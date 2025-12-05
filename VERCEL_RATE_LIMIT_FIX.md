# Vercel Rate Limit Fix

## Problem
Multiple Vercel projects (shiftchanges, shiftchanges-qkaz, shiftchangess) were all deploying on every git push, causing rapid rate limit exhaustion.

## Solutions Implemented

### 1. ✅ Ignored Build Step (`ignore-build-step.sh`)
This script automatically skips deployments when:
- Branch is a `claude/*` development branch
- Commit message indicates docs/config only (`docs:`, `chore:`, `style:`)
- Only documentation/config files changed (`.md`, `.json`, `.yml`)
- **Main/master branches ALWAYS build** (production safety)

### 2. ✅ .vercelignore File
Prevents Vercel from redeploying when only these files change:
- Documentation files (README.md, *.md)
- GitHub workflows
- Test files
- Environment examples

### 3. ✅ Updated vercel.json
Added `ignoreCommand` configuration to use the build step script.

## Additional Steps You Should Take

### A. Consolidate Vercel Projects (RECOMMENDED)
You have 3 projects for the same repo. **You likely only need ONE.**

**To fix this:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Delete unused projects: `shiftchanges-qkaz` and `shiftchangess`
3. Keep only: `shiftchanges`

This will **immediately reduce deployments by 66%**!

### B. Configure Vercel Project Settings
In your Vercel project dashboard:

1. **Production Branch**: Set to `main` only
   - Settings → Git → Production Branch → `main`

2. **Disable Auto-Deploy for Preview Branches** (optional):
   - Settings → Git → Uncheck "Automatically expose System Environment Variables"
   - This prevents every branch push from deploying

3. **Ignored Build Step**:
   - Already configured in `vercel.json` ✅

### C. Best Practices Going Forward

**For Development:**
- Work on feature branches (`claude/*` branches auto-skip now)
- Test locally with `npm run dev`
- Only merge to `main` when ready for production

**For Commits:**
- Use conventional commit prefixes for docs: `docs: update README`
- Batch related changes together instead of many small commits
- Consider using `git commit --amend` for iterative fixes (before pushing)

**For Multiple Environments:**
- If you need staging/preview environments, use **one Vercel project with different branches**
- Don't create separate Vercel projects for the same repo

## Expected Impact

With these changes:
- ✅ Development branch pushes won't deploy
- ✅ Documentation-only updates won't deploy
- ✅ Only meaningful code changes to main/master trigger deployments
- ✅ If you delete the duplicate projects: **66% fewer deployments**

## Testing

To test the ignore script locally:
```bash
bash ignore-build-step.sh
echo $?  # 0 = skip build, 1 = proceed with build
```

## Rate Limit Recovery

- Vercel rate limits reset after the specified time (11-12 hours in your case)
- Once these changes are in place, you should stay well under limits
- Free tier: ~100 deployments/day
- With optimizations: Should use <10 deployments/day for normal development

## Questions?

If you're still hitting rate limits after this:
1. Check how many Vercel projects are connected to this repo
2. Verify the ignore script is running (check Vercel deployment logs)
3. Consider upgrading to Vercel Pro if you need more deployments
