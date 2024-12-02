use axum::{extract::Path, Json};
use serde::Serialize;

use crate::dbt::{load_manifest, Node};

#[derive(Serialize)]
pub struct Lineage {
    model: String,
    dependencies: Vec<String>,
}

pub async fn get_lineage(Path(model_id): Path<String>) -> Json<Lineage> {
    let manifest = load_manifest("path/to/manifest.json").unwrap();
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