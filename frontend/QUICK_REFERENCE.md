# Frontend Quick Reference Guide

> Cheat sheet for common tasks, code snippets, and troubleshooting

---

## Table of Contents
1. [Common Code Snippets](#common-code-snippets)
2. [API Hooks Patterns](#api-hooks-patterns)
3. [Form Handling](#form-handling)
4. [Routing & Navigation](#routing--navigation)
5. [Styling with Tailwind](#styling-with-tailwind)
6. [Debugging Checklist](#debugging-checklist)
7. [Troubleshooting Common Errors](#troubleshooting-common-errors)

---

## Common Code Snippets

### Fetch and Display Data
```tsx
import { useProblems } from "@/hooks/use-problems";

function ProblemsList() {
  const { data, isLoading, error } = useProblems({ page: 1, size: 10 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      {data.items.map((problem) => (
        <div key={problem.id}>{problem.title}</div>
      ))}
    </div>
  );
}
```

### Create New Item
```tsx
import { useCreateProblem } from "@/hooks/use-problems";
import { toast } from "sonner";

function CreateButton() {
  const createMutation = useCreateProblem();

  async function handleCreate() {
    try {
      await createMutation.mutateAsync({
        title: "My Problem",
        difficulty: "Easy",
        // ... other fields
      });
      toast.success("Created successfully!");
    } catch (error) {
      toast.error("Failed to create");
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={createMutation.isPending}
    >
      {createMutation.isPending ? "Creating..." : "Create"}
    </button>
  );
}
```

### Update Item
```tsx
import { useUpdateProblem } from "@/hooks/use-problems";

function UpdateButton({ problemId }: { problemId: string }) {
  const updateMutation = useUpdateProblem();

  async function handleUpdate() {
    try {
      await updateMutation.mutateAsync({
        id: problemId,
        data: {
          title: "Updated Title",
          // ... other fields to update
        },
      });
      toast.success("Updated!");
    } catch (error) {
      toast.error("Failed to update");
    }
  }

  return <button onClick={handleUpdate}>Update</button>;
}
```

### Delete Item
```tsx
import { useDeleteProblem } from "@/hooks/use-problems";

function DeleteButton({ problemId }: { problemId: string }) {
  const deleteMutation = useDeleteProblem();

  async function handleDelete() {
    if (!confirm("Are you sure?")) return;

    try {
      await deleteMutation.mutateAsync(problemId);
      toast.success("Deleted!");
    } catch (error) {
      toast.error("Failed to delete");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleteMutation.isPending}
    >
      Delete
    </button>
  );
}
```

### Conditional Rendering
```tsx
// Option 1: &&
{isLoggedIn && <UserProfile />}

// Option 2: Ternary
{isLoggedIn ? <UserProfile /> : <LoginButton />}

// Option 3: Early return
if (!user) return <LoginPage />;
return <Dashboard />;

// Option 4: Optional chaining
<p>{user?.name ?? "Guest"}</p>
```

### Handle Loading & Error States
```tsx
function DataComponent() {
  const { data, isLoading, error, refetch } = useQuery(...);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error: {error.message}</p>
        <button onClick={() => refetch()} className="mt-4">
          Retry
        </button>
      </div>
    );
  }

  return <div>{/* Render data */}</div>;
}
```

---

## API Hooks Patterns

### Basic Query Hook Template
```tsx
// hooks/use-items.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Item, ItemListResponse } from "@/types";

export function useItems(params: { page?: number; size?: number } = {}) {
  const { page = 1, size = 10 } = params;

  return useQuery({
    queryKey: ["items", { page, size }],
    queryFn: async () => {
      const res = await api.get<ItemListResponse>(
        `/items?page=${page}&size=${size}`
      );
      return res.data;
    },
  });
}
```

### Mutation Hook Template
```tsx
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ItemCreate) => {
      const res = await api.post<Item>("/items", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ItemUpdate }) => {
      const res = await api.put<Item>(`/items/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}
```

### Query with Filters
```tsx
export function useFilteredItems(filters: {
  search?: string;
  status?: string;
  sortBy?: string;
}) {
  return useQuery({
    queryKey: ["items", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.sortBy) params.set("sort", filters.sortBy);

      const res = await api.get<ItemListResponse>(`/items?${params}`);
      return res.data;
    },
  });
}

// Usage
function ItemsList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data } = useFilteredItems({ search, status });

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
      {/* Render items */}
    </div>
  );
}
```

---

## Form Handling

### Basic Form with React Hook Form + Zod
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Define schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+"),
});

type FormData = z.infer<typeof formSchema>;

// 2. Create form component
function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      age: 18,
    },
  });

  function onSubmit(data: FormData) {
    console.log(data);
    // Call API here
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label>Name</label>
        <input {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <label>Email</label>
        <input {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### Form with Shadcn Components
```tsx
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ShadcnForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Form with API Integration
```tsx
function CreateItemForm() {
  const navigate = useNavigate();
  const createMutation = useCreateItem();

  const form = useForm<ItemCreate>({
    resolver: zodResolver(itemSchema),
  });

  async function onSubmit(data: ItemCreate) {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Item created!");
      navigate("/items");
    } catch (error) {
      toast.error("Failed to create item");
      console.error(error);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <Button
        type="submit"
        disabled={createMutation.isPending || form.formState.isSubmitting}
      >
        {createMutation.isPending ? "Creating..." : "Create Item"}
      </Button>
    </form>
  );
}
```

---

## Routing & Navigation

### Navigate Programmatically
```tsx
import { useNavigate } from "react-router-dom";

function MyComponent() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/problems");
  }

  function handleBack() {
    navigate(-1); // Go back
  }

  function handleReplace() {
    navigate("/login", { replace: true }); // Replace current entry
  }

  return (
    <div>
      <button onClick={handleClick}>Go to Problems</button>
      <button onClick={handleBack}>Go Back</button>
    </div>
  );
}
```

### Link Component
```tsx
import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/problems">Problems</Link>
      <Link to="/problems/123">Problem 123</Link>
      <Link to="/problems" state={{ from: "navbar" }}>
        Problems with State
      </Link>
    </nav>
  );
}
```

### Get URL Parameters
```tsx
import { useParams, useSearchParams } from "react-router-dom";

function ProblemDetail() {
  // Route: /problems/:id
  const { id } = useParams<{ id: string }>();

  return <div>Problem ID: {id}</div>;
}

function ProblemsPage() {
  // URL: /problems?page=2&difficulty=easy
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get("page") ?? "1";
  const difficulty = searchParams.get("difficulty");

  function updatePage(newPage: number) {
    setSearchParams({ page: String(newPage) });
  }

  return <div>Page: {page}</div>;
}
```

### Protected Route
```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

function ProtectedRoute() {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// In App.tsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/problems" element={<Problems />} />
</Route>
```

---

## Styling with Tailwind

### Layout
```tsx
// Flex container
<div className="flex items-center justify-between gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

// Grid
<div className="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

// Center content
<div className="flex items-center justify-center h-screen">
  <div>Centered</div>
</div>

// Responsive columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

### Spacing
```tsx
// Padding
<div className="p-4">      {/* All sides: 1rem */}
<div className="px-4 py-2"> {/* Horizontal: 1rem, Vertical: 0.5rem */}
<div className="pt-8">     {/* Top: 2rem */}

// Margin
<div className="m-4">      {/* All sides: 1rem */}
<div className="mx-auto">  {/* Horizontal: auto (center) */}
<div className="mt-4">     {/* Top: 1rem */}

// Gap (for flex/grid)
<div className="flex gap-4">  {/* Gap between children: 1rem */}
```

### Typography
```tsx
<h1 className="text-3xl font-bold text-gray-900">Heading</h1>
<p className="text-sm text-gray-600">Small text</p>
<p className="text-base leading-relaxed">Normal text</p>
<p className="font-semibold">Semi-bold</p>
<p className="italic">Italic</p>
<p className="truncate">Text that will be truncated...</p>
```

### Colors
```tsx
// Text
<p className="text-red-500">Error</p>
<p className="text-green-600">Success</p>
<p className="text-blue-500">Info</p>

// Background
<div className="bg-gray-100">Light background</div>
<div className="bg-primary">Primary color</div>

// Border
<div className="border border-gray-300">With border</div>
<div className="border-2 border-red-500">Thick red border</div>
```

### Interactive States
```tsx
// Hover
<button className="hover:bg-blue-600">Hover me</button>

// Focus
<input className="focus:ring-2 focus:ring-blue-500" />

// Active
<button className="active:scale-95">Click me</button>

// Disabled
<button className="disabled:opacity-50 disabled:cursor-not-allowed">
  Disabled
</button>
```

### Responsive Design
```tsx
// Mobile first: sm → md → lg → xl
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<div className="hidden md:block">
  Hidden on mobile, visible on md+
</div>

<div className="block md:hidden">
  Visible on mobile, hidden on md+
</div>
```

### Common Patterns
```tsx
// Card
<div className="rounded-lg border bg-white p-6 shadow-sm">
  Card content
</div>

// Button
<button className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90">
  Button
</button>

// Badge
<span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
  Badge
</span>

// Input
<input className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
```

---

## Debugging Checklist

### When Component Doesn't Render

- [ ] Is the component imported correctly?
- [ ] Is it exported with `export default` or `export`?
- [ ] Are there any console errors?
- [ ] Is the route configured in `App.tsx`?
- [ ] Are all required props provided?

### When Data Doesn't Load

- [ ] Check Network tab in DevTools - is the request being made?
- [ ] Is the API endpoint correct?
- [ ] Is the auth token present in request headers?
- [ ] Check backend logs - did the request reach the server?
- [ ] Is the response status 200?
- [ ] Is the response data structure what you expect?

### When Form Doesn't Submit

- [ ] Is `onSubmit` wrapped in `form.handleSubmit()`?
- [ ] Are there validation errors? Check `form.formState.errors`
- [ ] Is the submit button outside the `<form>` tag?
- [ ] Is the button type="submit"?
- [ ] Check console for errors in the submit handler

### When State Doesn't Update

- [ ] Are you mutating state directly? (❌ `user.name = "..."`)
- [ ] Are you creating a new object/array? (✅ `setUser({ ...user, name: "..." })`)
- [ ] Is the dependency array correct in `useEffect`?
- [ ] Are you updating the correct state variable?

### When Auth Doesn't Work

- [ ] Is token in localStorage? (DevTools → Application → Local Storage)
- [ ] Is token being sent in request headers? (DevTools → Network → Headers)
- [ ] Is token valid? (Not expired, correct format)
- [ ] Is backend CORS configured for your frontend URL?

---

## Troubleshooting Common Errors

### Error: "Cannot read property '...' of undefined"
**Cause:** Trying to access a property on undefined/null

**Fix:**
```tsx
// ❌ Wrong
<p>{user.name}</p>

// ✅ Correct
<p>{user?.name}</p>
// or
{user && <p>{user.name}</p>}
// or
<p>{user?.name ?? "Guest"}</p>
```

### Error: "Rendered more hooks than during the previous render"
**Cause:** Hooks called conditionally or in loops

**Fix:**
```tsx
// ❌ Wrong
if (condition) {
  const [state, setState] = useState(0);
}

// ✅ Correct
const [state, setState] = useState(0);
if (condition) {
  // Use state here
}
```

### Error: "Objects are not valid as a React child"
**Cause:** Trying to render an object directly

**Fix:**
```tsx
// ❌ Wrong
<div>{user}</div>

// ✅ Correct
<div>{user.name}</div>
// or
<div>{JSON.stringify(user)}</div>
```

### Error: "Maximum update depth exceeded"
**Cause:** setState called during render, causing infinite loop

**Fix:**
```tsx
// ❌ Wrong
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Called on every render!
  return <div>{count}</div>;
}

// ✅ Correct
function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(count + 1);
  }, []); // Only on mount

  return <div>{count}</div>;
}
```

### Error: "Failed to fetch" or CORS error
**Cause:** Backend not allowing frontend origin

**Check:**
1. Is backend running?
2. Is backend CORS configured?
   ```python
   # backend/app/main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
