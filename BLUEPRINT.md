# RecapLink — Production Development Blueprint

> Execute this document top-to-bottom with Claude Code. Each task has a clear input, output, and acceptance test.
> Backend: `/home/salem/freelance/hapt/recaplink-back` (NestJS/MongoDB)
> Frontend: `/home/salem/freelance/hapt/recaplink` (React 19/Vite/Tailwind v4)

---

## EXISTING FOUNDATION

### Backend — Already Built
| Item | Status |
|---|---|
| NestJS app with ThrottlerGuard, ConfigModule | ✅ |
| MongoDB/Mongoose connection | ✅ |
| JWT access token + HTTP-only refresh cookie | ✅ |
| Auth: register, login, refresh, logout, /me | ✅ |
| User schema (all fields, indexes, toJSON sanitize) | ✅ |
| Roles, UserStatus, PlasticType enums | ✅ |
| JwtAuthGuard, RefreshTokenGuard, RolesGuard | ✅ |
| ResponseTransformInterceptor, AllExceptionsFilter | ✅ |
| Paginate util | ✅ |

### Frontend — Already Built
| Item | Status |
|---|---|
| Vite + React 19 + TS + Tailwind v4 | ✅ |
| All domain TypeScript types | ✅ |
| Zustand stores: auth, ui, socket | ✅ |
| Axios instance + refresh-token interceptor | ✅ |
| API clients: auth, offers, users | ✅ |
| main.tsx, App.tsx, i18n stub, router stub | ✅ |

### What's Missing (this blueprint covers)
Backend: offers, knowledge, messaging, notifications, badges, files, chatbot, analytics, reports, geolocation
Frontend: all layouts, pages, components, feature hooks

---

## PHASE 1 — Backend Foundation (Week 1)

### 1.1 Auth — Missing Endpoints

**Task:** Add `forgot-password` and `reset-password` flows, plus email verification OTP.

**Add to `auth.controller.ts`:**
```
POST /auth/forgot-password   { email }          → sends OTP code via email
POST /auth/verify-otp        { email, code }    → validates OTP, returns reset token
POST /auth/reset-password    { token, password } → sets new password
POST /auth/verify-email      { email, code }    → marks email as verified after signup
POST /auth/resend-otp        { email, type }    → resend OTP (email_verify | password_reset)
PATCH /auth/change-password  { currentPassword, newPassword } → for logged-in user
```

**New schema additions to User:**
```typescript
@Prop({ default: false }) emailVerified: boolean;
@Prop() otpCode: string;
@Prop() otpExpiry: Date;
@Prop() otpType: 'email_verify' | 'password_reset';
```

**Service logic:**
- OTP: 6-digit numeric, 10min expiry, bcrypt-hash before storing
- Email: use `@nestjs-modules/mailer` + Nodemailer with SMTP env vars
- Rate limit OTP resend: 1 per 60s via ThrottlerGuard

**Validation (DTOs):**
- `ForgotPasswordDto`: email IsEmail
- `VerifyOtpDto`: email IsEmail, code IsString Length(6,6)
- `ResetPasswordDto`: token IsString, password MinLength(8), Matches(/[A-Z]/, /[0-9]/)

**Frontend pages:** `/forgot-password`, `/forgot-password/check`, `/forgot-password/verify`, `/reset-password`, `/reset-password/success`

**Acceptance:** Full OTP flow works end-to-end; expired/wrong OTP returns 400; used tokens are invalidated.

---

### 1.2 File Upload Module

**Task:** Create `FilesModule` using Cloudinary (config already exists).

**New module:** `src/modules/files/`

```
files.module.ts
files.controller.ts   POST /files/upload (multipart, accepts image/*)
files.service.ts      uploadToCloudinary(file, folder): Promise<{ url, publicId }>
```

**Dependencies to install:**
```bash
npm install cloudinary multer @nestjs/multer @types/multer
```

**Controller:**
```
POST /files/upload
  Guard: JwtAuthGuard
  Body: multipart/form-data, field: file (max 5MB, jpg/png/webp)
  Query: folder (offers | avatars | knowledge | badges)
  Returns: { url: string, publicId: string }

DELETE /files/:publicId
  Guard: JwtAuthGuard + ownership check
```

**Validation:** FileInterceptor with size limit `5 * 1024 * 1024`, MIME filter `image/(jpeg|png|webp)`

**Acceptance:** Upload a JPEG → get back Cloudinary CDN URL; reject PDF with 400.

---

### 1.3 Offers Module

**Task:** Full CRUD for plastic offers.

**Schema: `src/modules/offers/schemas/offer.schema.ts`**
```typescript
@Schema({ timestamps: true })
class Offer {
  refCode: string          // auto-generated: RL-2026-XXXX
  title: string
  description: string
  plasticType: PlasticType // PET | HDPE | PP | PVC | Autres
  quantityKg: number
  quantityPiece: number
  pricePerKg: number
  isFree: boolean
  location: {
    city: string
    zone: string
    coordinates: [number, number]  // [lng, lat] for $near queries
  }
  images: string[]         // Cloudinary URLs
  status: OfferStatus      // active | pending | closed | verified | reported
  availability: string     // free text date/schedule
  owner: ObjectId → User
  viewCount: number
  messageCount: number
  expiresAt: Date          // auto: createdAt + 30 days
}

// Indexes:
// { owner: 1, status: 1 }
// { 'location.coordinates': '2dsphere' }
// { plasticType: 1, status: 1 }
// { expiresAt: 1 } TTL optional
```

**Endpoints: `POST/GET/PATCH/DELETE /offers`**
```
GET    /offers              Public. Query: plasticType, zone, status, search, page, limit
GET    /offers/:id          Public. Increments viewCount +1
POST   /offers              Auth. Body: CreateOfferDto. Sets owner=me, status=active
PATCH  /offers/:id          Auth + owner. Body: UpdateOfferDto
DELETE /offers/:id          Auth + (owner | admin)
POST   /offers/:id/report   Auth. Creates report entry, sets status=reported if 3+ reports
PATCH  /offers/:id/verify   Admin only. Sets status=verified
PATCH  /offers/:id/close    Auth + owner. Sets status=closed
GET    /offers/:id/similar  Public. Same plasticType, nearby zone, limit 4
GET    /users/me/offers     Auth. My offers with stats
```

**DTOs:**
```typescript
CreateOfferDto {
  title: IsString, MaxLength(100)
  description?: IsString, MaxLength(500)
  plasticType: IsEnum(PlasticType)
  quantityKg?: IsNumber, Min(0.1)
  quantityPiece?: IsNumber, Min(1)
  pricePerKg?: IsNumber, Min(0)
  isFree: IsBoolean
  location: { city: IsString, zone: IsString, coordinates?: [number, number] }
  images?: IsArray, IsString each, MaxLength(5 items)
  availability?: IsString
}
```

**Service logic:**
- `refCode` generated as `RL-${year}-${nanoid(6).toUpperCase()}`
- `expiresAt` = `new Date() + 30 * 24h`
- On delete: also delete Cloudinary images (FilesService)
- Populate `owner` with: `_id fullName username avatarUrl rating`

**Permissions:**
- Create: collecteur | vendeur_plastique
- Edit/Delete: owner or admin
- Verify: admin only

**Acceptance:** Create offer → GET /offers returns it; admin verifies → status=verified; owner closes → status=closed.

---

### 1.4 Notifications Module

**Schema: `src/modules/notifications/schemas/notification.schema.ts`**
```typescript
@Schema({ timestamps: true })
class Notification {
  recipient: ObjectId → User
  type: 'new_offer' | 'new_member' | 'badge_awarded' | 'report' | 'system' | 'chatbot_escalation'
  title: string
  body: string
  link: string        // frontend route e.g. /offers/abc123
  isRead: boolean     // default false
  // auto-delete after 30 days: createdAt TTL index
}
```

