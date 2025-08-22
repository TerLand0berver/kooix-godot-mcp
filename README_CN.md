<div align="center">

# 🎮 Godot MCP 服务器

**为 Godot 游戏引擎提供 AI 驱动的开发助手**

[![npm version](https://badge.fury.io/js/kooix-godot-mcp.svg)](https://badge.fury.io/js/kooix-godot-mcp)
[![npm downloads](https://img.shields.io/npm/dm/kooix-godot-mcp.svg)](https://npmjs.com/package/kooix-godot-mcp)
[![GitHub license](https://img.shields.io/github/license/telagod/kooix-godot-mcp.svg)](https://github.com/telagod/kooix-godot-mcp/blob/main/LICENSE)
[![Build Status](https://github.com/telagod/kooix-godot-mcp/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/telagod/kooix-godot-mcp/actions)

[English](README.md) | [中文](README_CN.md)

*用智能 AI 助手变革你的 Godot 开发体验*

</div>

---

## 🤔 遇到的问题

在使用 Godot 开发时，你可能经常需要：
- ❌ 分析复杂的项目结构和场景层次
- ❌ 调试神秘的错误信息和性能问题
- ❌ 生成遵循 Godot 最佳实践的样板代码
- ❌ 理解遗留代码库或继承的项目
- ❌ 在缺乏深入引擎知识的情况下优化游戏性能

## ✨ 解决方案

**Godot MCP 服务器**连接了 AI 助手和你的 Godot 项目，提供：

- ✅ **智能项目分析**：深度理解你的游戏架构
- ✅ **智能错误诊断**：AI 驱动的调试，提供可行的建议
- ✅ **代码生成**：遵循 Godot 约定的模板和模式
- ✅ **性能洞察**：自动优化建议
- ✅ **架构指导**：可扩展游戏开发的最佳实践

---

## 🚀 快速开始

### 通过 NPM 安装
```bash
npm install -g kooix-godot-mcp
```

### 添加到 Claude Desktop
<details>
<summary><strong>点击展开安装步骤</strong></summary>

#### 自动设置（推荐）
```bash
claude mcp add godot-mcp kooix-godot-mcp
```

#### 手动配置
添加到你的 Claude Desktop 配置文件：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/claude/claude_desktop_config.json`

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

### 其他安装方式

<details>
<summary><strong>从 GitHub Packages 安装</strong></summary>

```bash
npm install -g @telagod/kooix-godot-mcp
```
</details>

<details>
<summary><strong>从源码安装</strong></summary>

```bash
git clone https://github.com/telagod/kooix-godot-mcp.git
cd kooix-godot-mcp
npm install && npm run build
npm install -g .
```
</details>

<details>
<summary><strong>使用 npx（免安装）</strong></summary>

```bash
npx kooix-godot-mcp --project /path/to/your/project
```
</details>

---

## 🛠️ 功能特性

### 📊 项目智能分析
- **项目配置**：提取设置、自动加载和元数据
- **场景架构**：分析节点层次和场景关系
- **脚本分析**：解析 GDScript 的方法、属性和信号
- **设计模式**：识别架构模式并建议改进

### 🎨 代码生成
- **智能模板**：生成遵循 Godot 约定的类
  - 🎯 带输入处理的玩家控制器
  - 🏗️ 游戏系统的管理器单例
  - 🖼️ UI 组件（菜单、对话框、HUD）
  - 🎮 带生命周期管理的游戏对象

### 🌐 网络系统
- **多人游戏模板**：即用的网络代码
- **REST API 集成**：HTTP 客户端实现
- **状态同步**：网络游戏的模式

### ⚡ 性能优化
- **性能分析**：识别代码中的瓶颈
- **内存管理**：对象池和资源优化
- **最佳实践**：自动代码质量建议
- **性能指标**：游戏系统的实时分析

### 🐛 调试和故障排除
- **错误分析**：智能解析 Godot 日志
- **崩溃诊断**：游戏崩溃的根本原因分析
- **性能问题**：内存泄漏和帧率问题
- **代码质量**：静态分析和改进建议

---

## 🎯 使用场景

### 对于初学者
- 📚 通过生成的示例学习 Godot 最佳实践
- 🔍 理解现有项目结构
- 🎓 获得复杂游戏开发概念的解释

### 对于经验丰富的开发者
- 🚀 用智能代码生成加速开发
- 🔧 用 AI 驱动的分析调试复杂问题
- 📈 用详细建议优化性能
- 🏗️ 架构可扩展的游戏系统

### 对于团队
- 📋 分析和记录遗留代码库
- 🔄 维护一致的编码标准
- 🤝 更快地让新团队成员上手
- 📊 生成项目健康报告

---

## 🤖 可用工具

| 工具 | 描述 | 使用场景 |
|------|-------------|----------|
| `get-project-info` | 提取项目配置和元数据 | 理解项目结构 |
| `list-scenes` | 分析场景文件和层次 | 场景管理和组织 |
| `analyze-scene` | 特定场景文件的深度分析 | 调试场景相关问题 |
| `list-scripts` | 清点所有 GDScript 文件 | 代码组织和重构 |
| `analyze-script` | 解析脚本结构和模式 | 代码质量和优化 |
| `generate-script-template` | 创建常见脚本模式 | 快速开发和一致性 |
| `analyze-game-architecture` | 高级架构分析 | 系统设计和规划 |
| `generate-ui-component` | 创建 UI 组件模板 | 界面开发 |
| `optimize-game-performance` | 性能分析和建议 | 游戏优化 |
| `generate-network-system` | 网络代码模板 | 多人游戏开发 |
| `debug-project-errors` | 错误日志分析和解决方案 | 故障排除和调试 |
| `start-debug-session` | 实时调试会话 | 交互式问题解决 |
| `analyze-debug-logs` | 解析和解释日志文件 | 事后分析 |
| `get-performance-insights` | 性能分析和指标 | 优化规划 |
| `check-project-health` | 整体项目质量评估 | 维护和规划 |

---

## 📖 文档和示例

### 快速示例

<details>
<summary><strong>生成玩家控制器</strong></summary>

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

# ... 生成完整实现
```
</details>

<details>
<summary><strong>创建 UI 组件</strong></summary>

```gdscript
extends Control
class_name GameHUD

@export var health_bar: ProgressBar
@export var score_label: Label
@export var timer_label: Label

func update_health(health: int) -> void:
    if health_bar:
        health_bar.value = health

# ... 带动画的完整 HUD 系统
```
</details>

### 高级用法

- 🎯 [项目分析指南](docs/project-analysis.md)
- 🎨 [代码生成示例](docs/code-generation.md)  
- ⚡ [性能优化](docs/performance.md)
- 🐛 [调试工作流](docs/debugging.md)

---

## 🤝 贡献

我们欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解详情。

### 开发设置
```bash
git clone https://github.com/telagod/kooix-godot-mcp.git
cd kooix-godot-mcp
npm install
npm run dev
```

---

## 📄 许可证

MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🆘 支持

- 📖 [文档](https://github.com/telagod/kooix-godot-mcp/wiki)
- 🐛 [报告问题](https://github.com/telagod/kooix-godot-mcp/issues)
- 💬 [讨论](https://github.com/telagod/kooix-godot-mcp/discussions)

---

<div align="center">

**为 Godot 社区用 ❤️ 制作**

*用 AI 助手为你的游戏开发增压*

[![在 GitHub 上加星](https://img.shields.io/github/stars/telagod/kooix-godot-mcp?style=social)](https://github.com/telagod/kooix-godot-mcp)

</div>