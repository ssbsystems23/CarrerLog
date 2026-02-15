# CarrerLog - Frontend Architecture Diagrams

> Visual representations of the frontend architecture and data flows

---

## Table of Contents
1. [Overall Architecture](#overall-architecture)
2. [Component Hierarchy](#component-hierarchy)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Authentication Flow](#authentication-flow)
5. [File Organization Map](#file-organization-map)

---

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (React App)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐        ┌──────────────┐      ┌──────────────┐   │
│  │   User UI    │───────▶│   React      │─────▶│  TanStack    │   │
│  │  (Components)│        │   Router     │      │   Query      │   │
│  └──────────────┘        └──────────────┘      └──────┬───────┘   │
│         │                                              │            │
│         │                                              │            │
│         ▼                                              ▼            │
│  ┌──────────────┐        ┌──────────────┐      ┌──────────────┐   │
│  │   Zustand    │◀───────│    Axios     │◀─────│  API Hooks   │   │
│  │   (State)    │        │  (HTTP)      │      │ (use-*.ts)   │   │
│  └──────────────┘        └──────┬───────┘      └──────────────┘   │
│                                 │                                   │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
                                  │ HTTP Requests
                                  │ (JSON)
                                  ▼
                    ┌──────────────────────────┐
                    │   Backend (FastAPI)      │
                    │   Port 8000              │
                    └──────────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   PostgreSQL Database    │
                    │   Port 5432              │
                    └──────────────────────────┘
```

### Layer Breakdown

**Presentation Layer (UI Components)**
- What user sees and interacts with
- React components styled with Tailwind CSS
- Shadcn/UI for base components

**Routing Layer (React Router)**
- Maps URLs to components
- Handles navigation
- Manages page transitions

**State Management Layer**
- **TanStack Query**: Server state (API data)
- **Zustand**: Client state (auth, theme, UI preferences)
- **React Hook Form**: Form state

**Data Layer (API Hooks)**
- Custom hooks for each resource (problems, certifications, etc.)
- Wraps TanStack Query's useQuery/useMutation
- Provides clean API to components

**Network Layer (Axios)**
- HTTP client for API communication
- Interceptors for auth tokens
- Error handling

---

## Component Hierarchy

### Application Tree
```
App (BrowserRouter)
│
├── Routes
│   │
│   ├── /landing ─────────────────▶ LandingPage
│   │
│   ├── /login ───────────────────▶ LoginPage
│   │
│   └── / (DashboardLayout)
│       │
│       ├── Sidebar
│       │   ├── Logo
│       │   ├── Navigation Links
│       │   └── Theme Toggle
│       │
│       ├── Header
│       │   ├── Page Title
│       │   ├── Search (optional)
│       │   └── User Menu
│       │       ├── Profile
│       │       └── Logout
│       │
│       └── <Outlet> (Main Content Area)
│           │
│           ├── / ──────────────────▶ DashboardPage
│           │                         ├── StatCard (×4)
│           │                         ├── RecentProblems
│           │                         └── UpcomingCerts
│           │
│           ├── /problems ──────────▶ ProblemsPage
│           │                         ├── FilterBar
│           │                         │   ├── SearchInput
│           │                         │   ├── DifficultyFilter
│           │                         │   └── TagFilter
│           │                         ├── ProblemCard (×N)
│           │                         │   ├── Title
│           │                         │   ├── Tags
│           │                         │   ├── Difficulty Badge
│           │                         │   └── Actions
│           │                         │       ├── Edit
│           │                         │       └── Delete
│           │                         └── Pagination
│           │
│           ├── /problems/new ──────▶ NewProblemPage
│           │                         └── ProblemForm
│           │                             ├── TitleInput
│           │                             ├── DifficultySelect
│           │                             ├── RichTextEditor (×4)
│           │                             │   ├── Situation
│           │                             │   ├── Task
│           │                             │   ├── Action
│           │                             │   └── Result
│           │                             ├── TagsInput
│           │                             └── SubmitButton
│           │
│           ├── /experiences ───────▶ ExperiencesPage
│           ├── /certifications ────▶ CertificationsPage
│           ├── /learnings ─────────▶ LearningsPage
│           └── /interview-bank ────▶ InterviewBankPage
```

---

## Data Flow Diagrams

### 1. Reading Data (Query Flow)

```
USER ACTION                 COMPONENT                  HOOK                   API                    BACKEND
┌──────────┐              ┌──────────┐             ┌──────────┐          ┌──────────┐           ┌──────────┐
│          │              │          │             │          │          │          │           │          │
│  Visits  │─────────────▶│ Problems │────────────▶│useProblems│─────────▶│  Axios   │──────────▶│ FastAPI  │
│  /problems│              │   Page   │             │          │          │          │           │          │
│          │              │          │             │          │          │          │           │          │
└──────────┘              └────┬─────┘             └────┬─────┘          └────┬─────┘           └────┬─────┘
                               │                        │                     │                      │
                               │                        │                     │                      │
                               │                   ┌────▼─────┐               │                ┌─────▼──────┐
                               │                   │ TanStack │               │                │ PostgreSQL │
                               │                   │  Query   │               │                │  Database  │
                               │                   │  Cache   │               │                └─────┬──────┘
                               │                   └────┬─────┘               │                      │
                               │                        │                     │                      │
                               │                        │                HTTP │                      │
                               │                        │             Response│              SELECT  │
                               │                        │                     │                      │
                               │                        │◀────────────────────┘◀─────────────────────┘
                               │                        │
                               │                   ┌────▼─────┐
                               │                   │  data:   │
                               │                   │  items[] │
                               │                   │isLoading │
                               │◀──────────────────┤  error   │
                               │                   └──────────┘
                          ┌────▼─────┐
                          │  Render  │
                          │ Problem  │
                          │  Cards   │
                          └──────────┘
```

**Steps Explained:**
1. User navigates to `/problems`
2. ProblemsPage component mounts
3. Component calls `useProblems()` hook
4. Hook uses TanStack Query's `useQuery`
5. Query checks cache first
   - If data is fresh (< 5 min old), return cached data
   - If stale or missing, make API request
6. Axios sends `GET /api/v1/problems` with auth token
7. Backend queries PostgreSQL
8. Response flows back through the chain
9. TanStack Query caches the result
10. Component receives `data`, `isLoading`, `error`
11. Component renders UI based on state

### 2. Writing Data (Mutation Flow)

```
USER ACTION              COMPONENT              HOOK                   API                  BACKEND
┌──────────┐           ┌──────────┐          ┌──────────┐          ┌──────────┐         ┌──────────┐
│          │           │          │          │          │          │          │         │          │
│  Clicks  │──────────▶│  Form    │─────────▶│useCreate │─────────▶│  Axios   │────────▶│ FastAPI  │
│  Submit  │           │          │          │ Problem  │          │          │         │          │
│          │           │          │          │          │          │          │         │          │
└──────────┘           └────┬─────┘          └────┬─────┘          └────┬─────┘         └────┬─────┘
                            │                     │                     │                    │
                       ┌────▼──────┐              │                     │              ┌─────▼──────┐
                       │Validation │              │                     │              │PostgreSQL  │
                       │  (Zod)    │              │                     │              │  INSERT    │
                       └────┬──────┘              │                     │              └─────┬──────┘
                            │                     │                     │                    │
                         Valid?                   │                     │                    │
                            │                     │              POST   │              Created│
                            │                ┌────▼─────┐               │                    │
                            │                │useMutation              │                    │
                            │                │          │◀──────────────┘◀───────────────────┘
                            │                │onSuccess │
                            │                └────┬─────┘
                            │                     │
                            │                     │ Invalidate Queries
                            │                     │
                            │                ┌────▼─────────────┐
                            │                │ queryClient      │
                            │                │ .invalidateQueries│
                            │                │ (["problems"])    │
                            │                └────┬─────────────┘
                            │                     │
                            │                     │ Refetch
                            │                     │
                            │                ┌────▼─────┐
                            │                │ useQuery │
                            │                │ reruns   │
                            │                └────┬─────┘
                            │                     │
                       ┌────▼─────────────────────▼─────┐
                       │   UI Updates Automatically     │
                       │   - New problem in list        │
                       │   - Success toast              │
                       │   - Navigate to /problems      │
                       └────────────────────────────────┘
```

**Steps Explained:**
1. User fills form and clicks submit
2. React Hook Form validates with Zod schema
3. If valid, calls `onSubmit` handler
4. Handler calls `createMutation.mutateAsync(data)`
5. TanStack Query's `useMutation` executes
6. Axios sends `POST /api/v1/problems` with data
7. Backend validates, saves to PostgreSQL, returns created object
8. `onSuccess` callback runs
9. Query client invalidates `["problems"]` and `["dashboard"]` queries
10. This triggers automatic refetch of those queries
11. UI updates with fresh data (new problem appears)
12. User sees success toast and redirects

### 3. Optimistic Updates (Advanced)

```
USER DELETES PROBLEM

┌─────────────────────┐
│  User clicks Delete │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  Immediately remove from UI │  ← Optimistic update
│  (before API responds)      │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────┐
    │  API Request │
    └──────┬───────┘
           │
     ┌─────┴──────┐
     │            │
     ▼            ▼
┌─────────┐  ┌─────────┐
│ Success │  │  Error  │
└────┬────┘  └────┬────┘
     │            │
     │            ▼
     │    ┌───────────────┐
     │    │  Rollback UI  │  ← Restore deleted item
     │    │  Show error   │
     │    └───────────────┘
     │
     ▼
┌──────────────────┐
│  Keep UI as-is   │
│  (already removed)│
└──────────────────┘
```

---

## Authentication Flow

### Login Sequence
```
┌──────────────────────────────────────────────────────────────────────┐
│                        LOGIN FLOW                                     │
└──────────────────────────────────────────────────────────────────────┘

USER                    UI                    HOOK               API              BACKEND
  │                     │                     │                  │                  │
  │  Enters email/pwd   │                     │                  │                  │
  ├────────────────────▶│                     │                  │                  │
  │                     │                     │                  │                  │
  │  Clicks Login       │                     │                  │                  │
  ├────────────────────▶│                     │                  │                  │
  │                     │                     │                  │                  │
  │                     │  loginMutation      │                  │                  │
  │                     │  .mutateAsync()     │                  │                  │
  │                     ├────────────────────▶│                  │                  │
  │                     │                     │                  │                  │
  │                     │                     │ POST /auth/login │                  │
  │                     │                     ├─────────────────▶│                  │
  │                     │                     │                  │                  │
  │                     │                     │                  │ Verify password  │
  │                     │                     │                  ├─────────────────▶│
  │                     │                     │                  │                  │
  │                     │                     │                  │  Generate JWT    │
  │                     │                     │                  │◀─────────────────┤
  │                     │                     │                  │                  │
  │                     │                     │ { access_token, user_info }        │
  │                     │                     │◀─────────────────┤                  │
  │                     │                     │                  │                  │
  │                     │  Success response   │                  │                  │
  │                     │◀────────────────────┤                  │                  │
  │                     │                     │                  │                  │
  │                     │  setAuth(token, user)                  │                  │
  │                     ├───────────────────────────────────────────────────────────┐
  │                     │                     │                  │                  │
  │                     │ ┌─────────────────────────────────────────────────────┐  │
  │                     │ │  Zustand Store:                                     │  │
  │                     │ │  1. Save token to localStorage                      │  │
  │                     │ │  2. Save user to localStorage                       │  │
  │                     │ │  3. Update store: { token, user }                   │  │
  │                     │ └─────────────────────────────────────────────────────┘  │
  │                     │◀──────────────────────────────────────────────────────────┘
  │                     │                     │                  │                  │
  │                     │  navigate("/")      │                  │                  │
  │                     ├────────────────────▶│                  │                  │
  │                     │                     │                  │                  │
  │  Dashboard Page     │                     │                  │                  │
  │◀────────────────────┤                     │                  │                  │
  │                     │                     │                  │                  │
```

### Authenticated Request Flow
```
┌──────────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATED REQUEST                               │
└──────────────────────────────────────────────────────────────────────┘

COMPONENT            AXIOS                INTERCEPTOR          BACKEND
    │                 │                       │                   │
    │  api.get(...)   │                       │                   │
    ├────────────────▶│                       │                   │
    │                 │                       │                   │
    │                 │  Request Interceptor  │                   │
    │                 ├──────────────────────▶│                   │
    │                 │                       │                   │
    │                 │                  ┌────▼─────────────┐    │
    │                 │                  │ Read localStorage│    │
    │                 │                  │ token = "abc..."  │    │
    │                 │                  └────┬─────────────┘    │
    │                 │                       │                   │
    │                 │                  ┌────▼─────────────────────┐
    │                 │                  │ Add Header:              │
    │                 │                  │ Authorization:           │
    │                 │                  │ Bearer abc...            │
    │                 │                  └────┬─────────────────────┘
    │                 │                       │                   │
    │                 │  Modified request     │                   │
    │                 │◀──────────────────────┤                   │
    │                 │                       │                   │
    │                 │  HTTP Request with auth header            │
    │                 ├────────────────────────────────────────────▶│
    │                 │                       │                   │
    │                 │                       │              ┌────▼─────┐
    │                 │                       │              │ Verify   │
    │                 │                       │              │ JWT      │
    │                 │                       │              └────┬─────┘
    │                 │                       │                   │
    │                 │       200 OK + data                       │
    │                 │◀──────────────────────────────────────────┤
    │                 │                       │                   │
    │  data           │                       │                   │
    │◀────────────────┤                       │                   │
    │                 │                       │                   │
```

### Logout Flow
```
USER                 COMPONENT              ZUSTAND              AXIOS
  │                      │                     │                   │
  │  Clicks Logout       │                     │                   │
  ├─────────────────────▶│                     │                   │
  │                      │                     │                   │
  │                      │  logout()           │                   │
  │                      ├────────────────────▶│                   │
  │                      │                     │                   │
  │                      │              ┌──────▼────────────┐      │
  │                      │              │ localStorage.     │      │
  │                      │              │   removeItem()    │      │
  │                      │              │ - "token"         │      │
  │                      │              │ - "user"          │      │
  │                      │              └──────┬────────────┘      │
  │                      │                     │                   │
  │                      │              ┌──────▼────────────┐      │
  │                      │              │ Update store:     │      │
  │                      │              │ token = null      │      │
  │                      │              │ user = null       │      │
  │                      │              └──────┬────────────┘      │
  │                      │                     │                   │
  │                      │  State updated      │                   │
  │                      │◀────────────────────┤                   │
  │                      │                     │                   │
  │                      │  navigate("/login") │                   │
  │                      ├────────────────────────────────────────▶│
  │                      │                     │                   │
  │  Login Page          │                     │                   │
  │◀─────────────────────┤                     │                   │
  │                      │                     │                   │
```

---

## File Organization Map

### Directory Structure with Purpose

```
frontend/src/
│
├── components/                  # Reusable UI pieces
│   ├── ui/                     # Base components (Shadcn)
│   │   ├── button.tsx          # → <Button variant="..." />
│   │   ├── card.tsx            # → <Card><CardHeader>...</Card>
│   │   ├── input.tsx           # → <Input type="text" />
│   │   ├── dialog.tsx          # → Modal/popup component
│   │   ├── select.tsx          # → Dropdown component
│   │   ├── textarea.tsx        # → Multi-line text input
│   │   ├── badge.tsx           # → Tag/label component
│   │   ├── tabs.tsx            # → Tab navigation
│   │   └── ...                 # Other base components
│   │
│   ├── layout/                 # Page structure components
│   │   ├── dashboard-layout.tsx  # → Sidebar + Header wrapper
│   │   ├── sidebar.tsx           # → Left navigation menu
│   │   └── header.tsx            # → Top bar with user menu
│   │
│   ├── problem-card.tsx        # → Displays one problem
│   ├── stat-card.tsx           # → Dashboard statistic card
│   ├── rich-text-editor.tsx   # → WYSIWYG editor (TipTap)
│   └── rich-text-display.tsx  # → Shows formatted rich text
│
├── hooks/                      # Custom React hooks (API logic)
│   ├── use-auth.ts            # → Login, logout, current user
│   ├── use-problems.ts        # → CRUD for problems
│   ├── use-experiences.ts     # → CRUD for experiences
│   ├── use-certifications.ts # → CRUD for certifications
│   ├── use-learnings.ts       # → CRUD for learnings
│   ├── use-interview-questions.ts  # → CRUD for interview questions
│   └── use-dashboard.ts       # → Dashboard stats
│
├── lib/                        # Configurations & utilities
│   ├── axios.ts               # → Configured HTTP client
│   ├── utils.ts               # → Helper functions (cn, etc.)
│   └── validation.ts          # → Zod schemas for forms
│
├── pages/                      # Full page components (one per route)
│   ├── landing.tsx            # → / (public landing)
│   ├── login.tsx              # → /login
│   ├── dashboard.tsx          # → /dashboard (home)
│   ├── problems.tsx           # → /problems (list)
│   ├── new-problem.tsx        # → /problems/new (create form)
│   ├── experiences.tsx        # → /experiences
│   ├── certifications.tsx     # → /certifications
│   ├── learnings.tsx          # → /learnings
│   └── interview-bank.tsx     # → /interview-bank
│
├── store/                      # Global state (Zustand)
│   ├── auth-store.ts          # → { token, user, setAuth(), logout() }
│   └── theme-store.ts         # → { theme, toggleTheme() }
│
├── types/                      # TypeScript type definitions
│   └── index.ts               # → All interfaces (User, Problem, etc.)
│
├── App.tsx                     # → Router configuration
├── main.tsx                    # → Entry point (renders <App />)
└── index.css                   # → Global styles & Tailwind imports
```

### Data Flow Through Files

**Example: Viewing Problems List**

```
URL: /problems
    │
    │ React Router matches route
    ▼
App.tsx
    │ <Route path="/problems" element={<ProblemsPage />} />
    ▼
pages/problems.tsx
    │ const { data, isLoading } = useProblems({ page: 1 });
    ▼
hooks/use-problems.ts
    │ useQuery({ queryKey: ["problems"], queryFn: async () => {...} })
    ▼
lib/axios.ts
    │ api.get("/problems?page=1")
    │ + Interceptor adds: Authorization: Bearer <token>
    ▼
Backend API
    │ FastAPI → PostgreSQL → Returns JSON
    ▼
hooks/use-problems.ts
    │ TanStack Query caches response
    ▼
pages/problems.tsx
    │ Receives data: { items: [...], total: 50 }
    │ Maps over items
    ▼
components/problem-card.tsx
    │ Renders each problem
    ▼
USER SEES LIST
```

---

## State Management Overview

### Two Types of State

#### 1. Server State (TanStack Query)
- Data from the backend (problems, users, certifications)
- Cached automatically
- Refetches on window focus, network reconnect
- **Managed by:** TanStack Query

```tsx
// Server state - lives in TanStack Query cache
const { data, isLoading } = useProblems();
```

#### 2. Client State (Zustand / Local State)
- UI state (modal open/closed, current page, filters)
- Authentication (token, user)
- Theme preference
- **Managed by:** Zustand (global) or useState (local)

```tsx
// Global client state - lives in Zustand store
const { token, user } = useAuthStore();

// Local component state - lives in this component only
const [isOpen, setIsOpen] = useState(false);
```

### When to Use Which

| Data Type | Use | Example |
|-----------|-----|---------|
| Data from backend | TanStack Query | Problems, users, certifications |
| Auth token & user | Zustand | Login state, current user |
| Theme preference | Zustand | Dark/light mode |
| Modal open/closed | useState | Dialog visibility |
| Current page number | useState | Pagination |
| Form input values | React Hook Form | Form fields |

---

## Request/Response Examples

### GET Request (Fetch Problems)
```
┌─────────────────────────────────────────────────┐
│ REQUEST                                         │
├─────────────────────────────────────────────────┤
│ GET /api/v1/problems?page=1&size=10&difficulty=Easy
│                                                 │
│ Headers:                                        │
│   Authorization: Bearer eyJhbGc...             │
│   Content-Type: application/json               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ RESPONSE                                        │
├─────────────────────────────────────────────────┤
│ Status: 200 OK                                  │
│                                                 │
│ Body:                                           │
│ {                                               │
│   "items": [                                    │
│     {                                           │
│       "id": "abc-123",                          │
│       "title": "Two Sum",                       │
│       "difficulty": "Easy",                     │
│       "tags": ["arrays", "hash-table"],         │
│       "solved_at": "2024-01-15",                │
│       ...                                       │
│     }                                           │
│   ],                                            │
│   "total": 42,                                  │
│   "page": 1,                                    │
│   "size": 10                                    │
│ }                                               │
└─────────────────────────────────────────────────┘
```

### POST Request (Create Problem)
```
┌─────────────────────────────────────────────────┐
│ REQUEST                                         │
├─────────────────────────────────────────────────┤
│ POST /api/v1/problems                           │
│                                                 │
│ Headers:                                        │
│   Authorization: Bearer eyJhbGc...             │
│   Content-Type: application/json               │
│                                                 │
│ Body:                                           │
│ {                                               │
│   "title": "Reverse Linked List",              │
│   "difficulty": "Medium",                       │
│   "situation": "During interview at FAANG...",  │
│   "task": "Reverse a singly linked list",      │
│   "action": "Used three-pointer approach...",   │
│   "result": "Solved in O(n) time",             │
│   "tags": ["linked-list", "pointers"]          │
│ }                                               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ RESPONSE                                        │
├─────────────────────────────────────────────────┤
│ Status: 201 Created                             │
│                                                 │
│ Body:                                           │
│ {                                               │
│   "id": "xyz-789",                              │
│   "user_id": "user-123",                        │
│   "title": "Reverse Linked List",              │
│   "difficulty": "Medium",                       │
│   "created_at": "2024-01-20T10:30:00Z",        │
│   ...                                           │
│ }                                               │
└─────────────────────────────────────────────────┘
```

### Error Response (401 Unauthorized)
```
┌─────────────────────────────────────────────────┐
│ RESPONSE                                        │
├─────────────────────────────────────────────────┤
│ Status: 401 Unauthorized                        │
│                                                 │
│ Body:                                           │
│ {                                               │
│   "detail": "Not authenticated"                 │
│ }                                               │
└─────────────────────────────────────────────────┘

What happens:
1. Axios response interceptor catches 401
2. Calls useAuthStore.getState().logout()
3. Clears token from localStorage
4. User redirected to /login
```

---

## Performance Optimization Flow

```
┌────────────────────────────────────────────────────────────┐
│              OPTIMIZATION TECHNIQUES                        │
└────────────────────────────────────────────────────────────┘

1. CODE SPLITTING (Lazy Loading)
   ┌──────────────────────────────────────┐
   │ Initial Load: Only load App.tsx      │
   │ Size: ~50KB                          │
   └──────────────────────────────────────┘
                    │
                    │ User navigates to /problems
                    ▼
   ┌──────────────────────────────────────┐
   │ Dynamic Import: Load ProblemsPage    │
   │ Size: +30KB                          │
   └──────────────────────────────────────┘

2. CACHING (TanStack Query)
   ┌──────────────────────────────────────┐
   │ First Request: Fetch from API        │
   │ Time: 200ms                          │
   └──────────────────────────────────────┘
                    │
                    │ Cache for 5 minutes
                    ▼
   ┌──────────────────────────────────────┐
   │ Subsequent Requests: Use cache       │
   │ Time: <1ms                           │
   └──────────────────────────────────────┘

3. OPTIMISTIC UPDATES
   ┌──────────────────────────────────────┐
   │ User Action: Delete problem          │
   └──────────────────────────────────────┘
                    │
                    │ Immediately
                    ▼
   ┌──────────────────────────────────────┐
   │ UI Update: Remove from list          │
   │ User Experience: Instant!            │
   └──────────────────────────────────────┘
                    │
                    │ In background
                    ▼
   ┌──────────────────────────────────────┐
   │ API Request: Actually delete         │
   │ If fails: Rollback UI change         │
   └──────────────────────────────────────┘

4. DEBOUNCING (Search Input)
   ┌──────────────────────────────────────┐
   │ User Types: "r e a c t"              │
   │ Without debounce: 5 API calls        │
   └──────────────────────────────────────┘
                    │
                    │ With debounce
                    ▼
   ┌──────────────────────────────────────┐
   │ Wait 300ms after last keystroke      │
   │ Only then: 1 API call                │
   └──────────────────────────────────────┘
```

---

## Conclusion

These diagrams show:
- ✅ How components are organized hierarchically
- ✅ How data flows through the application
- ✅ How authentication works step-by-step
- ✅ How files are organized and their purposes
- ✅ When to use which state management solution

**Use These Diagrams To:**
1. Understand the big picture before diving into code
2. Trace bugs by following the data flow
3. Plan new features by understanding patterns
4. Onboard new developers to the codebase

---

*Refer to FRONTEND_GUIDE.md for detailed code examples and explanations*
