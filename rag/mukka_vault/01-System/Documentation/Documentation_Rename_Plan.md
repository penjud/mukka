---
title: Documentation Rename Plan
created: 2025-03-09 20:30:00
modified: 2025-03-09 20:30:00
tags:
  - documentation
  - branding
  - mukkaai
  - rename
status: in-progress
---

# MCP to MukkaAI Documentation Rename Plan

This document outlines the plan to rename documentation files from MCP to MukkaAI branding.

## Files to Rename

| Current Filename | New Filename | Status |
|------------------|--------------|--------|
| `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MCP_System_Architecture.md` | `MukkaAI_System_Architecture.md` | Content Updated, Filename Pending |
| `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MCP_API_Reference.md` | `MukkaAI_API_Reference.md` | Content Update Needed, Filename Pending |
| `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MCP_API_Paths.md` | `MukkaAI_API_Paths.md` | Content Update Needed, Filename Pending |
| `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MCP_Interface_Strategy.md` | `MukkaAI_Interface_Strategy.md` | Content Update Needed, Filename Pending |
| `/home/mothership/mukka/rag/mukka_vault/01-System/MCP Deployment Summary.md` | `MukkaAI Deployment Summary.md` | Content Update Needed, Filename Pending |
| `/home/mothership/mukka/rag/mukka_vault/01-System/MCP_Deployment_Guide.md` | `MukkaAI_Deployment_Guide.md` | Content Update Needed, Filename Pending |
| `/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/Docker-Troubleshooting-Guide.md` | No change needed | Content Update Needed (References to MCP) |

## Rename Process

For each file:
1. Create a backup of the original file
2. Update all content to replace "MCP" with "MukkaAI" (while preserving context)
3. Rename the file using the proposed new filename
4. Update any internal references or links within the document
5. Search for and update references to this file in other documentation

## Special Considerations

- When updating content, we need to be careful about references to Docker container names, which still use "MCP" in their names despite the rebranding
- All Docker-related documentation should clarify that container names still use "MCP" naming convention
- Some environment variables still use "MCP" prefix; these should be documented as-is but with an explanation of the legacy naming

## Content Update Guidelines

When updating content:
1. Replace "MCP Server" with "MukkaAI Service"
2. Replace "MCP" with "MukkaAI" unless referring to:
   - Docker container names (e.g., `mukka-mcp-auth-server`)
   - Environment variable names (e.g., `MCP_AUTH_TOKEN`)
   - Service names in docker-compose.yml (e.g., `mcp-auth-server`)
3. Add a note explaining the transition from MCP to MukkaAI in each document
4. Update architecture diagrams if present
5. Ensure version history is maintained

## References

- Original MCP Deployment Summary: `/home/mothership/mukka/rag/mukka_vault/01-System/MCP Deployment Summary.md`
- Branding update requirements: `/home/mothership/mukka/rag/mukka_vault/01-System/Handovers/2025-03-09_16-49_Profile_Enhancement_Completion.md`
- Documentation Update Handover: `/home/mothership/mukka/rag/mukka_vault/01-System/Handovers/2025-03-09_19-30_Documentation_Update_Handover.md`
