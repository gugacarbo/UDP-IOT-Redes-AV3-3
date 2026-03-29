---
name: ralph-task-creator
description: "Creates a new task structure following the swing-gui-builder project pattern. When invoked, the skill performs a brief research about the task topic and the user's request, identifies gaps, and returns actionable suggestions. Use when the user asks to create a new task, feature, or increment the project. Triggers: create a task, new task, criar task, nova feature, adicionar feature, incrementar projeto, new feature, add feature."
user-invocable: true
---

# Task Scaffold Generator

Creates the directory and file structure for a new task following the swing-gui-builder project pattern, and improves the requirements documentation process. This skill is triggered when the user asks to create a new task, feature, or increment the project. Additionally, when invoked it will perform a short research and gap-analysis step to help improve requirement quality and surface missing context.

---

## The Job

1. Receive the task name/title from the user
2. Create the directory structure in the format `task-DD_MM_YY_HHMMss-[task-name]`
3. Create the required file:
   - `req-[task-name].md` - Requirements and conversation history
4. Improve the requirements provided by the user, ensuring they are clear, actionable, and follow the project standards.
5. Perform a brief research and gap analysis about the task topic and the user's request, listing missing information, risks, and concrete suggestions to improve the requirements.
**Important:** Do NOT start implementing. Just create the structure.

---

## Naming Convention

- **Task name:** in English, kebab-case (e.g., `components-preview`, `expand-swing-components`)
- **Date:** format `DD_MM_YY_HHMMSS` (e.g., `16_03_26_183407`)
- **Full example:** `task-16_03_26_183407-components-preview`

---

## Step 1: Collect Information

Ask the user:

1. Task name/title (in English, kebab-case)
2. Brief description of what needs to be implemented

Additional questions to enable research and gap analysis:

- Do you allow a brief research (repo + quick web search) to look for examples, similar tasks, or missing context? (yes/no)
- Provide any links, specs, prototypes, or related issues that help contextualize the task.
- Who is the main stakeholder and what is the success criteria?

---

## Step 2: Generate Current Date

Generate current timestamp in `DD_MM_YY_HHMMSS` format:

```javascript
const now = new Date();
const timestamp = `${String(now.getDate()).padStart(2, "0")}_${String(now.getMonth() + 1).padStart(2, "0")}_${String(now.getFullYear()).slice(-2)}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
// Example: 16_03_26_183407
```

---

## Step 3: Create File Structure

Create in `tasks/task-{timestamp}-{name}/`:

### req-{name}.md

```markdown
# {Title}

## Description

[Brief description of the task]

## Decided Requirements

- [ ] Requirement 1
- [ ] Requirement 2
```

1. Ask the user for the task name and suggest some examples.
2. Generate the current date
3. Create the directories and files
4. If research is allowed: perform a short research and gap-analysis (see guidance below).
5. Ask the user gap-filling questions based on the findings and suggestions.
6. Show the user the created structure with the file paths

---

## Guidance: Brief Research & Gap Analysis

- Scope: short, focused (5–10 minutes). Prefer repo context first, then quick external searches only when needed.
- Outputs: 3 sections added to `req-{name}.md`:
   - `Findings`: summary of relevant references, examples, or conflicts.
   - `Gaps & Risks`: missing information, unclear requirements, or potential blockers.
   - `Suggestions`: prioritized, actionable fixes or clarifying questions for the author.
- If web searches are used, cite sources or links in `Findings`.
- If user disallows research, skip this step and note it in `req-{name}.md`.
