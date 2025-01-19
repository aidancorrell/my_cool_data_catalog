# Stage 1: Build the React app
FROM node:18-alpine as builder

# Set working directory inside the container
WORKDIR /frontend

# Copy package.json and package-lock.json to install dependencies
COPY ./frontend/package.json ./frontend/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY ./frontend ./

# Build the production version of the React app
RUN npm run build

# Stage 2: Serve the app using NGINX
FROM nginx:1.25-alpine

# Copy the built app from the builder stage to the nginx directory
COPY --from=builder /frontend/build /usr/share/nginx/html

# Remove default NGINX configuration and replace with custom one
RUN rm /etc/nginx/conf.d/default.conf
COPY ./frontend/nginx.conf /etc/nginx/conf.d

# Expose the port NGINX is running on
EXPOSE 3001

# Start NGINX when the container runs
CMD ["nginx", "-g", "daemon off;"]
