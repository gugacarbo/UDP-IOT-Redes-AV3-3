---
name: ralph-task-creator
description: "Creates a new task structure following the swing-gui-builder project pattern. Use when the user asks to create a new task, feature, or increment the project. Triggers: create a task, new task, criar task, nova feature, adicionar feature, incrementar projeto, new feature, add feature."
user-invocable: true
---

# Task Scaffold Generator

Creates the directory and file structure for a new task inside the `tasks/` directory.

---

## The Job

1. Receive the task name/title/description from the user
2. Determine the target directory:
   - If `tasks/current` does **not** exist → create at `tasks/current`
   - If `tasks/current` already exists → create at `tasks/{task-name}`
3. Create the required files inside the target directory:
   - `req-{task-name}.md` - Requirements and conversation history

**Important:** Do NOT start implementing. Just create the structure.

---

## Naming Convention

- **Task name:** in English, kebab-case (e.g., `components-preview`, `expand-swing-components`)
- **Full example (current):** `tasks/current/`
- **Full example (named):** `tasks/components-preview/`

---

## Step 1: Collect Information

Ask the user:

1. Task name/title (in English, kebab-case)
2. Brief description of what needs to be implemented

---

## Step 2: Refine Requirements

Use `vscode_askQuestions` to ask clarifying questions based on the task description. Keep questions short and focused — no more than 3-4 questions at a time. Examples:

- **Scope:** "Should this cover only new endpoints or also modify existing ones?"
- **Priority:** "Is there a specific part that should be done first?"
- **Dependencies:** "Does this depend on another task or external service?"
- **Acceptance criteria:** "What defines 'done' for this task?"
- **Constraints:** "Any performance, security, or compatibility concerns?"

Adapt the questions to the context of the task. If the description is already clear, skip this step.

Use the answers to populate the `Decided Requirements` section in `req-{task-name}.md`.

---

## Step 3: Determine Target Directory

Check if `tasks/current` already exists in the workspace:

- **Does not exist** → target is `tasks/current`
- **Already exists** → target is `tasks/{task-name}`

Use the `list_dir` tool on `tasks/` to check.

---

## Step 4: Create File Structure

Create the following files inside the target directory determined in Step 3:

### req-{task-name}.md

```markdown
# {Title}

## Description

[Brief description of the task]

## Decided Requirements

- [ ] Requirement 1
- [ ] Requirement 2
```

---

## Step 5: Confirm

Show the user the created structure with the file paths.
