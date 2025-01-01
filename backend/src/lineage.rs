use std::process::{Command, Output};
use std::path::Path;
use axum::{extract::Path as AxumPath, Json};
use serde::Serialize;
use log::{info, error};

#[derive(Serialize)]
pub struct ModelMetadata {
    name: String,
    schema: String,
    materialization: Option<String>,
    tags: Vec<String>,
}

#[derive(Serialize)]
pub struct Lineage {
    models: Vec<ModelMetadata>,
}

/// Helper function to run a DBT command
fn run_dbt_command(dbt_project_dir: &str, args: &[&str]) -> Result<Output, String> {
    if !Path::new(dbt_project_dir).exists() {
        error!("DBT project directory does not exist: {}", dbt_project_dir);
        return Err(format!("DBT project directory does not exist: {}", dbt_project_dir));
    }

    // Construct the command for logging
    let command_str = format!(
        "dbt {} in directory: {}",
        args.join(" "),
        dbt_project_dir
    );

    // Log the command being executed
    // info!("Executing DBT command: {}", command_str);

    // Execute the command
    Command::new("dbt")
        .args(args)
        .current_dir(dbt_project_dir)
        .output()
        .map_err(|e| {
            error!("Failed to run DBT command: {}", e);
            format!("Failed to run dbt command: {}", e)
        })
}


/// Parse DBT output to extract clean model metadata
fn parse_dbt_output(output: &[u8]) -> Vec<ModelMetadata> {
    String::from_utf8_lossy(output)
        .lines()
        .filter(|line| !line.starts_with("\u{1b}")) // Remove ANSI escape sequences
        .filter(|line| !line.contains("Running with dbt") && !line.contains("Registered adapter"))
        .filter(|line| line.contains(".")) // Only keep fully-qualified model names
        .map(|line| {
            // Extract model metadata
            let parts: Vec<&str> = line.split('.').collect();
            let name = parts.last().unwrap_or(&"").to_string();
            let schema = parts.get(parts.len() - 2).unwrap_or(&"default").to_string();
            ModelMetadata {
                name,
                schema,
                materialization: None, // You can augment this with additional DBT commands if needed
                tags: vec![],          // Include tags if available
            }
        })
        .collect()
}

/// Endpoint to get lineage using the `model_a+,+model_b` DBT syntax
pub async fn get_lineage(AxumPath((start_model, end_model)): AxumPath<(String, String)>) -> Json<Lineage> {
    let dbt_project_dir = "/Users/aidancorrell/repos/my_cool_dbt_repo/my_cool_dbt_project";

    // Use `model_a+,+model_b` syntax to get both upstream and downstream lineage
    let dbt_args = &["ls", "--models", &format!("{}+,+{}", start_model, end_model)];
    let lineage_output = match run_dbt_command(dbt_project_dir, dbt_args) {
        Ok(output) if output.status.success() => parse_dbt_output(&output.stdout),
        Ok(output) => {
            error!("DBT command failed: {}", String::from_utf8_lossy(&output.stderr));
            vec![]
        }
        Err(err) => {
            error!("Error running DBT command: {}", err);
            vec![]
        }
    };

    Json(Lineage { models: lineage_output })
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