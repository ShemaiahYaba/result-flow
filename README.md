# ResultFlow

A university result management system that streamlines the processing, approval, and distribution of academic results.

## Overview

ResultFlow connects three stakeholders in the academic result workflow:

- **Admins** define marksheet formats, grading policies, manage departments, and approve results before they become visible to students.
- **HODs** (Heads of Department) upload student marksheets, manage their student registry, and track upload history.
- **Students** view their approved results, download result sheets as PDFs, and track CGPA progression across semesters.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database & Auth | Supabase (PostgreSQL) |
| Styling | Tailwind CSS + shadcn/ui |
| AI Integration | Genkit (Google AI) |
| Deployment | Firebase App Hosting |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- (Optional) A Firebase project for deployment

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd result-flow

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Database Setup

Run the SQL schema against your Supabase project. The full schema is in `docs/database-schema.md`.

A convenience view for approved results is available in `create-admin-approved-results-view.sql`.

### Development

```bash
npm run dev          # Start dev server on port 9002
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Login page (Student / HOD / Admin tabs)
│   ├── register/          # Student self-registration
│   ├── admin/             # Admin dashboard
│   │   ├── approve-results/
│   │   ├── departments/
│   │   ├── grading-policy/
│   │   ├── manage-hods/
│   │   └── marksheet-format/
│   ├── hod/               # HOD dashboard
│   │   ├── broadsheet/
│   │   ├── uploads/
│   │   └── upload-history/
│   └── student/           # Student dashboard
│       ├── course-registration/
│       └── past-results/
├── api/                   # API route handlers
├── components/            # Shared UI components
├── lib/                   # Utilities (API factory, Supabase client)
├── providers/             # React context providers (Auth, Query)
├── schemas/               # Zod validation schemas
└── services/              # Data-fetching service layer
```

## User Roles & Access

### Student
- Log in with matriculation number and password
- Self-register at `/register`
- View current and past semester results
- Download individual result sheets as PDFs
- Track CGPA progression

### HOD (Head of Department)
- Log in with staff ID and password
- Upload student marksheets (CSV/Excel)
- Manage department student registry
- View upload history and processing status
- View department broadsheet

### Admin
- Log in with staff ID and password
- Define and manage marksheet formats
- Configure grading policies (grade boundaries and GPA values)
- Manage departments and assign HODs
- Approve or reject result uploads before students can view them

## Authentication

Authentication is handled by Supabase Auth. The login flow:

1. The client posts the user's ID (matric number or staff ID) to `/api/lookup-email` to resolve the associated email.
2. The resolved email and password are passed to Supabase `signIn`.
3. Middleware (`middleware.ts`) enforces role-based access on `/admin`, `/hod`, and `/student` route groups.

## API Routes

All API routes use a `makeRoute` factory (`src/lib/api/routeFactory`) that handles authentication, input validation (Zod), and standardised response formatting:

```typescript
// Standard response shape
{ ok: true, data: T }
```

Route handlers declare a `requiredRole` (`'student' | 'hod' | 'admin' | 'any'`) and the factory rejects requests that don't match.

## Documentation

Additional technical documentation lives in the `docs/` directory:

| File | Description |
|---|---|
| `blueprint.md` | Original feature spec and design guidelines |
| `database-schema.md` | Full PostgreSQL schema with indexes and triggers |
| `API_ARCHITECTURE_GUIDE.md` | API patterns, auth flow, and frontend integration |
| `auth-implementation.md` | Supabase auth implementation details |
| `uploads-data-flow.md` | Marksheet upload and processing pipeline |
| `integration-guide.md` | Guide for integrating new modules |

## Deployment

The project is configured for Firebase App Hosting (`apphosting.yaml`). To deploy:

```bash
npm run build
firebase deploy
```

Ensure all environment variables are configured in your Firebase App Hosting backend settings.
