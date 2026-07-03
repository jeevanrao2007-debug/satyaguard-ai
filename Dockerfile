# Use the official Node.js 20 LTS slim image as the base
FROM node:20-slim

# Create and set the working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production and development dependencies (needed for Vite and esbuild build step)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the frontend assets and bundle the backend server code
RUN npm run build

# Prune development dependencies to keep the image lightweight
RUN npm prune --production

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Configure production environment
ENV NODE_ENV=production
ENV PORT=8080

# Start the bundled Express server
CMD ["node", "dist/server.cjs"]
