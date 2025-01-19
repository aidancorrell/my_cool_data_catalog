#!/bin/bash

# Paths
DBT_PROJECT_DIR="/Users/aidancorrell/repos/my_cool_dbt_repo/my_cool_dbt_project"
DATA_CATALOG_DIR="/Users/aidancorrell/repos/data_catalog" # Update to your actual data_catalog path
ENRICH_SCRIPT_PATH="$DATA_CATALOG_DIR/backend/scripts/enrich_manifest.py"

echo "Generating DBT documentation and model list..."
cd "$DBT_PROJECT_DIR" || exit

# Run DBT commands
dbt docs generate
dbt ls --output json > target/models.json

echo "Enriching manifest..."
python3 "$ENRICH_SCRIPT_PATH"

echo "Cache refreshed successfully!"
