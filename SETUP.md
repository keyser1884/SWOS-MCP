# Installation & Setup Guide

## Prerequisites

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **Claude Desktop**: Download from [claude.ai](https://claude.ai/download)

## Quick Setup

### 1. Clone and Install
```bash
git clone https://github.com/keyser1884/SWOS-MCP.git
cd SWOS-MCP
npm install
```

### 2. Test the Server
```bash
npm start
```
You should see: `[SWOS] ✓ Server connected successfully! Waiting for requests...`

### 3. Configure Claude Desktop

**Windows**: Edit `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this server configuration:

```json
{
  "mcpServers": {
    "swos-database": {
      "command": "node",
      "args": ["C:\\path\\to\\SWOS-MCP\\swos-server.js"],
      "cwd": "C:\\path\\to\\SWOS-MCP"
    }
  }
}
```

**Important**: Replace `C:\\path\\to\\SWOS-MCP` with your actual installation path.

### 4. Restart Claude Desktop

Close and reopen Claude Desktop completely. The SWOS tools should now be available.

## Verification

Ask Claude: **"What SWOS tools do you have available?"**

You should see 8 available tools for searching players and teams.

## Example Queries

- "Find me the best strikers under 5 million"
- "Show me fast Brazilian wingers with good finishing"  
- "Get the AC Milan squad with player details"
- "Find defenders with maximum tackling and heading"

## Troubleshooting

### Server Not Starting
- Check Node.js version: `node --version` (should be 18+)
- Try: `npm install` again
- Check for port conflicts

### Claude Not Seeing Tools
- Verify config file path and syntax
- Ensure paths in config use double backslashes on Windows
- Restart Claude Desktop completely
- Check Claude Desktop logs

### Database Issues
- Ensure `swos_database.db` exists in project folder
- File should be ~2.4MB with 25,328 players

## Support

For issues:
1. Check the [Issues](https://github.com/keyser1884/SWOS-MCP/issues) page
2. Create a new issue with:
   - Your OS and Node.js version
   - Error messages
   - Config file contents (remove sensitive info)

---
**Ready to find your perfect SWOS team! ⚽**