**Endpoints:**
```
GET    /notifications           Auth. My notifications, paginated, unread first
PATCH  /notifications/:id/read  Auth. Mark one as read
PATCH  /notifications/read-all  Auth. Mark all as read
DELETE /notifications/:id       Auth. Delete one
GET    /notifications/count     Auth. Returns { unread: number }
```

**NotificationsService.create()** — called internally by other services (offers, badges, messaging)

**Acceptance:** Create offer → owner of watched zone gets notification; mark-all-read sets all isRead=true.

---

### 1.5 Knowledge Module

**Schema: `src/modules/knowledge/schemas/knowledge.schema.ts`**
```typescript
@Schema({ timestamps: true })
class Knowledge {
  slug: string           // url-safe, unique, auto-generated from title.fr
  title: { fr: string; ar: string; wo: string }
  content: { fr: string; ar: string; wo: string }
  type: 'article' | 'video' | 'tutorial'
  category: string       // PET.Collecte | HDPE.Traitement | Marché.Prix | Sécurité | Environnement | Logistique
  tags: string[]
  coverImageUrl: string
  coverColor: string     // hex for card bg (green | red | black | yellow)
  author: ObjectId → User
  status: 'draft' | 'published' | 'archived'
  viewCount: number
  likeCount: number
  stepCount: number       // for tutorials
  videoDuration: string   // for videos
  likedBy: ObjectId[]    // for deduplication
}
// Indexes: { slug: 1 unique }, { type: 1, status: 1 }, { category: 1 }
```

**Endpoints:**
```
GET    /knowledge              Public. Query: type, category, search, page, limit. Returns published only (unless admin)
GET    /knowledge/:slug        Public. Increments viewCount
POST   /knowledge              Admin. Body: CreateKnowledgeDto
PATCH  /knowledge/:slug        Admin.
DELETE /knowledge/:slug        Admin.
POST   /knowledge/:slug/like   Auth. Toggle like (adds/removes from likedBy, increments/decrements likeCount)
PATCH  /knowledge/:slug/publish Admin. Sets status=published
PATCH  /knowledge/:slug/archive Admin. Sets status=archived
```

**Acceptance:** Admin creates article → public GET returns it; like/unlike toggles correctly.

---

### 1.6 Messaging Module

**Schemas:**
```typescript
// conversation.schema.ts
@Schema({ timestamps: true })
class Conversation {
  participants: [ObjectId, ObjectId]  // always exactly 2
  offer: ObjectId → Offer (optional, nullable)
  lastMessage: ObjectId → Message
  lastActivityAt: Date
  // Compound unique index: { participants sorted }
}

// message.schema.ts
@Schema({ timestamps: true })
class Message {
  conversation: ObjectId → Conversation
  sender: ObjectId → User
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  fileUrl: string
  readBy: ObjectId[]
}
// Indexes: { conversation: 1, createdAt: -1 }
```

**HTTP Endpoints:**
```
GET    /conversations                     Auth. My conversations, sorted by lastActivityAt desc
GET    /conversations/:id/messages        Auth + participant. Paginated messages (page, limit)
POST   /conversations                     Auth. Body: { recipientId, offerId? }. Gets-or-creates conversation
PATCH  /conversations/:id/read            Auth. Marks all messages in conversation as read by me
```

**Socket.IO Gateway: `src/modules/messaging/messaging.gateway.ts`**
```typescript
@WebSocketGateway({ cors: true, namespace: '/chat' })
class MessagingGateway {
  // Events emitted by client:
  'join_conversation'  { conversationId } → joins Socket.IO room
  'leave_conversation' { conversationId }
  'send_message'       { conversationId, content, type, fileUrl? } → broadcasts to room
  'typing'             { conversationId } → broadcasts 'user_typing' to room
  'read'               { conversationId } → marks messages read

  // Events emitted to client:
  'new_message'        Message object
  'user_typing'        { userId, conversationId }
  'message_read'       { conversationId, userId }
  'new_conversation'   Conversation object (when other user starts)
}
```

**Auth for WS:** `WsJwtGuard` reads token from `socket.handshake.auth.token`

**Acceptance:** Two users connect; one sends message; other receives it in <100ms via Socket.IO.

---

### 1.7 Badge Module

**Schema: `src/modules/badges/schemas/badge.schema.ts`**
```typescript
@Schema({ timestamps: true })
class Badge {
  name: { fr: string; ar: string; wo: string }
  description: { fr: string; ar: string; wo: string }
  iconUrl: string
  category: 'expert' | 'pioneer' | 'administrator' | 'volume' | 'activity'
  criteriaType: 'kg_collected' | 'offers_completed' | 'days_active' | 'manual'
  criteriaValue: number      // e.g. 100 for "100 kg collected"
  autoAssign: boolean        // if true, BadgeService checks after each action
  userCount: number          // denormalized count
}
```

**Endpoints:**
```
GET    /badges                Admin. All badges with userCount
POST   /badges                Admin. Create badge
PATCH  /badges/:id            Admin.
DELETE /badges/:id            Admin.
POST   /badges/:id/assign     Admin. Body: { userId }. Manual award
GET    /users/:id/badges      Auth. User's earned badges with { awardedAt, completed, progress }
```

**BadgeService.checkAndAward(userId):**
- Called after: offer closed, kg_collected updated
- Fetches all autoAssign badges
- For each: checks if user meets criteria and doesn't already have it
- Awards and sends Notification if newly earned

**Seeded badges (run in `main.ts` on startup):**
```
Premier Pas       → 1 offer completed, autoAssign
Collecteur Bronze → 100 kg, autoAssign
Collecteur Argent → 500 kg, autoAssign
Collecteur Or     → 1000 kg, autoAssign
Expert PET        → manual
Pionnier          → manual
Administrateur    → manual
```

**Acceptance:** User crosses 100kg → `Collecteur Bronze` badge appears in their profile and they receive a notification.

---

### 1.8 Reports Module

**Schema: `src/modules/reports/schemas/report.schema.ts`**
```typescript
@Schema({ timestamps: true })
class Report {
  type: 'offer' | 'user' | 'message'
  targetId: ObjectId
  reporter: ObjectId → User
  reason: string
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken'
  adminNote: string
  reviewedBy: ObjectId → User
  reviewedAt: Date
}
```

**Endpoints:**
```
POST   /reports              Auth. Body: { type, targetId, reason }
GET    /reports              Admin. Query: status, type, page, limit
PATCH  /reports/:id/review   Admin. Body: { status, adminNote }
```

**Acceptance:** User reports offer → report appears in admin panel; admin dismisses it → status=dismissed.

---

### 1.9 Analytics Module (Admin)

**No separate schema** — aggregates from Users, Offers, Messages collections.

**Endpoints (all Admin only):**
```
GET /admin/stats/overview
  Returns: {
    kgRecycledThisMonth, kgRecycledLastMonth,
    activeOffers, activeOffersLastMonth,
    activeCollectors, newCollectorsThisMonth,
    activeRecyclers, newRecyclersThisMonth,
    plasticTypeDistribution: [{ type, count, percentage }],
    recentActivity: [{ type, description, createdAt }]
  }

GET /admin/stats/collections-by-zone
  Returns: [{ zone, totalKg }] sorted desc, for current month

GET /admin/stats/registrations-by-month
  Returns: [{ month: 'Jan 2026', count }] last 12 months

GET /admin/stats/offers-by-type
  Returns: [{ plasticType, count, percentage }]
```

**Implementation:** Pure MongoDB aggregation pipelines. No caching needed for MVP.

**Acceptance:** Dashboard renders all 4 chart datasets correctly with real DB data.

