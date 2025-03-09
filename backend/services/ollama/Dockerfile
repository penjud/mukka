FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 8082

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8082
ENV OLLAMA_HOST=http://ollama:11434
ENV JWT_SECRET=mcp-secret-key

# Start the application
CMD ["node", "index.js"]
