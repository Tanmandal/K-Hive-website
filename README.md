# K-Hive — Frontend

> The official web client for K-Hive, a university community forum for KIIT students. Built with Next.js 16, React 19, Tailwind CSS v4, and TanStack Query — with a neon-dark aesthetic, AI-enhanced search, real-time optimistic updates, and full media upload support.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Pages & Routes](#pages--routes)
- [Project Structure](#project-structure)
- [Features](#features)
- [Component Guide](#component-guide)
- [Data Fetching & State](#data-fetching--state)
- [API Layer](#api-layer)
- [Styling & Design System](#styling--design-system)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Backend Connection](#backend-connection)

---

## Overview

K-Hive Website is the Next.js frontend that connects to the K-Hive Backend REST API. It provides a Reddit-style community feed with threaded discussions, media uploads, real-time vote updates, and an AI-powered search experience — all wrapped in a dark, cyber-themed UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Server State | TanStack React Query v5 |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Intersection | react-intersection-observer |
| Fonts | Geist Sans & Geist Mono (Google Fonts) |
| Dev Port | 5173 |

---

## Pages & Routes

| Route | Description |
|---|---|
| `/` | Main feed — paginated posts with Hot / New / Top / Rising filters |
| `/announcements` | Pinned posts feed — official updates from admins |
| `/post/[id]` | Single post view with full threaded comment section |
| `/profile` | Current authenticated user's profile |
| `/profile/[userId]` | Public profile of any user |
| `/search` | Full search results with NLP-enhanced mode |
| `/settings` | User settings (name, avatar) |
| `/feedback` | Feedback submission form |
| `/about` | About page for the K-Hive community |
| `/legal` | Legal notices index |
| `/legal/privacy` | Privacy policy |
| `/legal/terms` | Terms of service |
| `/auth/success` | OAuth redirect landing page (handles JWT storage) |

---

## Project Structure

```
K-Hive-website/
├── public/
│   └── KHive/
│       ├── k-logo2.png           # Navbar logo
│       ├── favicon.png
│       ├── banner.png
│       └── k-hive_banner.png
├── src/
│   ├── app/
│   │   ├── layout.jsx            # Root layout — fonts, providers, toaster
│   │   ├── page.jsx              # Home page (mounts Hero feed)
│   │   ├── globals.css           # Global Tailwind + CSS variables
│   │   ├── about/page.jsx
│   │   ├── announcements/page.jsx
│   │   ├── auth/success/page.jsx
│   │   ├── feedback/page.jsx
│   │   ├── legal/
│   │   │   ├── page.jsx
│   │   │   ├── privacy/page.jsx
│   │   │   └── terms/page.jsx
│   │   ├── post/[id]/page.jsx
│   │   ├── profile/
│   │   │   ├── page.jsx          # /profile (own profile)
│   │   │   └── [userId]/page.jsx # /profile/:userId (public)
│   │   ├── search/page.jsx
│   │   ├── settings/page.jsx
│   │   └── components/           # App-level components
│   │       ├── Navbar.jsx
│   │       ├── hero.jsx
│   │       ├── Searchbar.jsx
│   │       ├── Sidebar.jsx
│   │       ├── CreateModal.jsx
│   │       ├── EditModal.jsx
│   │       ├── CommentSection.jsx
│   │       ├── ProfilePage.jsx
│   │       ├── LegalPage.jsx
│   │       └── sign-up.jsx
│   ├── components/               # Shared utility components
│   │   ├── ClientLayout.jsx      # Sidebar + main content layout wrapper
│   │   └── scrollToTop.jsx       # Floating scroll-to-top button
│   ├── lib/
│   │   ├── queryClient.js        # TanStack QueryClient configuration
│   │   ├── api/                  # API service modules
│   │   │   ├── client.js         # Axios instance + JWT interceptors
│   │   │   ├── auth.js
│   │   │   ├── posts.js
│   │   │   ├── comments.js
│   │   │   ├── search.js
│   │   │   ├── media.js
│   │   │   └── users.js
│   │   └── hooks/                # TanStack Query hooks
│   │       ├── useAuth.js
│   │       ├── usePosts.js
│   │       ├── useComments.js
│   │       ├── useSearch.js
│   │       ├── useFeedback.js
│   │       └── useUsers.js
│   └── providers/
│       └── QueryProvider.jsx     # QueryClientProvider + DevTools
├── next.config.mjs
├── package.json
├── postcss.config.mjs
└── jsconfig.json
```

---

## Features

### Feed
- Paginated post feed sortable by **Hot** (upvotes), **New** (date), **Top** (upvotes), and **Rising** (recent)
- Inline quick-comment from the feed card
- Media thumbnails with lightbox expand on click
- Share button — uses native Web Share API on mobile, clipboard fallback on desktop
- Refresh button with spin animation
- Post tags displayed as pills

### Post Detail
- Full post with complete threaded comment tree
- One level of nested replies per comment
- Soft-deleted comments show `[deleted]` placeholder
- Edited comments show `(edited)` indicator
- Pagination for both top-level comments and reply threads

### Create Post
- Title (5–200 chars), body (10–5000 chars) with character counter
- Image upload — client-side resize to max 1200 px width at 80% JPEG quality before upload
- Direct upload to ImageKit CDN using signed credentials from backend (no file data sent to API server)
- Up to 5 tags (2–20 chars each), managed as chips
- **Live post preview** rendered below the form in real time

### Image Upload

K-Hive uses a **client-direct upload** pattern — the API server never receives raw file bytes:

```
User selects image
        │
        ▼
Client compresses image
(Canvas API, max 1200px wide, 80% JPEG quality, max 10 MB)
        │
        ▼
GET /api/media/uploadlink  →  backend returns signed ImageKit credentials
{token, signature, expire, publicKey, uploadUrl, folder}
        │
        ▼
POST directly to ImageKit CDN (uploadUrl)
FormData: { file, fileName, publicKey, signature, expire, token, folder }
        │
        ▼
ImageKit returns { url, fileId }
        │
        ▼
POST /api/post  →  { ..., media: [url], mediaId: [fileId] }
```

The backend uses the returned `fileId` to delete the image from ImageKit if the post is later deleted or fails moderation.

### Voting
- Upvote / downvote on posts and comments
- **Optimistic updates** — vote counts reflect immediately; auto-rollback on error
- Toggle semantics — clicking the same vote again removes it; clicking the opposite side switches

### Search
- **Autocomplete dropdown** (300 ms debounce) — results driven by the backend's prefix trie index
- Graceful fallback to full-text search when the trie index is still building (with 30 s cooldown before retrying)
- **Enhanced Search** button (authenticated users only) — triggers NLP query expansion (spell correction, synonyms, WordNet) server-side
- Recent searches stored in `localStorage`, individually removable or bulk-cleared

### Authentication
- Google OAuth 2.0 — browser redirects to backend `/api/auth/google`
- JWT `accessToken` stored in `localStorage`; attached as `Authorization: Bearer` header on every request via Axios interceptor
- Auto-clears token on `401` response
- Auth state cached by React Query (`staleTime` 5 min, no retry on unauthenticated)

### User Profiles
- View any user's posts and comments
- Edit own name and avatar from the Settings page
- Avatar fallback: gradient circle with first letter of username

### Sidebar Navigation
- Links: Home, About Us, Announcements, Feedback, Settings, Legal Notices
- Desktop: collapsible (remembers state in `localStorage`), dispatches `sidebarToggle` event
- Mobile: slide-in drawer with backdrop overlay

### Responsive Design
- Full mobile-first breakpoint cascade (`xs` → `sm` → `md` → `lg` → `xl`)
- Mobile search toggle in navbar
- Mobile sidebar drawer
- Stacked post layout below `md`, side-by-side above

---

## Component Guide

### `Navbar`
Fixed top bar with logo, search bar (hidden on mobile), mobile search toggle, create post button, and user avatar/login buttons. Handles the image upload flow to ImageKit before calling `createPost`.

### `Hero` (`src/app/components/hero.jsx`)
The main feed component. Renders filter tabs, paginated post cards, quick-comment input inline, share, and pagination controls.

### `Searchbar`
Controlled search input with 300 ms debounce. Shows autocomplete from the trie index, falls back to text search during index build, and offers an enhanced NLP search shortcut for logged-in users. Keeps up to 10 recent searches in `localStorage`.

### `Sidebar`
Dual desktop/mobile implementation. Desktop version is `position: fixed` with a collapse toggle. Mobile version uses a transform-based slide-in drawer. Active route is highlighted with a left border accent.

### `CreateModal`
Full-featured post creation modal. Includes client-side image compression (Canvas API), tag chip management, form validation, and a live preview panel.

### `CommentSection`
Renders top-level comments with lazy-loaded reply threads. Handles create, edit, delete (soft), and voting for both comment types.

### `ClientLayout`
Wraps all page content with the Sidebar + main column layout. Manages mobile sidebar open/close state and listens for the `sidebarToggle` event to adjust main content margin.

---

## Data Fetching & State

All server state is managed through **TanStack React Query v5**. The global `QueryClient` is configured with:

```
staleTime:            5 minutes   (data considered fresh)
cacheTime:            10 minutes  (kept in cache after unmount)
refetchOnWindowFocus: false
refetchOnReconnect:   true
retry (queries):      1
retry (mutations):    0
```

### Query Keys

| Key Pattern | Data |
|---|---|
| `['auth', 'user']` | Current authenticated user |
| `['posts', page, sort, limit]` | Paginated post feed |
| `['posts', postId]` | Single post |
| `['posts', 'pinned', page, limit]` | Pinned posts |
| `['posts', 'user', userId, ...]` | Posts by a user |
| `['posts', 'search', query, ...]` | Search results |
| `['comments', postId, page, limit]` | Top-level comments |
| `['replies', commentId, page, limit]` | Replies to a comment |
| `['comments', 'user', userId, ...]` | Comments by a user |
| `['search', 'autocomplete', query, ...]` | Autocomplete suggestions |
| `['search', 'results', query, ...]` | Full search results |

### Optimistic Updates

`useVotePost` and `useVoteComment` both implement full optimistic update cycles:
1. **`onMutate`** — cancel outgoing refetches, snapshot old data, apply delta immediately
2. **`onError`** — roll back to snapshot
3. **`onSuccess`** — reconcile with actual server response

`useUpdateComment` and `useDeleteComment` apply optimistic mutations across all cached comment/reply queries.

---

## API Layer

All API calls go through a single Axios instance (`src/lib/api/client.js`):

```
baseURL:          process.env.NEXT_PUBLIC_API_URL  (default: http://localhost:5000/api)
withCredentials:  true
Content-Type:     application/json
```

**Request interceptor** — reads `accessToken` from `localStorage` and injects the `Authorization: Bearer` header.

**Response interceptor** — on `401`, removes the stale token from `localStorage`.

### Service Modules

| Module | Methods |
|---|---|
| `auth.js` | `loginWithGoogle`, `getCurrentUser`, `updateUser`, `logout` |
| `posts.js` | `getAllPosts`, `getPostById`, `getPostsByUserId`, `getPinnedPosts`, `createPost`, `updatePost`, `deletePost`, `upvotePost`, `downvotePost`, `searchPosts` |
| `comments.js` | `getCommentsByPostId`, `getRepliesByCommentId`, `getCommentsByUserId`, `createComment`, `updateComment`, `deleteComment`, `upvoteComment`, `downvoteComment`, `getCommentCount`, `getReplyCount` |
| `search.js` | `autocomplete`, `search`, `getTagSuggestions` |
| `media.js` | `getUploadLink` |
| `users.js` | `getUserProfile` |

---

## Styling & Design System

The project uses **Tailwind CSS v4** with a custom dark color palette:

| Token | Value | Usage |
|---|---|---|
| Background dark | `#020d17` | Page backgrounds |
| Background card | `#0d1d2c` | Post cards, sidebar |
| Background elevated | `#272729` / `#323234` | Hover states, inputs |
| Accent cyan | `#1dddf2` | Borders, active states, icons |
| Accent purple | `#7193ff` | Downvote highlight, gradients |
| Text primary | `#ffffff` | Headings, key content |
| Text secondary | `#9ca3af` | Metadata, labels |

**Typefaces**: Geist Sans (body) and Geist Mono loaded via `next/font/google`.

**Neon glow effect**: custom `neonPulse` keyframe on navbar action buttons:
```css
@keyframes neonPulse {
  0%, 100% { box-shadow: 0 0 5px rgba(29,221,242,0.5); }
  50%       { box-shadow: 0 0 20px rgba(29,221,242,0.8); }
}
```

**Glassmorphism**: `backdrop-blur-md` on the fixed navbar with a semi-transparent `#020d1776` background.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

In production, set this to your deployed backend URL (e.g. `https://your-api.vercel.app/api`).

---

## Getting Started

### Prerequisites
- Node.js >= 18
- K-Hive Backend running locally or deployed

### Installation

```bash
git clone https://github.com/your-org/K-Hive-website.git
cd K-Hive-website
npm install
```

### Running Locally

```bash
# Development server on port 5173
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** The dev server intentionally runs on port **5173** (not Next.js default 3000) to match the CORS `allowedOrigins` configured in the backend.

### React Query DevTools

In development mode, TanStack Query DevTools are mounted at the bottom of the page. Click the React Query logo icon to inspect query cache, mutations, and refetch status.

---

## Backend Connection

This frontend requires the K-Hive Backend API reachable at `NEXT_PUBLIC_API_URL`. The backend must have `http://localhost:5173` in its CORS `allowedOrigins` for local development (already configured by default).

**Auth flow:**
1. User clicks **Log In** → browser redirects to `NEXT_PUBLIC_API_URL/auth/google`
2. Google OAuth completes → backend redirects to `/auth/success?token=<jwt>`
3. `/auth/success` page stores the token in `localStorage` and redirects to `/`
4. All subsequent API requests carry `Authorization: Bearer <token>`
