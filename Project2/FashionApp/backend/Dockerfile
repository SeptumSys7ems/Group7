# Use official Node.js slim image
FROM node:20-slim

# Set working directory inside the container
WORKDIR /app

# Copy package.json files first for caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the app code
COPY . .

# Tell Cloud Run which port to listen on (injected by platform)
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
