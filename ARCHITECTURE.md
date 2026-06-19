# RecapLink — Frontend Architecture Document

> Source of truth: Figma file `2NSgpazb2JTXX8yept8u91` · 201 screens · 2 pages (IOS, Composant)
> Stack: React 19 · Vite 8 · TypeScript 6 · Tailwind v4 · React Router v7 · React Query v5 · Zustand v5 · Axios · React Hook Form + Zod · i18next · lucide-react · Recharts · Socket.IO

---

## 1. Design System

### 1.1 Colors

```css
/* src/index.css — @theme block (Tailwind v4) */
@theme {
  --color-green-primary: #4d9538;   /* brand green — buttons, nav, headers, borders */
  --color-green-dark:    #038543;   /* darker accent — gradients, hover states */
  --color-green-light:   #ebf5ea;   /* 20% tint — inactive tabs, bg highlights */
  --color-green-soft-1:  #e0f4d3;   /* gradient start — cards, chatbot bg */
  --color-green-soft-2:  #c9e7b6;   /* gradient end */
  --color-black:         #231f20;   /* near-black — body text, headings */
  --color-placeholder:   rgba(35,31,32,0.5);  /* input placeholders */
  --color-danger:        #c41539;   /* delete / error (BBW red) */
  --color-white:         #ffffff;
}
```

| Token | Hex | Usage |
|---|---|---|
| `green-primary` | `#4d9538` | Primary buttons, nav bar, headers, input borders |
| `green-dark` | `#038543` | Gradient end, hover states |
| `green-light` | `#ebf5ea` | Inactive tab bg, card tints |
| `green-soft-1/2` | `#e0f4d3→#c9e7b6` | Card gradients (chatbot, savoir-faire) |
| `black` | `#231f20` | All body text, icons |
| `placeholder` | `rgba(35,31,32,0.5)` | Input placeholder text |
| `danger` | `#c41539` | Delete account, error states |

### 1.2 Typography

Two font families. Load both via `@font-face` or Google Fonts in `index.html`.

| Token | Family | Weight | Size | Usage |
|---|---|---|---|---|
| `text-display` | Poppins | 700 | 16px | CTA buttons only |
| `text-h4` | Inter | 700 | 24px | Large numbers, hero values |
| `text-h3` | Inter | 700 | 16px | Section headings, card titles |
| `text-h2` | Inter | 700 | 12px | Sub-labels, badge text |
| `text-body` | Inter | 400 | 16px | Body copy, form values |
| `text-par` | Inter | 400 | 12px | Supporting copy, descriptions |
| `text-caption` | Inter | 400 / 700 | 11-12px | Nav labels, timestamps |
| `text-placeholder` | Inter | 400 | 10px | Input placeholders |
| `text-status` | Inter | 600 | 15px | Status bar time |

```css
/* Tailwind v4 @theme additions */
@theme {
  --font-inter:   'Inter', sans-serif;
  --font-poppins: 'Poppins', sans-serif;
}
```

### 1.3 Spacing Scale

Base unit: 4px (Tailwind default). Key design values extracted:

| Usage | Value |
|---|---|
| Screen horizontal padding | 21px (`px-5`) |
| Form field horizontal offset | 51px (centered, 300px wide on 402px) |
| Card inner padding | 20px |
| Nav bar height | 77px |
| Header height | 44px (status) + 61px (title bar) = 105px |
| Input height | 50px (standard) / 40px (compact) / 60px (large CTA) |
| Bottom nav bottom margin | 20px |

### 1.4 Border Radius

```css
@theme {
  --radius-input:    10px;   /* all form fields */
  --radius-card:     12px;   /* cards, tiles, tag chips */
  --radius-card-lg:  15px;   /* role selector cards */
  --radius-tile:      5px;   /* home dashboard tiles */
  --radius-segment:  12px;   /* language toggle, tab segments */
  --radius-pill:     30px;   /* primary CTA buttons */
  --radius-sm:        8px;   /* secondary/icon buttons */
  --radius-nav:      20px;   /* bottom navigation bar */
}
```

