# Loragent - Dynamic Formation & Self-Improvement Rules

These rules apply universally to the Loragent system and all 108 constituent agents in the ecosystem. 

## 1. Dynamic Formation Engine
`loragent-boss` is the central orchestrator. When a user submits a prompt, `loragent-teacher` will clarify the requirements, and then the Boss will assemble the team using one of four modes:

1. **Auto Team Formation**: For standard software projects. The Boss delegates to `loragent-tech-director`, `loragent-backend-se`, `loragent-frontend-se`, and `loragent-sqa`.
2. **Office Formation**: For full-scale business launches. The Boss delegates to `loragent-project-coordinator`, `loragent-marketing-strategy-manager`, `loragent-publisher`, `loragent-pr-specialist`, etc.
3. **Freelance Formation**: For isolated, single-agent gig work. The Boss delegates to a single specialist (e.g., `loragent-logo-designer`, `loragent-3d-designer`).
4. **Chela Formation**: For aggressive, high-priority bug hunting and complex Git issues. The Boss delegates to `loragent-bug-hunter`, `loragent-shift-engineer`, and `loragent-git-specialist`.

## 2. Firebase Self-Improvement Loop
- **Continuous Learning**: All generated code, successful workflows, prompt optimizations, and resolved bugs MUST be logged to a centralized Firebase database.
- **The Updater**: `loragent-database-updater` is responsible for parsing successful workflows and syncing them to Firebase.
- **Collective Memory**: Before starting a complex task, agents should query the Firebase collective memory (or ask the Boss to do so) to retrieve past learnings and avoid repeating mistakes.

## 3. Loragent MCP Server Integration & Lazy Loading
- **Summon**: To save context tokens, only the Core Operations Team is installed by default. The Boss MUST use the `loragent_summon_agent` MCP tool to pull specialized agents into the workspace on-demand.
- **Dismiss**: When a specialist is no longer needed, use `loragent_dismiss_agent` to remove them from context.
- **Steer**: Agents MUST use the `loragent_steer` MCP tool to explicitly hand off data/context between one another, ensuring the `loragent-workflow-manager` logs the path.
- **Hooks**: Agents MUST use the `loragent_trigger_hook` MCP tool to execute lifecycle events (e.g. `pre-commit`, `deploy-retry`) securely.
- **State**: The `loragent_get_state` MCP tool should be queried to see the current active agent.

## 4. Professionalism & Consistency
- **Strict Handoffs**: Sub-agents MUST return their specialized output to the Boss (or `loragent-office-assistant`) for the next routing step.
- **Secure Credentials**: `loragent-accounts-specialist` is the ONLY agent allowed to manage tokens using the `secure-cred-vault` standard. Never print plain text secrets.
- **Efficiency**: `loragent-cache-collector` organizes the workspace context to reduce token usage and speed up AI editor processing (Parallel Collaboration & Multi-Task Execution).
- **Workspace Guard**: The `loragent-workspace-guard` monitors and strictly blocks destructive operations (e.g., `rm -rf`) unless explicitly permitted by the user.

## 5. Multi-AI Support
- This ruleset and the associated skills are framework-agnostic. Loragent can be installed via NPM, PIP, or Composer and is compatible with Claude Code, Cursor, Codex, and Antigravity IDEs.

## 6. The Watchman & Prompt Engineering Commands
Loragent supports custom Slash Commands to effortlessly steer the workflow. The `loragent-watchman` agent maintains an uninterrupted execution cache.
- **/loragent-watchman continue**: Resumes execution from the exact `.loragent/watchman-cache.json` state if the AI gets stuck.
- **/loragent-boss auto**: Instantly triggers the Auto-Team formation.
- **/loragent-boss chela**: Instantly triggers the Chela (Debugging) formation.
- **/loragent-teacher clarify**: Forces the teacher agent to ask clarifying requirements.
- **/loragent-inspector rca**: Forces a Root Cause Analysis report on the current bug.

