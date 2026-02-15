# CarrerLog - Frontend Documentation

> Complete documentation for the React/TypeScript frontend

---

## 🔐 IMPORTANT: Google SSO Authentication

**The application now uses Google Single Sign-On (SSO) exclusively.**
- Only Gmail accounts (@gmail.com) can sign in
- No password-based authentication
- One-click login with Google

📖 **See [GOOGLE_SSO_GUIDE.md](./GOOGLE_SSO_GUIDE.md) for complete SSO documentation**

---

## 📚 Documentation Overview

This folder contains **four comprehensive guides** to help you understand, develop, and debug the frontend application:

### 1. [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - **Start Here!**
**The Complete Beginner's Guide** (15,000+ words)

Perfect for:
- ✅ New to frontend development
- ✅ Understanding how everything works
- ✅ Learning the complete data flow
- ✅ Step-by-step explanations

**What's Inside:**
- Technology stack explained in plain English
- Complete project structure breakdown
- **How data flows from UI → API → Database → UI**
- File-by-file detailed explanations
- React concepts (hooks, state, effects)
- TanStack Query for data fetching
- Form handling with React Hook Form + Zod
- Authentication flow explained
- Debugging guide with solutions
- **How to add new features** (complete example)

**📖 Read this first to understand the big picture!**

---

### 2. [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)
**Visual Architecture & Data Flow Diagrams**

Perfect for:
- ✅ Visual learners
- ✅ Understanding component relationships
- ✅ Tracing data flow
- ✅ Getting the big picture quickly

**What's Inside:**
- Overall system architecture diagram
- Component hierarchy tree
- **Data flow diagrams** (read & write operations)
- Authentication flow step-by-step
- File organization visual map
- State management overview
- HTTP request/response examples
- Performance optimization flow

**👁️ Use this to visualize how everything connects!**

---

### 3. [GOOGLE_SSO_GUIDE.md](./GOOGLE_SSO_GUIDE.md) - **AUTHENTICATION UPDATE**
**Google OAuth 2.0 Implementation Guide**

Perfect for:
- ✅ Understanding Google SSO integration
- ✅ Setting up OAuth credentials
- ✅ Debugging authentication issues
- ✅ Configuring for production

**What's Inside:**
- How Google SSO works (vs password auth)
- **Complete authentication flow diagram**
- Step-by-step OAuth 2.0 explanation
- Backend and frontend code changes
- **Setup instructions** (Google Cloud Console)
- Debugging common SSO issues
- Security considerations
- Migration guide from password auth

**🔐 Read this to understand the new authentication!**

---

### 4. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Practical Cheat Sheet & Troubleshooting**

Perfect for:
- ✅ Quick code snippets
- ✅ Common patterns
- ✅ Debugging errors
- ✅ Daily development tasks

**What's Inside:**
- Ready-to-use code snippets
- API hooks patterns (fetch, create, update, delete)
- Form handling examples
- Routing & navigation recipes
- Tailwind CSS common patterns
- **Debugging checklist**
- **Troubleshooting common errors** (with fixes!)
- Performance tips
- Keyboard shortcuts
- Git commands reference

**⚡ Keep this open while coding!**

---

## 🎯 How to Use These Docs

### If you're **new to frontend**:
1. Start with **FRONTEND_GUIDE.md** (sections 1-3)
2. Follow along with **ARCHITECTURE_DIAGRAMS.md** for visual understanding
3. Keep **QUICK_REFERENCE.md** handy for code snippets

### If you're **debugging an issue**:
1. Check **QUICK_REFERENCE.md** → "Troubleshooting Common Errors"
2. Use **FRONTEND_GUIDE.md** → "Debugging Guide"
3. Trace data flow with **ARCHITECTURE_DIAGRAMS.md**

### If you're **adding a feature**:
1. Read **FRONTEND_GUIDE.md** → "How to Add New Features"
2. Copy patterns from **QUICK_REFERENCE.md** → "API Hooks Patterns"
3. Reference **ARCHITECTURE_DIAGRAMS.md** for structure

### If you need **quick code examples**:
1. Go straight to **QUICK_REFERENCE.md**
2. Find your use case (forms, routing, styling, etc.)
3. Copy, paste, modify!

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Opens at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Project Structure (Quick Overview)

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/         # Base components (buttons, inputs, cards)
│   │   └── layout/     # Layout components (sidebar, header)
│   ├── hooks/          # Custom React hooks (API logic)
│   ├── lib/            # Utilities (axios, validation)
│   ├── pages/          # Page components (one per route)
│   ├── store/          # Global state (auth, theme)
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Router configuration
│   └── main.tsx        # Entry point
├── FRONTEND_GUIDE.md           # ← Complete guide
├── ARCHITECTURE_DIAGRAMS.md    # ← Visual diagrams
└── QUICK_REFERENCE.md          # ← Cheat sheet
```

---

## 💡 Key Concepts (TL;DR)

### Data Fetching
- Uses **TanStack Query** (`useQuery`, `useMutation`)
- Custom hooks in `hooks/` folder (`use-problems.ts`, etc.)
- Automatic caching, loading states, error handling

### State Management
- **Server state**: TanStack Query (data from API)
- **Client state**: Zustand (auth, theme)
- **Form state**: React Hook Form
- **Local state**: `useState`

### Routing
- **React Router** for navigation
- Lazy loaded pages for performance
- Protected routes for authenticated pages

### Styling
- **Tailwind CSS** for utility classes
- **Shadcn/UI** for pre-built components
- Responsive design built-in

### Forms
- **React Hook Form** for form management
- **Zod** for validation
- Type-safe with TypeScript

---

## 🔍 Common Tasks

### Task: Fetch and Display Data
```tsx
import { useProblems } from "@/hooks/use-problems";

