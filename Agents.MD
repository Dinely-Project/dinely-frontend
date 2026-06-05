# Dinely Frontend — Agent Rules

> Read this file in full before touching any code.
> These rules are derived from the actual codebase and must be followed exactly.

---

## 1. Project Overview

**Stack:** React 19 · TypeScript (strict) · Vite 8 · React Router v7 · Axios

**Purpose:** Multi-role restaurant management frontend. Four roles exist:
`ADMIN`, `STAFF`, `EMPLOYEE`, `CUSTOMER`. Each role has its own protected
dashboard. The app is dark-themed (`#0a0a0a` background, white text, orange
`#FF6B35` accent).

**No test framework is installed.** Do not add tests unless explicitly asked.
Do not add any dependency that is not already in `package.json` unless the task
explicitly requires a new library — and if it does, state what you are adding
and why before writing any code.

---

## 2. Architecture — Understand This Before Writing Anything

```
src/
├── api/
│   ├── axios.ts          ← Single Axios instance. ALL API calls go through this.
│   └── errors.ts         ← Typed error helpers. Use these for every catch block.
├── context/
│   ├── auth-context.ts   ← createContext + User/AuthContextType interfaces ONLY
│   └── AuthContext.tsx   ← AuthProvider implementation (state, effects, login/logout)
├── hooks/
│   └── useAdminUsers.ts  ← Custom hook pattern. Data fetching belongs in hooks, not components.
├── components/
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   └── admin/            ← Feature-scoped components live in subdirectories
│       ├── UsersPanel.tsx        (orchestrator — composes the others)
│       ├── UsersTable.tsx        (pure display)
│       ├── UserFilters.tsx       (filter controls)
│       ├── EditRoleModal.tsx     (modal with own API call)
│       └── SalaryHistoryModal.tsx (modal with own data fetch)
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── internal/
│       └── EmployeeRegisterPage.tsx
├── dashboards/
│   ├── AdminDashboard.tsx
│   ├── StaffDashboard.tsx
│   ├── EmployeeDashboard.tsx
│   └── CustomerDashboard.tsx
├── App.tsx               ← Router only. No logic lives here.
├── main.tsx              ← Entry point. Do not modify.
├── index.css             ← Global styles + utility classes. See Section 5.
└── App.css               ← Legacy Vite scaffold CSS. Do not add anything here.
```

### Layer rules — never cross these boundaries

| Layer | Responsibility | Must NOT |
|---|---|---|
| `api/axios.ts` | Axios instance, auth interceptor | Contain component logic |
| `api/errors.ts` | Error type guards and message extraction | Import React |
| `context/` | Auth session state only | Fetch non-auth data |
| `hooks/` | Data fetching, loading/error state | Render JSX |
| `components/` | UI, user interaction | Call APIs directly (go through hooks or pass handlers as props) |
| `pages/` & `dashboards/` | Route-level composition | Contain reusable logic (extract to hooks) |
| `App.tsx` | Route definitions only | Contain state or business logic |

---

## 3. Styling Rules — Tailwind CSS for All New Code

### Tailwind is the styling system for all new and modified code

**Tailwind is not yet installed.** When a task requires new styling, install
Tailwind v4 first using this exact setup:

**Install:**
```bash
npm install tailwindcss @tailwindcss/vite
```

**`vite.config.ts`:**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Top of `src/index.css`** (add as the very first line):
```css
@import "tailwindcss";
```

Do NOT create a `tailwind.config.js`. Tailwind v4 uses CSS-based config.

### What goes where

| Situation | What to use |
|---|---|
| New component or new feature | Tailwind utility classes |
| Modifying an existing component | Tailwind for any new styles you add; leave existing inline styles untouched unless the task is a full refactor |
| Global one-off utility (glass card, buttons, inputs) | Use the existing global classes (see Section 5) |
| Fully dynamic value (e.g. color from a JS variable at runtime) | Inline `style={{ color: dynamicValue }}` — Tailwind cannot handle this |
| Mixed static + dynamic | Tailwind class for static parts, inline style for dynamic part only |

### Never do this

- Do not create `.module.css` files.
- Do not add styles to `App.css`.
- Do not use `@apply` in `index.css` for new feature styles.
- Do not use `onMouseOver`/`onMouseOut` for hover effects — use Tailwind `hover:` variants.
- Do not write `style={{ display: 'flex' }}` when `className="flex"` works.

### Existing inline styles in legacy files

The existing files use inline styles. **Do not refactor them unless the task
explicitly asks for it.** When you modify a legacy file, only the elements
you touch get migrated to Tailwind. Leave the rest alone.

---

## 4. Error Handling — Non-Negotiable Rules

### Always use the error helpers in `src/api/errors.ts`

```ts
import { getApiErrorMessage } from '../api/errors';

// In every catch block:
} catch (err: unknown) {
  setError(getApiErrorMessage(err, 'Your fallback message here.'));
}
```

