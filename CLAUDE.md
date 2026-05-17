# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev       # start Vite dev server (http://localhost:5173)
npm run build     # production build → dist/
npm run preview   # serve the dist/ build locally
npm run lint      # ESLint (flat config, react-hooks + react-refresh plugins)
npx tsc --noEmit  # type-check without emitting (run before committing)
```

No test runner is configured yet.

---

## Project

**Coachly** — Ukrainian SPA connecting sports clients with trainers. Stack: **React 19 + Vite 8 + TypeScript (strict mode)**, plain CSS with CSS custom properties, no routing library yet (React Router to be added), no state management library yet (Zustand / Context to be added).

Backend: ASP.NET Core REST API. All endpoints are prefixed `/api`. Base URL configured via `VITE_API_URL` env variable.

---

## Source Layout

```
src/
  types/        # index.ts — all enums and interfaces shared across the app
  services/     # raw API call functions — one file per domain (authService.ts, etc.)
  hooks/        # React hooks that call services and manage loading/error state
  pages/        # one file per route/screen (.tsx)
  components/
    ui/          # stateless primitives (Icon, Input, Divider)
    auth/        # feature-scoped components
  index.css      # global CSS variables + resets
  App.tsx        # top-level; currently renders AuthPage directly
                 # TODO: replace with React Router <Routes> once routing is set up
```

**Pattern:** `services/` functions are plain async functions (no hooks). `hooks/` wrap them with `useState` for `isLoading` / `error`. Pages and forms call hooks, never services directly.

**TypeScript config:** `tsconfig.app.json` covers `src/` with `strict: true`, `noUnusedLocals`, `noUnusedParameters`. `tsconfig.node.json` covers `vite.config.ts`. All enums and shared interfaces live in `src/types/index.ts` — import from there, never redefine locally.

---

## Auth Architecture

- Access token: short-lived JWT — attach as `Authorization: Bearer <token>` on all authenticated requests.
- Refresh token: longer-lived — used to silently re-issue the access token.
- **Tokens must NOT be stored in `localStorage`.** Use `httpOnly` cookies or a secure in-memory store.
- On any `401` response: attempt silent refresh via `POST /api/auth/refresh` → retry the original request → if refresh fails, redirect to login.

### Auth endpoints
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/api/auth/register` | body: `{ firstName, lastName, email, password, role }` |
| POST | `/api/auth/login` | returns `{ accessToken, refreshToken, user }` |
| POST | `/api/auth/refresh` | body: `{ refreshToken }` |
| POST | `/api/auth/logout` | invalidates refresh token server-side |
| POST | `/api/auth/forgot-password` | body: `{ email }` |
| POST | `/api/auth/reset-password` | body: `{ token, newPassword }` |

---

## User Roles (integer values in JWT payload and API responses)

```
0 = Client   — books sessions, pays, leaves reviews
1 = Trainer  — manages slots, uploads documents
2 = Admin    — verifies trainer documents, manages support tickets
```

Role-based routing: Clients go to `/dashboard`, Trainers to `/trainer`, Admins to `/admin`.

---

## Key Backend Enumerations (SMALLINT)

```
SlotStatus:      0=available  1=booked  2=sold_out  3=cancelled
BookingStatus:   0=pending    1=confirmed  2=cancelled  3=completed
PaymentStatus:   0=pending    1=paid       2=refunded   3=failed
PaymentMethod:   0=online(Stripe)  1=cash
VerificationStatus: 0=not_verified  1=pending  2=verified  3=rejected
DocumentType:    0=certificate  1=diploma  2=license  3=other
TagCategory:     0=specialization  1=disability  2=methodology
Gender:          0=male  1=female  2=other
```

---

## Business Rules the Frontend Must Enforce

- **Cancellation refund display:** client >24 h before session → 100% refund; client ≤24 h → 50% refund; trainer cancels → always 100%.
- **Reviews** can only be submitted for bookings with `status = 3` (completed).
- **Slot booking button** shown only when `slotStatus = 0`; statuses 1/2 shown as unavailable; status 3 hidden.
- **Trainer verified badge** shown only when `verificationStatus = 2`.
- **Online sessions** always require Stripe payment; offline sessions can be cash or Stripe.

---

## Stripe Payments (Frontend Role)

1. Client submits booking → `POST /api/bookings` returns `{ bookingId, stripeCheckoutUrl, status: 0 }`.
2. Frontend **redirects** the user to `stripeCheckoutUrl` (Stripe-hosted page — frontend never handles card data).
3. After payment, Stripe redirects to `?success=true` or `?canceled=true` — frontend reads the query param and shows the appropriate state.
4. Booking status is updated by the backend Stripe webhook; frontend polls or re-fetches.