### 1.5 Shadows

```css
@theme {
  --shadow-header: 0px 2px 48px 0px rgba(0, 0, 0, 0.13);
  --shadow-button: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  --shadow-card:   0px 2px 12px 0px rgba(0, 0, 0, 0.08);
}
```

### 1.6 Gradients

```css
/* Utility classes */
.bg-gradient-primary { background: linear-gradient(to bottom, #4d9538, #038543); }
.bg-gradient-soft    { background: linear-gradient(to bottom, #e0f4d3, #c9e7b6); }
```

### 1.7 Responsive Breakpoints

The app is **mobile-first** (375px base, iOS screen width 402px in Figma). Web admin dashboard is **desktop** (≥ 1024px).

```css
@theme {
  --breakpoint-sm:  480px;   /* large mobile */
  --breakpoint-md:  768px;   /* tablet */
  --breakpoint-lg: 1024px;   /* admin dashboard starts */
  --breakpoint-xl: 1280px;   /* wide desktop */
}
```

### 1.8 Icons

Library: **lucide-react** (already installed). All icons are `24×24` by default.
Custom SVG assets (logo, nav icons, language flags) live in `src/assets/`.

---

## 2. Screen Inventory & Route Map

### 2.1 Mobile App Routes (React Router v7)

#### Auth Group — no nav bar, no auth required

| Route | Figma Screen | Screen Name |
|---|---|---|
| `/` | 1-3 Onboarding | Carousel splash (3 slides, FR/AR/WO) |
| `/login` | 5-Sign In | Email or Phone + Password |
| `/signup` | 6-Sign up | Mobile sign-up form |
| `/verify` | 7-8 Validation | OTP code entry + text confirmation |
| `/role` | 9-Role Verification | Collecteur / Recycleur / Vendeur selector |
| `/welcome` | 10-Successful Registration | Success screen |
| `/forgot-password` | 11-mot de passe oublié | Enter email |
| `/forgot-password/check` | 12-mot de passe oublié | Check inbox |
| `/forgot-password/verify` | 13-mot de passe oublié | Enter code |
| `/reset-password` | 14-15 créer mot de passe | New password + confirm |
| `/reset-password/success` | 16-mot de passe confirmé | Success |

#### Main App Group — bottom nav, auth required

| Route | Figma Screen | Screen Name |
|---|---|---|
| `/home` | 20-Acceuil | Home dashboard (search, tiles) |
| `/find` | 21-Trouver recyclage | Find collector/recycler map |
| `/find/select` | 22-select collecteur | Select from list |
| `/offers` | 23-Ui_OffresPage | Offer listing (filtered) |
| `/offers/new` | 40-42 multi-step | Create offer (3 steps) |
| `/offers/mine` | 43-Ui_Mes offres | My offers list |
| `/offers/:id` | 46-47 Ui_Détail Offre | Offer detail |
| `/offers/:id/edit` | 44-Modifier l'offre | Edit offer form |
| `/knowledge` | 30-Ui_Savoir-faire | Knowledge hub |
| `/knowledge/articles` | 31-Ui_Listes_Articles | Articles list |
| `/knowledge/videos` | 32-Ui_Listes_Videos | Videos list |
| `/knowledge/tutorials` | 33-Ui_Listes_Tutoriels | Tutorials list |
| `/knowledge/article/:id` | 34-Ui_Article | Article reader |
| `/knowledge/video/:id` | 35-Ui_Video | Video player |
| `/knowledge/tutorial/:id` | 36-39 Ui_Tutoriel | Tutorial steps (1-4) |
| `/chatbot` | 25-29 ChatBot | AI chat conversation |
| `/messaging` | 51-52 Messagerie | Conversation list |
| `/messaging/:id` | 53-71 Messagerie | Chat thread |
| `/settings` | 69-Ui_Paramètres | Settings menu |
| `/settings/about` | 70-Informations | App info |
| `/settings/privacy` | 71-Politique | Privacy policy |
| `/profile` | 73-Ui_compte | My profile / account |
| `/profile/edit` | 78-Modifier le profil | Edit profile form |
| `/profile/badges` | 77-Mes badges | Badge gallery |
| `/profile/badge/:id` | 76-badge | Badge detail |
| `/notifications` | 74-75 Ui_Notifications | Notification list |
| `/profile/:id` | 24-Recycleur | Other user profile |