3. Is frontend proxy configured in `vite.config.ts`?

### Error: "QueryClient not found"
**Cause:** Component not wrapped in QueryClientProvider

**Fix:** Check `main.tsx`:
```tsx
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### TypeScript Errors

#### "Property '...' does not exist on type '...'"
```tsx
// Define proper types
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: "1",
  name: "John",
  email: "john@example.com",
};
```

#### "Type '...' is not assignable to type '...'"
```tsx
// Ensure types match
const difficulty: "Easy" | "Medium" | "Hard" = "Easy"; // ✅
const difficulty: "Easy" | "Medium" | "Hard" = "easy"; // ❌
```

---

## Performance Tips

### Avoid Unnecessary Re-renders
```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Only re-renders when data changes
  return <div>{/* Render data */}</div>;
});

// Use useMemo for expensive calculations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.date - b.date);
}, [items]);

// Use useCallback for functions passed to children
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Optimize Images
```tsx
// Use appropriate image formats
<img src="image.webp" alt="..." />

// Lazy load images
<img loading="lazy" src="..." alt="..." />
```

### Debounce Search Input
```tsx
import { useDeferredValue } from "react";

function SearchableList() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const { data } = useItems({ search: deferredQuery });

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {/* Render data */}
    </div>
  );
}
```

