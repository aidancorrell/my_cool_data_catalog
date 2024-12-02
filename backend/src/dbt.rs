use axum::Json;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs};

// Ensure this derives Clone
#[derive(Deserialize, Serialize, Clone)]
pub struct DbtManifest {
    pub nodes: HashMap<String, Node>,
}

// Ensure this derives Clone
#[derive(Deserialize, Serialize, Clone)]
pub struct Node {
    pub name: String,
    pub description: String,
    pub depends_on: Dependencies,
}

// Ensure this derives Clone
#[derive(Deserialize, Serialize, Clone)]
pub struct Dependencies {
    pub nodes: Vec<String>,
}

pub async fn get_models() -> Json<Vec<String>> {
    let manifest = load_manifest("path/to/manifest.json").unwrap();
    let models: Vec<String> = manifest.nodes.keys().cloned().collect();
    Json(models)
}

pub async fn get_model_details(path_params: axum::extract::Path<String>) -> Json<Node> {
    let model_id = path_params.0;
    let manifest = load_manifest("path/to/manifest.json").unwrap();

    // Explicit dereference and clone
    if let Some(model) = manifest.nodes.get(&model_id) {
        Json((*model).clone())
    } else {
        panic!("Model not found");
    }
}

pub fn load_manifest(file_path: &str) -> Result<DbtManifest, std::io::Error> {
    let data = fs::read_to_string(file_path)?;
    let manifest: DbtManifest = serde_json::from_str(&data)?;
    Ok(manifest)
}