---

## File Uploads

- Avatar: `POST /api/users/me/avatar` — `multipart/form-data`, field `file`.
- Trainer documents: `POST /api/trainer-documents` — `multipart/form-data`, fields `file` + `documentType` (SMALLINT).
- Returned `avatarUrl` / `fileUrl` are direct Azure Blob Storage URLs, usable in `<img src>` directly.

---

## Pagination

All list endpoints use:
```
?page=1&pageSize=10   (1-based page numbering)
```
Response shape:
```json
{ "items": [], "totalCount": 0, "totalPages": 0, "page": 1, "pageSize": 10 }
```

---

## API Error Shape

```json
{ "message": "Human-readable error", "errors": { "fieldName": ["validation error"] } }
```

HTTP status codes: `400` validation · `401` unauthenticated · `403` wrong role · `404` not found · `409` conflict (slot already booked, booking overlap) · `500` server error.

---

## Styling

CSS custom properties defined in `src/index.css`. Auth-specific design tokens use the `--auth-*` prefix (e.g. `--auth-accent-600`). Inline style objects are used for dynamic/component-level styles; global CSS only for resets and tokens. Google Fonts (Manrope + Plus Jakarta Sans) are imported via `@import` in `index.css`.

---

## API Data Shapes

All DB columns are snake_case; AutoMapper converts them to camelCase in responses.

### User (base — all roles)
```
id, email, role, firstName, lastName, avatarUrl, city, phone, birthDate, gender, isActive, createdAt, updatedAt
```
`avatarUrl` is a direct Azure Blob URL — use as `<img src>` directly. `phone` max 20 chars. `birthDate` is a date string (`YYYY-MM-DD`).

### Client extension (nested when `role = 0`)
```
heightCm, weightKg, fitnessGoals
```

### Trainer extension (nested when `role = 1`)
```
bio, experienceYears, verificationStatus, rating, reviewsCount
```
`rating` and `reviewsCount` are read-only — maintained by a PostgreSQL trigger on `reviews`, never set by the frontend.

### Schedule Slot
```
id, trainerId, startTime, endTime, format, price, maxClients, description, gymName, gymAddress, status, createdAt
```
`gymName` / `gymAddress` are only present when `format = 1` (offline). `maxClients = 1` → individual session; `> 1` → group.

### Booking
```
id, slotId, clientId, status, cancellationReason, cancelledBy, reminderMinutes, createdAt, updatedAt
+ nested: slot (full slot object), trainer (user summary), payment (see below)
```

### Payment (nested inside booking)
```
id, bookingId, amount, currency, paymentMethod, status, transactionId, paidAt, refundedAt, createdAt
```
`currency` defaults to `"UAH"`. `transactionId` is null for cash payments.

### Review
```
id, bookingId, clientId, trainerId, rating, comment, createdAt
+ nested: client { firstName, lastName, avatarUrl }
```
`rating` is an integer **1–5** (enforced by DB CHECK constraint — validate on the form before submit).

### Tag
```
id, name, category, description
```
When building tag pickers, filter by `category`: 0 = specialisation, 1 = disability, 2 = methodology.

### Trainer Document
```
id, trainerId, fileUrl, fileName, fileSizeBytes, documentType, status, rejectionReason, reviewedBy, reviewedAt, uploadedAt
```
`DELETE /api/trainer-documents/{id}` is only allowed when `status = 0` (pending) — disable the delete action in the UI for approved/rejected docs.

### Session Note
```
id, bookingId, authorId, content, isPrivate, createdAt, updatedAt
```
Notes where `isPrivate = true` are only returned to the author by the API — the frontend doesn't need to filter them manually.

### Achievement
```
id, type, title, description, iconUrl
```
When earned: also includes `earnedAt` (from `user_achievements`).

---

## Field Constraints Relevant to Forms

| Field | Constraint |
|---|---|
| `email` | max 255 chars, unique |
| `firstName`, `lastName` | max 100 chars |
| `phone` | max 20 chars |
| `city` | max 100 chars |
| `review.rating` | integer, 1–5 inclusive |
| `slot.price` | positive decimal |
| `slot.maxClients` | ≥ 1 |
| Uploaded files | PDF / JPG / PNG only; max 10 MB; validated server-side — display `400` errors from API |
