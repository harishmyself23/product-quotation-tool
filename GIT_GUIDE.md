# Git Quick Reference Guide

## Daily Workflow

### 1. Check What Changed
```powershell
git status
```
Shows which files were modified, added, or deleted.

### 2. Save Your Changes (Commit)
```powershell
# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Brief description of what you changed"

# Examples:
git commit -m "Fixed image loading issue in ProductSearch"
git commit -m "Added instant search functionality"
git commit -m "Removed price display from UI"
```

### 3. Push to GitHub
```powershell
git push
```
Uploads your commits to GitHub for backup.

---

## Viewing History

### See Recent Commits
```powershell
# Short format (one line per commit)
git log --oneline

# Detailed format
git log

# Last 5 commits only
git log --oneline -5
```

### See What Changed in a Commit
```powershell
git show COMMIT_HASH
```

---

## Rollback & Recovery

### Undo Last Commit (Keep Changes)
```powershell
git reset --soft HEAD~1
```
Removes the commit but keeps your file changes. Useful if you made a typo in the commit message.

### Undo Last Commit (Discard Changes)
```powershell
git reset --hard HEAD~1
```
⚠️ **WARNING**: This deletes your changes permanently!

### Rollback to Specific Commit
```powershell
# 1. Find the commit hash
git log --oneline

# 2. Rollback to that commit (DESTRUCTIVE)
git reset --hard COMMIT_HASH

# Example:
git reset --hard a3f5c21
```

### Restore a Single File
```powershell
# Restore file to last committed version
git checkout -- path/to/file.js

# Restore file from specific commit
git checkout COMMIT_HASH -- path/to/file.js
```

---

## Branching (For Experiments)

### Create a New Branch
```powershell
# Create and switch to new branch
git checkout -b feature-name

# Example:
git checkout -b add-pdf-export
```

### Switch Between Branches
```powershell
# Go back to main branch
git checkout main

# Go to your feature branch
git checkout feature-name
```

### Merge Branch into Main
```powershell
# 1. Switch to main
git checkout main

# 2. Merge your feature
git merge feature-name

# 3. Push to GitHub
git push
```

### Delete a Branch
```powershell
git branch -d feature-name
```

---

## Emergency Recovery

### File Accidentally Deleted?
```powershell
# Restore it from last commit
git checkout HEAD -- path/to/deleted-file.js
```

### Made a Mess? Start Fresh
```powershell
# Discard ALL local changes (DESTRUCTIVE)
git reset --hard HEAD

# Pull latest from GitHub
git pull
```

### See Differences Before Committing
```powershell
# See all changes
git diff

# See changes in specific file
git diff path/to/file.js
```

---

## Best Practices

✅ **DO:**
- Commit frequently (every logical change)
- Write clear commit messages
- Push to GitHub daily
- Use branches for big experiments

❌ **DON'T:**
- Commit sensitive data (API keys, passwords)
- Use `git reset --hard` unless you're sure
- Make huge commits with 50+ file changes

---

## Common Scenarios

### Scenario 1: "I want to try something risky"
```powershell
# Create a branch
git checkout -b experiment

# Make changes, test...

# If it works:
git checkout main
git merge experiment

# If it fails:
git checkout main
git branch -d experiment
```

### Scenario 2: "I need yesterday's version"
```powershell
# Find yesterday's commit
git log --oneline --since="yesterday"

# Rollback to it
git reset --hard COMMIT_HASH
```

### Scenario 3: "I committed to wrong branch"
```powershell
# Undo commit (keep changes)
git reset --soft HEAD~1

# Switch to correct branch
git checkout correct-branch

# Commit again
git add .
git commit -m "Your message"
```

---

## Quick Troubleshooting

**Problem**: `git push` rejected
```powershell
# Someone else pushed changes, pull first
git pull
git push
```

**Problem**: Merge conflict
```powershell
# 1. Open conflicted files, resolve conflicts
# 2. Mark as resolved
git add .
git commit -m "Resolved merge conflict"
```

**Problem**: Forgot to add file to commit
```powershell
# Add the file
git add forgotten-file.js

# Amend last commit
git commit --amend --no-edit
```

---

## GitHub Desktop (Alternative)

If you prefer a visual interface:
1. Download: https://desktop.github.com/
2. Install and sign in
3. Add your repository
4. Use the GUI for commits, pushes, and rollbacks

Much easier for beginners!