**Never use `catch (err: any)`** — this disables TypeScript's type checking.
Always type catch parameters as `unknown`.

**Never access `err.response?.data?.message` directly** — use
`getApiErrorMessage()` which handles all cases safely.

### Error state in components

Every component or hook that makes an API call must have:
- A `loading` state (boolean, starts `true` for initial fetches)
- An `error` state (`string | null`, starts `null`)
- The error displayed visibly in the UI — never silently swallowed

### `console.error` in catch blocks

Only use `console.error` for genuinely unexpected errors (e.g. 500s, network
failures). Do not log user-facing validation errors (400s) to the console.
Never log tokens, passwords, or user PII.

### HTTP status-specific messages

When the API can return known status codes that need different UX messages,
handle them explicitly:

```ts
import { isAxiosError } from '../api/errors';

} catch (err: unknown) {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401 || status === 403) {
      setError('You do not have permission to perform this action.');
      return;
    }
  }
  setError(getApiErrorMessage(err, 'Something went wrong. Please try again.'));
}
```

---

## 5. Global CSS Classes — Use These, Do Not Recreate Them

These classes are defined in `src/index.css` and are available everywhere.
Use them with `className=`. Never recreate them with inline styles or Tailwind.

| Class | What it does |
|---|---|
| `glass-card` | Frosted glass card — dark background, blur, subtle border, 20px radius |
| `btn-primary` | Orange filled button with hover |
| `btn-ghost` | Transparent button with white border and hover |
| `input-field` | Dark glass input — full width, white text, orange focus ring |
| `text-orange` | `color: #FF6B35` |
| `text-muted` | `color: #A0A0A0` |
| `text-success` | `color: #00C9A7` |
| `text-error` | `color: #FF4C6A` |
| `container` | `max-width: 1200px`, centered, `padding: 0 24px` |

**Do not add new global classes to `index.css`** unless they will be reused
across 3+ components.

---

## 6. Auth Context — How to Use It Correctly

The context is split into two files intentionally:

- `src/context/auth-context.ts` — exports `AuthContext`, `User` interface,
  `AuthContextType` interface. Import the context and types from here.
- `src/context/AuthContext.tsx` — exports `AuthProvider` only. Only `App.tsx`
  imports this.

**Correct import pattern:**
```ts
// In any component or page:
import { AuthContext } from '../context/auth-context';
// Then:
const auth = useContext(AuthContext);
```

**Never import `AuthProvider` in a component.** It belongs only in `App.tsx`.

**Never import both from the same file** — the split is intentional to avoid
circular dependencies as the codebase grows.

**`auth` can be `undefined`** — always guard:
```ts
const auth = useContext(AuthContext);
const user = auth?.user; // not auth!.user unless you're certain context exists
```

