use axum::{routing::get, Router};
use crate::lineage::{get_lineage};
use crate::dbt::{get_models, get_model_details};

pub fn init_routes() -> Router {
    Router::new()
        .route("/models", get(get_models))
        .route("/models/:id", get(get_model_details))
        .route("/lineage/:id", get(get_lineage))  // this is for full lineage
        // .route("/lineage/:start/:end", get(get_lineage_between))  // New route for lineage between two models
}




// use axum::{
//     routing::{get},
//     Router,
// };

// use crate::dbt::{get_models, get_model_details};
// use crate::lineage::{get_lineage, get_all_lineages};
// // use crate::lineages::get_all_lineages;

// pub fn init_routes() -> Router {
//     Router::new()
//         .route("/models", get(get_models))
//         .route("/models/:id", get(get_model_details))
//         .route("/lineage/:id", get(get_lineage)) //route for a single model
//         .route("/lineage", get(get_all_lineages)) // New route for all models
// }