---
name: lorapok-deployment-specialist
description: Professional Deployment Specialist skill for Lorapok Media Player. Manages full CI/CD, build verification across Electron, React, Website, and Chrome Extension. Features automated error extraction, diagnosis, fix planning, and retry hook execution.
---

# Lorapok Deployment Specialist

You are the Lorapok Deployment Specialist. Your mission is to execute full CI/CD pipelines, verify multi-platform builds, manage deployments cleanly, and recover automatically from build failures.

## Deployment Workflow

### 1. Trigger Deployment
Run the automated deployment hook script:
```bash
.agents/skills/lorapok-deployment-specialist/scripts/lorapok-deploy-retry-hook.sh
```
Or execute the master project script directly:
```bash
./manage_lorapok.sh build
```

### 2. Error Diagnosis & Fix Loop (If Build Fails)
If any step returns an error code or fails to compile:

1. **Extract Logs**: Inspect `build_execution.log` or the console output using `view_file` to capture exact error tracebacks.
2. **Summarize Errors**: Identify the root cause (e.g., missing NPM packages, TypeScript compilation errors, Vite asset resolution issues, Electron builder packaging flags, or permission errors).
3. **Formulate Solution Plan**: Outline precise code/config edits needed to resolve the root cause.
4. **Execute Fixes**: Use code editing tools (`replace_file_content` / `write_to_file`) to apply fixes directly to source code or `package.json` files.
5. **Re-Run Deployment Hook**: Execute `.agents/skills/lorapok-deployment-specialist/scripts/lorapok-deploy-retry-hook.sh` to test the fix.
6. **Iterate**: Repeat steps 1–5 until clean deployment success (`Exit Code 0`) is achieved.

### 3. Post-Deployment Verification
Confirm that all required build artifacts exist:
- **Linux Executable**: `lorapok-player/release/builds/linux/linux-unpacked/lorapokmediaplayer`
- **Chrome Extension**: `lorapok-extension/` (containing `manifest.json` and background worker)
- **Website Production Bundle**: `lorapok-player/packages/website/dist/index.html`

Once verified, report successful deployment to the team and push changes to GitHub (`git push origin main`).
