# my cool data catalog

**An open-source tool for visualizing and exploring dbt model lineage and metadata**

---

## Features
- Interactive lineage graphs for dbt models.
- Metadata exploration.
- Modern and responsive UI built with React.
- Dockerized for easy setup.

---

## Prerequisites
Before starting, ensure you have:
- **Docker** (v20.x or later)
- **Docker Compose** (v2.x or later)
- Your local **dbt project** folder path (used for backend configuration).

---

## Setup Instructions

### 1. Update the `docker-compose.yml`
- Locate the `backend` service in the `docker-compose.yml` file.
- Update the `dbt_project` volume path to point to your local dbt project directory.

For example:
```yaml
backend:
  build:
    context: ./backend
  ports:
    - "3000:3000"
  volumes:
    - ./backend/cache:/backend/cache
    - ./backend/scripts:/backend/scripts
    - /absolute/path/to/your/dbt_project:/backend/dbt_project # Update this line
  environment:
    - RUST_LOG=info
```

### 1. Run the App with Docker
Build and start the containers:

```bash
docker-compose up --build
```

Access the application:
```
Frontend: Open your browser and go to http://localhost:8080.
Backend API: Access it at http://localhost:3000.
```

### 3. Stopping the App
To stop the containers, run:

```bash
docker-compose down
```

### Troubleshooting
Backend Errors: Ensure your dbt project path is correctly mapped in the docker-compose.yml file.
Port Conflicts: If another service is using port 8080 or 3000, update the ports mapping in docker-compose.yml.
Example:

```yaml
frontend:
  ports:
    - "8081:80"

backend:
  ports:
    - "3001:3000"
```

### Rebuild Containers After Changes: If you make changes to the code or configuration, rebuild the containers:
```bash
docker-compose up --build
```

### Contributing
Contributions are welcome! Fork the repository, make your changes, and open a pull request.