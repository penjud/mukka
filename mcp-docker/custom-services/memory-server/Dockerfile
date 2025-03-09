FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create data directory
RUN mkdir -p /data

# Set environment variables
ENV MEMORY_FILE_PATH=/data/memory.json
ENV AGENT_FILE_PATH=/data/agents.json
ENV PORT=8092

# Expose port
EXPOSE 8092

# Start the application
CMD ["node", "index.js"]
