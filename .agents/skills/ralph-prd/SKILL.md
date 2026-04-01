---
name: ralph-prd
description: "Generate a Product Requirements Document (PRD) for a new feature with grouped user stories for parallel execution. Use when planning a feature, starting a new project, or when asked to create a PRD. Triggers on: create a prd, write prd for, plan this feature, requirements for, spec out."
user-invocable: true
---

# PRD Generator

Create detailed Product Requirements Documents that are clear, actionable, and suitable for implementation.

---

## The Job

1. Receive a feature description/plan from the user
2. Ask 4-8 essential clarifying questions using `vscode_askQuestions`
3. Generate a structured PRD based on answers
4. Determine the target directory:
   - If `tasks/current` does **not** exist → save to `tasks/current/`
   - If `tasks/current` already exists → save to `tasks/{feature-name}/`

**Important:** Do NOT start implementing. Just create the PRD.

---

## Step 1: Clarifying Questions

Ask only critical questions where the initial prompt is ambiguous. Use `vscode_askQuestions` with structured options. Focus on:

- **Problem/Goal:** What problem does this solve?
- **Core Functionality:** What are the key actions?
- **Scope/Boundaries:** What should it NOT do?
- **Success Criteria:** How do we know it's done?

### Use `vscode_askQuestions`

- Each question needs a unique `header` (short kebab-case identifier)
- Provide `label` + `description` for each option so the user understands the trade-offs
- Keep to **3-5 questions per round** — split into multiple rounds if needed
- Adapt the questions to the feature context, don't copy generic examples
- `allowFreeformInput` defaults to `true`, so users can always type a custom answer

---

## Step 2: Explore & Identify Gaps

Before writing the PRD, explore the codebase to surface hidden complexity. Use `semantic_search`, `grep_search`, and `read_file` to understand:

- **Existing patterns:** How are similar features currently implemented?
- **Dependencies:** What modules, services, or types will be affected?
- **Integration points:** Where does this feature connect to the rest of the system?
- **Potential conflicts:** Are there existing conventions or constraints that could clash?
- **Missing pieces:** Are there types, schemas, or repositories that don't exist yet?

Document all findings. This step ensures the PRD is grounded in reality, not assumptions.

---

## Step 3: Decision Rounds

Based on the clarifying answers (Step 1) and the gaps found during exploration (Step 2), present decisions and open questions to the user using `vscode_askQuestions`. Ask **one focused round at a time** (3-4 questions max). Categories to cover:

### Architectural Decisions

- "Should this be a new module or extend an existing one?"
- "Which existing service/repository should this integrate with?"

### Data & Schema Decisions

- "What fields should the new entity have?"
- "Should we add a new database table or extend an existing one?"

### Behavioral Gaps

- "What should happen when [edge case identified during exploration]?"
- "Should this be synchronous or asynchronous?"

### Integration Gaps

- "This depends on [external service]. Is that already configured?"
- "Do we need new environment variables for this?"

### Priority & Ordering

- "Which part should be built first if we can't do everything?"
- "Are there any hard blockers we need to resolve before starting?"

**Important:**

- Adapt questions to what was actually found. Don't ask generic questions.
- Present the **gap you found** + **options to resolve it** so the user can decide.
- If everything is clear after Steps 1-2, skip this step.
- Carry all decisions forward into the PRD sections.

---

## Step 4: PRD Structure

Generate the PRD with these sections:

### 1. Introduction/Overview

Brief description of the feature and the problem it solves.

### 2. Goals

Specific, measurable objectives (bullet list).

### 3. User Stories

Each story needs:

- **Title:** Short descriptive name
- **Description:** "As a [user], I want [feature] so that [benefit]"
- **Acceptance Criteria:** Verifiable checklist of what "done" means

Each story should be small enough to implement in one focused session.

**Format:**

```markdown
### US-001: [Title]

**Description:** As a [user], I want [feature] so that [benefit].

**Group:** [A|B|C|...] (Stories in the same group can be executed in parallel)

**Acceptance Criteria:**

- [ ] Specific verifiable criterion
- [ ] Another criterion
- [ ] Typecheck/lint passes
- [ ] **[UI stories only]** Verify in browser using dev-browser skill
```

### Grouping Strategy

Stories should be organized into groups (A, B, C...) based on dependencies. **This is critical — grouping directly determines execution speed.**

- **Same group**: Stories with NO dependencies between them → can run in **parallel** (multiple workers at the same time)
- **Different groups**: Stories with dependencies → must run **sequentially** (A → B → C)

**The goal is to maximize the number of stories in the same group.** Every story that can run in parallel is time saved. When in doubt, ask yourself: "Does this story need the output of another story?" If not, same group.

### Atomicity

Keep stories **small and atomic** — each one should deliver one incremental piece of value that can be built, tested, and verified independently. Smaller stories = faster execution per worker = quicker overall delivery.

**What makes a story atomic:**

- ✅ Touches a single layer or concern (e.g., "add repository methods" or "add route handler" — not both)
- ✅ Can be fully implemented in one focused session
- ✅ Has its own verifiable acceptance criteria
- ✅ Doesn't leave the codebase in a broken state when completed individually

**When splitting a story, ask:**

- Can this be split into two independent stories without losing coherence?
- Does part of it depend on the other part, or can they truly run in parallel?
- Will the codebase still compile/pass lint after each individual story completes?

**Anti-patterns to avoid:**