#### Error / Utility Routes

| Route | Figma Screen |
|---|---|
| `/404` | 17-404 |
| `/no-internet` | 19-pas d'internet |
| `/no-notifications` | 18-pas de Notifs |

### 2.2 Admin Dashboard Routes

Separate layout, desktop-only (≥ 1024px), role `admin` required.

| Route | Purpose |
|---|---|
| `/admin` | Redirect → `/admin/overview` |
| `/admin/overview` | Stats dashboard (Recharts graphs) |
| `/admin/collectors` | Collector management table |
| `/admin/recyclers` | Recycler management table |
| `/admin/sellers` | Vendeur plastique management |
| `/admin/offers` | All offers management |
| `/admin/knowledge` | Content management (articles, videos, tutorials) |
| `/admin/badges` | Badge CRUD |
| `/admin/settings` | Platform settings |

### 2.3 User Flow

```
Onboarding → Login
                ├── Forgot password → Reset → Login
                └── Sign up → OTP verify → Role select → Welcome → Home

Home (bottom nav)
  ├── Home dashboard
  │     ├── Find collector/recycler → Select → Profile
  │     ├── Chatbot
  │     ├── Savoir-faire → Articles / Videos / Tutorials → Detail
  │     └── Publish offer → Offer form (3 steps)
  ├── Offers → My offers / Browse → Detail → Report/Edit/Delete
  ├── Messaging → Conversations → Chat thread
  ├── Settings → About / Privacy / Logout
  └── Profile → Edit / Badges / Notifications
```

---

## 3. Component Inventory

### 3.1 Layout Components

| Component | Path | Description |
|---|---|---|
| `AppLayout` | `layouts/AppLayout.tsx` | Main mobile wrapper (max-w-[402px], centered) |
| `AdminLayout` | `layouts/AdminLayout.tsx` | Desktop sidebar + header shell |
| `AuthLayout` | `layouts/AuthLayout.tsx` | Centered card, no nav |
| `BottomNav` | `components/navigation/BottomNav.tsx` | 5-tab nav: Home, Offers, Messaging, Settings, Profile |
| `PageHeader` | `components/navigation/PageHeader.tsx` | Green header bar with back button + title |
| `StatusBar` | `components/navigation/StatusBar.tsx` | iOS status bar (decorative, light/dark variants) |

### 3.2 UI Primitives (Shared)

| Component | Variants | Figma ref |
|---|---|---|
| `Button` | `primary` (green pill), `secondary` (outlined), `danger` (outlined red), `ghost` | Button component |
| `Input` | `text`, `password`, `tel`, `search`, `textarea` | Input_Email, Input_Password |
| `Select` | dropdown | Products/plastic types |
| `Checkbox` | default, checked | Check-Box component |
| `RadioButton` | default, selected | Radio-button component |
| `Toggle` | on/off (dark mode) | dark mode, toggle components |
| `Avatar` | size: sm/md/lg, with badge | Ellipse profile |
| `Badge` | gamification badge chip | badge component |
| `Card` | base card wrapper | multiple |
| `PageDots` | slider indicator | dotSlider |
| `Skeleton` | loading placeholder | — |
| `EmptyState` | icon + message | 18-pas de Notifs, 52-Messager vide |
| `ErrorState` | 404, no internet | 17-404, 19-pas d'internet |
| `Modal` | confirmation dialogs | 48-confirm suppression, 49-confirm modification |
| `Toast` | success/error feedback | — |
| `ProgressBar` | badge progress | progression in UserProfile |

