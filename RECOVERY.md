# MukkaAI Recovery Information

This document provides essential information for recovering the MukkaAI system from scratch in case of local environment loss.

## GitHub Repository

The complete MukkaAI system is backed up to GitHub at:
```
git@github.com:penjud/mukka.git
```

## Key Components

MukkaAI consists of the following key components, all containerized with Docker:

1. **Base Server** (Port 8090)
   - Core functionality and service coordination

2. **Memory Server** (Port 8094)
   - Knowledge graph and conversation history

3. **Filesystem Server** (Port 8095)
   - File browsing and documentation access
   - Mounted volume: `/home/mothership:/home/mothership`

4. **Brave Search Server** (Port 8096)
   - Web search integration

5. **Auth Server** (Port 8097)
   - User authentication and management
   - Connects to MongoDB

6. **Ollama Bridge** (Port 8082)
   - Integration with Ollama AI models
   - Connects to host Ollama service on port 11434

7. **Vue Dashboard** (Port 3002)
   - Primary user interface

## Environment Variables

The system is configured via the .env file. Critical variables include:
- PORT settings for each service
- API keys for external services
- JWT_SECRET for authentication
- Database connection settings

## Recovery Process

1. Clone the repository:
   ```bash
   git clone git@github.com:penjud/mukka.git
   cd mukka
   ```

2. Deploy the system:
   ```bash
   ./deploy.sh
   ```

3. For detailed recovery instructions, see:
   `/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/MukkaAI-Recovery-Guide.md`

## Documentation

All MukkaAI documentation is stored in:
```
/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/
```

## Troubleshooting Resources

- Docker troubleshooting:
  `/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/Docker-Troubleshooting-Guide.md`

- General troubleshooting:
  `/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/MukkaAI-Troubleshooting-Guide.md`

## Backup Process

Run the backup script to save all changes to GitHub:
```bash
./backup-to-github.sh
```

This script commits and pushes all changes to the GitHub repository, ensuring a complete backup of your system configuration.

## Important Note

The volume mount from the host to the container (`/home/mothership:/home/mothership`) is critical for the Filesystem Server to access documentation files. Always verify this mount point is correctly configured in docker-compose.yml after any system updates.
