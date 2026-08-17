---
name: lorapok-workflow-orchestrator
description: Defines the standard operating procedure and interaction flow between the 10-member virtual office subagents. Use to guide the overall process from planning to CI/CD.
---

# Lorapok Workflow Orchestrator

This skill sets the physical virtual office rules for the Lorapok ecosystem. The team consists of subagents functioning as a 10-member enterprise unit.

## Core Mission & Philosophy
The overarching mission for all agents is an **Engineering-first** approach that blends **biological UI concepts**, **sensory computing**, and practical utility.
- Interfaces must feel **alive**, highly responsive, and feature **high-clarity feedback loops**.
- The project architect and UI/UX developer must evaluate all designs and implementations for "alive" responsiveness and sensory computing feedback loops.

## The Core Loop
1. **Intake**: A new feature or bug is reported by the user or hook.
2. **Planning (`lorapok-plan-generator`)**: The feature is broken down into tasks.
3. **Assignment (`lorapok-project-architect`)**: The Architect takes the plan, assigns the specific modules to developers, and sets constraints, enforcing the sensory computing philosophy.
4. **Implementation (`lorapok-specialized-developer`)**: The Developer writes the code, adhering to Lorapok standards (modern UI, sensory computing feedback, robust error handling).
5. **Quality Assurance (`lorapok-sqa-lead`)**: The SQA tests the code, attempting to break it. If it fails, SQA sends it back to the Architect to re-assign. If it passes, SQA approves.
6. **SEO Injection (`lorapok-seo-analyst`)**: If applicable to web properties, the SEO Analyst injects meta tags.
7. **CI/CD (`lorapok-automate-pipeline.sh`)**: Code is committed, built using `manage_lorapok.sh build`, tested via Vitest, and pushed to the repository.

Always invoke agents sequentially to respect this chain of command.
