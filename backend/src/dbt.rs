use axum::Json;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use serde_yaml::Value as YamlValue;
use core::str;
use std::{fs, path::Path, process::{Command, Output}};
use log::{info, error};
use std::collections::HashMap;

// Updated Node struct
#[derive(Deserialize, Serialize, Clone, Debug)]
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

#[derive(Deserialize, Serialize, Clone, Debug)]
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

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Contract {
    pub alias_types: Option<bool>,
    pub enforced: Option<bool>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Docs {
    pub node_color: Option<String>,
    pub show: Option<bool>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Dependencies {
    pub macros: Option<Vec<String>>,
    pub nodes: Option<Vec<String>>,
}

/// Clean the output of DBT command to remove logs and retain only JSON.
pub fn clean_dbt_output(output: &[u8]) -> String {
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
pub fn run_dbt_command(dbt_project_dir: &str, args: &[&str]) -> Result<String, String> {
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
    let cache_path = "/backend/cache/enriched_manifest.json";

    match fs::read_to_string(cache_path) {
        Ok(enriched_manifest) => {
            let manifest_json: serde_json::Value = match serde_json::from_str(&enriched_manifest) {
                Ok(parsed) => parsed,
                Err(e) => {
                    error!("Failed to parse enriched manifest: {}", e);
                    return Json(vec![]);
                }
            };

            // Extract model names
            let model_names = manifest_json["nodes"]
                .as_object()
                .unwrap_or(&serde_json::Map::new())
                .iter()
                .filter_map(|(_, node)| {
                    if node["resource_type"] == "model" {
                        node["name"].as_str().map(String::from)
                    } else {
                        None
                    }
                })
                .collect::<Vec<_>>();

            Json(model_names)
        }
        Err(e) => {
            error!("Failed to read enriched manifest: {}", e);
            Json(vec![])
        }
    }
}


pub async fn get_model_docs(path_params: axum::extract::Path<String>) -> Json<Value> {
    let model_id = path_params.0;
    let cache_path = "/backend/cache/enriched_manifest.json";

    // Load the enriched manifest
    let manifest_data = fs::read_to_string(cache_path)
        .expect("Failed to read enriched_manifest.json. Ensure the cache is built.");
    let manifest_json: Value = serde_json::from_str(&manifest_data)
        .expect("Failed to parse enriched_manifest.json");

    // Extract nodes
    let nodes = manifest_json
        .get("nodes")
        .and_then(|n| n.as_object())
        .expect("Nodes not found in enriched_manifest.json");

    // Find the model
    if let Some(model) = nodes.values().find(|node| {
        node.get("unique_id")
            .and_then(|id| id.as_str())
            .map_or(false, |id| id.ends_with(&model_id))
    }) {
        // Extract general information
        let general = json!({
            "name": model.get("name").unwrap_or(&json!("Unknown")),
            "description": model.get("description").unwrap_or(&json!("No description available")),
            "materialized": model.get("config")
                .and_then(|c| c.get("materialized"))
                .unwrap_or(&json!("Unknown")),
            "schema": model.get("schema").unwrap_or(&json!("Unknown")),
            "database": model.get("database").unwrap_or(&json!("Unknown")),
            "primary_keys": model.get("primary_key").unwrap_or(&json!([])),
            "tags": model.get("tags").unwrap_or(&json!([]))
        });

        // Extract columns
        let columns = model
            .get("columns")
            .and_then(|c| c.as_object())
            .map(|cols| {
                cols.values()
                    .map(|col| {
                        json!({
                            "name": col.get("name").unwrap_or(&json!("Unknown")),
                            "type": col.get("type").unwrap_or(&json!("Unknown")),
                            "description": col.get("comment").unwrap_or(&json!("No description available"))
                        })
                    })
                    .collect::<Vec<Value>>()
            })
            .unwrap_or_else(|| vec![]);

        // Extract SQL-related information
        let sql = json!({
            "relation_name": model.get("relation_name").unwrap_or(&json!("Unknown")),
            "raw_code": model.get("raw_code").unwrap_or(&json!("No SQL code available"))
        });

        // Combine cleaned data
        let cleaned_model = json!({
            "general": general,
            "columns": columns,
            "sql": sql
        });

        return Json(cleaned_model);
    }

    panic!("Model not found in enriched_manifest.json: {}", model_id);
}



pub async fn get_model_details(path_params: axum::extract::Path<String>) -> Json<Value> {
    let model_id = path_params.0; // e.g., "my_first_dbt_model"
    let cache_path = "/backend/cache/enriched_manifest.json";

    // Load the enriched manifest
    let manifest_data = fs::read_to_string(cache_path)
        .expect("Failed to read enriched_manifest.json. Ensure the cache is built.");
    let manifest_json: Value = serde_json::from_str(&manifest_data)
        .expect("Failed to parse enriched_manifest.json");

    // Extract nodes
    let nodes = manifest_json
        .get("nodes")
        .and_then(|n| n.as_object())
        .expect("Nodes not found in enriched_manifest.json");

    // Locate the model by matching `unique_id` (may include prefixes)
    if let Some(model) = nodes.values().find(|node| {
        node.get("unique_id")
            .and_then(|id| id.as_str())
            .map_or(false, |id| id.ends_with(&model_id)) // Match suffix for flexibility
    }) {
        // Extract general information
        let general = json!({
            "name": model.get("name").unwrap_or(&json!("Unknown")),
            "description": model.get("description").unwrap_or(&json!("No description available")),
            "materialized": model.get("config")
                .and_then(|c| c.get("materialized"))
                .unwrap_or(&json!("Unknown")),
            "schema": model.get("schema").unwrap_or(&json!("Unknown")),
            "database": model.get("database").unwrap_or(&json!("Unknown")),
            "primary_keys": model.get("primary_key").unwrap_or(&json!([])),
            "tags": model.get("tags").unwrap_or(&json!([]))
        });

        // Extract columns
        let columns = model
            .get("columns")
            .and_then(|c| c.as_object())
            .map(|cols| {
                cols.values()
                    .map(|col| {
                        json!({
                            "name": col.get("name").unwrap_or(&json!("Unknown")),
                            "type": col.get("type").unwrap_or(&json!("Unknown")),
                            "description": col.get("comment").unwrap_or(&json!("No description available"))
                        })
                    })
                    .collect::<Vec<Value>>()
            })
            .unwrap_or_else(|| vec![]);

        // Extract SQL-related information
        let sql = json!({
            "relation_name": model.get("relation_name").unwrap_or(&json!("Unknown")),
            "raw_code": model.get("raw_code").unwrap_or(&json!("No SQL code available"))
        });

        // Combine cleaned data
        let cleaned_model = json!({
            "general": general,
            "columns": columns,
            "sql": sql
        });

        return Json(cleaned_model);
    }

    panic!("Model not found in enriched manifest: {}", model_id);
}


pub async fn get_manifest() -> String {
    let manifest_content = fs::read_to_string("/backend/cache/enriched_manifest.json")
        .unwrap_or_else(|_| "{}".to_string());
    manifest_content
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