---
name: ralph-json
description: "Convert PRDs to prd.json format for the Ralph autonomous agent system with parallel group support. Stories in the same group can be executed simultaneously. Use when you have an existing PRD and need to convert it to Ralph's JSON format. Triggers on: convert this prd, turn this into ralph format, create prd.json from this, ralph json."
user-invocable: true
---

# Ralph PRD Converter

Converts existing PRDs to the prd.json format that Ralph uses for autonomous execution.

---

## The Job

Take a PRD (markdown file or text) and convert it to `prd.json`.

### Target directory

- If `tasks/current` does **not** exist → save to `tasks/current/prd.json`
- If `tasks/current` already exists → save to `tasks/{feature-name}/prd.json`

Check with `list_dir` on `tasks/` before saving.

---

## Output Format

```json
{
  "project": "[Project Name]",
  "branchName": "ralph/[feature-name-kebab-case]",
  "description": "[Feature description from PRD title/intro]",
  "userStories": [
    {
      "id": "US-001",
      "title": "[Story title]",
      "description": "As a [user], I want [feature] so that [benefit]",
      "acceptanceCriteria": ["Criterion 1", "Criterion 2", "Typecheck passes"],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

---

## Story Size & Atomicity

**Each story must be completable in ONE Ralph iteration (one context window).**

Ralph spawns a fresh Amp instance per iteration with no memory of previous work. If a story is too big, the LLM runs out of context before finishing and produces broken code.

### Keep stories atomic:

- ✅ Touches a **single layer or concern** (e.g., "add repository methods" or "add route handler" — not both)
- ✅ Can be fully implemented in one focused session
- ✅ Has its own verifiable acceptance criteria
- ✅ Doesn't leave the codebase in a broken state when completed individually

### Right-sized stories:

- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic
- Add a filter dropdown to a list

### Too big (split these):

- "Build the entire dashboard" - Split into: schema, queries, UI components, filters
- "Add authentication" - Split into: schema, middleware, login UI, session handling
- "Refactor the API" - Split into one story per endpoint or pattern

**Rule of thumb:** If you cannot describe the change in 2-3 sentences, split it.

---

## Story Ordering: Dependencies First

Stories execute in priority order. Earlier stories must not depend on later ones.

**Correct order:**

1. Schema/database changes (migrations)
2. Server actions / backend logic
3. UI components that use the backend
4. Dashboard/summary views that aggregate data

**Wrong order:**

1. UI component (depends on schema that does not exist yet)
2. Schema change

---

## Acceptance Criteria: Must Be Verifiable

Each criterion must be something Ralph can CHECK, not something vague.

### Good criteria (verifiable):

- "Add `status` column to tasks table with default 'pending'"
- "Filter dropdown has options: All, Active, Completed"
- "Clicking delete shows confirmation dialog"
- "Typecheck passes"
- "Tests pass"

### Bad criteria (vague):

- "Works correctly"
- "User can do X easily"
- "Good UX"
- "Handles edge cases"

### Always include as final criterion:

```
"Typecheck passes"
```

For stories with testable logic, also include:

```
"Tests pass"
```

### For stories that change UI, also include:

```
"Verify in browser using dev-browser skill"
```

Frontend stories are NOT complete until visually verified. Ralph will use the dev-browser skill to navigate to the page, interact with the UI, and confirm changes work.

---

## Conversion Rules

1. **Each user story becomes one JSON entry**
2. **IDs**: Sequential (US-001, US-002, etc.)
3. **Priority**: Based on dependency order, then document order
4. **Group**: Stories with the same `group` value can be executed in parallel
5. **All stories**: `passes: false` and empty `notes`
6. **branchName**: Derive from feature name, kebab-case, prefixed with `ralph/`
7. **Always add**: "Typecheck passes" to every story's acceptance criteria

---

## Grouping Strategy

Stories are grouped by their `group` property (e.g., "A", "B", "C"). **This is critical — grouping directly determines execution speed.**

Stories within the same group:

- Have NO dependencies between each other
- Can be executed in **parallel** by the orchestrator (multiple workers at the same time)
- Must all complete before the next group starts

**The goal is to maximize the number of stories in the same group.** Every story that can run in parallel is time saved.

### Group ordering:

- Groups execute in alphabetical order (A → B → C)
- All stories in Group A must complete before Group B starts
- Within a group, stories run in parallel

### Anti-patterns to avoid:

- ❌ Putting independent stories in different groups (forces sequential execution for no reason)
- ❌ One story per group when they don't depend on each other
- ❌ Stories that touch the same files in the same group (causes conflicts)
- ❌ Stories that leave imports broken or types incomplete for dependent groups

### Rules:

- If a story depends on another, they MUST be in different groups
- Stories that touch the same files should NOT be in the same group
- Independent stories should share the same group for parallel execution

---

## Splitting Large PRDs

If a PRD has big features, split them:

**Original:**

> "Add user notification system"

**Split into:**

1. US-001: Add notifications table to database
2. US-002: Create notification service for sending notifications
3. US-003: Add notification bell icon to header
4. US-004: Create notification dropdown panel
5. US-005: Add mark-as-read functionality
6. US-006: Add notification preferences page

Each is one focused change that can be completed and verified independently.

---

Note: Refer to the Output Format section above for the JSON structure. Always ensure `group` properties maximize parallel execution.

---

## Example

**Input PRD:**

```markdown
# Task Status Feature

