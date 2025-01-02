use std::process::{Command, Output};
use std::path::Path;
use axum::{extract::Path as AxumPath, Json};
use serde::{Deserialize, Serialize};
use log::{info, error};
use crate::dbt::{run_dbt_command, clean_dbt_output, get_model_details};


#[derive(Serialize, Deserialize, Debug)]
pub struct Dependencies {
    nodes: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ModelMetadata {
    name: String,
    schema: String,
    materialization: Option<String>,
    tags: Vec<String>,
    depends_on: Dependencies,
}

#[derive(Serialize)]
pub struct Lineage {
    models: Vec<ModelMetadata>,
}

/// Helper function to run a DBT command and clean the output
// fn run_dbt_command(dbt_project_dir: &str, args: &[&str]) -> Result<Output, String> {
//     if !Path::new(dbt_project_dir).exists() {
//         error!("DBT project directory does not exist: {}", dbt_project_dir);
//         return Err(format!("DBT project directory does not exist: {}", dbt_project_dir));
//     }

//     let command_str = format!("dbt {} in directory: {}", args.join(" "), dbt_project_dir);
//     info!("Executing DBT command: {}", command_str);

//     let output = Command::new("dbt")
//         .args(args)
//         .current_dir(dbt_project_dir)
//         .output()
//         .map_err(|e| {
//             error!("Failed to run DBT command: {}", e);
//             format!("Failed to run dbt command: {}", e)
//         })?;

//     let stdout = String::from_utf8_lossy(&output.stdout);
//     let stderr = String::from_utf8_lossy(&output.stderr);

//     info!("DBT command stdout (raw): {}", stdout);
//     if !stderr.is_empty() {
//         error!("DBT command stderr: {}", stderr);
//     }

//     if !output.status.success() {
//         return Err(format!(
//             "DBT command failed with status: {}\nError: {}",
//             output.status, stderr
//         ));
//     }

//     Ok(output)
// }

pub async fn get_lineage(AxumPath((start_model, end_model)): AxumPath<(String, String)>) -> Json<Lineage> {
    let dbt_project_dir = "/Users/aidancorrell/repos/my_cool_dbt_repo/my_cool_dbt_project";
    let lineage_query = format!("{}+,+{}", start_model, end_model);
    let args = &["ls", "--output", "json", "--models", &lineage_query];

    // Fetch lineage models using DBT
    let lineage_models: Vec<String> = match run_dbt_command(dbt_project_dir, args) {
        Ok(cleaned_output) => {
            match serde_json::from_str::<Vec<serde_json::Value>>(&cleaned_output) {
                Ok(models) => models
                    .into_iter()
                    .filter_map(|m| m.get("name").and_then(|v| v.as_str().map(String::from)))
                    .collect(),
                Err(err) => {
                    error!("Failed to parse DBT JSON output for lineage models: {}", err);
                    vec![]
                }
            }
        }
        Err(err) => {
            error!("Failed to run DBT command for lineage: {}", err);
            vec![]
        }
    };

    // Retrieve detailed metadata for each lineage model
    let mut detailed_models = Vec::new();
    for model_name in lineage_models {
        if let Json(model_details) = get_model_details(axum::extract::Path(model_name.clone())).await {
            let model_metadata = ModelMetadata {
                name: model_details.name,
                schema: model_details.config.schema.unwrap_or_default(),
                materialization: model_details.config.materialized.clone(),
                tags: model_details.tags,
                depends_on: Dependencies {
                    nodes: model_details.depends_on.nodes.unwrap_or_default(),
                },
            };
            detailed_models.push(model_metadata);
        } else {
            error!("Failed to fetch details for model: {}", model_name);
        }        
    }

    info!("Lineage models with details: {:?}", detailed_models);

    Json(Lineage { models: detailed_models })
}



// use axum::{extract::Path, Json};
// use serde::Serialize;
// use std::collections::HashMap;

// use crate::dbt::{load_manifest, Node};
// use axum::body::Body;
// use axum::http::{Request, StatusCode};
// use axum::Router;
// use tower::ServiceExt; // for `oneshot` method

// #[derive(Serialize)]
// pub struct Lineage {
//     model: String,
//     dependencies: Vec<String>,
// }

// #[derive(Serialize)]
// pub struct LineageNode {
//     name: String,
//     dependencies: Vec<String>,
// }

// // Endpoint to get lineage for a specific model by its ID
// pub async fn get_lineage(Path(model_id): Path<String>) -> Json<Lineage> {
//     let manifest = load_manifest("./src/data/manifest.json").unwrap();
//     let model = manifest
//         .nodes
//         .get(&model_id)
//         .expect("Model not found")
//         .clone();

//     let lineage = Lineage {
//         model: model.name,
//         dependencies: model.depends_on.nodes,
//     };

//     Json(lineage)
// }

// // Endpoint to get lineage for all models (for DAG visualization)
// pub async fn get_all_lineages() -> Json<HashMap<String, LineageNode>> {
//     let manifest = load_manifest("./src/data/manifest.json").unwrap();

//     let lineages: HashMap<String, LineageNode> = manifest.nodes.into_iter().map(|(key, node)| {
//         (
//             key.clone(),
//             LineageNode {
//                 name: node.name,
//                 dependencies: node.depends_on.nodes,
//             },
//         )
//     }).collect();

//     Json(lineages)
// }