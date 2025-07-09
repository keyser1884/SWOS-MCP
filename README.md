# SWOS Database MCP Server ⚽

[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-compatible-blue.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A Model Context Protocol (MCP) server that provides Claude with access to the classic **Sensible World of Soccer** database. Find and analyze over 25,000 players and 1,500+ teams to build your perfect squad!

## 🚀 Quick Start

```bash
git clone https://github.com/keyser1884/SWOS-MCP.git
cd SWOS-MCP
npm install
npm start
```

See [SETUP.md](SETUP.md) for complete installation instructions.

## ✨ Features

- **25,328 players** from classic SWOS game
- **1,583 teams** across multiple leagues  
- **8 powerful search tools** for finding players by attributes, value, position, etc.
- **Full MCP integration** with Claude Desktop
- **SQLite database** with optimized queries
- **Input validation** and security best practices

## 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| `search_players` | Search players with comprehensive filters (name, team, position, attributes, etc.) |
| `get_top_players` | Get top players overall or by position |
| `get_team_info` | Get detailed team information including all players |
| `search_teams` | Search for teams by name, league, or rating |
| `get_league_stats` | Get statistics for all leagues |
| `find_value_players` | Find players with good value for money |
| `get_player_by_attributes` | Find players optimized for specific attributes |
| `find_cheapest_max_attribute_players` | Find cheapest players with maximum (7) attribute values |

*Each tool supports various filters and options - Claude will guide you through using them!*

## 💡 Example Queries

Ask Claude to help you find players:

```
"Find me the best strikers under 5 million"
"Show me fast Brazilian wingers with good finishing"
"Get the AC Milan squad with player details"
"Find defenders with maximum tackling and heading"
"Who are the best value players for a tight budget?"
```

## 📊 Database Stats

- **Total Players**: 25,328
- **Total Teams**: 1,583  
- **Leagues**: Multiple international leagues
- **Data Source**: Classic Sensible World of Soccer game

## 🔧 Player Attributes

| Attribute | Description |
|-----------|-------------|
| **PA** | Passing - accuracy of passes |
| **VE** | Velocity - running speed |
| **HE** | Heading - aerial ability |
| **TA** | Tackling - defensive skills |
| **CO** | Control - ball control |
| **SP** | Special - flair and skills |
| **FI** | Finishing - goal scoring |
| **GK** | Goalkeeping - keeper skills |

*All attributes range from 0-7, where 7 is maximum*

## 🏆 Star Ratings

- **5.0 stars**: World class (Pelé, Maradona level)
- **4.5 stars**: International stars  
- **4.0 stars**: Very good players
- **3.5 stars**: Good players
- **3.0 stars**: Average professionals
- **2.5 and below**: Lower league players

## 📁 Project Structure

```
swos-mcp-server/
├── swos-server.js        # Main MCP server
├── swos_database.db      # SQLite database (2.4MB)
├── package.json          # Dependencies
├── README.md            # This file
├── SETUP.md             # Installation guide
├── SECURITY.md          # Security information
└── LICENSE              # MIT license
```

## 🛡️ Security

This server is designed for safety:
- Read-only database access
- Input validation on all queries  
- No external network connections
- Parameterized SQL statements
- No sensitive data stored

See [SECURITY.md](SECURITY.md) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- [Report bugs](https://github.com/keyser1884/SWOS-MCP/issues)
- [Request features](https://github.com/keyser1884/SWOS-MCP/issues)
- [Setup help](SETUP.md)

---

**Ready to build your dream SWOS team! ⚽🏆**