---

### 1.10 Chatbot Module

**Schema: `src/modules/chatbot/schemas/chatbot-session.schema.ts`**
```typescript
@Schema({ timestamps: true })
class ChatbotSession {
  user: ObjectId → User
  messages: [{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }]
  escalated: boolean     // true = human needs to take over
  escalatedAt: Date
  status: 'active' | 'resolved' | 'escalated'
}
```

**Endpoints:**
```
POST   /chatbot/message     Auth. Body: { message, sessionId? }
  → Creates/resumes session, calls AI provider, returns { reply, sessionId, escalated }

GET    /chatbot/sessions    Admin. Paginated list of all sessions, filter by escalated=true
GET    /chatbot/sessions/:id Admin. Full session with messages
PATCH  /chatbot/sessions/:id/resolve Admin. Marks escalated session as resolved
GET    /chatbot/faq         Public. Returns FAQ entries (from Knowledge type=article, category=FAQ)
```

**AI Integration:** OpenAI GPT-4o-mini via `openai` npm package. System prompt includes: platform context, FAQ summary, escalation instructions.

**Escalation logic:** If message contains keywords (price, legal, urgent) OR user says "parler à quelqu'un" → set `escalated=true`, send admin notification.

**Acceptance:** Send "Comment créer une offre?" → receives helpful response; say "parler humain" → session marked escalated + admin notified.

---

### 1.11 Geolocation Module

**No separate module** — extends Offers and Users with location features.

**New endpoint on UsersModule:**
```
GET /users/nearby?lat=&lng=&radius=&role=    Public. Returns users within radius km using $geoNear
```

**New endpoint on OffersModule (already planned):**
```
GET /offers/nearby?lat=&lng=&radius=&plasticType=   Public.
```

**User schema addition:**
```typescript
@Prop({ type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] })
location: { type: 'Point'; coordinates: [number, number] }
// Add index: { location: '2dsphere' }
```

**Acceptance:** User registers at coordinates → GET /users/nearby with radius 10km returns them.

---

## PHASE 2 — Backend Integration (Week 1-2)

### 2.1 Register All New Modules in `app.module.ts`

```typescript
imports: [
  // existing...
  AuthModule, UsersModule, FeedbackModule,
  // new:
  FilesModule,
  OffersModule,
  NotificationsModule,
  KnowledgeModule,
  MessagingModule,
  BadgesModule,
  ReportsModule,
  AnalyticsModule,
  ChatbotModule,
]
```

### 2.2 Install Backend Dependencies

```bash
npm install \
  @nestjs/websockets @nestjs/platform-socket.io socket.io \
  @nestjs-modules/mailer nodemailer \
  cloudinary multer @nestjs/multer @types/multer \
  nanoid \
  openai \
  bcrypt @types/bcrypt
```

### 2.3 Environment Variables

Add to `.env`:
```env
# Mailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=no-reply@recaplink.tn
SMTP_PASS=xxx

# Cloudinary (already configured)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# OpenAI
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4o-mini

# App
FRONTEND_URL=http://localhost:5173
```

### 2.4 API Response Envelope

All endpoints return (via ResponseTransformInterceptor):
```json
{ "data": <payload>, "message": "success", "status": 200 }
```
Errors return:
```json
{ "status": 400, "message": "Validation failed", "errors": { "field": ["message"] } }
```

---

## PHASE 3 — Frontend Layout & Shared Components (Week 2)

### 3.1 Admin Layout

**File: `src/layouts/AdminLayout.tsx`**

From screenshots: fixed sidebar (320px) + top bar (72px) + scrollable content area.

**Sidebar contents (top to bottom):**
```
Logo (RecapLink)
─────────────────
🏠 Tableau de bord    → /admin/overview    (active = green text + dot)
👤 Collecteurs        → /admin/collectors
♻️ Recycleurs         → /admin/recyclers
🏷️ Offres             → /admin/offers
📋 Savoir-faire       → /admin/knowledge
🏆 Gestion des Badges → /admin/badges
⚙️ Paramètres         → /admin/settings
─────────────────
[Support widget]       illustration + "52.056.778"
[User avatar + name + arrow] → /admin/profile
```

**Top bar:**
```
[Page title + date] [─────── Search input ─────────] [Bell🔔] [Avatar + Name ▾]
```

**Implementation:**
- Sidebar: `w-80 fixed left-0 top-0 h-full bg-white border-r`
- Content: `ml-80 min-h-screen bg-[#f5faf5]`
- Top bar: `h-18 bg-[#4d9538] flex items-center px-6 gap-4`
- NavItem: active = `text-[#4d9538] font-bold` + green dot, inactive = `text-gray-500`

### 3.2 App Layout (Mobile)

**File: `src/layouts/AppLayout.tsx`**
```tsx
export default function AppLayout() {
  const { dir } = useUIStore()
  return (
    <div dir={dir} className="max-w-[402px] mx-auto min-h-dvh relative bg-white">
      <Outlet />
      <BottomNav />
    </div>
  )
}
```

**BottomNav: `src/components/navigation/BottomNav.tsx`**
- 5 tabs: Acceuil (`/home`), Offres (`/offers`), Messagerie (`/messaging`), Paramètres (`/settings`), Compte (`/profile`)
- `h-[77px]` fixed to bottom, `bg-[#4d9538]`, `rounded-[20px]`
- Active: white solid icon + bold white label
- Inactive: white icon at 50% opacity
- Unread badge on Messagerie tab from `socketStore.unreadCount`

### 3.3 Auth Layout

**File: `src/layouts/AuthLayout.tsx`**
```tsx
export default function AuthLayout() {
  return (
    <div className="min-h-dvh bg-white flex flex-col items-center">
      <Outlet />
    </div>
  )
}
```

### 3.4 Shared UI Components

All in `src/components/ui/`. Build these first — every page depends on them.

#### Button (`button.tsx`)
```tsx
variants: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
sizes: 'sm' | 'md' | 'lg'

// primary: bg-[#4d9538] text-white rounded-[30px] h-[60px] font-poppins font-bold
// secondary: border border-[#4d9538] text-[#4d9538] rounded-[8px]
// danger: border border-[#c41539] text-[#c41539] rounded-[30px]
// ghost: transparent, no border
```

#### Input (`input.tsx`)
```tsx
// border-2 border-[#4d9538] rounded-[10px] h-[50px] px-4
// label floats above when focused or has value
// error state: border-[#c41539] + error message below
// password: toggle show/hide eye icon
```

#### Card (`card.tsx`)
```tsx
// bg-white rounded-[12px] shadow-[var(--shadow-card)] p-4
// variants: default, colored (admin knowledge cards)
```

#### Badge / Chip (`chip.tsx`)
```tsx
// Small pill for plastic types: PET=green, HDPE=blue, PP=orange, PVC=purple, Autres=gray
// Status chips: Actif=green, En attente=yellow, Suspendu=red, Vérifié=green dark
```

#### Avatar (`avatar.tsx`)
```tsx
// sizes: sm(24) md(40) lg(80) xl(109)
// fallback: initials with colored bg (dark red for admin "LK" initials style)
// optional badge overlay (bottom-right badge icon)
```

#### Modal (`modal.tsx`)
```tsx
// Confirmation dialog: title, message, confirm button (danger), cancel button
// Backdrop click to close
// Used for: delete offer, delete account, logout confirmation
```

#### Skeleton (`skeleton.tsx`)
```tsx
// Animated pulse rectangles matching the shape of the content being loaded
// OfferCardSkeleton, UserRowSkeleton, KnowledgeCardSkeleton
```

#### EmptyState (`empty-state.tsx`)
```tsx
// icon (lucide), title, description, optional CTA button
// Used for: no offers, empty inbox, no notifications
```