The exception is pages where auth is guaranteed (e.g. `LoginPage.tsx` uses
`useContext(AuthContext)!` because the page can't render without the provider).
Use `!` only when you can justify it.

---

## 7. Routing Rules

Routes are defined exclusively in `src/App.tsx`. Do not define routes anywhere else.

### Current route map

| Path | Component | Guard |
|---|---|---|
| `/` | `LandingPage` | None |
| `/login` | `LoginPage` | None |
| `/register` | `RegisterPage` | None |
| `/internal/register/employee` | `EmployeeRegisterPage` | None (internal link — backend enforces auth) |
| `/dinely/admin/dashboard` | `AdminDashboard` | `ADMIN` only |
| `/dinely/staff/dashboard` | `StaffDashboard` | `STAFF` only |
| `/dinely/employee/dashboard` | `EmployeeDashboard` | `EMPLOYEE` only |
| `/dinely/customer/dashboard` | `CustomerDashboard` | `CUSTOMER` only |
| `*` | `FallbackRedirect` | Redirects to `/` |

### Adding a new route

1. Add the `<Route>` in `App.tsx`.
2. If it requires auth, wrap it in `<ProtectedRoute allowedRoles={[...]} />`.
3. If it is role-specific, follow the existing path convention:
   `/dinely/{role}/{feature}`.
4. If the new route needs a redirect after login, update the role→path map in
   `LoginPage.tsx` (the `if (user.role === ...)` chain).

### `ProtectedRoute` behaviour

- Unauthenticated → redirects to `/login`
- Authenticated but wrong role → redirects to the user's own dashboard
- Role fallback map covers: `ADMIN`, `STAFF`, `EMPLOYEE`, `CUSTOMER`, and
  any unknown role (falls back to `/`)

---

## 8. TypeScript Rules

The `tsconfig.app.json` is strict. Respect it — do not work around it.

```json
"noUnusedLocals": true,
"noUnusedParameters": true,
"noFallthroughCasesInSwitch": true
```

- **No `any`** — use `unknown` in catch blocks, use proper types everywhere else.
- **No type assertions (`as SomeType`)** without a comment explaining why it is safe.
- **No `// @ts-ignore` or `// @ts-expect-error`** without a comment explaining
  what the TS limitation is and why it cannot be avoided.
- Props interfaces must be defined for every component that accepts props.
  Inline prop types on the function signature are acceptable for simple cases.
- `React.FC<Props>` is used in this codebase — continue using it for consistency.

---

## 9. Component Patterns

### Data fetching belongs in hooks, not components

If a component needs to fetch data, the fetch logic goes in a custom hook
in `src/hooks/`. The component only calls the hook and renders the result.

```ts
// CORRECT
const { users, loading, error, refetch } = useAdminUsers({ role, status });

// WRONG — do not do this in a component
useEffect(() => {
  api.get('/api/admin/users').then(...);
}, []);
```

### Modals

Modal components (like `EditRoleModal`, `SalaryHistoryModal`) follow this pattern:
- Rendered conditionally by their parent based on state
- Receive `onClose` and `onSuccess` callbacks as props
- Manage their own loading/error/saving state internally
- Use `position: fixed, inset: 0` overlay with `zIndex: 1000`

When adding a new modal, follow this exact pattern.

### Loading spinners

The project uses a consistent orange spinner. Use this exact markup:

```tsx
<div className="flex justify-center py-12">
  <div className="w-10 h-10 rounded-full border-[3px] border-[rgba(255,107,53,0.2)] border-t-[#FF6B35] animate-spin" />
</div>
```

(If Tailwind is not yet installed, use the inline style equivalent from
`ProtectedRoute.tsx`.)

**Do not define `@keyframes spin` inline in JSX** — `animate-spin` handles it.
The existing inline `<style>` tags with `@keyframes spin` are legacy —
do not copy that pattern in new code.

### ROLE_COLORS and STATUS_COLORS duplication

`ROLE_COLORS` is currently duplicated across `UsersTable.tsx` and all four
dashboards. `STATUS_COLORS` is in `UsersTable.tsx`. Do not add more copies.
If a task requires these in a new file, extract them to
`src/constants/roleColors.ts` and import from there instead.

---

## 10. Known Issues — Do Not Introduce More

These issues exist in the current codebase. Do not replicate them in new code.

| Issue | Where | What to do in new code |
|---|---|---|
| `console.log` debug statements | `AuthContext.tsx`, `LoginPage.tsx` | Never add `console.log` to new code |
| `onMouseOver`/`onMouseOut` for hover | `Navbar.tsx`, dashboards, logout buttons | Use Tailwind `hover:` variants |
| Inline `<style>` with `@keyframes spin` | `ProtectedRoute.tsx`, `UsersPanel.tsx`, `SalaryHistoryModal.tsx` | Use `animate-spin` (Tailwind) |
| `ROLE_COLORS` duplicated in 5 files | All dashboards + `UsersTable.tsx` | Extract to `src/constants/` if you need it again |
| `normalizeUsersResponse` defensive branching | `useAdminUsers.ts` | Once the backend response shape is stable, simplify this |
| `App.css` contains unused Vite scaffold styles | `App.css` | Do not touch this file |

---

## 11. What You Must Never Do

- **Never modify `src/main.tsx`** — entry point is final.
- **Never add state or logic to `App.tsx`** — it is a router only.
- **Never import `AuthProvider` outside of `App.tsx`.**
- **Never use `catch (err: any)`** — always `catch (err: unknown)`.
- **Never silently swallow errors** — always surface them to the user.
- **Never hardcode the API base URL** — it comes from `import.meta.env.VITE_API_URL`.
- **Never make API calls outside of hooks or page-level handlers** — not in
  utility functions, not in context (except `AuthContext`'s session restore).
- **Never create `.module.css` files.**
- **Never add to `App.css`.**
- **Never duplicate `ROLE_COLORS` or `STATUS_COLORS`** — extract if needed.
- **Never add a new global class to `index.css`** unless it is reused in 3+ places.
- **Never use `window.confirm()`** for destructive actions in new code —
  it exists in `UsersTable.tsx` but is poor UX. New destructive actions
  should use a proper confirmation modal.

---

## 12. Before Submitting Any Change — Checklist

- [ ] Does the code compile? (`tsc -b` passes with zero errors)
- [ ] Are there any unused imports or variables? (`noUnusedLocals` will catch them)
- [ ] Is every `catch` block typed `unknown` and using `getApiErrorMessage`?
- [ ] Does every new component have a defined props interface?
- [ ] Is every new API call going through `src/api/axios.ts`?
- [ ] Is every new style using Tailwind (not inline style objects)?
- [ ] Are dynamic (runtime) color/size values still inline? (They must be)
- [ ] Does the auth context import come from `auth-context.ts` (not `AuthContext.tsx`)?
- [ ] Have you introduced any `console.log` statements? (Remove them)
- [ ] Have you duplicated any constant that already exists elsewhere?