<!-- BEGIN:nextjs-agent-rules -->

# DevEdu AI Agent Rules

## Project Overview

DevEdu is an online learning platform for developers.

Main features:

- Course catalog and course detail pages
- User authentication and profile management
- Course enrollment and checkout flow
- Payment integration
- Learning dashboard
- Forum and community discussions
- Blog and content management
- Admin management system

## Tech Stack

### Frontend

- Next.js (latest version)
- TypeScript
- Material UI (MUI)
- Lucide React icons
- React Query
- React Hook Form
- Zod

### Backend

- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT Authentication

## Important Instructions

### Before Writing Code

This project uses a newer Next.js version.

Do NOT assume APIs, routing conventions, server components, caching behavior, or file structure from previous Next.js versions.

Always check:

- node_modules/next/dist/docs/
- Existing project patterns
- Current package versions

before generating code.

### UI Guidelines

Always use:

- Material UI components
- Lucide React icons

Avoid:

- Tailwind UI components
- Chakra UI
- Ant Design
- Bootstrap

unless explicitly requested.

### Design Principles

Build interfaces that are:

- Clean and modern
- Mobile responsive
- Accessibility friendly
- Production ready

Reference products:

- Udemy
- Coursera
- Khoa Phạm
- Shopee checkout flow
- Modern SaaS dashboards

### Loading States

Every async page or component must provide:

- Loading skeleton
- Error state
- Empty state
- Retry action when appropriate

### Data Fetching

Prefer:

- React Query for client-side data fetching
- Server Components when suitable
- Proper cache invalidation

Avoid:

- Unnecessary duplicate API requests
- Refetching data already available in memory

### Form Handling

Use:

- React Hook Form
- Zod validation

Show:

- Validation messages
- Loading states
- Success feedback

### Code Quality

Always:

- Use TypeScript strict typing
- Avoid `any`
- Create reusable components
- Extract constants
- Extract hooks when logic becomes complex

### Admin Module

Admin pages should provide:

- Data table
- Filters
- Search
- Bulk actions
- Pagination
- Confirmation dialogs
- Permission awareness

### Commit Guidelines

When generating commit messages use:

feat:
fix:
refactor:
perf:
docs:
test:
chore:

following Conventional Commits.

<!-- END:nextjs-agent-rules -->
