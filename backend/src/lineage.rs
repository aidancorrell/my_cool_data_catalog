use std::process::{Command, Output};
use std::path::Path;
use axum::{extract::Path as AxumPath, Json};
use serde::Serialize;
use log::{info, error};  // Add `log` crate for logging

#[derive(Serialize)]
pub struct Lineage {
    model: String,
    upstream: Vec<String>,
    downstream: Vec<String>,
}

/// Helper function to run a DBT command
fn run_dbt_command(dbt_project_dir: &str, args: &[&str]) -> Result<Output, String> {
    if !Path::new(dbt_project_dir).exists() {
        return Err(format!("DBT project directory does not exist: {}", dbt_project_dir));
    }

    // Log the command being run
    info!("Running DBT command: dbt {:?} in directory: {}", args, dbt_project_dir);

    Command::new("dbt")
        .args(args)
        .current_dir(dbt_project_dir)
        .output()
        .map_err(|e| format!("Failed to run dbt command: {}", e))
}

/// Parse the output of `dbt ls`
fn parse_dbt_ls_output(output: &str) -> Vec<String> {
    output
        .lines()
        .map(|line| line.trim().to_string())
        .filter(|line| !line.is_empty())
        .collect()
}

/// Endpoint to get lineage using DBT commands
pub async fn get_lineage(AxumPath(model_id): AxumPath<String>) -> Json<Lineage> {
    let dbt_project_dir = "/Users/aidancorrell/repos/my_cool_dbt_repo/my_cool_dbt_project"; // Replace with the actual path to your DBT project

    // Run `dbt ls` to list all models
    let dbt_ls_output = match run_dbt_command(dbt_project_dir, &["ls"]) {
        Ok(output) if output.status.success() => output.stdout,
        Ok(output) => {
            error!("Error running dbt ls: {}", String::from_utf8_lossy(&output.stderr));
            return Json(Lineage {
                model: model_id.clone(),
                upstream: vec![],
                downstream: vec![],
            });
        }
        Err(err) => {
            error!("Error running dbt command: {}", err);
            return Json(Lineage {
                model: model_id.clone(),
                upstream: vec![],
                downstream: vec![],
            });
        }
    };

    // Parse the `dbt ls` output
    let models = parse_dbt_ls_output(&String::from_utf8_lossy(&dbt_ls_output));

    // Get upstream and downstream models
    let upstream_models: Vec<String> = models
        .iter()
        .filter(|model| model_id != **model) // Example filter logic
        .cloned()
        .collect();

    let downstream_models: Vec<String> = models
        .iter()
        .filter(|model| model_id != **model) // Example filter logic
        .cloned()
        .collect();

    // Return lineage data
    Json(Lineage {
        model: model_id,
        upstream: upstream_models,
        downstream: downstream_models,
    })
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