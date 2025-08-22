# Godot MCP Server

[![npm version](https://badge.fury.io/js/kooix-godot-mcp.svg)](https://badge.fury.io/js/kooix-godot-mcp)
[![npm downloads](https://img.shields.io/npm/dm/kooix-godot-mcp.svg)](https://npmjs.com/package/kooix-godot-mcp)
[![GitHub license](https://img.shields.io/github/license/telagod/kooix-godot-mcp.svg)](https://github.com/telagod/kooix-godot-mcp/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/telagod/kooix-godot-mcp.svg)](https://github.com/telagod/kooix-godot-mcp/issues)
[![Build Status](https://github.com/telagod/kooix-godot-mcp/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/telagod/kooix-godot-mcp/actions)

A comprehensive Model Context Protocol (MCP) server for Godot game engine development assistance. This server provides AI assistants like Claude with powerful tools to analyze, understand, and assist with Godot projects.

## Features

### 🔍 Project Analysis
- **Project Information**: Extract project configuration, autoloads, and metadata
- **Scene Analysis**: Parse and analyze scene structures and node hierarchies  
- **Script Analysis**: Examine GDScript files for methods, properties, and signals
- **Architecture Overview**: Analyze overall game architecture and design patterns

### 🛠️ Code Generation
- **Script Templates**: Generate common GDScript patterns (Singleton, Player, UI, Manager, GameObject)
- **UI Components**: Create complete UI component templates (Menu, Dialog, HUD, Card, Board)
- **Network Systems**: Generate multiplayer and REST API networking code

### ⚡ Performance Optimization  
- **Performance Analysis**: Identify common performance issues in scripts
- **Optimization Recommendations**: Get specific suggestions for improving game performance
- **Best Practices**: Code examples following Godot best practices

### 🐛 Debug and Error Analysis
- **Error Log Analysis**: Parse and analyze Godot error logs with intelligent suggestions
- **Debug Sessions**: Monitor running games for real-time error tracking
- **Crash Analysis**: Analyze crash dumps and provide detailed debugging guidance
- **Project Health**: Comprehensive project diagnostics and health scoring
- **Smart Fix Suggestions**: Context-aware error resolution recommendations

### 🎮 Game Development Tools
- **Manager Analysis**: Evaluate singleton managers and their responsibilities
- **Scene Structure**: Understand project organization and flow
- **Design Pattern Detection**: Identify and recommend design patterns

## Installation

### Global Installation from NPM (Recommended)
```bash
npm install -g kooix-godot-mcp
```

### Alternative Installation Methods

#### From GitHub Packages
```bash
npm install -g @telagod/kooix-godot-mcp
```

#### From Source
```bash
git clone https://github.com/telagod/kooix-godot-mcp.git
cd kooix-godot-mcp
npm install
npm run build
npm install -g .
```

#### Using npx (No Installation)
```bash
npx kooix-godot-mcp --project /path/to/your/godot/project
```

## Usage

### With Claude Desktop
Add to your Claude Desktop configuration:
```json
{
  "mcpServers": {
    "godot-mcp": {
      "type": "stdio",
      "command": "kooix-godot-mcp",
      "args": ["--project", "/path/to/your/godot/project"],
      "env": {}
    }
  }
}
```

### Command Line
```bash
# Analyze current directory
kooix-godot-mcp

# Analyze specific project
kooix-godot-mcp --project /path/to/godot/project

# Show help
kooix-godot-mcp --help
```

### Quick Setup for Claude Desktop
```bash
# Install globally
npm install -g kooix-godot-mcp

# Add to Claude (replace with your project path)
claude mcp add godot-mcp kooix-godot-mcp --project "/path/to/your/godot/project"
```

## Available Tools

### Project Analysis Tools
- `get_project_info` - Get comprehensive project information
- `list_scenes` - List all scenes with optional detailed analysis
- `list_scripts` - List all GDScript files with optional code analysis
- `analyze_scene` - Deep dive into specific scene structure
- `analyze_script` - Analyze specific script file

### Code Generation Tools  
- `generate_script_template` - Create script templates for common patterns
- `generate_ui_component` - Generate complete UI component systems
- `generate_network_system` - Create networking code templates

### Game Development Tools
- `analyze_game_architecture` - Comprehensive architecture analysis
- `optimize_game_performance` - Performance analysis and recommendations

### Debug and Error Analysis Tools
- `analyze_error_log` - Analyze Godot error logs and provide fix suggestions
- `start_debug_session` - Start real-time error monitoring session
- `stop_debug_session` - Stop debug session and get comprehensive results
- `get_debug_session` - Query active debug session status
- `analyze_crash_dump` - Analyze crash information with debugging guidance
- `diagnose_project` - Comprehensive project health diagnosis
- `suggest_fix` - Get specific fix suggestions for error messages

## Examples

### Analyzing Your Project
```javascript
// Get project overview
await mcp.callTool('get_project_info');

// Analyze game architecture
await mcp.callTool('analyze_game_architecture');

// Check performance issues  
await mcp.callTool('optimize_game_performance');

// Diagnose project health
await mcp.callTool('diagnose_project');
```

### Debugging and Error Analysis
```javascript
// Analyze error logs
await mcp.callTool('analyze_error_log', {
  logContent: "ERROR: Null reference at: Player.gd:45"
});

// Start debug session
await mcp.callTool('start_debug_session');

// Get fix suggestions
await mcp.callTool('suggest_fix', {
  errorMessage: "Invalid get index 'health' (on base: 'null instance')",
  context: "Player character script"
});

// Analyze crash dump
await mcp.callTool('analyze_crash_dump', {
  crashInfo: "Segmentation fault at Player.gd:23"
});
```

### Generating Code
```javascript
// Create a player controller
await mcp.callTool('generate_script_template', {
  templateType: 'player',
  className: 'PlayerController',
  extendsClass: 'CharacterBody2D'
});

// Generate a menu system
await mcp.callTool('generate_ui_component', {
  componentType: 'menu', 
  componentName: 'MainMenu'
});

// Create multiplayer networking
await mcp.callTool('generate_network_system', {
  networkType: 'multiplayer'
});
```

## Supported Project Types

This MCP server is designed to work with any Godot project, but provides enhanced analysis for:

- 🎲 Board Games (like Monopoly)  
- 🎮 RPG/Roguelike Games
- 🌐 Multiplayer Games
- 📱 Mobile Games
- 🎨 ASCII/Pixel Art Games

## Architecture

```
src/
├── index.ts              # Main MCP server
├── tools/               
│   ├── project-analyzer.ts   # Project analysis
│   ├── scene-manager.ts      # Scene operations  
│   ├── script-manager.ts     # Script analysis
│   └── game-dev-tools.ts     # Game dev utilities
├── types/
│   └── index.ts          # Type definitions
└── utils/               # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Development mode with auto-rebuild
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Requirements

- Node.js 18.0.0 or higher
- Godot 3.5+ or 4.0+ project
- MCP-compatible AI assistant (Claude Desktop, Cursor, etc.)

## License

MIT License - see LICENSE file for details

## Related Projects

- [Model Context Protocol](https://github.com/modelcontextprotocol/specification)
- [Claude Desktop](https://claude.ai/download)
- [Godot Engine](https://godotengine.org/)

## Support

- 📝 [GitHub Issues](https://github.com/yourusername/godot-mcp/issues)
- 📖 [Documentation](https://github.com/yourusername/godot-mcp/wiki)
- 💬 [Discussions](https://github.com/yourusername/godot-mcp/discussions)