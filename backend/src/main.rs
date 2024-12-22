mod routes;
mod dbt;
mod models;
mod lineage;
mod utils;

use axum::{Router, Server};
use std::net::SocketAddr;
use tower_http::cors::{CorsLayer, Any};
use env_logger;


#[tokio::main]
async fn main() {
    env_logger::init();


    // Initialize routes
    let app = Router::new()
        .merge(routes::init_routes())
        // Add CORS middleware
        .layer(
            CorsLayer::new()
                .allow_origin(Any) // Allow any origin for development; restrict in production
                .allow_methods(Any) // Allow any HTTP method
                .allow_headers(Any), // Allow any headers
        );

    // Define server address
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Server running at http://{}", addr);

    // Run server
    Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}