function ProblemsList() {
  const { data, isLoading, error } = useProblems();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return (
    <div>
      {data?.items.map(problem => (
        <div key={problem.id}>{problem.title}</div>
      ))}
    </div>
  );
}
```
📖 **See QUICK_REFERENCE.md → "Common Code Snippets"**

### Task: Create a Form
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(mySchema),
});

function onSubmit(data) {
  // Call API
}

return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
```
📖 **See FRONTEND_GUIDE.md → "Form Handling"**

### Task: Navigate to Another Page
```tsx
import { useNavigate } from "react-router-dom";

function MyComponent() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate("/problems")}>
      Go to Problems
    </button>
  );
}
```
📖 **See QUICK_REFERENCE.md → "Routing & Navigation"**

---

## 🐛 Debugging Quick Tips

### Issue: Data not loading
1. **Check Network tab** in DevTools - Is request being made?
2. **Check auth token** - Is it in the request headers?
3. **Check backend** - Is it running? Any errors?

### Issue: Component not rendering
1. **Check console** - Any errors?
2. **Check route** - Is it configured in `App.tsx`?
3. **Check imports** - Correct import path?

### Issue: Form not submitting
1. **Check validation** - Any validation errors?
2. **Check button** - Is it `type="submit"`?
3. **Check onSubmit** - Wrapped in `form.handleSubmit()`?

📖 **See QUICK_REFERENCE.md → "Debugging Checklist"** for complete list

---

## 🛠️ Tech Stack Details

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI library |
| TypeScript | 5.9 | Type safety |
| Vite | 7 | Build tool |
| React Router | 7 | Routing |
| TanStack Query | 5 | Data fetching |
| Zustand | 5 | State management |
| Axios | 1.13 | HTTP client |
| Tailwind CSS | 4 | Styling |
| Shadcn/UI | Latest | Components |
| Zod | 4 | Validation |
| React Hook Form | 7 | Forms |

---

## 📖 Learning Path

### Week 1: Understanding the Basics
- [ ] Read FRONTEND_GUIDE.md sections 1-3
- [ ] Review ARCHITECTURE_DIAGRAMS.md
- [ ] Run the app and explore each page
- [ ] Make a small change (e.g., button text)

### Week 2: Data Flow
- [ ] Read FRONTEND_GUIDE.md section 4 (Data Flow)
- [ ] Trace one complete flow (e.g., creating a problem)
- [ ] Open DevTools and watch Network tab
- [ ] Modify an existing component

### Week 3: Building Features
- [ ] Read FRONTEND_GUIDE.md section 7 (How to Add Features)
- [ ] Add a small feature (e.g., new filter)
- [ ] Use QUICK_REFERENCE.md for code patterns
- [ ] Debug any issues using the debugging guide

### Week 4: Advanced Topics
- [ ] Understand state management (TanStack Query vs Zustand)
- [ ] Learn form validation patterns
- [ ] Optimize component performance
- [ ] Write your own custom hook

---

## 🤝 Contributing Guidelines

When modifying the frontend:

1. **Follow existing patterns**
   - Check similar components for reference
   - Use the same folder structure
   - Follow naming conventions

2. **Type safety**
   - Always define TypeScript types
   - Add types to `types/index.ts`
   - No `any` types!

3. **Code style**
   - Use Tailwind for styling
   - Use Shadcn components when possible
   - Keep components small and focused

4. **Error handling**
   - Always handle loading and error states
   - Show user-friendly error messages
   - Log errors to console

5. **Testing**
   - Test happy path
   - Test error cases
   - Test on different screen sizes

---

## 🆘 Getting Help

### When stuck:

1. **Check the docs:**
   - FRONTEND_GUIDE.md for concepts
   - QUICK_REFERENCE.md for solutions
   - ARCHITECTURE_DIAGRAMS.md for structure

2. **Use DevTools:**
   - Console for errors
   - Network for API calls
   - React DevTools for components

3. **Common issues:**
   - Not authenticated? → Check localStorage for token
   - CORS error? → Check backend CORS settings
   - Type error? → Check TypeScript definitions

4. **Still stuck?**
   - Check Git history for similar changes
   - Search error message on Stack Overflow
   - Ask for help with specific error message

---

## 📝 Additional Resources

### Official Documentation
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

### Video Tutorials
- React basics: Search "React tutorial" on YouTube
- TypeScript: Search "TypeScript crash course"
- Tailwind CSS: Official Tailwind screencasts

### Practice
- Build small features
- Modify existing components
- Break things and fix them
- Read the code!

---

## ✅ Checklist: "I Understand Frontend!"

Mark these off as you learn:

- [ ] I can navigate the codebase and find files
- [ ] I understand the data flow (UI → API → Database)
- [ ] I can fetch data using custom hooks
- [ ] I can create a simple form
- [ ] I can navigate between pages
- [ ] I can debug using DevTools
- [ ] I can add a new page/route
- [ ] I can style components with Tailwind
- [ ] I understand authentication flow
- [ ] I can fix common errors independently

**When all checked:** You're ready to build features! 🎉

---

## 🎓 Conclusion

You now have:
- ✅ **FRONTEND_GUIDE.md** - Complete learning resource
- ✅ **ARCHITECTURE_DIAGRAMS.md** - Visual reference
- ✅ **QUICK_REFERENCE.md** - Daily coding companion

**Start with the guide, refer to diagrams, and keep the reference handy!**

The best way to learn is by doing:
1. Read the guides
2. Run the app
3. Make small changes
4. Break things (safely with git!)
5. Fix them
6. Repeat!

**Happy coding! 🚀**

---

*Last Updated: 2026-02-13*

*Questions? Check the three guides above - they have everything you need!*
