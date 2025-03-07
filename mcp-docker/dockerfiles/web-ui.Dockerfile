FROM golang:1.21-alpine AS build

WORKDIR /app

# Clone the repository and build
RUN apk add --no-cache git && \
    git clone --depth=1 https://github.com/penjud/mcp-web-ui.git . && \
    go mod download && \
    cd cmd/server && \
    go build -o ../../mcpwebui .

# Final stage
FROM alpine:latest

WORKDIR /app

# Copy binary and static files
COPY --from=build /app/mcpwebui /app/
COPY --from=build /app/static /app/static
COPY --from=build /app/templates /app/templates

# Default command
CMD ["/app/mcpwebui"]
