
## Issue Tracking

This project uses **bd (beads)** for issue tracking.
Run `bd prime` for workflow context, or install hooks (`bd hooks install`) for auto-injection.

### When to Use Beads vs OpenSpec

| Situation | Tool | Action |
|-----------|------|--------|
| New feature/capability | OpenSpec | `/openspec:proposal` first |
| Approved spec ready for implementation | Both | Import tasks to Beads, then implement |
| Bug fix, small task, tech debt | Beads | `bd create` directly |
| Discovered issue during work | Beads | `bd create --discovered-from <parent>` |
| Tracking what's ready to work on | Beads | `bd ready` |
| Feature complete | OpenSpec | `/openspec:archive` |

### Converting OpenSpec Tasks to Beads

When an OpenSpec change is approved and ready for implementation:
```bash
# Create epic for the change
bd create "<change-name>" -t epic -p 1 -l "openspec:<change-name>"

# For each task in tasks.md, create a child issue
bd create "<task description>" -t task -l "openspec:<change-name>"
```

### Importing OpenSpec Tasks to Beads

When converting OpenSpec tasks to Beads issues, ALWAYS include full context. Issues must be **self-contained**.

**REQUIRED in every issue description:**
1. Spec file reference path
2. Relevant requirements (copy key points)
3. Acceptance criteria from the spec
4. Any technical context needed

### Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete the following steps to ensure progress is tracked, but you **MUST NOT** push to the remote repository without explicit user confirmation.

#### 1. File Issues for Remaining Work
Create Beads issues for anything that needs follow-up:
```bash
bd create "TODO: <description>" -t task -p 2
bd create "Bug: <description>" -t bug -p 1
```

#### 2. Run Quality Gates
- Execute tests, linters, and builds to ensure no regressions.
- File P0 issues if the build is broken.

#### 3. Update Tracking & Stage Changes
```bash
bd close <id> --reason "Completed"           # Finished work
bd update <id> --status in_progress          # Partially done
bd sync                                      # Sync local beads DB
git add -A                                   # Stage all changes
```

#### 4. Review & Confirmation (MANDATORY)
Before committing or pushing, you MUST:
1. Provide a concise summary of the changes made.
2. **ASK the user:** "I have completed the tasks and staged the changes. Would you like me to commit, sync beads, and push to the remote repository now?"

#### 5. Final Sync & Push (Only after user approval)
If and ONLY IF the user confirms:
```bash
git commit -m "chore: session end - <summary>"
bd sync                                      # Final sync to capture commit link
git pull --rebase
git push
git status
```

### CRITICAL RULES
- **No Automatic Pushing:** Never run `git push` unless the user has reviewed the work and explicitly said yes.
- **Local Integrity:** Ensure `bd sync` and `git add` are done so the local state is clean and ready for review.
- **Verification:** Always run `git status` after a push to confirm success.


