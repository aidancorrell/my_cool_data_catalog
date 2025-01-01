use axum::Json;
use serde::{Deserialize, Serialize};
use core::str;
use std::{fs, path::Path, process::{Command, Output}};
use log::{info, error};
use std::collections::HashMap;

// Updated Node struct
#[derive(Deserialize, Serialize, Clone)]
pub struct Node {
    pub alias: String,
    pub config: Config,
    pub depends_on: Dependencies,
    pub name: String,
    pub original_file_path: String,
    pub package_name: String,
    pub resource_type: String,
    pub tags: Vec<String>,
    pub unique_id: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Config {
    pub access: Option<String>,
    pub alias: Option<String>,
    pub batch_size: Option<u32>,
    pub begin: Option<String>,
    pub column_types: Option<HashMap<String, String>>,
    pub concurrent_batches: Option<u32>,
    pub contract: Option<Contract>,
    pub database: Option<String>,
    pub docs: Option<Docs>,
    pub enabled: Option<bool>,
    pub event_time: Option<String>,
    pub full_refresh: Option<bool>,
    pub grants: Option<HashMap<String, Vec<String>>>,
    pub group: Option<String>,
    pub incremental_strategy: Option<String>,
    pub lookback: Option<u32>,
    pub materialized: Option<String>,
    pub meta: Option<HashMap<String, String>>,
    pub on_configuration_change: Option<String>,
    pub on_schema_change: Option<String>,
    pub packages: Option<Vec<String>>,
    pub persist_docs: Option<HashMap<String, String>>,
    pub post_hook: Option<Vec<String>>,
    pub pre_hook: Option<Vec<String>>,
    pub quoting: Option<HashMap<String, bool>>,
    pub schema: Option<String>,
    pub tags: Option<Vec<String>>,
    pub unique_key: Option<String>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Contract {
    pub alias_types: Option<bool>,
    pub enforced: Option<bool>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Docs {
    pub node_color: Option<String>,
    pub show: Option<bool>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Dependencies {
    pub macros: Option<Vec<String>>,
    pub nodes: Option<Vec<String>>,
}

/// Clean the output of DBT command to remove logs and retain only JSON.
fn clean_dbt_output(output: &[u8]) -> String {
    let stdout = str::from_utf8(output).unwrap_or_default();

    // Keep only lines starting or ending with JSON markers
    let cleaned: Vec<&str> = stdout
        .lines()
        .filter(|line| {
            line.trim_start().starts_with("{")
                || line.trim_start().starts_with("[")
                || line.trim_start().ends_with("}")
                || line.trim_start().ends_with("]")
        })
        .collect();

    // Join lines; if multiple, assume it's a valid array
    if cleaned.len() > 1 {
        format!("[{}]", cleaned.join(","))
    } else {
        cleaned.join("\n")
    }
}


/// Helper function to run a DBT command and clean its output.
fn run_dbt_command(dbt_project_dir: &str, args: &[&str]) -> Result<String, String> {
    // Ensure the directory exists
    if !std::path::Path::new(dbt_project_dir).exists() {
        return Err(format!("DBT project directory does not exist: {}", dbt_project_dir));
    }

    // Log the DBT command for debugging
    let command_str = format!(
        "dbt {} (in directory: {})",
        args.join(" "),
        dbt_project_dir
    );
    info!("Running DBT command: {}", command_str);

    // Run the command
    let output = Command::new("dbt")
        .args(args)
        .current_dir(dbt_project_dir)
        .output()
        .map_err(|e| format!("Failed to run dbt command: {}", e))?;

    // Log raw stdout and stderr
    let stdout_raw = String::from_utf8_lossy(&output.stdout);
    let stderr_raw = String::from_utf8_lossy(&output.stderr);
    info!("DBT command stdout (raw): {}", stdout_raw);
    info!("DBT command stderr: {}", stderr_raw);

    // Check for successful execution
    if !output.status.success() {
        return Err(format!(
            "DBT command failed with status: {}\nError: {}",
            output.status, stderr_raw
        ));
    }

    // Clean the stdout to extract valid JSON lines
    let cleaned_output = clean_dbt_output(&output.stdout);
    info!("DBT command stdout (cleaned): {}", cleaned_output);

    Ok(cleaned_output)
}


pub async fn get_models() -> Json<Vec<String>> {
    let dbt_project_dir = "/Users/aidancorrell/repos/my_cool_dbt_repo/my_cool_dbt_project";
    let args = &["ls", "--output", "json"];

    match run_dbt_command(dbt_project_dir, args) {
        Ok(cleaned_output) => {
            let models: Vec<serde_json::Value> = match serde_json::from_str(&cleaned_output) {
                Ok(parsed) => parsed,
                Err(e) => {
                    error!("Failed to parse DBT JSON output: {}", e);
                    return Json(vec![]);
                }
            };

            // Extract model names from either an object or array
            let model_names = models
                .into_iter()
                .filter_map(|model| model.get("name").and_then(|name| name.as_str()).map(String::from))
                .collect::<Vec<_>>();

            Json(model_names)
        }
        Err(err) => {
            error!("Failed to fetch DBT models: {}", err);
            Json(vec![])
        }
    }
}

pub async fn get_model_details(path_params: axum::extract::Path<String>) -> Json<Node> {
    let model_id = path_params.0;
    let dbt_project_dir = "/Users/aidancorrell/repos/my_cool_dbt_repo/my_cool_dbt_project";
    let args = &["ls", "--output", "json", "--select", &model_id];

    match run_dbt_command(dbt_project_dir, args) {
        Ok(cleaned_output) => {
            // Parse the JSON output
            let models: Vec<serde_json::Value> = match serde_json::from_str(&cleaned_output) {
                Ok(parsed) => parsed,
                Err(e) => {
                    error!("Failed to parse DBT JSON output: {}", e);
                    panic!("Invalid DBT JSON structure");
                }
            };

            // Filter models by resource_type and name
            let matching_model = models.into_iter().find(|model| {
                model.get("resource_type")
                    .and_then(|rt| rt.as_str())
                    .map_or(false, |rt| rt == "model")
                    && model.get("name")
                        .and_then(|name| name.as_str())
                        .map_or(false, |name| name == model_id)
            });
            
            if let Some(details) = matching_model {
                info!("Matching model JSON: {}", details);
                let node: Node = match serde_json::from_value(details.clone()) {
                    Ok(parsed_node) => parsed_node,
                    Err(e) => {
                        error!("Failed to deserialize model details for {}: {}", model_id, e);
                        panic!("Invalid DBT JSON structure for model: {}", model_id);
                    }
                };
                return Json(node);
            }
             else {
                error!("Model not found: {}", model_id);
                panic!("Model not found");
            }
        }
        Err(err) => {
            error!("Failed to fetch model details: {}", err);
            panic!("Failed to fetch model details");
        }
    }
}








// use axum::Json;
// use serde::{Deserialize, Serialize};
// use std::{collections::HashMap, fs};

// // Ensure this derives Clone
// #[derive(Deserialize, Serialize, Clone)]
// pub struct DbtManifest {
//     pub nodes: HashMap<String, Node>,
// }

// // Ensure this derives Clone
// #[derive(Deserialize, Serialize, Clone)]
// pub struct Node {
//     pub name: String,
//     pub description: String,
//     pub depends_on: Dependencies,
// }

// // Ensure this derives Clone
// #[derive(Deserialize, Serialize, Clone)]
// pub struct Dependencies {
//     pub nodes: Vec<String>,
// }

// pub async fn get_models() -> Json<Vec<String>> {
//     let manifest = load_manifest("./src/data/manifest.json").unwrap();
//     let models: Vec<String> = manifest.nodes.keys().cloned().collect();
//     Json(models)
// }

// pub async fn get_model_details(path_params: axum::extract::Path<String>) -> Json<Node> {
//     let model_id = path_params.0;
//     let manifest = load_manifest("./src/data/manifest.json").unwrap();

//     // Explicit dereference and clone
//     if let Some(model) = manifest.nodes.get(&model_id) {
//         Json((*model).clone())
//     } else {
//         panic!("Model not found");
//     }
// }

// pub fn load_manifest(file_path: &str) -> Result<DbtManifest, std::io::Error> {
//     println!("Attempting to load manifest from: {}", file_path); // Log file path
//     let data = fs::read_to_string(file_path)?;
//     let manifest: DbtManifest = serde_json::from_str(&data)?;
//     Ok(manifest)
// }