#### PageHeader (`page-header.tsx`)
```tsx
// bg-[#4d9538] h-[61px] flex items-center
// back button (left), title (center), optional right action
// Used on all mobile inner pages
```

#### LanguageSwitcher (`language-switcher.tsx`)
```tsx
// 3-flag pill toggle: FR | AR | WO
// FR flag, Arabic script "ع", Wolof "WO"
// Active flag has green-soft gradient bg
// Calls uiStore.setLanguage() which sets dir + i18n.changeLanguage()
```

#### PlasticTypeTag (`plastic-type-tag.tsx`)
```tsx
const colors = {
  PET: 'bg-green-100 text-green-800',
  HDPE: 'bg-blue-100 text-blue-800',
  PP: 'bg-orange-100 text-orange-800',
  PVC: 'bg-purple-100 text-purple-800',
  Autres: 'bg-gray-100 text-gray-700',
}
```

#### AdminStatCard (`admin-stat-card.tsx`)
```tsx
// From dashboard screenshots:
// bg-[color] rounded-xl p-6
// icon (top-left) + title + large number
// trend badge: ▲ X% vs mois dernier
// Donut chart mini (optional, Recharts PieChart)
// Colors seen: green (#4d9538), red (#c41539), black (#1a1a1a), yellow (#f5c518)
```

#### AdminDataTable (`admin-data-table.tsx`)
```tsx
// Generic sortable table
// Props: columns[], data[], onRowAction
// Action buttons: 👁 view, ✏️ edit, 🚫 suspend, ✅ validate, 🗑 delete
// Status pill in each row
// Filter tab bar above table
// Export button (triggers CSV download)
```

---

## PHASE 4 — Frontend Feature Implementation (Weeks 2-4)

### 4.1 Authentication Feature

**Files:** `src/features/auth/`

**Pages to build:**

#### `OnboardingPage.tsx`
- 3-slide carousel using state index
- Slides: RecapLink logo + title + subtitle + illustration
- Dot indicators at bottom
- Language switcher (Multi-Langue component)
- "Suivant" button → next slide → 3rd slide has "Commencer"
- FR/AR/WO content from i18n `auth:onboarding`

#### `LoginPage.tsx`
- Logo at top
- Language switcher
- "Se connecter à RecapLink" title
- Email/phone input + password input (with show/hide)
- "Mot de passe oublié ?" link
- Primary "Se connecter" button
- Divider "Ou"
- Google + Apple social buttons (stub, no OAuth for MVP)
- "Pas de compte ? Inscrivez-vous" link → /signup
- Form: `useForm` + `loginSchema` (Zod)
- On submit: `authApi.login()` → store token → navigate `/home`

#### `SignupPage.tsx`
- Fields: fullName, username, email, phone, password, confirmPassword
- Language switcher
- Submit → API → navigate `/verify`

#### `VerifyPage.tsx` (OTP)
- 6 individual digit inputs (auto-advance on input)
- Resend OTP countdown (60s)
- Submit → `authApi.verifyOtp()` → navigate `/role`

#### `RolePage.tsx`
- UserTypeSelector component (3 cards: Collecteur, Recycleur, Vendeur Plastique)
- Selected card has green filled header
- Submit → `authApi.setRole()` → navigate `/welcome`

#### `WelcomePage.tsx`
- Success illustration + "Inscription réussie!" + name
- Auto-redirect to `/home` after 3s

#### `ForgotPasswordPage.tsx` + `ForgotCheckPage.tsx` + `ForgotVerifyPage.tsx`
- Step 1: Enter email → POST /auth/forgot-password
- Step 2: "Vérifiez votre boîte mail" static screen
- Step 3: OTP input → POST /auth/verify-otp → navigate /reset-password?token=xxx

#### `ResetPasswordPage.tsx` + `ResetSuccessPage.tsx`
- New password + confirm
- Password strength indicator
- On success → /reset-password/success → redirect /login after 3s

**Hooks:**
```typescript
// src/features/auth/hooks/useLogin.ts
export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.accessToken)
      navigate('/home')
    },
  })
}
// Similar hooks: useRegister, useForgotPassword, useVerifyOtp, useResetPassword
```

**Zod schemas (`src/features/auth/schemas/`):**
```typescript
loginSchema = z.object({
  email: z.string().email().or(z.string().min(8)), // email or phone
  password: z.string().min(1),
})
registerSchema = z.object({
  fullName: z.string().min(2).max(50),
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword)
```

**State:** `useAuthStore` (persisted). After login: `user`, `accessToken`, `isAuthenticated=true`.

**Guards:**
```typescript
// src/router/guards/RequireAuth.tsx
export function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// src/router/guards/RequireAdmin.tsx
export function RequireAdmin({ children }) {
  const user = useAuthStore(s => s.user)
  return user?.role === 'admin' ? children : <Navigate to="/home" replace />
}
```

**i18n namespace:** `auth` — keys: `onboarding.slide1.title`, `login.title`, `login.emailPlaceholder`, etc.

**Testing:** Login with wrong password → shows error; login with correct → redirects /home; refresh token auto-called on 401.

---

### 4.2 Home Feature

**File: `src/features/home/pages/HomePage.tsx`**

Layout (from Figma screen 20-Acceuil):
```
[StatusBar]
[Logo (left) | Language switcher (right)]
[Avatar | "Bienvenue, {name}"]
[Tab: Collecteur | Recycleur] (toggle)
[Address search input]
[GPS location input]
[Search button → /find]
[Two tiles: Chatbot | Savoir-faire] (gradient green bg)
[Publish offer banner] (gradient green, full width)
[BottomNav]
```

**Components:**
- `FindToggle` — Collecteur/Recycleur tab selector
- `AddressSearch` — input with search icon + submit
- `GPSButton` — "Utiliser ma position actuelle" + GPS icon
- `HomeTile` — card with gradient bg, illustration, title, CTA button
- `PublishOfferBanner` — full-width green gradient strip

**No API calls on home** — purely UI navigation hub.

---

### 4.3 Offers Feature

**Pages:**

#### `OffersPage.tsx` (route: `/offers`)
- Filter chips: Tous | PET | HDPE | PP | PVC | Autres
- Offer list (paginated, 10 per page)
- Each item: `OfferCard` component
- Pull-to-refresh behavior with React Query `refetch`
- Infinite scroll or "Charger plus" button

**`OfferCard.tsx`:**
```
[Image thumbnail (first image or placeholder)] [PlasticTypeTag]
[Title]                                         [Price/Free badge]
[Zone, City]                                    [Date]
[Owner avatar + name]                           [View count icon]
```

#### `OfferDetailPage.tsx` (route: `/offers/:id`)
- Image carousel (swipe)
- PlasticTypeTag + title + description
- Quantity, price, availability
- Location with zone/city
- Owner card: avatar, name, rating stars, "Contacter" button
- Action buttons (if owner): Edit | Close | Delete
- "Signaler" option (3-dot menu)
- Similar offers section at bottom

#### `NewOfferPage.tsx` (route: `/offers/new`) — 3-step form
- Step 1: plasticType (PlasticTypeSelector), title, description, isFree toggle, pricePerKg, quantityKg
- Step 2: location city, zone, optional GPS coordinates
- Step 3: image upload (react-dropzone, max 5 images), availability
- Step indicator at top (1 of 3)
- Back/Next buttons; final step shows "Publier"
- `useCreateOffer` mutation hook

#### `MyOffersPage.tsx` (route: `/offers/mine`)
- Tabs: Actives | En attente | Fermées | Signalées
- Each row: title, status pill, date, edit/delete icons
- Empty state per tab