### 3.3 Domain Components

| Component | Feature | Description |
|---|---|---|
| `OfferCard` | offers | Thumbnail, type badge, price, location |
| `OfferDetail` | offers | Full detail with images, owner, actions |
| `OfferForm` | offers | 3-step form (Info, Location, Images) |
| `OfferFilters` | offers | PlasticType, zone, status filters |
| `KnowledgeCard` | knowledge | Article/video/tutorial card |
| `KnowledgeTabs` | knowledge | Articles / Vidéos / Tutoriels tab bar |
| `TutorialStep` | knowledge | Single tutorial step view |
| `VideoPlayer` | knowledge | Embedded video player wrapper |
| `ChatBubble` | messaging/chatbot | User / assistant message bubble |
| `ConversationRow` | messaging | List item: avatar, name, last msg, unread |
| `MessageInput` | messaging | Text + attachment + send |
| `UserCard` | profile | Collector/recycler profile card |
| `UserTypeSelector` | auth/profile | Collecteur / Recycleur / Vendeur selector |
| `BadgeCard` | profile | Badge icon + name + progress |
| `NotificationRow` | notifications | Icon, title, body, timestamp |
| `RatingStars` | profile/offers | Star rating display |
| `PlasticTypeTag` | offers | Colored chip: PET, HDPE, PP, PVC, Autres |

### 3.4 Feature-Specific Components

| Component | Feature |
|---|---|
| `LanguageSwitcher` | i18n — FR/AR/WO flag toggle (Multi-Langue) |
| `DarkModeToggle` | settings |
| `OnboardingSlide` | onboarding carousel |
| `OTPInput` | auth — 6-digit code |
| `ImageUpload` | offers/profile — react-dropzone wrapper |
| `LocationPicker` | offers/home — address input + GPS |
| `ChatbotMessage` | chatbot — AI response with actions |
| `AdminSidebar` | admin |
| `AdminDataTable` | admin — sortable/filterable table |
| `AdminStatCard` | admin — metric card with Recharts |

---

## 4. Frontend Architecture

### 4.1 Folder Structure

