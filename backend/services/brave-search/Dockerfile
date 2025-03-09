FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the server port
EXPOSE 8096

# Start the server
CMD ["node", "src/index.js"]