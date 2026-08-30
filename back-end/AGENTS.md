## 1. Purpose

This file defines the development instructions and workflow for AI coding agents working on this Spring Boot project.

Before modifying code, understand the existing architecture, coding conventions, API contracts, technology stack, and testing requirements documented in the project documentation.

Do not make assumptions about the project when the required information can be found in the documentation files.

---

## 2. Project Documentation

The following documents are the source of truth for the corresponding areas of the project:

| Document               | Purpose                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `docs/api.md`          | Existing API endpoints, request/response DTOs, permissions, and validation rules    |
| `docs/architecture.md` | Current project structure, modules, responsibilities, and architectural conventions |
| `docs/rule.md`         | Project-specific coding and implementation rules                                    |
| `docs/techstack.md`    | Dependencies used by the application and their intended purposes                    |
| `docs/testing.md`      | Testing guidelines, test documentation standards, and test execution commands       |

### Documentation reading rules

Before starting a task:

1. Read `docs/architecture.md` when the task involves application structure, modules, services, controllers, repositories, or cross-module changes.
2. Read `docs/api.md` when the task involves existing or new APIs, endpoints, DTOs, permissions, authentication, authorization, or validation.
3. Read `docs/rule.md` before implementing or modifying application code.
4. Read `docs/techstack.md` before introducing, replacing, upgrading, or significantly changing a dependency.
5. Read `docs/testing.md` whenever the task involves tests, bug fixes, business logic changes, or behavior changes.

When multiple areas are affected, read all relevant documents before making changes.

---

## 3. Source of Truth

Treat the existing codebase and project documentation as the primary source of truth.

Do not:

* Invent APIs, DTO fields, permissions, validation rules, modules, or dependencies.
* Introduce a new architectural pattern without first checking the existing architecture.
* Replace an existing library with another library without a clear requirement.
* Duplicate functionality that already exists in the project.
* Refactor unrelated code while implementing a focused task.
* Change public behavior without updating the relevant documentation and tests.

When documentation conflicts with the implementation, inspect the code and tests to determine the current behavior. If the change intentionally modifies the documented behavior, update the relevant documentation as part of the task.

---

## 4. Development Workflow

For every non-trivial task, follow this workflow:

### Step 1 — Understand

Before editing:

1. Identify the relevant modules and files.
2. Read the relevant documentation.
3. Inspect existing implementations.
4. Inspect related tests.
5. Identify existing patterns that should be followed.

Do not immediately create new files or abstractions before understanding how the existing project solves similar problems.

### Step 2 — Plan

Determine:

* Which files need to change.
* Which existing components can be reused.
* Whether the change affects API contracts.
* Whether permissions or validation rules are affected.
* Whether documentation needs to be updated.
* Which tests need to be added or modified.

Prefer the smallest change that correctly satisfies the requirement.

### Step 3 — Implement

Implement the change consistently with:

* `docs/rule.md`
* `docs/architecture.md`
* Existing project patterns
* Existing dependency choices

Avoid unnecessary refactoring.

### Step 4 — Test

Follow `docs/testing.md`.

At minimum:

* Add or update tests for changed behavior.
* Run the most relevant tests first.
* Run the full test suite when appropriate.
* Do not skip, disable, or remove tests merely to make the test suite pass.

### Step 5 — Validate

Before considering the task complete:

* Verify compilation/build.
* Run relevant tests.
* Run the required static analysis/lint/check commands.
* Review the final diff.
* Check for unintended changes.

### Step 6 — Update Documentation

If the implementation changes any documented behavior, update the appropriate documentation.

Examples:

* New/changed endpoint → `docs/api.md`
* Changed module responsibility → `docs/architecture.md`
* New coding convention → `docs/rule.md`
* New dependency → `docs/techstack.md`
* Changed testing strategy or test commands → `docs/testing.md`

Documentation should describe the actual current implementation, not an intended or outdated design.

---

## 5. API Changes

When modifying or creating an API:

1. Read `docs/api.md`.
2. Follow existing endpoint naming and structure.
3. Reuse existing DTOs when appropriate.
4. Follow existing permission and authorization patterns.
5. Apply validation consistently with existing APIs.
6. Add or update tests.
7. Update `docs/api.md`.