```
src/
├── assets/                    # Static assets
│   ├── icons/                 # Custom SVG icons (logo, nav icons)
│   ├── images/                # Illustrations (onboarding, chatbot, etc.)
│   └── flags/                 # FR, AR, WO flag images
│
├── components/                # Truly shared, domain-agnostic UI
│   ├── ui/                    # Primitives: Button, Input, Card, Badge, Modal…
│   ├── navigation/            # BottomNav, PageHeader, StatusBar, AdminSidebar
│   ├── feedback/              # EmptyState, ErrorState, Skeleton, Toast
│   └── forms/                 # FormField, OTPInput, ImageUpload, LocationPicker
│
├── features/                  # Feature slices (co-locate component + hook + api)
│   ├── auth/
│   │   ├── components/        # LoginForm, SignupForm, OTPInput, RoleSelector
│   │   ├── hooks/             # useLogin, useRegister, useForgotPassword
│   │   ├── pages/             # LoginPage, SignupPage, VerifyPage, RolePage…
│   │   └── schemas/           # zod schemas for all auth forms
│   ├── home/
│   │   ├── components/        # HomeGrid, FindCollectorWidget, PublishBanner
│   │   └── pages/             # HomePage
│   ├── offers/
│   │   ├── components/        # OfferCard, OfferDetail, OfferForm, OfferFilters
│   │   ├── hooks/             # useOffers, useOffer, useCreateOffer, useMyOffers
│   │   ├── pages/             # OffersPage, OfferDetailPage, NewOfferPage, MyOffersPage
│   │   └── schemas/           # offerSchema
│   ├── knowledge/
│   │   ├── components/        # KnowledgeCard, KnowledgeTabs, TutorialStep, VideoPlayer
│   │   ├── hooks/             # useKnowledge, useKnowledgeItem
│   │   ├── pages/             # KnowledgePage, ArticlePage, VideoPage, TutorialPage
│   │   └── schemas/
│   ├── chatbot/
│   │   ├── components/        # ChatbotMessage, ChatbotInput, ChatbotHeader
│   │   ├── hooks/             # useChatbot
│   │   └── pages/             # ChatbotPage
│   ├── messaging/
│   │   ├── components/        # ConversationRow, ChatBubble, MessageInput
│   │   ├── hooks/             # useConversations, useMessages, useSocket
│   │   ├── pages/             # MessagingPage, ConversationPage
│   │   └── socket/            # Socket event handlers
│   ├── profile/
│   │   ├── components/        # UserCard, BadgeCard, NotificationRow, RatingStars
│   │   ├── hooks/             # useProfile, useEditProfile, useBadges, useNotifications
│   │   └── pages/             # ProfilePage, EditProfilePage, BadgesPage, NotificationsPage
│   ├── settings/
│   │   ├── components/        # DarkModeToggle, LanguageSwitcher
│   │   └── pages/             # SettingsPage, AboutPage, PrivacyPage
│   └── admin/
│       ├── components/        # AdminDataTable, AdminStatCard, AdminSidebar
│       ├── hooks/             # useAdminUsers, useAdminOffers, useAdminStats
│       └── pages/             # OverviewPage, CollectorsPage, OffersPage, BadgesPage…
│
├── hooks/                     # Cross-feature hooks
│   ├── useAuth.ts             # Auth state shortcut (from authStore)
│   ├── useDirection.ts        # RTL/LTR from uiStore
│   ├── usePagination.ts       # Shared pagination hook
│   └── useDebounce.ts
│
├── layouts/
│   ├── AppLayout.tsx          # Mobile shell (max-w-[402px], bottom nav)
│   ├── AuthLayout.tsx         # Centered, no nav
│   └── AdminLayout.tsx        # Desktop sidebar + topbar
│
├── lib/
│   ├── api/
│   │   ├── axios.ts           # Axios instance + interceptors (token inject, refresh)
│   │   ├── auth.api.ts
│   │   ├── offers.api.ts
│   │   ├── users.api.ts
│   │   ├── knowledge.api.ts   # to create
│   │   ├── messaging.api.ts   # to create
│   │   ├── badges.api.ts      # to create
│   │   ├── notifications.api.ts # to create
│   │   └── admin.api.ts       # to create
│   ├── queryClient.ts         # React Query client config
│   └── socket.ts              # Socket.IO client factory
│
├── i18n/
│   ├── index.ts               # i18next init
│   └── locales/
│       ├── fr/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── offers.json
│       │   ├── knowledge.json
│       │   ├── messaging.json
│       │   ├── profile.json
│       │   ├── settings.json
│       │   └── admin.json
│       ├── ar/                # same structure
│       └── wo/                # same structure
│
├── router/
│   ├── index.tsx              # createBrowserRouter root
│   ├── authRoutes.tsx         # Auth group (no layout guard)
│   ├── appRoutes.tsx          # Main app group (AppLayout + RequireAuth)
│   ├── adminRoutes.tsx        # Admin group (AdminLayout + RequireAdmin)
│   └── guards/
│       ├── RequireAuth.tsx    # Redirect to /login if !isAuthenticated
│       └── RequireAdmin.tsx   # Redirect if role !== 'admin'
│
├── store/
│   ├── auth.store.ts          # User, token, isAuthenticated
│   ├── ui.store.ts            # language, dir, darkMode, sidebarOpen
│   └── socket.store.ts        # socket, connected, unreadCount
│
├── types/
│   ├── api.types.ts           # ApiResponse, PaginatedResponse, ApiError, Language
│   ├── user.types.ts          # User, UserProfile, Role, UserStatus, PlasticType
│   ├── offer.types.ts         # Offer, OfferFilters, OfferLocation, OfferStatus
│   ├── knowledge.types.ts     # KnowledgeItem, KnowledgeFilters, KnowledgeType
│   ├── message.types.ts       # Message, Conversation, MessageType
│   └── badge.types.ts         # Badge, UserBadge, BadgeCategory
│
├── index.css                  # Tailwind v4 @import + @theme tokens
├── main.tsx                   # App entry
└── App.tsx                    # RouterProvider + QueryClientProvider + i18n init
```

