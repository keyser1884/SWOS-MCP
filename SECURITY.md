# Security Guidelines

## Database Security
- The SQLite database (`swos_database.db`) contains only game data, no sensitive information
- All database queries use parameterized statements to prevent SQL injection
- No user authentication required (read-only game database)

## Input Validation
- Attribute values validated against SWOS ranges (0-7)
- SQL parameters properly escaped
- Query limits enforced to prevent resource exhaustion

## Safe for Public Use
- No API keys or secrets stored
- No external network connections (local database only)
- No file system access beyond project directory
- No code execution from user input

## Recommended Security Practices

### For Development
- Keep dependencies updated: `npm audit fix`
- Use `.gitignore` to exclude sensitive files
- Don't commit `node_modules/` or logs

### For Production Deployment
- Run with limited user privileges
- Consider Docker containerization
- Monitor for unusual query patterns
- Set appropriate file permissions

## Vulnerability Reporting
Report security issues privately to: [your-email@domain.com]

## Regular Security Maintenance
- Update MCP SDK: `npm update @modelcontextprotocol/sdk`
- Update SQLite: `npm update sqlite3`
- Review dependencies: `npm audit`