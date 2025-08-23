# Claude Desktop Configuration Example

This example shows how to configure Godot MCP Server with Claude Desktop using npx.

## Configuration File Location

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

## Configuration Content

```json
{
  "mcpServers": {
    "godot-mcp": {
      "command": "npx",
      "args": ["kooix-godot-mcp", "--project", "/path/to/your/godot/project"]
    }
  }
}
```

## Example Configurations

### Windows Example
```json
{
  "mcpServers": {
    "godot-mcp": {
      "command": "npx",
      "args": ["kooix-godot-mcp", "--project", "C:\\Users\\YourName\\Documents\\MyGame"]
    }
  }
}
```

### macOS/Linux Example
```json
{
  "mcpServers": {
    "godot-mcp": {
      "command": "npx",
      "args": ["kooix-godot-mcp", "--project", "/home/username/projects/my-game"]
    }
  }
}
```

## Benefits of Using npx

- ✅ **No Global Installation**: Always uses the latest version
- ✅ **Easy Updates**: Automatically downloads updates when available
- ✅ **Clean Environment**: No global package pollution
- ✅ **Version Flexibility**: Can specify specific versions if needed

## Troubleshooting

If you encounter issues:

1. **Ensure npm is installed**: `npm --version`
2. **Test npx directly**: `npx kooix-godot-mcp --help`
3. **Check project path**: Make sure the path exists and contains a `project.godot` file
4. **Restart Claude Desktop**: After making configuration changes

## Using Specific Versions

To use a specific version:
```json
{
  "mcpServers": {
    "godot-mcp": {
      "command": "npx",
      "args": ["kooix-godot-mcp@1.1.16", "--project", "/path/to/project"]
    }
  }
}
```