### 4.2 Route Architecture (React Router v7)

```tsx
// src/router/index.tsx
createBrowserRouter([
  // Auth group
  {
    element: <AuthLayout />,
    children: [
      { path: '/', element: <OnboardingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/verify', element: <VerifyPage /> },
      { path: '/role', element: <RolePage /> },
      { path: '/welcome', element: <WelcomePage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/forgot-password/check', element: <ForgotCheckPage /> },
      { path: '/forgot-password/verify', element: <ForgotVerifyPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/reset-password/success', element: <ResetSuccessPage /> },
    ],
  },
  // Main mobile app
  {
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { path: '/home', element: <HomePage /> },
      { path: '/find', element: <FindPage /> },
      { path: '/find/select', element: <SelectCollectorPage /> },
      { path: '/offers', element: <OffersPage /> },
      { path: '/offers/new', element: <NewOfferPage /> },
      { path: '/offers/mine', element: <MyOffersPage /> },
      { path: '/offers/:id', element: <OfferDetailPage /> },
      { path: '/offers/:id/edit', element: <EditOfferPage /> },
      { path: '/knowledge', element: <KnowledgePage /> },
      { path: '/knowledge/articles', element: <ArticlesListPage /> },
      { path: '/knowledge/videos', element: <VideosListPage /> },
      { path: '/knowledge/tutorials', element: <TutorialsListPage /> },
      { path: '/knowledge/article/:id', element: <ArticlePage /> },
      { path: '/knowledge/video/:id', element: <VideoPage /> },
      { path: '/knowledge/tutorial/:id', element: <TutorialPage /> },
      { path: '/chatbot', element: <ChatbotPage /> },
      { path: '/messaging', element: <MessagingPage /> },
      { path: '/messaging/:id', element: <ConversationPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/settings/about', element: <AboutPage /> },
      { path: '/settings/privacy', element: <PrivacyPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/profile/edit', element: <EditProfilePage /> },
      { path: '/profile/badges', element: <BadgesPage /> },
      { path: '/profile/badge/:id', element: <BadgeDetailPage /> },
      { path: '/profile/:id', element: <UserProfilePage /> },
      { path: '/notifications', element: <NotificationsPage /> },
    ],
  },
  // Admin dashboard
  {
    path: '/admin',
    element: <RequireAdmin><AdminLayout /></RequireAdmin>,
    children: [
      { index: true, element: <Navigate to="/admin/overview" /> },
      { path: 'overview', element: <AdminOverviewPage /> },
      { path: 'collectors', element: <AdminCollectorsPage /> },
      { path: 'recyclers', element: <AdminRecyclersPage /> },
      { path: 'sellers', element: <AdminSellersPage /> },
      { path: 'offers', element: <AdminOffersPage /> },
      { path: 'knowledge', element: <AdminKnowledgePage /> },
      { path: 'badges', element: <AdminBadgesPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
  // Errors
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" /> },
])
```

### 4.3 State Management (Zustand v5)

Three stores, all in `src/store/`:

```
authStore   → user, accessToken, isAuthenticated         persisted (rl-auth)
uiStore     → language, dir, darkMode, sidebarOpen       persisted (rl-ui)
socketStore → socket, connected, unreadCount             in-memory only
```

