# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Stage 2: Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "run", "server"]
