<div align="center">

# 🎮 Godot MCP Server

**AI-Powered Development Assistant for Godot Game Engine**

[![npm version](https://badge.fury.io/js/kooix-godot-mcp.svg)](https://badge.fury.io/js/kooix-godot-mcp)
[![npm downloads](https://img.shields.io/npm/dm/kooix-godot-mcp.svg)](https://npmjs.com/package/kooix-godot-mcp)
[![GitHub license](https://img.shields.io/github/license/telagod/kooix-godot-mcp.svg)](https://github.com/telagod/kooix-godot-mcp/blob/main/LICENSE)
[![Build Status](https://github.com/telagod/kooix-godot-mcp/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/telagod/kooix-godot-mcp/actions)

[English](README.md) | [中文](README_CN.md)

*Transform your Godot development with intelligent AI assistance*

</div>

---

## 🤔 The Problem

Working with Godot can be challenging when you need to:
- ❌ Analyze complex project structures and scene hierarchies
- ❌ Debug cryptic error messages and performance issues  
- ❌ Generate boilerplate code following Godot best practices
- ❌ Understand legacy codebases or inherited projects
- ❌ Optimize game performance without deep engine knowledge

## ✨ The Solution

**Godot MCP Server** bridges the gap between AI assistants and your Godot projects, providing:

- ✅ **Intelligent Project Analysis**: Deep understanding of your game architecture
- ✅ **Smart Error Diagnosis**: AI-powered debugging with actionable suggestions
- ✅ **Code Generation**: Templates and patterns following Godot conventions
- ✅ **Performance Insights**: Automated optimization recommendations
- ✅ **Architecture Guidance**: Best practices for scalable game development

---

## 🚀 Quick Start

### Using npx (Recommended)
No installation required! Run directly:
```bash
npx kooix-godot-mcp --project /path/to/your/godot/project
```

### Add to Claude Desktop
<details>
<summary><strong>Click to expand configuration steps</strong></summary>

Add to your Claude Desktop config file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/claude/claude_desktop_config.json`

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

**Note**: Replace `/path/to/your/godot/project` with the actual path to your Godot project directory.
</details>

### Alternative Installation Methods

<details>
<summary><strong>Global Installation via NPM</strong></summary>

```bash
npm install -g kooix-godot-mcp
```

Then use in Claude Desktop config:
```json
{
  "mcpServers": {
    "godot-mcp": {
      "command": "godot-mcp",
      "args": ["--project", "/path/to/your/godot/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>From GitHub Packages</strong></summary>

```bash
npm install -g @telagod/kooix-godot-mcp
```
</details>

<details>
<summary><strong>From Source</strong></summary>

```bash
git clone https://github.com/telagod/kooix-godot-mcp.git
cd kooix-godot-mcp
npm install && npm run build
npm install -g .
```
</details>

---

## 🛠️ Features

### 📊 Project Intelligence
- **Project Configuration**: Extract settings, autoloads, and metadata
- **Scene Architecture**: Analyze node hierarchies and scene relationships
- **Script Analysis**: Parse GDScript for methods, properties, and signals
- **Design Patterns**: Identify architectural patterns and suggest improvements

### 🎨 Code Generation
- **Smart Templates**: Generate classes following Godot conventions
  - 🎯 Player Controllers with input handling
  - 🏗️ Manager Singletons for game systems
  - 🖼️ UI Components (Menus, Dialogs, HUD)
  - 🎮 Game Objects with lifecycle management

### 🌐 Network Systems
- **Multiplayer Templates**: Ready-to-use networking code
- **REST API Integration**: HTTP client implementations
- **State Synchronization**: Patterns for networked games

### ⚡ Performance Optimization
- **Performance Profiling**: Identify bottlenecks in your code
- **Memory Management**: Object pooling and resource optimization
- **Best Practices**: Automated code quality suggestions
- **Performance Metrics**: Real-time analysis of game systems

### 🐛 Debug & Troubleshooting
- **Error Analysis**: Intelligent parsing of Godot logs
- **Crash Diagnostics**: Root cause analysis for game crashes
- **Performance Issues**: Memory leaks and frame rate problems
- **Code Quality**: Static analysis and improvement suggestions

---

## 🎯 Use Cases

### For Beginners
- 📚 Learn Godot best practices through generated examples
- 🔍 Understand existing project structures
- 🎓 Get explanations for complex game development concepts

### For Experienced Developers
- 🚀 Accelerate development with smart code generation
- 🔧 Debug complex issues with AI-powered analysis  
- 📈 Optimize performance with detailed recommendations
- 🏗️ Architect scalable game systems

### For Teams
- 📋 Analyze and document legacy codebases
- 🔄 Maintain consistent coding standards
- 🤝 Onboard new team members faster
- 📊 Generate project health reports

---

## 🤖 Available Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `get-project-info` | Extract project configuration and metadata | Understanding project structure |
| `list-scenes` | Analyze scene files and hierarchies | Scene management and organization |
| `analyze-scene` | Deep analysis of specific scene files | Debugging scene-related issues |
| `list-scripts` | Inventory all GDScript files | Code organization and refactoring |
| `analyze-script` | Parse script structure and patterns | Code quality and optimization |
| `generate-script-template` | Create common script patterns | Rapid development and consistency |
| `analyze-game-architecture` | High-level architectural analysis | System design and planning |
| `generate-ui-component` | Create UI component templates | Interface development |
| `optimize-game-performance` | Performance analysis and suggestions | Game optimization |
| `generate-network-system` | Networking code templates | Multiplayer development |
| `debug-project-errors` | Error log analysis and solutions | Troubleshooting and debugging |
| `start-debug-session` | Real-time debugging session | Interactive problem solving |
| `analyze-debug-logs` | Parse and interpret log files | Post-mortem analysis |
| `get-performance-insights` | Performance profiling and metrics | Optimization planning |
| `check-project-health` | Overall project quality assessment | Maintenance and planning |

---

## 📖 Documentation & Examples

### Quick Examples

<details>
<summary><strong>Generate a Player Controller</strong></summary>

```gdscript
extends CharacterBody2D
class_name PlayerController

@export var speed: float = 300.0
@export var health: int = 100

signal health_changed(new_health: int)
signal player_died

var _input_vector: Vector2
var _is_alive: bool = true

func _ready() -> void:
    initialize_player()

func _process(delta: float) -> void:
    if _is_alive:
        handle_input()
        update_movement(delta)

# ... complete implementation generated
```
</details>

<details>
<summary><strong>Create UI Components</strong></summary>

```gdscript
extends Control
class_name GameHUD

@export var health_bar: ProgressBar
@export var score_label: Label
@export var timer_label: Label

func update_health(health: int) -> void:
    if health_bar:
        health_bar.value = health

# ... complete HUD system with animations
```
</details>

### Advanced Usage

- 🎯 [Project Analysis Guide](docs/project-analysis.md)
- 🎨 [Code Generation Examples](docs/code-generation.md)  
- ⚡ [Performance Optimization](docs/performance.md)
- 🐛 [Debugging Workflows](docs/debugging.md)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/telagod/kooix-godot-mcp.git
cd kooix-godot-mcp
npm install
npm run dev
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- 📖 [Documentation](https://github.com/telagod/kooix-godot-mcp/wiki)
- 🐛 [Report Issues](https://github.com/telagod/kooix-godot-mcp/issues)
- 💬 [Discussions](https://github.com/telagod/kooix-godot-mcp/discussions)

---

<div align="center">

**Made with ❤️ for the Godot Community**

*Supercharge your game development with AI assistance*

[![Star on GitHub](https://img.shields.io/github/stars/telagod/kooix-godot-mcp?style=social)](https://github.com/telagod/kooix-godot-mcp)

</div>