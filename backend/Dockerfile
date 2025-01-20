# Backend Dockerfile

# Use the latest Rust version
FROM rust:1.83-slim as builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl build-essential libssl-dev pkg-config python3 python3-pip

# Set the working directory
WORKDIR /backend

# Copy the Cargo files and fetch dependencies
COPY Cargo.toml Cargo.lock ./
RUN mkdir -p src && echo "fn main() {}" > src/main.rs
RUN cargo fetch

# Copy the source code and build the release binary
COPY . .
RUN cargo build --release

# Runtime stage
FROM python:3.9-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libssl3 cron && rm -rf /var/lib/apt/lists/*

# Install dbt
RUN pip install --no-cache-dir dbt-core dbt-duckdb # Adjust dbt adapter as needed

# Set working directory
WORKDIR /backend

# Copy compiled binary from the builder stage
COPY --from=builder /backend/target/release/data_catalog_backend /backend/data_catalog_backend

# Copy cache and scripts
COPY ./cache /backend/cache
COPY ./scripts /backend/scripts

# Copy profiles.yml to the appropriate location
COPY ./profiles.yml /root/.dbt/profiles.yml

# Make the cache refresh script executable
COPY ./cache/refresh_cache.sh /backend/refresh_cache.sh
RUN chmod +x /backend/refresh_cache.sh

# Configure cron job
RUN echo "*/15 * * * * /backend/refresh_cache.sh >> /var/log/cron.log 2>&1" > /etc/cron.d/refresh_cache
RUN chmod 0644 /etc/cron.d/refresh_cache
RUN crontab /etc/cron.d/refresh_cache

# Start cron and backend service together
CMD ["/bin/bash", "-c", "service cron start && /backend/data_catalog_backend"]

# Expose the backend service port
EXPOSE 3000


# # Backend Dockerfile

# # Use the latest Rust version
# FROM rust:1.83-slim as builder

# # Install dependencies
# RUN apt-get update && apt-get install -y curl build-essential libssl-dev pkg-config

# # Set the working directory
# WORKDIR /backend

# # Copy the Cargo files and fetch dependencies
# COPY Cargo.toml Cargo.lock ./
# RUN mkdir -p src && echo "fn main() {}" > src/main.rs
# RUN cargo fetch

# # Copy the source code and build the release binary
# COPY . .
# RUN cargo build --release

# # Runtime stage
# FROM debian:buster-slim

# # Install runtime dependencies
# RUN apt-get update && apt-get install -y libssl1.1 cron && rm -rf /var/lib/apt/lists/*

# # Set working directory
# WORKDIR /backend

# # Copy compiled binary from the builder stage
# COPY --from=builder /backend/target/release/data_catalog_backend /backend/data_catalog_backend

# # Copy cache and scripts
# COPY ./cache /backend/cache
# COPY ./scripts /backend/scripts

# # Make the cache refresh script executable
# COPY ./cache/refresh_cache.sh /backend/refresh_cache.sh
# RUN chmod +x /backend/refresh_cache.sh

# # Configure cron job
# RUN echo "*/15 * * * * /backend/refresh_cache.sh >> /var/log/cron.log 2>&1" > /etc/cron.d/refresh_cache
# RUN chmod 0644 /etc/cron.d/refresh_cache
# RUN crontab /etc/cron.d/refresh_cache

# # Start cron and backend service together
# CMD ["/bin/bash", "-c", "service cron start && /backend/data_catalog_backend"]

# # Expose the backend service port
# EXPOSE 3000
