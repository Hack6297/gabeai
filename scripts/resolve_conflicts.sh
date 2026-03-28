#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-ours}"

if [[ "$MODE" != "ours" && "$MODE" != "theirs" ]]; then
  echo "Usage: scripts/resolve_conflicts.sh [ours|theirs]"
  exit 1
fi

mapfile -t FILES < <(git diff --name-only --diff-filter=U)

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No unmerged files found."
  exit 0
fi

echo "Unmerged files:"
printf ' - %s\n' "${FILES[@]}"

for file in "${FILES[@]}"; do
  if [[ "$MODE" == "ours" ]]; then
    git checkout --ours -- "$file"
  else
    git checkout --theirs -- "$file"
  fi
  git add "$file"
done

echo "Resolved ${#FILES[@]} files using '$MODE'."
echo "Next: run tests and commit the merge resolution."
