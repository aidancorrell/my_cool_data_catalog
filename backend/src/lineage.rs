use axum::{extract::Path, Json};
use serde::Serialize;
use std::collections::HashMap;

use crate::dbt::{load_manifest, Node};

#[derive(Serialize)]
pub struct Lineage {
    model: String,
    dependencies: Vec<String>,
}

#[derive(Serialize)]
pub struct LineageNode {
    name: String,
    dependencies: Vec<String>,
}

// Endpoint to get lineage for a specific model by its ID
pub async fn get_lineage(Path(model_id): Path<String>) -> Json<Lineage> {
    let manifest = load_manifest("./src/data/manifest.json").unwrap();
    let model = manifest
        .nodes
        .get(&model_id)
        .expect("Model not found")
        .clone();

    let lineage = Lineage {
        model: model.name,
        dependencies: model.depends_on.nodes,
    };

    Json(lineage)
}

// Endpoint to get lineage for all models (for DAG visualization)
pub async fn get_all_lineages() -> Json<HashMap<String, LineageNode>> {
    let manifest = load_manifest("./src/data/manifest.json").unwrap();

    let lineages: HashMap<String, LineageNode> = manifest.nodes.into_iter().map(|(key, node)| {
        (
            key.clone(),
            LineageNode {
                name: node.name,
                dependencies: node.depends_on.nodes,
            },
        )
    }).collect();

    Json(lineages)
}
