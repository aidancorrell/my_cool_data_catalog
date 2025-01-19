# Use an official Rust image for building
FROM rust:1.72 as builder

# RUN pwd

# Set the working directory inside the container
WORKDIR /backend

# Print the working directory (debugging)
# RUN pwd

# Copy the source code and relevant files
COPY ./backend /backend

# Build the backend binary
RUN cargo build --release

# Use a lightweight runtime image for production
FROM debian:bullseye-slim

# Set the working directory for the runtime container
WORKDIR /backend

# Print the working directory (debugging)
# RUN pwd

# Copy the built binary and necessary files from the builder stage
COPY --from=builder /backend/target/release/data_catalog_backend /backend/data_catalog_backend
COPY ./backend/cache/refresh_cache.sh /backend/cache/refresh_cache.sh
COPY ./backend/cache /backend/cache
COPY ./backend/scripts /backend/scripts

# Make sure the shell script is executable
RUN chmod +x /backend/cache/refresh_cache.sh

# Install Python and other dependencies required for scripts
RUN apt-get update && \
    apt-get install -y python3 python3-pip cron && \
    pip3 install --no-cache-dir -r /backend/scripts/requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Schedule cache refresh in the cron job
RUN echo "* * * * * /backend/refresh_cache.sh >> /var/log/cron.log 2>&1" > /etc/cron.d/refresh_cache && \
    chmod 0644 /etc/cron.d/refresh_cache && \
    crontab /etc/cron.d/refresh_cache

# Expose the port that your backend server will run on
EXPOSE 3000

# Set the command to run the backend server and cron service
CMD [ "sh", "-c", "cron && ./data_catalog_backend" ]
