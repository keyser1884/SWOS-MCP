// --- SWOS Database MCP Server ---
//
// This server provides access to the Sensible World of Soccer database,
// allowing Claude to help find good players with specific attributes.
//
// -----------------------------------------------------------------------------

console.error('[SWOS] Server starting...');

// --- Core Imports ---
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// --- Database Imports ---
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Database Helper ---
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, 'swos_database.db');
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
    });

    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
      db.close();
    });
  });
}

// --- Tool Definitions ---
const tools = [
  {
    name: 'search_players',
    description: 'Search for players with various filters including name, team, position, nationality, minimum stars, and attributes',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Player name (partial match)' },
        team: { type: 'string', description: 'Team name (partial match)' },
        position: { type: 'string', description: 'Position (G, D, LB, RB, M, LW, RW, A)' },
        nationality: { type: 'string', description: '3-letter nationality code (e.g., BRA, ENG, ITA)' },
        min_stars: { type: 'number', description: 'Minimum star rating (0.0-5.0)' },
        max_stars: { type: 'number', description: 'Maximum star rating (0.0-5.0)' },
        min_value: { type: 'integer', description: 'Minimum transfer value' },
        max_value: { type: 'integer', description: 'Maximum transfer value' },
        min_pa: { type: 'integer', description: 'Minimum passing skill (0-7, where 7 is maximum)' },
        min_ve: { type: 'integer', description: 'Minimum shot velocity/power (0-7, where 7 is maximum)' },
        min_he: { type: 'integer', description: 'Minimum heading skill (0-7, where 7 is maximum)' },
        min_ta: { type: 'integer', description: 'Minimum tackling skill (0-7, where 7 is maximum)' },
        min_co: { type: 'integer', description: 'Minimum control skill (0-7, where 7 is maximum)' },
        min_sp: { type: 'integer', description: 'Minimum speed/pace (0-7, where 7 is maximum)' },
        min_fi: { type: 'integer', description: 'Minimum finishing skill (0-7, where 7 is maximum)' },
        limit: { type: 'integer', description: 'Maximum number of results', default: 50 }
      }
    }
  },
  {
    name: 'get_top_players',
    description: 'Get top players overall or by position, sorted by star rating',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: 'Number of players to return', default: 20 },
        position: { type: 'string', description: 'Filter by position (G, D, LB, RB, M, LW, RW, A)' }
      }
    }
  },
  {
    name: 'get_team_info',
    description: 'Get detailed information about a team including all players',
    inputSchema: {
      type: 'object',
      properties: {
        team_name: { type: 'string', description: 'Team name (partial match allowed)' }
      },
      required: ['team_name']
    }
  },
  {
    name: 'search_teams',
    description: 'Search for teams with filters',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Team name (partial match)' },
        league: { type: 'string', description: 'League name (partial match)' },
        min_stars: { type: 'number', description: 'Minimum team star rating' }
      }
    }
  },
  {
    name: 'get_league_stats',
    description: 'Get statistics for all leagues including player counts and ratings',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'find_value_players',
    description: 'Find players with good value for money - high ratings relative to their transfer cost',
    inputSchema: {
      type: 'object',
      properties: {
        max_budget: { type: 'integer', description: 'Maximum transfer budget' },
        min_stars: { type: 'number', description: 'Minimum star rating', default: 3.0 },
        position: { type: 'string', description: 'Filter by position' },
        limit: { type: 'integer', description: 'Number of results', default: 20 }
      }
    }
  },
  {
    name: 'get_player_by_attributes',
    description: 'Find players with specific attribute combinations for tactical purposes',
    inputSchema: {
      type: 'object',
      properties: {
        attribute_focus: { type: 'string', description: 'Primary attribute to optimize for (PA=passing, VE=shot velocity, HE=heading, TA=tackling, CO=control, SP=speed, FI=finishing)' },
        min_primary: { type: 'integer', description: 'Minimum value for primary attribute' },
        secondary_attributes: { type: 'object', description: 'Secondary attribute minimums as key-value pairs' },
        position: { type: 'string', description: 'Player position' },
        limit: { type: 'integer', description: 'Number of results', default: 20 }
      },
      required: ['attribute_focus']
    }
  },
  {
    name: 'find_cheapest_max_attribute_players',
    description: 'Find the cheapest players with maximum (7) values in specific attributes. Perfect for questions like "cheapest player with full speed and control"',
    inputSchema: {
      type: 'object',
      properties: {
        required_max_attributes: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Array of attributes that must be maximum (7). Valid: PA=passing, VE=shot velocity, HE=heading, TA=tackling, CO=control, SP=speed, FI=finishing. Example: ["SP", "CO"] for speed and control'
        },
        position: { type: 'string', description: 'Filter by position (G, D, LB, RB, M, LW, RW, A)' },
        min_stars: { type: 'number', description: 'Minimum star rating (0.0-5.0)' },
        max_stars: { type: 'number', description: 'Maximum star rating (0.0-5.0)' },
        league: { type: 'string', description: 'Filter by league name (partial match)' },
        nationality: { type: 'string', description: '3-letter nationality code (e.g., BRA, ENG, ITA)' },
        limit: { type: 'integer', description: 'Number of results', default: 20 }
      },
      required: ['required_max_attributes']
    }
  }
];