**React Query handles all server state** — authStore only holds the token/user identity. No query results go into Zustand.

### 4.4 API Integration Strategy

```
Axios instance (src/lib/api/axios.ts)
  ├── baseURL: VITE_API_URL or /api
  ├── withCredentials: true  (refresh cookie)
  ├── request interceptor: inject Bearer token + Accept-Language header
  └── response interceptor: 401 → refresh token → retry queue

React Query (src/lib/queryClient.ts)
  ├── staleTime: 5 minutes for lists, 1 minute for details
  ├── retry: 1 (not for 401/403/404)
  ├── onError global: toast error
  └── Keys convention: ['resource', id?, filters?]
```

**Query key convention:**
```ts
// src/lib/queryKeys.ts
export const qk = {
  offers:        (f?: OfferFilters) => ['offers', f],
  offer:         (id: string)       => ['offers', id],
  myOffers:      ()                 => ['offers', 'mine'],
  knowledge:     (f?: KnowledgeFilters) => ['knowledge', f],
  knowledgeItem: (id: string)       => ['knowledge', id],
  conversations: ()                 => ['conversations'],
  messages:      (id: string)       => ['messages', id],
  profile:       (id: string)       => ['users', id],
  badges:        (id: string)       => ['users', id, 'badges'],
  notifications: ()                 => ['notifications'],
  adminStats:    ()                 => ['admin', 'stats'],
}
```

### 4.5 Layout Architecture (Mobile)

```
<div dir={dir}>                          ← RTL/LTR root
  <AppLayout>
    <div className="max-w-[402px] mx-auto min-h-dvh relative pb-[97px]">
      ┌─────────────────────────────────┐
      │         StatusBar (44px)        │
      │─────────────────────────────────│
      │         PageHeader (61px)       │ ← conditional per page
      │─────────────────────────────────│
      │                                 │
      │           <Outlet />            │ ← page content scrolls here
      │                                 │
      │                                 │
      │─────────────────────────────────│
      │    BottomNav (77px + 20px gap)  │ ← fixed bottom, inside max-w
      └─────────────────────────────────┘
    </div>
  </AppLayout>
</div>
```

**BottomNav tabs:**
```
Acceuil  |  Offres  |  Messagerie  |  Paramètres  |  Compte
  /home     /offers    /messaging     /settings      /profile
```

Active tab: white icon + bold label. Inactive: 50% opacity.

---

## 5. Internationalization

### 5.1 Languages

| Code | Language | Direction | Status |
|---|---|---|---|
| `fr` | Français | LTR | Default |
| `ar` | العربية | **RTL** | Full translation |
| `wo` | Wolof | LTR | Full translation |

### 5.2 i18next Configuration

```ts
// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS: 'common',
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'ar', 'wo'],
    ns: ['common', 'auth', 'offers', 'knowledge', 'messaging', 'profile', 'settings', 'admin'],
    resources: {
      fr: { common: frCommon, auth: frAuth, /* … */ },
      ar: { common: arCommon, /* … */ },
      wo: { common: woCommon, /* … */ },
    },
    interpolation: { escapeValue: false },
  })
```

### 5.3 Namespace Strategy

| Namespace | Contents |
|---|---|
| `common` | App name, buttons (save, cancel, back, delete, confirm), errors, empty states, nav labels |
| `auth` | Login/signup/reset forms, role names, onboarding copy |
| `offers` | Offer fields, plastic types, statuses, filters |
| `knowledge` | Article/video/tutorial labels, categories |
| `messaging` | Chat UI strings, system messages |
| `profile` | Profile fields, badge names/descriptions, notification copy |
| `settings` | Settings labels, dark mode, about, privacy |
| `admin` | Admin-only labels, table headers, action labels |

### 5.4 RTL Architecture

Arabic is the only RTL language. Strategy:

1. **Root dir attribute** — set by `uiStore.setLanguage()`:
   ```ts
   document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
   document.documentElement.lang = lang
   ```

