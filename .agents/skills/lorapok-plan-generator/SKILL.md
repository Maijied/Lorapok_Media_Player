---
name: lorapok-plan-generator
description: Analyzes project requirements, breaks down features, and generates structured implementation plans with atomic subtasks. Use when a new feature or complex architecture is requested by the user to scaffold the tasks for the agents.
---

# Lorapok Plan Generator

This skill is designed to take raw, high-level project goals and distill them into actionable, atomic subtasks suitable for delegation across the 10-member virtual office team.

## Planning Protocol

1. **Understand Scope**: Analyze the user's prompt to grasp the full requirement. Check any relevant files provided in the context.
2. **Architecture Outline**: Propose an architectural layout or a step-by-step logic map.
3. **Task Decomposition**: Split the overarching goal into manageable chunks.
4. **Agent Delegation**: Assign each task to the corresponding expert:
   - Architecture & Triage -> `lorapok-project-architect`
   - Implementation -> `lorapok-specialized-developer`
   - Quality Assurance & Edge Cases -> `lorapok-sqa-lead`
   - SEO -> `lorapok-seo-analyst`
5. **Output Format**: Output a clear markdown plan with checkboxes for tracking progress. Provide this plan to the user for approval.