---

## Testing Tips

### Manual Testing Checklist
- [ ] Test happy path (everything works)
- [ ] Test error cases (API fails, validation errors)
- [ ] Test loading states
- [ ] Test empty states (no data)
- [ ] Test authentication (logged in vs logged out)
- [ ] Test on different screen sizes (mobile, tablet, desktop)
- [ ] Test keyboard navigation
- [ ] Test with slow network (DevTools → Network → Throttling)

### Browser DevTools
```
F12 or Ctrl+Shift+I → Open DevTools

Console:
- View errors and logs
- Run JavaScript code

Network:
- See all HTTP requests
- Check request/response headers and body
- Throttle network speed

Application:
- View localStorage
- View cookies
- View session storage

React DevTools (Extension):
- Inspect component tree
- View props and state
- Profile performance
```

---

## Keyboard Shortcuts (VS Code)

| Shortcut | Action |
|----------|--------|
| Ctrl+Shift+P | Command palette |
| Ctrl+P | Quick open file |
| Ctrl+` | Toggle terminal |
| Ctrl+B | Toggle sidebar |
| Ctrl+/ | Toggle comment |
| Alt+Up/Down | Move line up/down |
| Ctrl+D | Select next occurrence |
| Ctrl+Shift+L | Select all occurrences |
| F2 | Rename symbol |
| Ctrl+Space | Trigger suggestions |

---

## Git Commands Quick Reference

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Add feature X"

# Push to remote
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature/my-feature

# Switch branch
git checkout main

# View changes
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout .
```

---

## Useful VS Code Extensions

- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Auto Rename Tag** - Rename paired HTML/JSX tags
- **Prettier** - Code formatter
- **ESLint** - JavaScript linter
- **GitLens** - Enhanced Git integration
- **Error Lens** - Show errors inline
- **Path Intellisense** - Autocomplete file paths

---

## Conclusion

This quick reference covers:
- ✅ Common code patterns you'll use daily
- ✅ How to handle forms, routing, and styling
- ✅ Debugging checklist and error solutions
- ✅ Performance optimization tips
- ✅ Testing and development workflow

**Bookmark this page** for quick access when coding!

---

*Companion to FRONTEND_GUIDE.md and ARCHITECTURE_DIAGRAMS.md*
