FROM node:18-alpine

WORKDIR /app

# Install dependencies
RUN npm install @modelcontextprotocol/server-filesystem -g

# Set environment variables
ENV NODE_ENV=production

# Default command
ENTRYPOINT ["npx", "@modelcontextprotocol/server-filesystem"]
