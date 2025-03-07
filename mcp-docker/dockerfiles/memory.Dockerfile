FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN npm install @modelcontextprotocol/server-memory -g

# Set environment variables
ENV NODE_ENV=production

# Default command
CMD ["npx", "@modelcontextprotocol/server-memory"]