For API changes, explicitly verify:

* HTTP method
* Endpoint/path
* Request DTO
* Response DTO
* Validation
* Authentication
* Authorization/permission
* Error handling
* HTTP status codes

Do not silently change an existing API contract.

---

## 6. Architecture

Follow the architecture documented in `docs/architecture.md`.

Before introducing a new:

* module
* service
* controller
* repository
* component
* abstraction
* integration layer

check whether an existing component already provides the required functionality.

Prefer extending existing architecture over introducing parallel patterns.

Do not move classes, rename modules, or perform broad architectural refactoring unless the task explicitly requires it.

---

## 7. Dependencies

Before adding or changing dependencies:

1. Read `docs/techstack.md`.
2. Check whether an existing dependency already solves the problem.
3. Prefer existing project technologies and established patterns.
4. Avoid adding dependencies for functionality that can reasonably be implemented using the existing stack.
5. Update `docs/techstack.md` when dependency changes are intentional.

Do not introduce a new framework or library merely because it is personally preferred.

---

## 8. Coding Rules

All implementation must follow `docs/rule.md`.

If a rule in `docs/rule.md` conflicts with a task requirement, follow the explicit task requirement and keep the implementation consistent with the rest of the project where possible.

Do not bypass project rules simply to make compilation, tests, or static analysis pass.

In particular:

* Do not use unsafe types or suppress compiler/static-analysis errors without justification.
* Do not disable tests to hide failures.
* Do not add broad suppressions such as `@SuppressWarnings` merely to silence problems.
* Do not introduce unnecessary abstractions.
* Do not modify unrelated files without a clear reason.

---

## 9. Testing Rules

Follow `docs/testing.md` for all testing-related work.

When changing business logic:

* Identify existing tests covering the behavior.
* Add tests for new behavior.
* Update tests when behavior intentionally changes.
* Preserve meaningful assertions.
* Test important success and failure cases.

When fixing a failing test:

1. Determine whether the problem is in the implementation or the test.
2. Identify the root cause.
3. Fix the root cause.
4. Do not simply increase timeouts, weaken assertions, skip tests, or mock away the behavior being tested.

A passing test suite is not sufficient if the tests no longer verify the intended behavior.

---

## 10. Documentation Rules

Documentation must reflect the current implementation.

When changing a documented area:

1. Update the relevant `.md` file.
2. Keep documentation concise and structured.
3. Do not document hypothetical or unused functionality.
4. Remove outdated information when behavior changes.
5. Keep examples consistent with the actual codebase.

The documentation files are maintained as part of the project, not as temporary notes.

---

## 11. Change Scope

Keep changes focused.

For a given task:

* Modify only files necessary to complete the requirement.
* Avoid unrelated refactoring.
* Avoid formatting entire files unless required.
* Avoid changing dependency versions unless required.
* Avoid renaming unrelated classes or methods.
* Preserve existing behavior outside the requested scope.

If a broader issue is discovered, mention it separately rather than silently expanding the task.

---

## 12. Error Handling and Debugging

When encountering an error:

1. Read the complete error message.
2. Identify the failing file and code path.
3. Inspect related implementation and tests.
4. Determine the root cause.
5. Apply the smallest appropriate fix.
6. Re-run the failing check.
7. Run broader validation afterward.

Do not repeatedly retry commands without investigating the underlying failure.

Do not hide errors through configuration changes unless the configuration change is itself the intended solution.

---

## 13. Completion Criteria

A task is complete only when:

* The requested functionality is implemented.
* The implementation follows the project architecture.
* The implementation follows `docs/rule.md`.
* Relevant tests are added or updated.
* Relevant tests pass.
* Required build/static-analysis checks pass.
* Relevant documentation is updated.
* No unrelated changes were introduced.
* The final diff has been reviewed for accidental changes.

Before reporting completion, provide a concise summary of:

1. What was changed.
2. Tests/checks that were run.
3. Documentation that was updated.
4. Any remaining issues or limitations.
