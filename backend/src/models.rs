use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::clone::Clone;

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