**API hooks:**
```typescript
useOffers(filters)     → useInfiniteQuery(['offers', filters], offersApi.list)
useOffer(id)           → useQuery(['offers', id], () => offersApi.detail(id))
useCreateOffer()       → useMutation(offersApi.create, { onSuccess: invalidate })
useUpdateOffer(id)     → useMutation(data => offersApi.update(id, data))
useDeleteOffer(id)     → useMutation(() => offersApi.delete(id))
useMyOffers()          → useQuery(['offers', 'mine'], offersApi.mine)
useReportOffer(id)     → useMutation(() => offersApi.report(id))
```

**State:** React Query handles all server state. No Zustand for offers.

**Permissions (frontend enforcement):**
- NewOffer button only visible if `user.role !== 'admin'`
- Edit/Delete actions only if `offer.owner._id === user._id` or `user.role === 'admin'`

---

### 4.4 Knowledge Feature

**Pages:**

#### `KnowledgePage.tsx` (route: `/knowledge`)
- Hero section: title "Savoir-faire"
- Type tabs: Tous | Articles | Vidéos | Tutoriels
- Card grid (2 columns on mobile)
- Search bar

#### `ArticlePage.tsx` (route: `/knowledge/article/:id`)
- Cover image or colored header
- Title, category tags, author, date
- Rich content (rendered markdown or HTML)
- Like button (heart icon + count)
- Related articles at bottom

#### `VideoPage.tsx` (route: `/knowledge/video/:id`)
- Video player (iframe or HTML5 video)
- Duration badge
- Title, description
- Like button

#### `TutorialPage.tsx` (route: `/knowledge/tutorial/:id`)
- Step progress indicator: Step 1 of 4
- Step content: illustration + instructions
- Previous / Next buttons
- Completion celebration on last step

**`KnowledgeCard.tsx`:**
```
[Colored header bg with icon]
[Category tags (green text)]
[Title (bold)]
[Description (2 lines truncated)]
[👁 views | ❤️ likes | Status badge]
```

Card header colors from design: green (recycling), red (safety), black (market), yellow (logistics)

**Hooks:**
```typescript
useKnowledge(filters)   → useQuery(['knowledge', filters], knowledgeApi.list)
useKnowledgeItem(slug)  → useQuery(['knowledge', slug], () => knowledgeApi.detail(slug))
useLikeKnowledge(slug)  → useMutation(() => knowledgeApi.like(slug), { onSuccess: invalidate })
```

---

### 4.5 Chatbot Feature

**Page: `ChatbotPage.tsx`** (route: `/chatbot`)

Layout:
```
[PageHeader: "Chatbot RecapLink"]
[Message list (scrollable)]
  [AssistantBubble: robot avatar + text]
  [UserBubble: right-aligned, green bg]
[Input bar: text input + send button]
[Quick action chips: "Créer une offre" | "Trouver collecteur" | "Prix marché"]
```

**`ChatBubble.tsx`:**
- User: right-aligned, `bg-[#4d9538] text-white rounded-[12px_12px_0_12px]`
- Assistant: left-aligned, `bg-gray-100 text-black rounded-[12px_12px_12px_0]`, robot avatar
- Timestamp below each bubble
- Typing indicator: 3 animated dots

**State:**
```typescript
// Local state (no Zustand needed)
const [messages, setMessages] = useState<ChatMessage[]>([])
const [sessionId, setSessionId] = useState<string | null>(null)
const [isTyping, setIsTyping] = useState(false)
```

**Flow:**
1. Page loads → show welcome message + FAQ quick chips
2. User types or taps chip → `POST /chatbot/message { message, sessionId }`
3. Show typing indicator while awaiting response
4. Append assistant reply to messages
5. If response has `escalated: true` → show "Un agent va vous contacter" message

**Escalation UI:** Show info banner "Votre message a été transmis à notre équipe. Réponse sous 24h."

---

### 4.6 Messaging Feature

**`MessagingPage.tsx`** (route: `/messaging`)
- Conversation list, sorted by lastActivityAt
- Each row: `ConversationRow` — avatar, name, last message preview, unread count badge, timestamp
- Empty state: illustration + "Pas encore de messages"
- New conversation initiated from offer detail page ("Contacter")

**`ConversationPage.tsx`** (route: `/messaging/:id`)
```
[PageHeader: other user name + avatar + online indicator]
[Message list (reversed, scroll to bottom on mount)]
  [ChatBubbles]
[Typing indicator (when remote user types)]
[MessageInput: text field + attachment icon + send]
```

**Socket.IO integration:**
```typescript
// src/features/messaging/hooks/useMessaging.ts
export function useMessaging(conversationId: string) {
  const { socket } = useSocketStore()

  useEffect(() => {
    if (!socket || !conversationId) return
    socket.emit('join_conversation', { conversationId })
    socket.on('new_message', (msg) => {
      queryClient.setQueryData(['messages', conversationId], (old) => [...old, msg])
    })
    socket.on('user_typing', ({ userId }) => setTypingUserId(userId))
    return () => {
      socket.emit('leave_conversation', { conversationId })
      socket.off('new_message')
      socket.off('user_typing')
    }
  }, [socket, conversationId])
}
```

**`MessageInput.tsx`:**
- Text input with `onKeyDown Enter` → send
- Typing event: debounced 500ms `socket.emit('typing', { conversationId })`
- Image attachment: opens file picker → upload → send as type='image'

**Unread count:** `socketStore.unreadCount` displayed on BottomNav Messagerie tab. Reset to 0 when conversation is opened.

---

### 4.7 Profile Feature

**`ProfilePage.tsx`** (route: `/profile`)
From Figma screen 73 (Ui_compte):
```
[StatusBar]
[PageHeader: "Mon Compte"]
[Avatar (xl, 109px)]
[Full name]
[Badge chip: "Expert Vert ⭐"]
[Tab bar: Informations | Offres | Badges]
  → Informations: email, phone, zone, role pill
  → Offres: mini offer list (own)
  → Badges: badge gallery
[Edit profile button]
[BottomNav]
```

**`EditProfilePage.tsx`** (route: `/profile/edit`)
- Avatar picker with camera overlay button → opens ImageUpload
- Form fields: fullName, email, phone, zone/city, bio, plasticTypes (multi-select), password change
- UserTypeSelector at bottom
- Save button → `PATCH /users/me`
- Delete account button (danger, opens confirmation modal)

**`BadgesPage.tsx`** (route: `/profile/badges`)
- Grid of badge cards: icon, name, description, "Obtenu le" date
- Locked badges shown at 50% opacity with lock icon
- Progress bar on in-progress badges (e.g. "50/100 kg")

**`NotificationsPage.tsx`** (route: `/notifications`)
- List grouped by: Aujourd'hui | Cette semaine | Plus ancien
- Each row: colored icon by type, title, body, relative time
- Swipe left to delete (or trash icon on right)
- "Tout marquer comme lu" button at top

**Hooks:**
```typescript
useProfile()         → useQuery(['users', 'me'], usersApi.getMe)
useUpdateProfile()   → useMutation(data => usersApi.updateMe(data), { onSuccess: invalidate profile })
useUserBadges()      → useQuery(['users', 'me', 'badges'], badgesApi.myBadges)
useNotifications()   → useQuery(['notifications'], notificationsApi.list)
useMarkAllRead()     → useMutation(notificationsApi.readAll, { onSuccess: invalidate })
```

---

### 4.8 Settings Feature

**`SettingsPage.tsx`** (route: `/settings`)
- Menu list items with chevron right:
  - ℹ️ Informations sur l'application → /settings/about
  - 🔒 Politique de confidentialité → /settings/privacy
  - 🌙 Mode sombre (toggle inline)
  - 🌐 Langue → shows LanguageSwitcher modal
  - ↩️ Déconnexion → opens confirmation modal

