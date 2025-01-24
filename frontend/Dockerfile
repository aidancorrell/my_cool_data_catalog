# Frontend Dockerfile

# for local dev:
# FROM node:18 as builder
# WORKDIR /frontend
# COPY package.json package-lock.json ./
# RUN npm install
# COPY . .
# EXPOSE 3001
# CMD ["npm", "start"]

# For production:
# Use Node.js for building the frontend
FROM node:18 as builder

# Set working directory
WORKDIR /frontend

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy frontend source code and build the app
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy build files to nginx HTML directory
COPY --from=builder /frontend/build /usr/share/nginx/html

# Copy custom nginx configuration if any
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose frontend port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