2. **Tailwind RTL** — use `tailwindcss-rtl` plugin (already in devDependencies):
   - Replace `ms-4` / `me-4` for logical spacing (auto-flips)
   - Use `rtl:` prefix for directional overrides: `rtl:text-right`, `rtl:flex-row-reverse`

3. **Font** — Inter handles Arabic numerals. For Arabic text, add `'Cairo'` or `'Noto Sans Arabic'` as an Arabic-specific fallback in CSS:
   ```css
   :lang(ar) { font-family: 'Cairo', 'Inter', sans-serif; }
   ```

4. **Inputs** — all inputs use `dir="auto"` attribute (already in Figma-extracted code).

5. **Logo & Nav icons** — do NOT mirror (brand assets). Only directional UI arrows flip.

### 5.5 Language Switch Component

Figma component: `Multi-Langue` (node `759:6976`) — pill with 3 flag buttons.
Located in: top-right of every pre-auth screen and home screen top-right area.

```tsx
// src/components/forms/LanguageSwitcher.tsx
const LANGS = [
  { code: 'fr', label: 'FR', flag: flagFR },
  { code: 'ar', label: 'AR', flag: flagAR },
  { code: 'wo', label: 'WO', flag: flagWO },
] as const
```

Post-auth language switch lives in **Settings → Langue**.

---

## 6. Responsive Strategy

### Mobile App (≤ 768px)

- Fixed max-width: `402px` (Figma iOS canvas), centered on wider screens
- All screens are **single-column**, no responsive breakpoints needed internally
- Safe area: `env(safe-area-inset-bottom)` for devices with home indicator
- Bottom nav uses `pb-[env(safe-area-inset-bottom)]`

### Admin Dashboard (≥ 1024px)

- Sidebar: `w-64` fixed left, collapsible to icons-only `w-16`
- Content area: `flex-1`, responsive grid with `md:grid-cols-2 xl:grid-cols-4` for stat cards
- Tables: horizontal scroll on `md:overflow-x-auto`

---

## 7. Remaining API Modules to Create

| File | Endpoints needed |
|---|---|
| `src/lib/api/knowledge.api.ts` | GET /knowledge, GET /knowledge/:id |
| `src/lib/api/messaging.api.ts` | GET /conversations, GET /conversations/:id/messages, POST message |
| `src/lib/api/badges.api.ts` | GET /badges, GET /users/:id/badges |
| `src/lib/api/notifications.api.ts` | GET /notifications, PATCH /:id/read, PATCH /read-all |
| `src/lib/api/admin.api.ts` | All /admin/* endpoints |
| `src/lib/api/chatbot.api.ts` | POST /chatbot/message |

---

## 8. Shadcn UI Integration

Shadcn is listed in the stack but not yet installed. When added:

```bash
# With Tailwind v4, use the canary shadcn CLI
npx shadcn@canary init
```

Components to install: `button`, `input`, `dialog`, `sheet`, `tabs`, `badge`, `avatar`, `skeleton`, `toast` (sonner), `form`, `select`, `textarea`, `progress`, `separator`.

**Override shadcn defaults** with RecapLink tokens in `src/index.css` `@theme` block — do not use shadcn's default gray/slate color scheme; map to green-primary.

---

## 9. Socket.IO Integration

```ts
// src/lib/socket.ts
import { io } from 'socket.io-client'

export function createSocket(token: string) {
  return io(import.meta.env.VITE_API_URL ?? '/', {
    auth: { token },
    transports: ['websocket'],
    autoConnect: false,
  })
}
```

Events to handle in `src/features/messaging/socket/`:
- `connect` / `disconnect` → update `socketStore.setConnected`
- `new_message` → invalidate `qk.messages(conversationId)`, `socketStore.incrementUnread`
- `message_read` → update read receipts
- `typing` → local typing indicator state
- `notification` → invalidate `qk.notifications()`
