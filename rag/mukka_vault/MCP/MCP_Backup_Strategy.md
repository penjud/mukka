# MCP Backup Strategy

This document outlines the backup strategy for the MCP (Model Context Protocol) system.

## Backup Components

The following components are included in backups:

1. **Configuration Files**
   - Docker Compose configuration
   - Environment variables (.env)
   - Service configurations

2. **Persistent Data**
   - Memory MCP knowledge graph
   - Conversation history
   - User settings and preferences

3. **Documentation**
   - Obsidian vault MCP documentation
   - Readme files
   - Implementation notes

## Backup Methods

### Local Backups

The system includes a backup script (`backup-mcp.sh`) that creates timestamped archives of all critical data:

```bash
./backup-mcp.sh
```

This creates a compressed archive in `/home/mothership/mukka/backups` containing all essential data.

### GitHub Backups

The backup script also supports pushing to GitHub for off-site backup:

1. Creates a new branch named `backup-YYYY-MM-DD_HH-MM-SS`
2. Commits all changes to this branch
3. Pushes the branch to GitHub remote repository

### Automated Backups

Configure cron to run backups automatically:

```bash
# Edit crontab
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /home/mothership/mukka/backup-mcp.sh
```

## Restoration Procedure

To restore from a backup:

1. **Local Archive Restoration**:
   ```bash
   # Extract backup to temporary location
   mkdir -p /tmp/mcp-restore
   tar -xzf /home/mothership/mukka/backups/mcp_backup_YYYY-MM-DD_HH-MM-SS.tar.gz -C /tmp/mcp-restore
   
   # Copy files back to project directory
   cp -r /tmp/mcp-restore/* /home/mothership/mukka/
   ```

2. **GitHub Restoration**:
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/mukka.git
   
   # Checkout backup branch
   git checkout backup-YYYY-MM-DD_HH-MM-SS
   ```

## Emergency Recovery

In case of complete system failure:

1. Reinstall Docker and Docker Compose
2. Restore from latest backup
3. Run `./deploy.sh` to rebuild containers

## Backup Schedule

- **Daily**: Local compressed archives
- **Weekly**: GitHub branch backups
- **Monthly**: Full system backup including Ollama models