- ❌ Putting independent stories in different groups (forces sequential execution for no reason)
- ❌ One story per group when they don't depend on each other
- ❌ Not thinking about grouping at all
- ❌ Stories that touch too many layers at once (slows down the worker)
- ❌ Stories that leave imports broken or types incomplete for other stories that depend on them

**Example of good grouping with atomic stories:**

- **Group A**: Database schema (US-001) — foundation, must run first alone
- **Group B**: Repository methods (US-002) + Types/interfaces (US-003) — independent layers, **run in parallel**
- **Group C**: Service logic (US-004) + Validation schemas (US-005) — independent concerns, **run in parallel**
- **Group D**: Route handlers (US-006, US-007, US-008) — each route is independent, **run in parallel**

**Result:** Instead of 8 sequential stories, we have 4 steps with multiple atomic workers executing simultaneously.

**Important:**

- Acceptance criteria must be verifiable, not vague. "Works correctly" is bad. "Button shows confirmation dialog before deleting" is good.
- **For any story with UI changes:** Always include "Verify in browser using dev-browser skill" as acceptance criteria. This ensures visual verification of frontend work.

### 4. Functional Requirements

Numbered list of specific functionalities:

- "FR-1: The system must allow users to..."
- "FR-2: When a user clicks X, the system must..."

Be explicit and unambiguous.

### 5. Non-Goals (Out of Scope)

What this feature will NOT include. Critical for managing scope.

### 6. Design Considerations (Optional)

- UI/UX requirements
- Link to mockups if available
- Relevant existing components to reuse

### 7. Technical Considerations (Optional)

- Known constraints or dependencies
- Integration points with existing systems
- Performance requirements

### 8. Success Metrics

How will success be measured?

- "Reduce time to complete X by 50%"
- "Increase conversion rate by 10%"

### 9. Open Questions

Remaining questions or areas needing clarification.

---

## Writing for Junior Developers

The PRD reader may be a junior developer or AI agent. Therefore:

- Be explicit and unambiguous
- Avoid jargon or explain it
- Provide enough detail to understand purpose and core logic
- Number requirements for easy reference
- Use concrete examples where helpful

---

## Output

- **Format:** Markdown (`.md`)
- **Location:** `tasks/current/` (if not exists) or `tasks/{feature-name}/` (if current exists)
- **Filename:** `prd-[feature-name].md` (kebab-case)

---

## Example PRD

```markdown
# PRD: Task Priority System

## Introduction

Add priority levels to tasks so users can focus on what matters most. Tasks can be marked as high, medium, or low priority, with visual indicators and filtering to help users manage their workload effectively.

## Goals

- Allow assigning priority (high/medium/low) to any task
- Provide clear visual differentiation between priority levels
- Enable filtering and sorting by priority
- Default new tasks to medium priority

## User Stories

### US-001: Add priority field to database

**Description:** As a developer, I need to store task priority so it persists across sessions.

**Group:** A

**Acceptance Criteria:**

- [ ] Add priority column to tasks table: 'high' | 'medium' | 'low' (default 'medium')
- [ ] Generate and run migration successfully
- [ ] Typecheck passes

### US-002: Display priority indicator on task cards

**Description:** As a user, I want to see task priority at a glance so I know what needs attention first.

**Group:** B

**Acceptance Criteria:**

- [ ] Each task card shows colored priority badge (red=high, yellow=medium, gray=low)
- [ ] Priority visible without hovering or clicking
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Add priority selector to task edit

**Description:** As a user, I want to change a task's priority when editing it.

**Group:** B

**Acceptance Criteria:**

- [ ] Priority dropdown in task edit modal
- [ ] Shows current priority as selected
- [ ] Saves immediately on selection change
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Filter tasks by priority

**Description:** As a user, I want to filter the task list to see only high-priority items when I'm focused.

**Group:** B

**Acceptance Criteria:**

- [ ] Filter dropdown with options: All | High | Medium | Low
- [ ] Filter persists in URL params
- [ ] Empty state message when no tasks match filter
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Add `priority` field to tasks table ('high' | 'medium' | 'low', default 'medium')
- FR-2: Display colored priority badge on each task card
- FR-3: Include priority selector in task edit modal
- FR-4: Add priority filter dropdown to task list header
- FR-5: Sort by priority within each status column (high to medium to low)

## Non-Goals

- No priority-based notifications or reminders
- No automatic priority assignment based on due date
- No priority inheritance for subtasks

## Technical Considerations

- Reuse existing badge component with color variants
- Filter state managed via URL search params
- Priority stored in database, not computed

## Success Metrics

- Users can change priority in under 2 clicks
- High-priority tasks immediately visible at top of lists
- No regression in task list performance

## Open Questions

- Should priority affect task ordering within a column?
- Should we add keyboard shortcuts for priority changes?
```

---

## Checklist

Before saving the PRD:

- [ ] Asked clarifying questions via vscode_askQuestions (Step 1)
- [ ] Explored codebase and documented gaps (Step 2)
- [ ] Presented decisions and gaps via vscode_askQuestions (Step 3)
- [ ] Incorporated all answers and decisions into the PRD
- [ ] User stories are small and specific
- [ ] Functional requirements are numbered and unambiguous
- [ ] Non-goals section defines clear boundaries
- [ ] Open Questions section reflects only genuinely unresolved items
- [ ] Saved to `tasks/current/prd-[feature-name].md` or `tasks/{feature-name}/prd-[feature-name].md`