**`AboutPage.tsx`** — app version, partners (BBW logo), legal text
**`PrivacyPage.tsx`** — privacy policy text (multilingual)

---

## PHASE 5 — Admin Dashboard (Week 3-4)

### 5.1 Admin Overview Page

**Route: `/admin/overview`**

From screenshot 1 — four stat cards + right column:

**Stat Cards (2x2 grid):**
```
[green]  kg recyclés ce mois  12 480    ▲ 18% vs mois dernier  [donut 75%]
[red]    Offres actives        247       ▲ 12% vs mois dernier  [donut 50%]
[black]  Collecteurs actifs    84        ▼ 5 nouveaux           [donut 25%]
[yellow] Recycleurs actifs     150       ▲ 30 nouveaux          [donut 75%]
```

**Right column:**
- "Types de plastique Par Offres" — 4 mini-stat rows (PET 40% | 112 sur 247) + Recharts PieChart
- "Collectes par zone" — horizontal bar chart (Recharts BarChart horizontal)
- "Inscriptions mensuelles" — vertical bar chart last 12 months (Recharts BarChart)

**Recent Activity feed:**
- 5 latest items from audit log
- Icons per type: 👤 user, 🏆 badge, 📋 knowledge, 🤖 chatbot, ⚠️ report
- "Tout voir" link → /admin/reports

**Data source:** `GET /admin/stats/overview` + `GET /admin/stats/collections-by-zone` + `GET /admin/stats/registrations-by-month`

**Hooks:**
```typescript
useAdminOverview()  → useQuery(['admin', 'overview'], adminApi.getOverview, { staleTime: 60000 })
useCollectionsByZone() → useQuery(['admin', 'stats', 'zones'], adminApi.getCollectionsByZone)
useRegistrationsByMonth() → useQuery(['admin', 'stats', 'registrations'], adminApi.getRegistrationsByMonth)
```

### 5.2 Collectors Page

**Route: `/admin/collectors`**

From screenshot 2:

**Header:** "Gestion des Collecteurs" + subtitle "84 collecteurs..." + "+ Ajouter collecteur" button (top right)

**Stat Cards row (4 cards):**
```
84 Total collecteurs  ▲ 5 ce mois
71 Actifs             ▲ 84%
8  En attente vérif.  → 3 nouvelles
5  Suspendus          ▼ signalés
```

**Filter tabs:** Tous | ✓ Actifs | ⏳ En attente | 🚫 Suspendus | 🔍 Search input | [Exporter] button

**Table columns:** Collecteur (avatar+name+@username) | Zone | Matériaux (chips) | Kg collectés | Note (⭐) | Statut | Inscrit le | Actions

**Actions per row:**
- Active: 👁 view | ✏️ edit | 🚫 suspend
- En attente: 👁 view | ✅ Valider | ✖️ Rejeter
- Suspendu: 👁 view | 🔁 Réactiver | 🗑️ delete

**Hooks:**
```typescript
useAdminCollectors(filters) → useQuery(['admin', 'collectors', filters], () => usersApi.list({ role: 'collecteur', ...filters }))
useSetUserStatus()          → useMutation(({ id, status }) => usersApi.setStatus(id, status))
```

### 5.3 Recyclers Page

**Route: `/admin/recyclers`**

Same structure as Collectors but different table columns:
Recycleur | Spécialité (plastic chips) | Capacité/mois | Offres traitées | Certification (pill) | Statut | Actions

Additional stat card: "Note moyenne 4.6 — Stable"

### 5.4 Offers Admin Page

**Route: `/admin/offers`**

From screenshot 4:

**Stat Cards:** 312 Offres actives | 89 Total recyclé | 198 Collecteurs actifs

**Filter tabs:** Tous | Certifié | ♻ Actifs | 🚫 Suspendus | 🔍 Search

**Table columns:** Recycleur (thumbnail+title+ref) | Catégorie (chip) | Quantité(kg) | Date | Localisation | Statut (Vérifiée + Signalée) | Actions

**Statut can be compound:** "Vérifiée" green pill + "Signalée" red pill on same row

**Pagination:** `< 1 2 3 … 99 >` at bottom

### 5.5 Knowledge Admin Page

**Route: `/admin/knowledge`**

From screenshot 5:

**Header:** "Savoir-faire" + "48 fiches publiées - Bibliothèque de contenus" + "+ Nouvelle fiche" button

**Filter tabs:** Tous | Publiées | Brouillons | Vidéos | Articles | 🔍 Search

**Card grid (3 columns desktop):**
Each card:
```
[Colored header: green recycling icon | red gear | black bar chart | yellow truck | etc.]
[Category tags: "PET · Collecte" in green text]
[Title (bold, 2 lines)]
[Description (3 lines truncated)]
[👁 1240 ❤️ 88 | ✏️ edit | [Publié] green pill]
```

**Actions:** Edit opens slide-over form; Archive button in dropdown; Delete with confirmation

### 5.6 Badges Admin Page

**Route: `/admin/badges`**

From screenshot 6:

**Header:** "Gestion des Badges" + "Attribuer et gérer les badges des utilisateurs" + "+ Créer badge" button

**Badge Cards grid (4 columns):**
```
[Colored circle icon: ↗ trend | 💧 drop | ♻️ recycle | 🏆 trophy]
[Badge name: "Premier Pas"]
[Description]
[342 Utilisateurs (green number)]
["Utilisateurs" label]
[✏️ Editer | [Attribuer] green button]
```

**"Attribuer" opens modal:** Search user by name/username, confirm → POST /badges/:id/assign

### 5.7 Admin Settings Page

**Route: `/admin/settings`**

From screenshot 7:

**Left tab navigation:**
- Profil administrateur (active)
- Notifications
- Langue & Région
- Sécurité
- Chatbot Ai
- Badges auto
- Rapports
- Déconnexion (red, at bottom)

**Profil tab content:**
- Form: Nom complet, Nom d'utilisateur, Email, Numéro de téléphone
- "Enregistrer les modifications" green button

**Notifications tab content (from screenshot):**
5 toggle rows:
- Nouveau signalement — "Alerte immédiate pour tout signalement" — ON
- Nouvelles inscriptions — "collecteurs & recycleurs en attente" — ON
- Chatbot : escapade — "Conversations nécessitant une intervention humaine" — ON
- Rapports hebdomadaires — "Résumé automatique chaque lundi" — ON
- Alerte de performance — "Indicateurs en dehors des seuils normaux" — OFF

**Implementation:** Each toggle calls `PATCH /users/me` with updated `notifPrefs` object.

### 5.8 Admin Profile Page

**Route: `/admin/profile`**

From screenshot 8:

Left card:
```
[Avatar: dark red rounded square with initials "LK"]
[Name: "Lokamni Karim"]
[Title: "Super Administrateur · RecapLink"]
[City: "Tunis, Tunisie"]
[Badge pills: Administrateur (red) | Expert (green) | Pionnier (blue)]
[Stats grid 2x2: Utilisateurs gérés 396 | Fiches créées 46 | Badges attribués 1247 | Jours actifs 365]
[Changer mot de passe link]
[Déconnexion (red link)]
```

Right panel:
```
Informations personnelles form
[Nom complet] [Nom d'utilisateur]
[Email] [Numéro de téléphone]
[Ville] [Rôle (readonly)]
[Bio textarea]
[Enregistrer les modifications]
```

---

## PHASE 6 — Router Wiring (Week 4)

Update `src/router/index.tsx` with all real pages replacing the placeholder:

