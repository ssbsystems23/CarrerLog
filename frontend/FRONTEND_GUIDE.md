# Developer Dashboard - Complete Frontend Guide

> **For Beginners**: This guide explains everything from scratch so you can understand, debug, and modify the frontend without AI assistance.

---

## Table of Contents
1. [Technology Stack Overview](#technology-stack-overview)
2. [Project Structure](#project-structure)
3. [How Data Flows Through the App](#how-data-flows-through-the-app)
4. [File-by-File Breakdown](#file-by-file-breakdown)
5. [Common Patterns & Concepts](#common-patterns--concepts)
6. [Debugging Guide](#debugging-guide)
7. [How to Add New Features](#how-to-add-new-features)

---

## Technology Stack Overview

### Core Technologies

| Technology | Purpose | Why We Use It |
|------------|---------|---------------|
| **React** | UI Library | Builds reusable components (like LEGO blocks for web pages) |
| **TypeScript** | Programming Language | JavaScript + type checking = fewer bugs |
| **Vite** | Build Tool | Fast development server and optimized production builds |
| **React Router** | Navigation | Handles URL routing (e.g., `/dashboard`, `/problems`) |
| **TanStack Query** | Data Fetching | Manages API calls, caching, and loading states automatically |
| **Zustand** | State Management | Simple global state (like variables that all components can access) |
| **Axios** | HTTP Client | Makes API calls to the backend |
| **Tailwind CSS** | Styling | Utility-first CSS (classes like `bg-blue-500`, `p-4`) |
| **Shadcn/UI** | Component Library | Pre-built, accessible UI components |
| **Zod** | Validation | Validates form data before sending to backend |
| **React Hook Form** | Form Management | Handles form state and validation efficiently |

---

## Project Structure

```
frontend/
├── public/              # Static files (images, icons)
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # Basic UI components (buttons, cards, inputs)
│   │   └── layout/     # Layout components (header, sidebar, dashboard layout)
│   ├── hooks/          # Custom React hooks (reusable logic)
│   ├── lib/            # Utilities and configurations
│   ├── pages/          # Page components (one per route)
│   ├── store/          # Global state management (Zustand)
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component with routes
│   ├── main.tsx        # Entry point (starts the React app)
│   └── index.css       # Global styles
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

### What Each Folder Does

**`components/`** - Building blocks of your UI
- `ui/` - Basic components like Button, Input, Card (from Shadcn)
- `layout/` - Page structure components (Header, Sidebar, DashboardLayout)
- Other components like `problem-card.tsx`, `stat-card.tsx` - specific reusable pieces

**`hooks/`** - Reusable logic that connects to the backend
- `use-problems.ts` - All problem-related API calls
- `use-auth.ts` - Authentication logic
- Each hook handles one resource (problems, certifications, etc.)

**`lib/`** - Configuration and utilities
- `axios.ts` - Configured HTTP client for API calls
- `utils.ts` - Helper functions
- `validation.ts` - Form validation schemas

**`pages/`** - Full page components (one per URL route)
- `dashboard.tsx` - Home page (shows stats)
- `problems.tsx` - List all problems
- `new-problem.tsx` - Create a new problem
- Each page assembles multiple components

**`store/`** - Global state (data accessible everywhere)
- `auth-store.ts` - Current user and login token
- `theme-store.ts` - Dark/light mode preference

**`types/`** - TypeScript definitions (what shape your data has)

---

## How Data Flows Through the App

### The Complete Journey: From User Click to UI Update

Let's trace what happens when you click "Add Problem":

#### Step 1: User Clicks Button
```tsx
// In new-problem.tsx
<Button onClick={handleSubmit}>Add Problem</Button>
```

#### Step 2: Form Validation
```tsx
// React Hook Form validates the data using Zod schema
const form = useForm<ProblemCreate>({
  resolver: zodResolver(problemCreateSchema),
});
```

#### Step 3: Call the Hook
```tsx
// Hook from use-problems.ts
const createMutation = useCreateProblem();

function onSubmit(data: ProblemCreate) {
  createMutation.mutate(data);
}
```

#### Step 4: API Request (Inside the Hook)
```tsx
// In use-problems.ts
export function useCreateProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProblemCreate) => {
      const res = await api.post<Problem>("/problems", data);
      return res.data;
    },
    onSuccess: () => {
      // Refresh the data after successful creation
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
```

#### Step 5: HTTP Request (Through Axios)
```tsx
// In lib/axios.ts
const api = axios.create({
  baseURL: "/api/v1",
});

// Interceptor automatically adds the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**What Actually Happens:**
1. Axios sends: `POST http://localhost:8000/api/v1/problems`
2. With headers: `{ Authorization: "Bearer <token>", Content-Type: "application/json" }`
3. With body: `{ title: "...", difficulty: "Easy", ... }`

#### Step 6: Backend Processes Request
- FastAPI receives the request
- Validates the token
- Saves to PostgreSQL
- Returns: `{ id: "123", title: "...", ... }`

#### Step 7: Success Callback
```tsx
onSuccess: () => {
  // TanStack Query automatically refetches the problems list
  queryClient.invalidateQueries({ queryKey: ["problems"] });

  // This triggers a re-render of the problems page with fresh data
}
```

#### Step 8: UI Updates Automatically
- Problems list component re-renders
- New problem appears in the list
- No manual refresh needed!

---

## File-by-File Breakdown

### Entry Point Files

#### `main.tsx` - The Starting Point
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a QueryClient instance (manages all API data)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // Data is fresh for 5 minutes
      retry: 1,                   // Retry failed requests once
    },
  },
});

// Render the app inside the #root div in index.html
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  </StrictMode>
);
```

**What This Does:**
- Creates the QueryClient (brain of data fetching)
- Wraps the app in QueryClientProvider (makes QueryClient available everywhere)
- Adds Toaster for notifications
- StrictMode helps catch bugs during development

#### `App.tsx` - The Router
```tsx
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes (inside DashboardLayout) */}
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/new" element={<NewProblemPage />} />
            {/* ... more routes */}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**Route Structure:**
- `/landing` → Landing page (no layout)
- `/login` → Login page (no layout)
- `/` → Dashboard (with sidebar + header)
- `/problems` → Problems list (with sidebar + header)
- All routes inside `<Route element={<DashboardLayout />}>` share the same layout

**Lazy Loading:**
```tsx
const DashboardPage = lazy(() => import("@/pages/dashboard"));
```
This loads the page code only when needed, making the initial load faster.

---

### Authentication Flow

#### `store/auth-store.ts` - Global Auth State
```tsx
interface AuthState {
  token: string | null;      // JWT token
  user: User | null;         // Current user info
  setAuth: (token: string, user: User) => void;  // Login
  setUser: (user: User) => void;                 // Update user
  logout: () => void;                             // Logout
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize from localStorage (persists across page refreshes)
  token: localStorage.getItem("token"),
  user: (() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  })(),

  setAuth: (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
```

**How to Use:**
```tsx
// In any component
import { useAuthStore } from "@/store/auth-store";

function MyComponent() {
  const { token, user, logout } = useAuthStore();

  if (!token) {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <p>Hello, {user?.full_name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### `lib/axios.ts` - API Client with Auto-Auth
```tsx
const api = axios.create({
  baseURL: "/api/v1",  // All requests go to /api/v1/*
});

// Request interceptor: Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Auto-logout on 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();  // Clear auth state
    }
    return Promise.reject(error);
  }
);
```

**What This Means:**
- Every API call automatically includes `Authorization: Bearer <token>`
- If backend returns 401, user is automatically logged out
- No need to manually add auth headers to each request

---

### Data Fetching Hooks (TanStack Query)

#### Pattern: `use-problems.ts`

**1. Fetch List of Problems**
```tsx
export function useProblems(params: {
  page?: number;
  size?: number;
  difficulty?: string;
  search?: string;
  tag?: string;
} = {}) {
  const { page = 1, size = 10, difficulty, search, tag } = params;

  return useQuery({
    queryKey: ["problems", { page, size, difficulty, search, tag }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(page));
      searchParams.set("size", String(size));
      if (difficulty) searchParams.set("difficulty", difficulty);
      if (search) searchParams.set("search", search);
      if (tag) searchParams.set("tag", tag);

      const res = await api.get<ProblemListResponse>(`/problems?${searchParams}`);
      return res.data;
    },
    placeholderData: keepPreviousData,  // Keep old data while fetching new
  });
}
```

**Using in a Component:**
```tsx
function ProblemsPage() {
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState("");

  const { data, isLoading, error } = useProblems({ page, difficulty });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data.items.map(problem => (
        <ProblemCard key={problem.id} problem={problem} />
      ))}
      <button onClick={() => setPage(page + 1)}>Next Page</button>
    </div>
  );
}
```

**What TanStack Query Does:**
- **Caching**: Stores results in memory
- **Auto-refetch**: Refetches when window regains focus
- **Loading states**: Provides `isLoading`, `isFetching` automatically
- **Error handling**: Provides `error` object
- **Deduplication**: Multiple components using same query = one request

**2. Create a Problem (Mutation)**
```tsx
export function useCreateProblem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProblemCreate) => {
      const res = await api.post<Problem>("/problems", data);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate cached data to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
```

**Using in a Component:**
```tsx
function NewProblemForm() {
  const createMutation = useCreateProblem();
  const navigate = useNavigate();

  async function onSubmit(data: ProblemCreate) {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Problem created!");
      navigate("/problems");
    } catch (error) {
      toast.error("Failed to create problem");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

**Key Concepts:**
- `mutate()` - Fire and forget
- `mutateAsync()` - Returns a promise (use with try/catch)
- `isPending` - True while request is in flight
- `onSuccess` - Runs after successful mutation

---

### Layout Components

#### `components/layout/dashboard-layout.tsx`
```tsx
export function DashboardLayout() {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />  {/* Child routes render here */}
        </main>
      </div>
    </div>
  );
}
```

**How This Works:**
1. Checks if user is logged in (`token`)
2. If not logged in, redirects to `/login`
3. If logged in, shows: Sidebar | Header + Content
4. `<Outlet />` is where child routes (dashboard, problems, etc.) appear

**Layout Structure:**
```
┌─────────────────────────────────┐
│ DashboardLayout                 │
│ ┌─────┬─────────────────────┐  │
│ │     │ Header              │  │
│ │ S   ├─────────────────────┤  │
│ │ i   │                     │  │
│ │ d   │   <Outlet />        │  │
│ │ e   │   (Child routes)    │  │
│ │ b   │                     │  │
│ │ a   │                     │  │
│ │ r   │                     │  │
│ └─────┴─────────────────────┘  │
└─────────────────────────────────┘
```

---

### Form Handling

#### Example: `pages/new-problem.tsx`

**Step 1: Define Validation Schema (Zod)**
```tsx
const problemCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  situation: z.string().min(1, "Situation is required"),
  task: z.string().min(1, "Task is required"),
  action: z.string().min(1, "Action is required"),
  result: z.string().min(1, "Result is required"),
  tags: z.array(z.string()).optional(),
});
```

**Step 2: Create Form with React Hook Form**
```tsx
const form = useForm<ProblemCreate>({
  resolver: zodResolver(problemCreateSchema),
  defaultValues: {
    title: "",
    difficulty: "Medium",
    tags: [],
  },
});
```

**Step 3: Handle Submission**
```tsx
const createMutation = useCreateProblem();

async function onSubmit(data: ProblemCreate) {
  try {
    await createMutation.mutateAsync(data);
    toast.success("Problem created!");
    navigate("/problems");
  } catch (error) {
    toast.error("Failed to create problem");
  }
}
```

**Step 4: Render Form**
```tsx
<form onSubmit={form.handleSubmit(onSubmit)}>
  <FormField
    control={form.control}
    name="title"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input placeholder="Problem title" {...field} />
        </FormControl>
        <FormMessage />  {/* Shows validation errors */}
      </FormItem>
    )}
  />

  <Button type="submit" disabled={createMutation.isPending}>
    {createMutation.isPending ? "Creating..." : "Create Problem"}
  </Button>
</form>
```

**What Happens:**
1. User types in input → `field.value` updates
2. User clicks submit → Form validates using Zod schema
3. If valid → Calls `onSubmit` → API request
4. If invalid → Shows error messages under fields

---

## Common Patterns & Concepts

### 1. Conditional Rendering
```tsx
// Show different content based on state
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// Ternary operator
{user ? <UserProfile user={user} /> : <LoginButton />}
```

### 2. Lists and Keys
```tsx
// Always use unique key when mapping arrays
{problems.map((problem) => (
  <ProblemCard key={problem.id} problem={problem} />
))}
```
**Why keys matter:** React uses keys to efficiently update the DOM.

### 3. Event Handlers
```tsx
// Inline function
<button onClick={() => deleteProblem(id)}>Delete</button>

// Named function
function handleDelete() {
  deleteProblem(id);
}
<button onClick={handleDelete}>Delete</button>

// With parameters
<button onClick={(e) => {
  e.preventDefault();
  handleSubmit(formData);
}}>Submit</button>
```

### 4. useEffect for Side Effects
```tsx
useEffect(() => {
  // Runs after component mounts and when dependencies change
  console.log("User changed:", user);

  // Cleanup function (optional)
  return () => {
    console.log("Component unmounting or user changed");
  };
}, [user]);  // Dependencies array

// Empty array = run once on mount
useEffect(() => {
  console.log("Component mounted");
}, []);
```

### 5. TypeScript Types
```tsx
// Define a type
interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
}

// Use in component props
interface ProblemCardProps {
  problem: Problem;
  onDelete?: (id: string) => void;  // Optional prop
}

function ProblemCard({ problem, onDelete }: ProblemCardProps) {
  return (
    <div>
      <h3>{problem.title}</h3>
      {onDelete && (
        <button onClick={() => onDelete(problem.id)}>Delete</button>
      )}
    </div>
  );
}
```

---

## Debugging Guide

### Common Issues and Solutions

#### Issue 1: "Cannot read property of undefined"
```tsx
// ❌ Wrong - data might be undefined while loading
<h1>{data.title}</h1>

// ✅ Correct - Check if data exists first
{data && <h1>{data.title}</h1>}

// ✅ Or use optional chaining
<h1>{data?.title}</h1>

// ✅ Or provide fallback
<h1>{data?.title ?? "Loading..."}</h1>
```

#### Issue 2: "Rendered more hooks than during the previous render"
**Cause:** You called a hook (like `useState`, `useQuery`) inside a condition/loop.

```tsx
// ❌ Wrong
if (user) {
  const [count, setCount] = useState(0);  // Conditional hook!
}

// ✅ Correct - Hooks must be at the top level
const [count, setCount] = useState(0);
if (user) {
  // Use the hook here
}
```

#### Issue 3: State not updating
```tsx
// ❌ Wrong - Mutating state directly
const [user, setUser] = useState({ name: "John" });
user.name = "Jane";  // This won't trigger re-render

// ✅ Correct - Create new object
setUser({ ...user, name: "Jane" });

// For arrays
const [items, setItems] = useState([1, 2, 3]);
// ❌ items.push(4);
// ✅ setItems([...items, 4]);
```

#### Issue 4: API call not including auth token
**Check:**
1. Is token in localStorage? → Open DevTools → Application tab → Local Storage
2. Is axios interceptor working? → Check Network tab in DevTools
3. Look for `Authorization: Bearer <token>` in request headers

#### Issue 5: CORS errors
```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Fix:** Check backend `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Debugging Tools

#### 1. React DevTools
- Install: Chrome/Firefox extension "React Developer Tools"
- Inspect components, props, state
- See component tree

#### 2. Browser DevTools
- **Console**: View logs, errors
- **Network**: See API requests/responses
- **Application**: Check localStorage, cookies
- **Elements**: Inspect DOM and CSS

#### 3. console.log() Debugging
```tsx
function MyComponent({ data }) {
  console.log("Component rendered with data:", data);

  useEffect(() => {
    console.log("Effect ran, data changed:", data);
  }, [data]);

  function handleClick() {
    console.log("Button clicked");
  }

  return <button onClick={handleClick}>Click</button>;
}
```

#### 4. TanStack Query Devtools
```tsx
// In main.tsx, add:
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```
This shows all queries, their status, cached data, etc.

---

## How to Add New Features

### Example: Adding a "Projects" Feature

#### Step 1: Define Types
```tsx
// src/types/index.ts
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  created_at: string;
}

export interface ProjectCreate {
  name: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
  page: number;
  size: number;
}
```

#### Step 2: Create API Hook
```tsx
// src/hooks/use-projects.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Project, ProjectCreate, ProjectListResponse } from "@/types";

export function useProjects(page = 1, size = 10) {
  return useQuery({
    queryKey: ["projects", { page, size }],
    queryFn: async () => {
      const res = await api.get<ProjectListResponse>(
        `/projects?page=${page}&size=${size}`
      );
      return res.data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProjectCreate) => {
      const res = await api.post<Project>("/projects", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
```

#### Step 3: Create Page Component
```tsx
// src/pages/projects.tsx
import { useState } from "react";
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useProjects(page);
  const deleteMutation = useDeleteProject();

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>My Projects</h1>

      <div className="grid gap-4">
        {data?.items.map((project) => (
          <Card key={project.id} className="p-4">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <div className="flex gap-2">
              {project.tech_stack.map((tech) => (
                <span key={tech} className="badge">{tech}</span>
              ))}
            </div>
            <Button
              variant="destructive"
              onClick={() => handleDelete(project.id)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setPage(page + 1)}
          disabled={!data || data.items.length < 10}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

#### Step 4: Add Route
```tsx
// src/App.tsx
const ProjectsPage = lazy(() => import("@/pages/projects"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          {/* ... existing routes ... */}
          <Route path="/projects" element={<ProjectsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

#### Step 5: Add Navigation Link
```tsx
// src/components/layout/sidebar.tsx
const navItems = [
  // ... existing items ...
  { name: "Projects", href: "/projects", icon: FolderIcon },
];
```

---

## Key Takeaways

### When to Use Each Technology

| Scenario | Use This | Why |
|----------|----------|-----|
| Need to fetch data from backend | TanStack Query (`useQuery`) | Automatic caching, loading states |
| Need to send data to backend | TanStack Query (`useMutation`) | Handles loading, errors, cache invalidation |
| Need global state (auth, theme) | Zustand | Simple, minimal boilerplate |
| Need form validation | React Hook Form + Zod | Declarative, type-safe |
| Need to make HTTP requests | Axios (`lib/axios.ts`) | Pre-configured with auth |
| Need routing/navigation | React Router | SPA navigation |
| Need reusable logic | Custom hooks | DRY principle |
| Need UI components | Shadcn/UI | Accessible, customizable |

### Common Mistakes to Avoid

1. **Don't fetch data in useEffect** → Use TanStack Query instead
2. **Don't store server data in useState** → Use TanStack Query cache
3. **Don't mutate state directly** → Always create new objects/arrays
4. **Don't forget error handling** → Always handle API errors
5. **Don't skip TypeScript types** → They catch bugs before runtime

### Performance Tips

1. **Use React.memo for expensive components**
   ```tsx
   const ExpensiveComponent = React.memo(({ data }) => {
     // Only re-renders if data changes
   });
   ```

2. **Use useMemo for expensive calculations**
   ```tsx
   const sortedItems = useMemo(() => {
     return items.sort((a, b) => a.date - b.date);
   }, [items]);
   ```

3. **Use useCallback for functions passed to children**
   ```tsx
   const handleClick = useCallback(() => {
     doSomething(id);
   }, [id]);
   ```

4. **Lazy load pages**
   ```tsx
   const BigPage = lazy(() => import("@/pages/big-page"));
   ```

---

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name
```

---

## Conclusion

You now have a complete understanding of:
- ✅ How the frontend is structured
- ✅ How data flows from UI → API → Database → UI
- ✅ How to use TanStack Query for data fetching
- ✅ How authentication works
- ✅ How to add new features
- ✅ How to debug common issues

**Next Steps:**
1. Read through one complete flow (e.g., creating a problem)
2. Try modifying an existing component
3. Add a small feature using the guide above
4. Use browser DevTools to inspect requests/state

**Remember:** Programming is learned by doing. Don't be afraid to break things—you can always revert with git!

---

*Last Updated: 2026-02-13*
