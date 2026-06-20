# RecapLink — Production-Ready Architecture & Execution Blueprint

> **Single source of truth** for all technical decisions on the RecapLink platform.  
> Figma reference: `fileKey = 2NSgpazb2JTXX8yept8u91` (pages: IOS, Composant)  
> Desktop screenshots are the authoritative visual spec for the web dashboard.

---

## 1. Figma Compliance Audit

### Current Status by Section

| Section | Layout Approach | Figma Match | Action |
|---|---|---|---|
| `/admin/*` | Web dashboard (sidebar + header) | ✅ Correct | Minor polish only |
| `/login`, `/signup`, auth | Desktop split or centered | ✅ Correct | Keep as-is |
| `/home`, `/offers/*` | **Mobile** (`max-w-402px` + BottomNav) | ❌ Wrong | **Full redesign** |
| `/knowledge/*` | Mobile layout | ❌ Wrong | **Full redesign** |
| `/messaging/*` | Mobile layout | ❌ Wrong | **Full redesign** |
| `/profile/*` | Mobile layout | ❌ Wrong | **Full redesign** |
| `/chatbot` | Mobile layout | ❌ Wrong | **Full redesign** |
| `/notifications` | Mobile layout | ❌ Wrong | **Full redesign** |
| `/settings` | Mobile layout | ❌ Wrong | **Full redesign** |

### Design System Tokens (extracted from screenshots & index.css)

