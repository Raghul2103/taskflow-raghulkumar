# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the source code and build
COPY . .
RUN npm run build

# Stage 2: Production stage
FROM nginx:stable-alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
