# Use the official Rust image as the base image
FROM rust:1.72 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Cargo.toml and Cargo.lock files
COPY Cargo.toml Cargo.lock ./

# Build the dependencies and cache them
RUN cargo build --release
RUN rm src/*.rs || true

# Copy the source code into the container
COPY ./src ./src

# Compile the application in release mode
RUN cargo build --release

# Use a lightweight image to run the application
FROM debian:buster-slim

# Set the working directory in the runtime image
WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/target/release/data_catalog_backend /app/

# Expose the application port
EXPOSE 3000

# Run the compiled binary
CMD ["./data_catalog_backend"]