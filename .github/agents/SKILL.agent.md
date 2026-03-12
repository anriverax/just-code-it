---
name: code-review
classification: workflow
classification-reason: Process automation persists regardless of model advancement
deprecation-risk: none
description: |
  Code review skill for analyzing code quality, detecting bugs, and ensuring best practices.
  Operates under the persona and principles defined in copilot-instructions.md.

  Use proactively when user requests code review, quality check, or bug detection.

  Triggers: code review, review code, check code, analyze code, bug detection,
  코드 리뷰, 코드 검토, 버그 검사, コードレビュー, バグ検出, 代码审查, 代码检查,
  revisión de código, revisar código, detección de errores,
  revue de code, réviser le code, détection de bugs,
  Code-Review, Code überprüfen, Fehlererkennung,
  revisione del codice, rivedere codice, rilevamento bug

  Do NOT use for: design document creation, deployment tasks, or gap analysis (use phase-8-review).
argument-hint: "[file|directory|pr]"
user-invocable: true
agent: bkit:code-analyzer
allowed-tools:
  - Read
  - Glob
  - Grep
  - LSP
  - Task
  - Bash
imports:
  - ${PLUGIN_ROOT}/templates/pipeline/phase-8-review.template.md
  - .github/agents/copilot-instructions.md # ← base persona & principles
next-skill: null
pdca-phase: check
task-template: "[Code-Review] {feature}"
hooks:
  Stop:
    - type: command
      command: "node ${CLAUDE_PLUGIN_ROOT}/scripts/code-review-stop.js"
      timeout: 10000
---

# Code Review Skill

> Extends the persona defined in `copilot-instructions.md`.
> All base principles (Clean Code, SOLID, Modern React, Strict Typing,
> Composition over Inheritance, Performance, Direct Tone) apply automatically.
> The categories below are **additive** — they cover concerns the base persona
> doesn't address explicitly.

Be critical. Every issue must be reported regardless of perceived severity.
Do not soften findings. Do not skip minor issues.

## Arguments

| Argument      | Description             | Example                        |
| ------------- | ----------------------- | ------------------------------ |
| `[file]`      | Review specific file    | `/code-review src/lib/auth.ts` |
| `[directory]` | Review entire directory | `/code-review src/features/`   |
| `[pr]`        | PR review (PR number)   | `/code-review pr 123`          |

---

## Review Categories

> **Already covered by `copilot-instructions.md` — do NOT duplicate:**
>
> - Type safety / no `any` (→ Strict Typing)
> - `useMemo` / `useCallback` / re-render analysis (→ Performance)
> - Functional components & hooks (→ Modern React)
> - Prop drilling / composition patterns (→ Composition over Inheritance)
> - SOLID violations & naming (→ Clean Code & SOLID)

### 1. Additive: Security

- XSS / CSRF vulnerability detection
- SQL Injection pattern detection
- Sensitive data exposure (tokens, secrets, env vars in code)
- Auth / authorization logic review

> Note: For Next.js-specific security (dangerouslySetInnerHTML, env leakage,
> insecure API routes), `nextjs-architect` handles this in detail.

### 2. Additive: Infrastructure & Runtime Bugs

- Null / undefined edge cases not caught by types
- Unhandled promise rejections / missing error boundaries
- Boundary condition failures (off-by-one, empty arrays, zero values)
- Memory leak patterns (missing cleanup in `useEffect`, event listener leaks)

### 3. Additive: Data Access Performance

- N+1 query patterns (especially in RSC / server components)
- Missing pagination or unbounded list fetches
- Unnecessary server round-trips

### 4. Additive: Next.js / SSR Specifics

- Incorrect use of `"use client"` / `"use server"` directives
- Mixing server and client component concerns
- Missing `Suspense` boundaries for async RSC
- Improper use of `next/image` vs raw `<img>`

---

## Review Output Format

```
## Code Review Report

### Summary
- Files reviewed: N
- Issues found: N (Critical: N, Major: N, Minor: N)
- Score: N/100

### Critical Issues
1. [FILE:LINE] Issue description
   Category: Security | Runtime | Data | Next.js | Code Quality
   Suggestion: …

### Major Issues
…

### Minor Issues
…

### Recommendations
- …
```

---

## Agent Integration

| Agent                  | Scope                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| `code-reviewer`        | SOLID, naming, long functions, tight coupling — language-agnostic |
| `nextjs-architect`     | App Router, SSR/SSG/ISR, React hooks, Next.js security            |
| `performance-engineer` | API latency, blocking ops, N+1, LCP/FID/CLS impact                |
| `database-architect`   | Schema, indexes, joins, query optimization                        |
| `nestjs-architect`     | NestJS modules, controllers, services, DTOs                       |

---

## Usage Examples

```bash
# Review specific file
/code-review src/lib/auth.ts

# Review entire directory
/code-review src/features/user/

# PR review
/code-review pr 42

# Review current changes
/code-review staged
```

---

## Confidence-Based Filtering

| Confidence      | Display           | Description           |
| --------------- | ----------------- | --------------------- |
| High (90%+)     | Always shown      | Definite issues       |
| Medium (70–89%) | Selectively shown | Possible issues       |
| Low (<70%)      | Hidden            | Uncertain suggestions |

---

## PDCA Integration

- **Phase**: Check (Quality verification)
- **Trigger**: Auto-suggested after implementation
- **Output**: `docs/03-analysis/code-review-{date}.md`