// --- Server Setup ---
const server = new Server(
  {
    name: 'swos-database',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// --- Request Handlers ---

// ListTools Handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error(`[SWOS] Received ListTools request. Responding with ${tools.length} tools.`);
  return { tools };
});

// CallTool Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`[SWOS] Received CallTool request for "${name}" with args:`, JSON.stringify(args));

  try {
    let result;
    switch (name) {
      case 'search_players':
        result = await searchPlayers(args || {});
        break;
      case 'get_top_players':
        result = await getTopPlayers(args || {});
        break;
      case 'get_team_info':
        result = await getTeamInfo(args || {});
        break;
      case 'search_teams':
        result = await searchTeams(args || {});
        break;
      case 'get_league_stats':
        result = await getLeagueStats(args || {});
        break;
      case 'find_value_players':
        result = await findValuePlayers(args || {});
        break;
      case 'get_player_by_attributes':
        result = await getPlayerByAttributes(args || {});
        break;
      case 'find_cheapest_max_attribute_players':
        result = await findCheapestMaxAttributePlayers(args || {});
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    console.error(`[SWOS] Tool "${name}" executed successfully.`);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };

  } catch (error) {
    console.error(`[SWOS] ERROR executing tool "${name}":`, error.message);
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool '${name}': ${error.message}`,
        },
      ],
    };
  }
});

// --- Tool Implementation Functions ---

async function searchPlayers(args) {
  // Validate attribute ranges (SWOS attributes are 0-7)
  const attributes = ['pa', 've', 'he', 'ta', 'co', 'sp', 'fi'];
  for (const attr of attributes) {
    const minKey = `min_${attr}`;
    if (args[minKey] !== undefined) {
      if (args[minKey] < 0 || args[minKey] > 7) {
        throw new Error(`${minKey} must be between 0 and 7 (SWOS attribute range)`);
      }
    }
  }

  let query = `
    SELECT id, name, pos, nat, team, league, stars, value, TOT, PA, VE, HE, TA, CO, SP, FI, GK
    FROM players WHERE 1=1
  `;
  const params = [];

  if (args.name) {
    query += ' AND name LIKE ?';
    params.push(`%${args.name.toUpperCase()}%`);
  }
  if (args.team) {
    query += ' AND team LIKE ?';
    params.push(`%${args.team.toUpperCase()}%`);
  }
  if (args.position) {
    query += ' AND pos = ?';
    params.push(args.position.toUpperCase());
  }
  if (args.nationality) {
    query += ' AND nat = ?';
    params.push(args.nationality.toUpperCase());
  }
  if (args.min_stars !== undefined) {
    query += ' AND stars >= ?';
    params.push(args.min_stars);
  }
  if (args.max_stars !== undefined) {
    query += ' AND stars <= ?';
    params.push(args.max_stars);
  }
  if (args.min_value !== undefined) {
    query += ' AND value >= ?';
    params.push(args.min_value);
  }
  if (args.max_value !== undefined) {
    query += ' AND value <= ?';
    params.push(args.max_value);
  }

  // Attribute filters
  const attributeColumns = ['PA', 'VE', 'HE', 'TA', 'CO', 'SP', 'FI'];
  for (const attr of attributeColumns) {
    const minKey = `min_${attr.toLowerCase()}`;
    if (args[minKey] !== undefined) {
      query += ` AND ${attr} >= ?`;
      params.push(args[minKey]);
    }
  }

  const limit = args.limit || 50;
  query += ' ORDER BY stars DESC, TOT DESC LIMIT ?';
  params.push(limit);

  return await runQuery(query, params);
}

async function getTopPlayers(args) {
  let query = `
    SELECT name, pos, nat, team, league, stars, value, TOT, PA, VE, HE, TA, CO, SP, FI, GK
    FROM players
  `;
  const params = [];

  if (args.position) {
    query += ' WHERE pos = ?';
    params.push(args.position.toUpperCase());
  }

  const limit = args.limit || 20;
  query += ' ORDER BY stars DESC, TOT DESC LIMIT ?';
  params.push(limit);

  return await runQuery(query, params);
}

async function getTeamInfo(args) {
  if (!args.team_name) {
    throw new Error('team_name is required');
  }

  // Get team stats
  const teams = await runQuery(
    'SELECT * FROM teams WHERE team LIKE ?',
    [`%${args.team_name.toUpperCase()}%`]
  );

  if (teams.length === 0) {
    return { error: 'Team not found' };
  }

  const teamInfo = teams[0];

  // Get players
  const players = await runQuery(`
    SELECT name, pos, nat, stars, value, TOT, PA, VE, HE, TA, CO, SP, FI, GK
    FROM players WHERE team = ? ORDER BY stars DESC, TOT DESC
  `, [teamInfo.team]);

  teamInfo.players = players;
  teamInfo.player_count = players.length;

  return teamInfo;
}

async function searchTeams(args) {
  let query = 'SELECT * FROM teams WHERE 1=1';
  const params = [];

  if (args.name) {
    query += ' AND team LIKE ?';
    params.push(`%${args.name.toUpperCase()}%`);
  }
  if (args.league) {
    query += ' AND league LIKE ?';
    params.push(`%${args.league.toUpperCase()}%`);
  }
  if (args.min_stars !== undefined) {
    query += ' AND stars >= ?';
    params.push(args.min_stars);
  }

  query += ' ORDER BY stars DESC';

  return await runQuery(query, params);
}

async function getLeagueStats(args) {
  const query = `
    SELECT 
      league,
      COUNT(*) as total_players,
      AVG(stars) as avg_stars,
      MAX(stars) as max_stars,
      MIN(stars) as min_stars,
      SUM(value) as total_value,
      AVG(value) as avg_value
    FROM players 
    GROUP BY league 
    ORDER BY avg_stars DESC
  `;

  return await runQuery(query);
}

async function findValuePlayers(args) {
  const minStars = args.min_stars || 3.0;

  let query = `
    SELECT name, pos, nat, team, league, stars, value, TOT, 
           (stars * 1000000.0 / CASE WHEN value = 0 THEN 1 ELSE value END) as value_ratio,
           PA, VE, HE, TA, CO, SP, FI, GK
    FROM players WHERE stars >= ?
  `;
  const params = [minStars];

  if (args.max_budget !== undefined) {
    query += ' AND value <= ?';
    params.push(args.max_budget);
  }
  if (args.position) {
    query += ' AND pos = ?';
    params.push(args.position.toUpperCase());
  }

  const limit = args.limit || 20;
  query += ' ORDER BY value_ratio DESC, stars DESC LIMIT ?';
  params.push(limit);

  return await runQuery(query, params);
}

async function getPlayerByAttributes(args) {
  if (!args.attribute_focus) {
    throw new Error('attribute_focus is required');
  }

  const validAttrs = ['PA', 'VE', 'HE', 'TA', 'CO', 'SP', 'FI'];
  const attributeFocus = args.attribute_focus.toUpperCase();

  if (!validAttrs.includes(attributeFocus)) {
    return { error: `Invalid attribute. Must be one of: ${validAttrs.join(', ')}` };
  }

  // Validate min_primary attribute range (SWOS attributes are 0-7)
  if (args.min_primary !== undefined) {
    if (args.min_primary < 0 || args.min_primary > 7) {
      throw new Error(`min_primary must be between 0 and 7 (SWOS attribute range)`);
    }
  }

  // Validate secondary attributes range
  if (args.secondary_attributes) {
    for (const [attr, minVal] of Object.entries(args.secondary_attributes)) {
      if (validAttrs.includes(attr.toUpperCase())) {
        if (minVal < 0 || minVal > 7) {
          throw new Error(`Secondary attribute ${attr} must be between 0 and 7 (SWOS attribute range)`);
        }
      }
    }
  }

  let query = `
    SELECT name, pos, nat, team, league, stars, value, TOT, PA, VE, HE, TA, CO, SP, FI, GK
    FROM players WHERE 1=1
  `;
  const params = [];

  if (args.min_primary !== undefined) {
    query += ` AND ${attributeFocus} >= ?`;
    params.push(args.min_primary);
  }
  if (args.position) {
    query += ' AND pos = ?';
    params.push(args.position.toUpperCase());
  }
  if (args.secondary_attributes) {
    for (const [attr, minVal] of Object.entries(args.secondary_attributes)) {
      if (validAttrs.includes(attr.toUpperCase())) {
        query += ` AND ${attr.toUpperCase()} >= ?`;
        params.push(minVal);
      }
    }
  }

  const limit = args.limit || 20;
  query += ` ORDER BY ${attributeFocus} DESC, stars DESC LIMIT ?`;
  params.push(limit);

  return await runQuery(query, params);
}

async function findCheapestMaxAttributePlayers(args) {
  if (!args.required_max_attributes || !Array.isArray(args.required_max_attributes) || args.required_max_attributes.length === 0) {
    throw new Error('required_max_attributes is required and must be a non-empty array');
  }

  const validAttrs = ['PA', 'VE', 'HE', 'TA', 'CO', 'SP', 'FI'];
  const requiredAttrs = args.required_max_attributes.map(attr => attr.toUpperCase());

  // Validate all attributes are valid
  for (const attr of requiredAttrs) {
    if (!validAttrs.includes(attr)) {
      throw new Error(`Invalid attribute "${attr}". Must be one of: ${validAttrs.join(', ')}`);
    }
  }

  let query = `
    SELECT id, name, pos, nat, team, league, stars, value, TOT, PA, VE, HE, TA, CO, SP, FI, GK
    FROM players WHERE 1=1
  `;
  const params = [];

  // Add conditions for each required max attribute (must equal 7)
  for (const attr of requiredAttrs) {
    query += ` AND ${attr} = 7`;
  }

  // Additional filters
  if (args.position) {
    query += ' AND pos = ?';
    params.push(args.position.toUpperCase());
  }
  if (args.min_stars !== undefined) {
    query += ' AND stars >= ?';
    params.push(args.min_stars);
  }
  if (args.max_stars !== undefined) {
    query += ' AND stars <= ?';
    params.push(args.max_stars);
  }
  if (args.league) {
    query += ' AND league LIKE ?';
    params.push(`%${args.league.toUpperCase()}%`);
  }
  if (args.nationality) {
    query += ' AND nat = ?';
    params.push(args.nationality.toUpperCase());
  }

  const limit = args.limit || 20;
  // Order by cheapest first (lowest value), then by highest stars for tie-breaking
  query += ' ORDER BY value ASC, stars DESC LIMIT ?';
  params.push(limit);

  return await runQuery(query, params);
}

// --- Main Application Logic ---
async function main() {
  try {
    console.error('[SWOS] Creating StdioServerTransport...');
    const transport = new StdioServerTransport();

    console.error('[SWOS] Connecting server to transport...');
    await server.connect(transport);

    console.error('[SWOS] ✓ Server connected successfully! Waiting for requests...');
    
  } catch (error) {
    console.error('[SWOS] FATAL ERROR in main:', error.message, error.stack);
    process.exit(1);
  }
}

// --- Process-wide Error Handling ---
process.on('uncaughtException', (error) => {
  console.error('[SWOS] UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[SWOS] UNHANDLED REJECTION:', promise, 'reason:', reason);
  process.exit(1);
});

// --- Start the Server ---
main();