```typescript
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@layouts/AuthLayout'
import { AppLayout } from '@layouts/AppLayout'
import { AdminLayout } from '@layouts/AdminLayout'
import { RequireAuth } from './guards/RequireAuth'
import { RequireAdmin } from './guards/RequireAdmin'
import { PageLoader } from '@components/feedback/PageLoader'

const wrap = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<PageLoader />}><Component /></Suspense>
)

// Auth pages (lazy loaded)
const OnboardingPage = lazy(() => import('@features/auth/pages/OnboardingPage'))
const LoginPage      = lazy(() => import('@features/auth/pages/LoginPage'))
// ... etc

export const router = createBrowserRouter([
  // --- Auth ---
  { element: <AuthLayout />, children: [
    { path: '/', element: wrap(OnboardingPage) },
    { path: '/login', element: wrap(LoginPage) },
    { path: '/signup', element: wrap(SignupPage) },
    { path: '/verify', element: wrap(VerifyPage) },
    { path: '/role', element: wrap(RolePage) },
    { path: '/welcome', element: wrap(WelcomePage) },
    { path: '/forgot-password', element: wrap(ForgotPasswordPage) },
    { path: '/forgot-password/check', element: wrap(ForgotCheckPage) },
    { path: '/forgot-password/verify', element: wrap(ForgotVerifyPage) },
    { path: '/reset-password', element: wrap(ResetPasswordPage) },
    { path: '/reset-password/success', element: wrap(ResetSuccessPage) },
  ]},
  // --- App ---
  { element: <RequireAuth><AppLayout /></RequireAuth>, children: [
    { path: '/home', element: wrap(HomePage) },
    { path: '/find', element: wrap(FindPage) },
    { path: '/find/select', element: wrap(SelectCollectorPage) },
    { path: '/offers', element: wrap(OffersPage) },
    { path: '/offers/new', element: wrap(NewOfferPage) },
    { path: '/offers/mine', element: wrap(MyOffersPage) },
    { path: '/offers/:id', element: wrap(OfferDetailPage) },
    { path: '/offers/:id/edit', element: wrap(EditOfferPage) },
    { path: '/knowledge', element: wrap(KnowledgePage) },
    { path: '/knowledge/articles', element: wrap(ArticlesListPage) },
    { path: '/knowledge/videos', element: wrap(VideosListPage) },
    { path: '/knowledge/tutorials', element: wrap(TutorialsListPage) },
    { path: '/knowledge/article/:id', element: wrap(ArticlePage) },
    { path: '/knowledge/video/:id', element: wrap(VideoPage) },
    { path: '/knowledge/tutorial/:id', element: wrap(TutorialPage) },
    { path: '/chatbot', element: wrap(ChatbotPage) },
    { path: '/messaging', element: wrap(MessagingPage) },
    { path: '/messaging/:id', element: wrap(ConversationPage) },
    { path: '/settings', element: wrap(SettingsPage) },
    { path: '/settings/about', element: wrap(AboutPage) },
    { path: '/settings/privacy', element: wrap(PrivacyPage) },
    { path: '/profile', element: wrap(ProfilePage) },
    { path: '/profile/edit', element: wrap(EditProfilePage) },
    { path: '/profile/badges', element: wrap(BadgesPage) },
    { path: '/profile/badge/:id', element: wrap(BadgeDetailPage) },
    { path: '/profile/:id', element: wrap(UserProfilePage) },
    { path: '/notifications', element: wrap(NotificationsPage) },
  ]},
  // --- Admin ---
  { path: '/admin', element: <RequireAdmin><AdminLayout /></RequireAdmin>, children: [
    { index: true, element: <Navigate to="/admin/overview" replace /> },
    { path: 'overview', element: wrap(AdminOverviewPage) },
    { path: 'collectors', element: wrap(AdminCollectorsPage) },
    { path: 'recyclers', element: wrap(AdminRecyclersPage) },
    { path: 'sellers', element: wrap(AdminSellersPage) },
    { path: 'offers', element: wrap(AdminOffersPage) },
    { path: 'knowledge', element: wrap(AdminKnowledgePage) },
    { path: 'badges', element: wrap(AdminBadgesPage) },
    { path: 'settings', element: wrap(AdminSettingsPage) },
    { path: 'profile', element: wrap(AdminProfilePage) },
  ]},
  // --- Errors ---
  { path: '/404', element: wrap(NotFoundPage) },
  { path: '*', element: <Navigate to="/404" replace /> },
])
```

---

## PHASE 7 — i18n Translation Files (Week 4)

**Structure:** `src/i18n/locales/{fr,ar,wo}/{namespace}.json`

### Key translation namespaces:

#### `common.json` (all 3 languages)
```json
{
  "app_name": "RecapLink",
  "save": "Enregistrer",
  "cancel": "Annuler",
  "delete": "Supprimer",
  "confirm": "Confirmer",
  "back": "Retour",
  "loading": "Chargement...",
  "error": "Une erreur s'est produite",
  "empty": "Aucun résultat",
  "search": "Rechercher...",
  "see_all": "Tout voir",
  "nav": {
    "home": "Accueil",
    "offers": "Offres",
    "messaging": "Messagerie",
    "settings": "Paramètres",
    "profile": "Compte"
  },
  "roles": {
    "collecteur": "Collecteur",
    "recycleur": "Recycleur",
    "vendeur_plastique": "Vendeur Plastique",
    "admin": "Administrateur"
  },
  "plastic": {
    "PET": "PET",
    "HDPE": "HDPE",
    "PP": "PP",
    "PVC": "PVC",
    "Autres": "Autres"
  },
  "status": {
    "active": "Actif",
    "pending": "En attente",
    "suspended": "Suspendu",
    "verified": "Vérifié",
    "reported": "Signalé",
    "closed": "Fermé"
  }
}
```

#### `auth.json`
```json
{
  "onboarding": {
    "slide1": { "title": "Bienvenue chez RecapLink", "subtitle": "..." },
    "slide2": { "title": "Connecter & Recycler", "subtitle": "..." },
    "slide3": { "title": "Créer de la valeur durable", "subtitle": "..." },
    "next": "Suivant",
    "start": "Commencer"
  },
  "login": { "title": "Se connecter à RecapLink", "email": "E-mail ou téléphone", ... },
  "signup": { ... },
  "forgot": { ... }
}
```

**Arabic (`ar`) translations** must use RTL-appropriate phrasing. Wolof (`wo`) translations should be reviewed by a Wolof speaker — for MVP use the French text as placeholder.

**i18n final config (`src/i18n/index.ts`)** — load all 8 namespaces × 3 languages using dynamic imports:
```typescript
import(/* webpackChunkName: "i18n-fr" */ './locales/fr/common.json')
```

---

## PHASE 8 — Socket.IO Client Setup (Week 4)

**`src/lib/socket.ts`:**
```typescript
import { io, Socket } from 'socket.io-client'

let socketInstance: Socket | null = null

export function getSocket(token: string): Socket {
  if (socketInstance?.connected) return socketInstance
  socketInstance = io(`${import.meta.env.VITE_API_URL ?? ''}/chat`, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  })
  return socketInstance
}

export function disconnectSocket() {
  socketInstance?.disconnect()
  socketInstance = null
}
```

**Initialize in App.tsx** after auth:
```typescript
useEffect(() => {
  if (isAuthenticated && accessToken) {
    const socket = getSocket(accessToken)
    setSocket(socket)
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('new_message', () => incrementUnread())
    return () => { disconnectSocket(); clearSocket() }
  }
}, [isAuthenticated, accessToken])
```

---

## PHASE 9 — API Client Completion (Week 4)

Create missing API files:

