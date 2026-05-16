# Agent Instructions: Managing this Repository

This repository serves the Verachi GitHub Pages landing site.

Main app lives in ../verachi

## Pushing Changes

When you make changes to this repository and need to push them, you must use the dedicated SSH key for the `verachi` identity to authenticate with GitHub.

Use the following command to push your changes:

```bash
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_verachi -o IdentitiesOnly=yes" git push origin main
```

**Standard Workflow:**
1. Stage your changes: `git add <files>`
2. Commit your changes: `git commit -m "feat/fix: descriptive message"`
3. Push using the dedicated SSH key command above.
