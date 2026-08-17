#!/bin/bash
input=$(cat)
subagent=$(echo "$input" | jq -r '.subagent // empty')
result=$(echo "$input" | jq -r '.result // empty')

# Simple logic to chain agents in the virtual office
if [[ "$subagent" == "lorapok-specialized-developer" ]]; then
  echo '{
    "followup_message": "Developer finished execution. /lorapok-sqa-lead please review the changes."
  }'
  exit 0
elif [[ "$subagent" == "lorapok-sqa-lead" ]]; then
  if [[ "$result" == *"Bug Report"* ]]; then
    echo '{
      "followup_message": "SQA found bugs. /lorapok-project-architect please triage and re-assign."
    }'
  else
    echo '{
      "followup_message": "SQA approved. /lorapok-seo-analyst please inject SEO if applicable, or finalize."
    }'
  fi
  exit 0
fi

echo '{}'
exit 0
