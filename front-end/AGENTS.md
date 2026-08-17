# Mandatory Rules When Starting a New Session

This is a Next.js + Material UI project. Before executing **any** user request regarding code, architecture, APIs, or conventions, you must read the following documentation files in the `docs` directory (if present):

1. `docs/architecture.md` — directory layout, codebase organization, routing, server/client component separation
2. `docs/techstack.md` — tech stack, dependencies, library initialization
3. `docs/api-integration.md` — catalog of frontend API services, authentication, request/response/error handling
4. `docs/rule.md` — coding standards, conventions, architecture patterns

## Mandatory Principles

- **Do not guess.** All responses, proposals, or code generated must be based on factual information read from the 4 docs files above and the actual codebase. If information is absent from documentation or source code, explicitly state "not found in documentation/codebase" rather than inventing solutions.
- **Prioritize reading docs before answering.** If the 4 files above have not been read in the current session, read them before making any technical decision (naming, directory structure, API calls, MUI usage, state management...).
- **Adhere to conventions documented in `docs/rule.md`.** Do not introduce unapproved patterns, libraries, or code organizations unless the user explicitly requests to change conventions.
- **When documentation (`docs/*.md`) conflicts with the actual codebase**, treat the codebase as ground truth, and inform the user that documentation may be outdated.
- **When creating new features**, cross-reference with `docs/architecture.md` and `docs/rule.md` to ensure consistency in directory structure, naming conventions, API calling patterns, and state management.
- **If the 4 documentation files do not exist** (project documentation has not been generated), notify the user and suggest running the documentation generation workflow before proceeding with complex feature development.

## When to Re-read Documentation in the Same Session

- From the very first message of a new session.
- After the user reports major changes to project structure, dependencies, or APIs.
- Before answering any question regarding "how does this project implement X", "are we using library Y", "how is this API called"...
