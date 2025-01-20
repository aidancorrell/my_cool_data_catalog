import json
import os

# DEV notes: unhardcode this to work in docker container
# Paths to manifest.json and catalog.json
manifest_path = "/Users/aidancorrell/repos/my_cool_dbt_repo/my_cool_dbt_project/target/manifest.json"
catalog_path = "/Users/aidancorrell/repos/my_cool_dbt_repo/my_cool_dbt_project/target/catalog.json"
enriched_manifest_path = "/Users/aidancorrell/repos/data_catalog/backend/cache/enriched_manifest.json"

# Ensure the output directory exists
output_dir = os.path.dirname(enriched_manifest_path)
os.makedirs(output_dir, exist_ok=True)

# Load manifest and catalog
with open(manifest_path) as manifest_file:
    manifest = json.load(manifest_file)

with open(catalog_path) as catalog_file:
    catalog = json.load(catalog_file)

# Enrich manifest with catalog columns
for node_id, node in manifest.get('nodes', {}).items():
    if node_id in catalog.get('nodes', {}):
        node['columns'] = catalog['nodes'][node_id].get('columns', {})

# Save enriched manifest
with open(enriched_manifest_path, 'w') as output_file:
    json.dump(manifest, output_file, indent=4)

print(f"Enriched manifest saved to {os.path.abspath(enriched_manifest_path)}")
