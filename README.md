# Godot MCP Server

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

### 🎮 Game Development Tools
- **Manager Analysis**: Evaluate singleton managers and their responsibilities
- **Scene Structure**: Understand project organization and flow
- **Design Pattern Detection**: Identify and recommend design patterns

## Installation

### Global Installation
```bash
npm install -g godot-mcp
```

### Local Development
```bash
git clone https://github.com/yourusername/godot-mcp.git
cd godot-mcp
npm install
npm run build
npm install -g .
```

## Usage

### With Claude Desktop
Add to your Claude Desktop configuration:
```json
{
  "mcpServers": {
    "godot-mcp": {
      "type": "stdio",
      "command": "godot-mcp",
      "args": ["--project", "/path/to/your/godot/project"],
      "env": {}
    }
  }
}
```

### Command Line
```bash
# Analyze current directory
godot-mcp

# Analyze specific project
godot-mcp --project /path/to/godot/project
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

## Examples

### Analyzing Your Project
```javascript
// Get project overview
await mcp.callTool('get_project_info');

// Analyze game architecture
await mcp.callTool('analyze_game_architecture');

// Check performance issues  
await mcp.callTool('optimize_game_performance');
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