#!/bin/bash
set -e  # exit on error
path=$(dirname "$(realpath "$0")")

"$path/.venv/bin/python" "$path/src/pie_server.py" &
SERVER_PID=$!

# Ensure server is killed even if tests fail
trap "kill $SERVER_PID" EXIT

npx wait-on http://localhost:8080 --timeout 30000
echo "server open"

# Run specs — exit code reflects test results
FAILED_SPECS=()
set +e  # allow cypress to fail without immediately exiting
for spec in "$path/cypress/e2e/"*.cy.js; do
  npx cypress run --spec "$spec"
  if [ $? -ne 0 ]; then
    FAILED_SPECS+=("$spec")
  fi
done
set -e

if [ ${#FAILED_SPECS[@]} -eq 0 ]; then
  echo "All tests passed"
else
  echo "Failed specs:"
  for s in "${FAILED_SPECS[@]}"; do
    echo "  - $s"
  done
  exit 1
fi