```
Colors:
  primary:        #4d9538   (green — main brand)
  primary-dark:   #038543   (dark green — hover states)
  primary-light:  #ebf5ea   (light green bg — active states)
  primary-bg:     #f0f9f0   (page background)
  crimson:        #c41539   (error / suspended / accent red)
  charcoal:       #231F20   (body text)
  amber:          #f5c518   (yellow — recycleurs, ratings)

Typography (Poppins / Cairo for RTL):
  page-title:     font-bold text-xl text-[#231F20]
  section-title:  font-bold text-sm text-[#231F20]
  body:           text-sm text-gray-600
  caption:        text-xs text-gray-500
  tiny:           text-[10px] text-gray-400

Layout:
  Header height:  68px (sticky, bg-[#4d9538])
  Sidebar width:  168px (admin) | 200px (user app)
  Page padding:   p-6 (24px)
  Card radius:    rounded-2xl (16px)
  Button radius:  rounded-xl (12px)
  Input radius:   rounded-xl (12px)
  Page bg:        bg-[#f0f9f0]
  Sidebar bg:     bg-white
```

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   React 19 + Vite 8 + TailwindCSS v4 + TypeScript 6            │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│   │  Auth Flow   │  │  User App    │  │  Admin Dashboard   │   │
│   │  /login etc  │  │  /home etc   │  │  /admin/*          │   │
│   └──────────────┘  └──────────────┘  └────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST + WebSocket (Socket.io)
┌──────────────────────────────▼──────────────────────────────────┐
│                      NestJS API (port 3000)                     │
│   JWT Auth + RBAC Guards + Swagger /api/docs                    │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐   │
│   │  Auth  │ │ Users  │ │ Offers │ │  Chat  │ │  Analytics │   │
│   └────────┘ └────────┘ └────────┘ └────────┘ └────────────┘   │
│   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐   │
│   │ Badges │ │ Know.  │ │Chatbot │ │ Notifs │ │  Reports   │   │
│   └────────┘ └────────┘ └────────┘ └────────┘ └────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                         DATA LAYER                              │
│   MongoDB (Mongoose) │ Cloudinary (files) │ Socket.io           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Architecture

### Stack
- **Framework**: React 19 + Vite 8 (keep — Next.js migration not warranted)
- **Styling**: TailwindCSS v4 (design tokens configured in `index.css`)
- **State**: Zustand (auth, socket, ui stores)
- **Server state**: TanStack Query v5
- **Forms**: React Hook Form + Zod
- **i18n**: i18next (FR / AR / WO)
- **Charts**: Recharts
- **Realtime**: socket.io-client

### Folder Structure
```
src/
├── components/
│   ├── navigation/
│   │   └── sidebar-nav.tsx          # NEW — shared sidebar (user app)
│   └── ui/
│       ├── avatar.tsx               ✅
│       ├── button.tsx               ✅
│       ├── chip.tsx                 ✅
│       ├── empty-state.tsx          ✅
│       ├── input.tsx                ✅
│       ├── language-switcher.tsx    ✅
│       ├── modal.tsx                ✅
│       ├── page-header.tsx          ✅
│       └── skeleton.tsx             ✅
├── features/
│   ├── admin/pages/                 ✅ DONE — 8 pages, keep as-is
│   ├── auth/pages/                  ✅ DONE — 8 pages, keep as-is
│   ├── chatbot/pages/               ❌ REDESIGN to web dashboard
│   ├── home/pages/                  ❌ REDESIGN to web dashboard
│   ├── knowledge/pages/             ❌ REDESIGN to web dashboard
│   ├── messaging/pages/             ❌ REDESIGN to web dashboard
│   ├── notifications/pages/         ❌ REDESIGN to web dashboard
│   ├── offers/pages/                ❌ REDESIGN to web dashboard
│   ├── profile/pages/               ❌ REDESIGN to web dashboard
│   └── settings/pages/              ❌ REDESIGN to web dashboard
├── layouts/
│   ├── AdminLayout.tsx              ✅ DONE (sidebar 168px + header)
│   ├── AppLayout.tsx                ❌ REDESIGN (replace mobile with web dashboard)
│   └── AuthLayout.tsx               ✅ DONE
├── lib/api/                         ✅ DONE — all API modules
├── router/index.tsx                 ✅ DONE
├── store/                           ✅ DONE
└── types/                           ✅ DONE
```

### Web Dashboard Layout Spec (User App)

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER h-[68px]  bg-[#4d9538]  sticky top-0 z-40               │
│ [Logo+Name 200px] [Page Title] [────Search────] [Bell] [Avatar] │
├──────────────────────┬──────────────────────────────────────────┤
│ SIDEBAR w-[200px]    │ MAIN CONTENT  flex-1  p-6                │
│ bg-white border-r    │ bg-[#f0f9f0]  min-h-[calc(100vh-68px)]  │
│ sticky h-screen      │                                          │
│                      │  <Outlet />                              │
│  🏠 Accueil          │                                          │
│  📦 Offres           │                                          │
│  💬 Messagerie       │                                          │
│  📚 Savoir-faire     │                                          │
│  🤖 Chatbot          │                                          │
│  🔔 Notifications    │                                          │
│  ───────────────     │                                          │
│  👤 Profil           │                                          │
│  ⚙️  Paramètres      │                                          │
│                      │                                          │
│  [Support widget]    │                                          │
│  [User avatar card]  │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

### Route Map
```
/                      → Onboarding (guest)
/login                 → LoginPage
/signup                → SignupPage
/verify                → VerifyPage
/role                  → RolePage
/welcome               → WelcomePage
/forgot-password       → ForgotPasswordPage
/reset-password        → ResetPasswordPage

/home                  → HomePage (dashboard: search + quick actions)
/offers                → OffersPage (list + filters)
/offers/new            → NewOfferPage (create form)
/offers/mine           → MyOffersPage (my listings)
/offers/:id            → OfferDetailPage (detail + contact)
/knowledge             → KnowledgePage (articles grid)
/knowledge/:slug       → KnowledgeDetailPage
/chatbot               → ChatbotPage (AI chat interface)
/messaging             → MessagingPage (conversation list)
/messaging/:id         → ConversationPage (chat)
/profile               → ProfilePage (view)
/profile/edit          → EditProfilePage
/profile/badges        → BadgesPage
/notifications         → NotificationsPage
/settings              → SettingsPage

/admin                 → redirect /admin/overview
/admin/overview        → AdminOverviewPage ✅
/admin/collectors      → AdminCollectorsPage ✅
/admin/recyclers       → AdminRecyclersPage
/admin/offers          → AdminOffersPage
/admin/knowledge       → AdminKnowledgePage
/admin/badges          → AdminBadgesPage ✅
/admin/settings        → AdminSettingsPage ✅
/admin/profile         → AdminProfilePage ✅
```

---

## 4. Backend Architecture

### Stack (current — keep as-is)
- **Framework**: NestJS (modular monolith)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT access (15min) + Refresh tokens (7d)
- **Realtime**: Socket.io namespace `/chat`
- **Files**: Cloudinary
- **Docs**: Swagger at `/api/docs`

### Module Inventory

| Module | Controller | Service | Schema | Status |
|---|---|---|---|---|
| Auth | auth.controller | auth.service | user.schema | ✅ Done |
| Users | users.controller | users.service | user.schema | ✅ Done |
| Offers | offers.controller | offers.service | offer.schema | ✅ Done |
| Messaging | messaging.controller | messaging.service | conversation + message | ✅ Done |
| Notifications | notifications.controller | notifications.service | notification.schema | ✅ Done |
| Knowledge | knowledge.controller | knowledge.service | knowledge.schema | ✅ Done |
| Chatbot | chatbot.controller | chatbot.service | chatbot-session.schema | ✅ Done |
| Badges | badges.controller | badges.service | badge + user-badge | ✅ Done |
| Files | files.controller | files.service | — (Cloudinary) | ✅ Done |
| Reports | reports.controller | reports.service | report.schema | ✅ Done |
| Analytics | analytics.controller | analytics.service | — (aggregation) | ✅ Done |
| Feedback | feedback.controller | feedback.service | feedback.schema | ✅ Done |

### Roles (RBAC)
```typescript
enum Role {
  COLLECTEUR = 'collecteur'   // plastic collectors
  RECYCLEUR  = 'recycleur'    // plastic recyclers
  VENDEUR    = 'vendeur'      // plastic sellers
  ADMIN      = 'admin'        // platform admin
}
```

### API Conventions
```
Base URL:       http://localhost:3000/api
Auth header:    Authorization: Bearer <accessToken>
Response shape: { success: boolean, message: string, data: T, meta?: Pagination }
Pagination:     { data: T[], total, page, limit, totalPages }
Error shape:    { statusCode, message, error }
```

---

## 5. Module API Reference

### Auth Module
```
POST /api/auth/register         Register (role in body)
POST /api/auth/login            → { user, accessToken, refreshToken }
POST /api/auth/refresh          → { accessToken }
POST /api/auth/verify-email     Verify OTP
POST /api/auth/forgot-password  Send reset email
POST /api/auth/reset-password   Reset with token
POST /api/auth/logout           Blacklist refresh token
GET  /api/auth/me               Current user profile
```

### Users Module
```
GET    /api/users                      Public user list
GET    /api/users/:id                  User profile
PATCH  /api/users/me                   Update my profile
GET    /api/admin/users                Admin: list with filters
PATCH  /api/admin/users/:id/status     Admin: update status
DELETE /api/admin/users/:id            Admin: delete user
```

### Offers Module
```
GET    /api/offers                     List offers (filter: plasticType, zone, status)
POST   /api/offers                     Create offer
GET    /api/offers/:id                 Offer detail
PATCH  /api/offers/:id                 Update offer (owner only)
DELETE /api/offers/:id                 Delete (owner / admin)
GET    /api/offers/mine                My offers
PATCH  /api/admin/offers/:id/approve   Admin approve
PATCH  /api/admin/offers/:id/reject    Admin reject
```

### Messaging Module
```
GET  /api/conversations               My conversations
POST /api/conversations               Start conversation
GET  /api/conversations/:id           Conversation + messages
POST /api/conversations/:id/messages  Send message
```

**Socket.io events:**
```
Client→Server:  join_conversation, send_message, typing, read_messages
Server→Client:  new_message, user_typing, message_read, online_status
```

### Notifications Module
```
GET   /api/notifications             My notifications (paginated)
PATCH /api/notifications/:id/read    Mark read
PATCH /api/notifications/read-all    Mark all read
```

### Knowledge Module
```
GET    /api/knowledge                Articles list (filter: category, type)
GET    /api/knowledge/:slug          Article detail
POST   /api/admin/knowledge          Create article
PATCH  /api/admin/knowledge/:id      Update article
DELETE /api/admin/knowledge/:id      Delete article
PATCH  /api/admin/knowledge/:id/publish  Toggle publish
```

### Badges Module
```
GET    /api/badges                   All badges
GET    /api/badges/mine              My badges
POST   /api/admin/badges             Create badge
PATCH  /api/admin/badges/:id         Update badge
DELETE /api/admin/badges/:id         Delete badge
POST   /api/admin/badges/:id/award   Award to user(s)
```

### Analytics Module
```
GET /api/admin/analytics/overview        KPIs summary
GET /api/admin/analytics/registrations   Monthly registrations
GET /api/admin/analytics/collections     Collections by zone
GET /api/admin/analytics/offers          Offers by plastic type
GET /api/admin/analytics/activity        Recent activity feed
```

### Files Module
```
POST   /api/files/upload            Upload file → { url, publicId }
POST   /api/files/upload-multiple   Multiple → [{ url, publicId }]
DELETE /api/files/:publicId         Delete file
```

---

## 6. State Management

### Zustand Stores
```typescript
// auth.store.ts  — ✅ Done
{ user, accessToken, isAuthenticated, setAuth(), logout() }

// socket.store.ts  — ✅ Done
{ socket, isConnected, unreadCount, setSocket(), setConnected(), incrementUnread(), clearSocket() }

// ui.store.ts  — ✅ Done
{ dir: 'ltr'|'rtl', lang: 'fr'|'ar'|'wo', setLang() }
```

### TanStack Query Key Convention
```typescript
['admin', 'overview']
['admin', 'collectors', statusFilter, search, page]
['admin', 'badges']
['offers', filter, search, page]
['offers', 'mine', page]
['offers', id]
['conversations']
['conversations', id]
['notifications', page]
['knowledge', category, type, page]
['knowledge', slug]
['badges']
['badges', 'mine']
['user', 'me']
```

---

## 7. Security Strategy

| Layer | Mechanism |
|---|---|
| Auth tokens | JWT access (15min) + Refresh (7d, HttpOnly cookie) |
| RBAC | `@Roles()` guard on all protected NestJS routes |
| Input validation | `class-validator` DTOs on every endpoint |
| File upload | MIME type whitelist (image/*, application/pdf) + 10MB max |
| Rate limiting | `@nestjs/throttler` — 100 req/min per IP |
| CORS | Allow only `FRONTEND_URL` env var origin |
| XSS | React escapes by default; avoid `dangerouslySetInnerHTML` |
| Injection | Mongoose sanitizes MongoDB queries; no raw string interpolation |

---

## 8. Internationalization

| Language | Code | Direction | Font |
|---|---|---|---|
| Français | `fr` | LTR | Poppins |
| العربية | `ar` | RTL | Cairo |
| Wolof | `wo` | LTR | Poppins |

- RTL handled via `dir` attribute on `<html>` driven by `ui.store`
- All user-visible text via `useTranslation()` from react-i18next
- Multi-language database fields: `{ fr: string; ar?: string; wo?: string }`

---

## 9. Delivery Roadmap

### Phase 1 — Web Dashboard Conversion (CURRENT — Critical)

Convert all mobile `/app` pages to desktop web dashboard format.

| Task | File | Status |
|---|---|---|
| Replace AppLayout mobile shell | `AppLayout.tsx` | ⬜ |
| Redesign HomePage | `home/pages/HomePage.tsx` | ⬜ |
| Redesign OffersPage | `offers/pages/OffersPage.tsx` | ⬜ |
| Redesign NewOfferPage | `offers/pages/NewOfferPage.tsx` | ⬜ |
| Redesign MyOffersPage | `offers/pages/MyOffersPage.tsx` | ⬜ |
| Redesign OfferDetailPage | `offers/pages/OfferDetailPage.tsx` | ⬜ |
| Redesign KnowledgePage | `knowledge/pages/KnowledgePage.tsx` | ⬜ |
| Redesign KnowledgeDetailPage | `knowledge/pages/KnowledgeDetailPage.tsx` | ⬜ |
| Redesign MessagingPage | `messaging/pages/MessagingPage.tsx` | ⬜ |
| Redesign ConversationPage | `messaging/pages/ConversationPage.tsx` | ⬜ |
| Redesign ProfilePage | `profile/pages/ProfilePage.tsx` | ⬜ |
| Redesign EditProfilePage | `profile/pages/EditProfilePage.tsx` | ⬜ |
| Redesign BadgesPage | `profile/pages/BadgesPage.tsx` | ⬜ |
| Redesign ChatbotPage | `chatbot/pages/ChatbotPage.tsx` | ⬜ |
| Redesign NotificationsPage | `notifications/pages/NotificationsPage.tsx` | ⬜ |
| Redesign SettingsPage | `settings/pages/SettingsPage.tsx` | ⬜ |

**Acceptance criteria:** No `max-w-[402px]` or BottomNav in non-admin/non-auth pages. All pages desktop-first with sidebar + header.

### Phase 2 — Admin Completions

| Task | File | Status |
|---|---|---|
| AdminRecyclersPage audit | `admin/pages/AdminRecyclersPage.tsx` | ⬜ |
| AdminOffersPage audit | `admin/pages/AdminOffersPage.tsx` | ⬜ |
| AdminKnowledgePage audit | `admin/pages/AdminKnowledgePage.tsx` | ⬜ |

### Phase 3 — Backend Enhancements

| Task | Notes |
|---|---|
| Geolocation index | Add `2dsphere` index on User + Offer `location.coordinates` |
| Email service | Nodemailer/SendGrid for verification + password reset |
| Push notifications | OneSignal or Firebase FCM |
| Rate limiting | `@nestjs/throttler` |
| Analytics export | CSV export endpoint |

### Phase 4 — Feature Wire-up

| Feature | Component |
|---|---|
| Real-time messaging | ConversationPage + socket events |
| Image upload in offers | NewOfferPage + files.api |
| Knowledge article create/edit | AdminKnowledgePage modals |
| Badge award flow | AdminBadgesPage → user select modal |
| Chatbot AI | ChatbotPage → /api/chatbot/message |
| Geo search | HomePage + OffersPage |
| Notification bell badge | AppLayout header |
| Profile avatar upload | EditProfilePage |

### Phase 5 — Testing

| Layer | Tool | Target |
|---|---|---|
| Unit (BE services) | Jest | 80% coverage |
| Integration (BE) | Jest + supertest | All endpoints |
| E2E | Playwright | Login, offer create, messaging |
| Frontend components | Vitest + Testing Library | UI components |

### Phase 6 — Deployment

```
Frontend:  Vercel (SPA) or Nginx
Backend:   Docker on Railway / Render / VPS
Database:  MongoDB Atlas M10+
Files:     Cloudinary (current)
CI/CD:     GitHub Actions → test → build → deploy

Environment variables (frontend):
  VITE_API_URL=https://api.recaplink.tn/api

Environment variables (backend):
  PORT=3000
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=...
  JWT_REFRESH_SECRET=...
  CLOUDINARY_CLOUD_NAME=...
  CLOUDINARY_API_KEY=...
  CLOUDINARY_API_SECRET=...
  FRONTEND_URL=https://app.recaplink.tn
```

---

## 10. Development Standards

### Code Patterns

**Data fetching — always TanStack Query:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['offers', filter, page],
  queryFn: () => offersApi.list({ ... }).then(r => r.data.data),
})
```

**Mutations:**
```typescript
const { mutate } = useMutation({
  mutationFn: (data) => offersApi.create(data),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
})
```

**Static fallback pattern (every data section):**
```typescript
const items = data?.data || STATIC_FALLBACK
```

**Class composition:**
```typescript
import { clsx } from 'clsx'
className={clsx('base-class', isActive && 'active-class', error && 'error-class')}
```

### Component Rules
- Page components: default export, in `features/<feature>/pages/`
- Shared UI: named export, in `components/ui/`
- No inline `style={{ color: ... }}` for design system colors — use Tailwind
- All colors reference design tokens from `index.css @theme`
- No `max-w-[402px]` or mobile-specific classes outside AuthLayout
- No `BottomNav` in AppLayout or any app page
