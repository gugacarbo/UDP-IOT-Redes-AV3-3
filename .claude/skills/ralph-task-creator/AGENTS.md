# Ralph Agent Instructions

## Overview

Ralph is an autonomous AI agent loop that runs in GitHub Copilot Chat mode to implement PRDs iteratively. Each iteration is a fresh context with clean state.

## Usage

This project uses **GitHub Copilot CLI in autopilot mode** with the following skills:
- `prd` - Generate Product Requirements Documents
- `ralph` - Convert PRDs to prd.json format
- `ralph-worker` - Execute a specific story from a PRD (called by coordinator agent)

## Task Folder Structure

```
tasks/
├── [task-name]/                    # Active task (not completed)
│   ├── prd-[task-name].md         # PRD document
│   ├── prd.json                   # Ralph-format PRD
│   └── progress.txt               # Progress tracking
├── [DONE] [task-name]/            # Completed task
│   ├── prd-[task-name].md
│   ├── prd.json
│   └── progress.txt
├── prd.example.json               # Example PRD format
├── prompt.md                      # Instructions for each iteration
├── ralph.sh                       # Bash script for CLI execution
└── ralph.ps1                      # PowerShell script for CLI execution
```

## Key Files

- `prompt.md` - Instructions given to each instance
- `prd.example.json` - Example PRD format

## Workflow

1. **Create PRD:** Use the `prd` skill to create a new PRD in `tasks/[feature-name]/prd-[feature-name].md`
2. **Convert PRD:** Use the `ralph` skill to convert to `prd.json`
3. **Execute:** Use `ralph-worker` to implement stories one at a time
4. **Complete:** When all stories pass, folder is renamed to `[DONE] [task-name]/`

## Patterns

- Each iteration completes exactly ONE user story
- Memory persists via git history, `progress.txt`, and `prd.json`
- Stories should be small enough to complete in one context window
- Always update AGENTS.md with discovered patterns for future iterations
- **Task completion:** Rename task folder from `[task-name]/` to `[DONE] [task-name]/`
- Keep `schemas/swingbuilder.schema.json` component keys aligned with `src/config/ConfigReader.ts` `COMPONENT_TYPES` to avoid runtime/schema drift.
- Official repository scripts contract is `build`/`verify`; treat `compile`/`check` as temporary legacy aliases during migration.
- For historical `prd.json` backfills, store an immutable pre-change snapshot under `tasks/<active-task>/backfill/<story-id>/before/` and link both before/after artifacts in evidence docs.
- Story-level evidence must use a minimum template in `prd.json` notes and `progress.txt`: `Changed files`, `Commands run`, `Observable results`. Apply this before setting `passes: true`.