Add ability to mark tasks with different statuses.

## Requirements

- Toggle between pending/in-progress/done on task list
- Filter list by status
- Show status badge on each task
- Persist status in database
```

**Output prd.json:**

```json
{
  "project": "TaskApp",
  "branchName": "ralph/task-status",
  "description": "Task Status Feature - Track task progress with status indicators",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add status field to tasks table",
      "description": "As a developer, I need to store task status in the database.",
      "acceptanceCriteria": [
        "Add status column: 'pending' | 'in_progress' | 'done' (default 'pending')",
        "Generate and run migration successfully",
        "Typecheck passes"
      ],
      "priority": 1,
      "group": "A",
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-002",
      "title": "Display status badge on task cards",
      "description": "As a user, I want to see task status at a glance.",
      "acceptanceCriteria": [
        "Each task card shows colored status badge",
        "Badge colors: gray=pending, blue=in_progress, green=done",
        "Typecheck passes",
        "Verify in browser using dev-browser skill"
      ],
      "priority": 2,
      "group": "B",
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-003",
      "title": "Add status toggle to task list rows",
      "description": "As a user, I want to change task status directly from the list.",
      "acceptanceCriteria": [
        "Each row has status dropdown or toggle",
        "Changing status saves immediately",
        "UI updates without page refresh",
        "Typecheck passes",
        "Verify in browser using dev-browser skill"
      ],
      "priority": 3,
      "group": "B",
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-004",
      "title": "Filter tasks by status",
      "description": "As a user, I want to filter the list to see only certain statuses.",
      "acceptanceCriteria": [
        "Filter dropdown: All | Pending | In Progress | Done",
        "Filter persists in URL params",
        "Typecheck passes",
        "Verify in browser using dev-browser skill"
      ],
      "priority": 4,
      "group": "B",
      "passes": false,
      "notes": ""
    }
  ]
}
```

US-001 (schema) runs first. US-002, US-003, US-004 are all in **Group B** — they have no dependencies between each other and execute in **parallel**.

---

## Archiving Previous Runs

**Before writing a new prd.json, check if there is an existing one from a different feature:**

1. Read the current `prd.json` if it exists
2. Check if `branchName` differs from the new feature's branch name
3. If different AND `progress.txt` has content beyond the header:
   - Create archive folder: `archive/YYYY-MM-DD-feature-name/`
   - Copy current `prd.json` and `progress.txt` to archive
   - Reset `progress.txt` with fresh header

**The ralph.sh script handles this automatically** when you run it, but if you are manually updating prd.json between runs, archive first.

---

## Checklist Before Saving

Before writing prd.json, verify:

- [ ] **Previous run archived** (if prd.json exists with different branchName, archive it first)
- [ ] Each story is **atomic and completable** in one iteration
- [ ] Each story touches a **single layer or concern**
- [ ] Stories are ordered by dependency (schema to backend to UI)
- [ ] **Each story has a `group` property** (stories in same group run in parallel)
- [ ] **Groups maximize parallelism** (independent stories share the same group)
- [ ] **No independent stories split across groups**
- [ ] **Groups are ordered correctly** (A before B, B before C, etc.)
- [ ] Every story has "Typecheck passes" as criterion
- [ ] UI stories have "Verify in browser using dev-browser skill" as criterion
- [ ] Acceptance criteria are verifiable (not vague)
- [ ] No story depends on a later story
- [ ] No duplicate story IDs
