use axum::{routing::get, Router};
use crate::lineage::get_lineage;
use crate::dbt::{get_models, get_model_details, get_model_docs, get_manifest};

pub fn init_routes() -> Router {
    Router::new()
        .route("/models", get(get_models))
        .route("/models/:id", get(get_model_details))
        .route("/model_docs/:id", get(get_model_docs))
        .route("/lineage/:start/:end", get(get_lineage))
        .route("/manifest", get(get_manifest))
}