#!/bin/bash

# Paths (update these to match your container's directory structure)
DBT_PROJECT_DIR="/backend/dbt_project"
ENRICH_SCRIPT_PATH="/backend/scripts/enrich_manifest.py"

echo "Generating DBT documentation and model list..."
cd "$DBT_PROJECT_DIR" || {
  echo "Failed to navigate to dbt project directory: $DBT_PROJECT_DIR"
  exit 1
}

# Run DBT commands
dbt docs generate
if [ $? -ne 0 ]; then
  echo "Error: Failed to generate dbt docs."
  exit 1
fi

dbt ls --output json > target/models.json
if [ $? -ne 0 ]; then
  echo "Error: Failed to list dbt models."
  exit 1
fi

echo "Enriching manifest..."
python3 "$ENRICH_SCRIPT_PATH"
if [ $? -ne 0 ]; then
  echo "Error: Failed to enrich manifest."
  exit 1
fi

echo "Cache refreshed successfully!"