**`src/lib/api/knowledge.api.ts`**
```typescript
export const knowledgeApi = {
  list: (params?: KnowledgeFilters) => api.get('/knowledge', { params }),
  detail: (slug: string) => api.get(`/knowledge/${slug}`),
  like: (slug: string) => api.post(`/knowledge/${slug}/like`),
  create: (data: FormData) => api.post('/knowledge', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (slug: string, data: FormData) => api.patch(`/knowledge/${slug}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (slug: string) => api.delete(`/knowledge/${slug}`),
  publish: (slug: string) => api.patch(`/knowledge/${slug}/publish`),
}
```

**`src/lib/api/messaging.api.ts`**
```typescript
export const messagingApi = {
  conversations: () => api.get('/conversations'),
  messages: (id: string, params?: { page: number; limit: number }) =>
    api.get(`/conversations/${id}/messages`, { params }),
  createConversation: (data: { recipientId: string; offerId?: string }) =>
    api.post('/conversations', data),
  markRead: (id: string) => api.patch(`/conversations/${id}/read`),
}
```

**`src/lib/api/badges.api.ts`**
```typescript
export const badgesApi = {
  list: () => api.get('/badges'),
  myBadges: () => api.get('/users/me/badges'),
  userBadges: (userId: string) => api.get(`/users/${userId}/badges`),
  assign: (badgeId: string, userId: string) => api.post(`/badges/${badgeId}/assign`, { userId }),
  create: (data: unknown) => api.post('/badges', data),
  update: (id: string, data: unknown) => api.patch(`/badges/${id}`, data),
  delete: (id: string) => api.delete(`/badges/${id}`),
}
```

**`src/lib/api/notifications.api.ts`**
```typescript
export const notificationsApi = {
  list: (params?: { page: number }) => api.get('/notifications', { params }),
  count: () => api.get('/notifications/count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  readAll: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}
```

**`src/lib/api/admin.api.ts`**
```typescript
export const adminApi = {
  getOverview: () => api.get('/admin/stats/overview'),
  getCollectionsByZone: () => api.get('/admin/stats/collections-by-zone'),
  getRegistrationsByMonth: () => api.get('/admin/stats/registrations-by-month'),
  getOffersByType: () => api.get('/admin/stats/offers-by-type'),
  getReports: (params?: unknown) => api.get('/reports', { params }),
  reviewReport: (id: string, data: unknown) => api.patch(`/reports/${id}/review`, data),
}
```

**`src/lib/api/chatbot.api.ts`**
```typescript
export const chatbotApi = {
  sendMessage: (data: { message: string; sessionId?: string }) =>
    api.post('/chatbot/message', data),
  sessions: (params?: unknown) => api.get('/chatbot/sessions', { params }),
  session: (id: string) => api.get(`/chatbot/sessions/${id}`),
  resolve: (id: string) => api.patch(`/chatbot/sessions/${id}/resolve`),
  faq: () => api.get('/chatbot/faq'),
}
```

**`src/lib/api/files.api.ts`**
```typescript
export const filesApi = {
  upload: (file: File, folder: string) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/files/upload?folder=${folder}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete: (publicId: string) => api.delete(`/files/${publicId}`),
}
```

---

## PHASE 10 — Testing Strategy

### Backend Testing

**Unit tests** (Jest, each service):
```
auth.service.spec.ts      → test register, login, OTP flow, token refresh
offers.service.spec.ts    → test CRUD, ownership checks, status transitions
badges.service.spec.ts    → test auto-award logic
notifications.service.spec.ts → test create and deliver
```

**E2E tests** (`test/*.e2e-spec.ts`, supertest):
```
auth.e2e-spec.ts    → full register → verify → login → refresh → logout flow
offers.e2e-spec.ts  → create → read → update → delete + report flow
messaging.e2e-spec.ts → create conversation, send messages via socket
```

**Run:** `npm run test` (unit) + `npm run test:e2e` (e2e)

### Frontend Testing

**Component tests** (Vitest + Testing Library):
```
Button.test.tsx       → renders all variants, handles click
Input.test.tsx        → shows error state, password toggle
LoginPage.test.tsx    → form validation, submit success, error display
OfferCard.test.tsx    → renders fields, conditional action buttons
```

**Install for frontend:**
```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

**`vite.config.ts` addition:**
```typescript
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  globals: true,
}
```

---

## EXECUTION ORDER SUMMARY

```
Week 1: Backend
  Day 1-2: Auth missing endpoints (OTP, forgot-password, email-verify)
  Day 2:   Files module (Cloudinary upload)
  Day 3:   Offers module (CRUD + report + verify)
  Day 4:   Notifications + Knowledge modules
  Day 5:   Messaging module (HTTP + Socket.IO gateway)

Week 2: Backend + Frontend foundation
  Day 1-2: Badges + Reports + Analytics + Chatbot modules
  Day 2:   Register all modules in AppModule
  Day 3-4: Frontend: AdminLayout + AppLayout + AuthLayout
  Day 5:   Frontend: All UI primitives (Button, Input, Card, Avatar, etc.)

Week 3: Frontend features
  Day 1-2: Auth pages (Onboarding → Login → Signup → OTP → Role → Forgot)
  Day 3:   Home + Find pages
  Day 4-5: Offers pages (list, detail, new offer 3-step, my offers)

Week 4: Frontend features + Admin
  Day 1:   Knowledge pages + Chatbot page
  Day 2:   Messaging + Profile + Settings pages
  Day 3:   Admin Overview + Collectors + Recyclers pages
  Day 4:   Admin Offers + Knowledge + Badges + Settings pages
  Day 5:   i18n translations + Router wiring + Socket.IO + Final API clients

Week 5: Polish + Testing
  Day 1-2: Backend unit tests + e2e tests
  Day 3:   Frontend component tests
  Day 4:   RTL (Arabic) layout verification
  Day 5:   Performance audit + Lighthouse + deploy prep
```

---

## ACCEPTANCE CRITERIA PER MODULE

| Module | Acceptance Test |
|---|---|
| Auth | Register → OTP → login → refresh → logout full round-trip works |
| Files | Upload 5MB PNG → Cloudinary URL returned; 6MB rejected |
| Offers | Collecteur creates offer → visible in /offers; admin verifies it |
| Notifications | Badge awarded → notification appears in /notifications |
| Knowledge | Admin publishes article → appears on /knowledge/articles |
| Messaging | Two users exchange 3 messages via Socket.IO in <200ms |
| Badges | User hits 100kg → Collecteur Bronze auto-awarded + notification |
| Chatbot | Message sent → AI reply in <3s; "parler humain" → escalation |
| Analytics | Admin dashboard loads all 4 chart datasets without error |
| Reports | User reports offer → appears in admin /reports; admin dismisses |
| Admin UI | All 8 admin pages render with real data from API |
| i18n | Switch to Arabic → all text switches + layout flips RTL |
| Mobile app | All 40+ mobile pages render correctly at 402px width |

---

## DEPENDENCY INSTALL COMMANDS

```bash
# Backend
cd recaplink-back
npm install \
  @nestjs/websockets @nestjs/platform-socket.io socket.io \
  @nestjs-modules/mailer nodemailer @types/nodemailer \
  cloudinary multer @nestjs/multer @types/multer \
  nanoid \
  openai

# Frontend
cd recaplink
# No new installs needed — all dependencies already in package.json
# shadcn UI when ready:
npx shadcn@canary init
npx shadcn@canary add button input dialog sheet tabs badge avatar skeleton form select textarea progress separator
```

---

## FILE CREATION ORDER (Claude Code Execution)

When implementing module by module, always follow this order per module:

```
1. Backend schema (mongoose @Schema)
2. Backend DTOs (class-validator)
3. Backend repository (if complex queries)
4. Backend service (business logic)
5. Backend controller (route definitions)
6. Backend module (register providers/imports)
7. Register in AppModule
8. Test with curl/httpie
9. Frontend type (already done for core types)
10. Frontend API client function
11. Frontend React Query hook
12. Frontend page component
13. Frontend wire into router
14. Test in browser
```
