import fs from 'fs-extra';
import path from 'path';
import { McpToolResponse } from '../types/index.js';

export class GameDevTools {
  constructor(private projectPath: string) {}

  async analyzeGameArchitecture(): Promise<McpToolResponse> {
    try {
      const analysis = {
        managers: await this.analyzeManagers(),
        scenes: await this.analyzeSceneStructure(),
        gameFlow: await this.analyzeGameFlow(),
        patterns: await this.identifyDesignPatterns(),
      };

      return {
        success: true,
        data: analysis,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze game architecture',
      };
    }
  }

  async generateUIComponent(componentType: string, componentName: string, options: any = {}): Promise<McpToolResponse> {
    try {
      const component = await this.createUIComponentTemplate(componentType, componentName, options);
      
      return {
        success: true,
        data: {
          componentType,
          componentName,
          script: component.script,
          scene: component.scene,
          usage: component.usage,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate UI component',
      };
    }
  }

  async optimizeGamePerformance(): Promise<McpToolResponse> {
    try {
      const optimizations = await this.analyzePerformanceIssues();
      
      return {
        success: true,
        data: {
          issues: optimizations.issues,
          recommendations: optimizations.recommendations,
          codeExamples: optimizations.codeExamples,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze performance',
      };
    }
  }

  async generateNetworkSystem(networkType: string): Promise<McpToolResponse> {
    try {
      const networkSystem = this.createNetworkSystemTemplate(networkType);
      
      return {
        success: true,
        data: {
          networkType,
          clientScript: networkSystem.client,
          serverScript: networkSystem.server,
          sharedScript: networkSystem.shared,
          setupInstructions: networkSystem.setup,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate network system',
      };
    }
  }

  private async analyzeManagers(): Promise<any> {
    const managersPath = path.join(this.projectPath, 'scripts', 'managers');
    const managers = [];

    try {
      if (await fs.pathExists(managersPath)) {
        const files = await fs.readdir(managersPath);
        for (const file of files) {
          if (file.endsWith('.gd')) {
            const content = await fs.readFile(path.join(managersPath, file), 'utf-8');
            const analysis = this.analyzeManagerScript(content, file);
            managers.push(analysis);
          }
        }
      }

      return {
        count: managers.length,
        managers,
        recommendations: this.getManagerRecommendations(managers),
      };
    } catch {
      return { count: 0, managers: [], recommendations: [] };
    }
  }

  private analyzeManagerScript(content: string, filename: string): any {
    const lines = content.split('\n');
    const manager = {
      name: filename.replace('.gd', ''),
      singleton: content.includes('extends Node'),
      signals: [] as string[],
      methods: [] as string[],
      responsibilities: [] as string[],
    };

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('signal ')) {
        const signalName = trimmed.split(' ')[1].split('(')[0];
        manager.signals.push(signalName);
      }
      
      if (trimmed.startsWith('func ')) {
        const methodName = trimmed.split(' ')[1].split('(')[0];
        manager.methods.push(methodName);
      }
    }

    // Infer responsibilities from method names
    manager.responsibilities = this.inferResponsibilities(manager.methods);

    return manager;
  }

  private inferResponsibilities(methods: string[]): string[] {
    const responsibilities = [];
    const patterns = {
      'Data Management': ['save', 'load', 'get_data', 'set_data'],
      'Game State': ['start', 'pause', 'resume', 'reset'],
      'Network': ['connect', 'disconnect', 'send', 'receive'],
      'UI Management': ['show', 'hide', 'update_ui', 'refresh'],
      'Audio': ['play', 'stop', 'volume', 'sound'],
      'Config': ['setting', 'config', 'option', 'preference'],
    };

    for (const [responsibility, keywords] of Object.entries(patterns)) {
      if (methods.some(method => keywords.some(keyword => method.toLowerCase().includes(keyword)))) {
        responsibilities.push(responsibility);
      }
    }

    return responsibilities;
  }

  private getManagerRecommendations(managers: any[]): string[] {
    const recommendations = [];

    if (managers.length > 8) {
      recommendations.push("Consider consolidating managers - too many singletons can impact performance");
    }

    const responsibilityMap: Record<string, number> = {};
    managers.forEach(manager => {
      manager.responsibilities.forEach((resp: string) => {
        responsibilityMap[resp] = (responsibilityMap[resp] || 0) + 1;
      });
    });

    Object.entries(responsibilityMap).forEach(([resp, count]) => {
      if (count > 1) {
        recommendations.push(`Multiple managers handle ${resp} - consider separation of concerns`);
      }
    });

    return recommendations;
  }

  private async analyzeSceneStructure(): Promise<any> {
    const scenesPath = path.join(this.projectPath, 'scenes');
    const structure = {
      main: [],
      ui: [],
      game: [],
      other: [],
    };

    try {
      if (await fs.pathExists(scenesPath)) {
        const categories = await fs.readdir(scenesPath);
        for (const category of categories) {
          const categoryPath = path.join(scenesPath, category);
          if (await fs.lstat(categoryPath).then(stat => stat.isDirectory())) {
            const scenes = await fs.readdir(categoryPath);
            const sceneList = scenes.filter(s => s.endsWith('.tscn')).map(s => s.replace('.tscn', ''));
            
            if (category in structure) {
              (structure as any)[category] = sceneList;
            } else {
              (structure as any).other.push(...sceneList);
            }
          }
        }
      }

      return structure;
    } catch {
      return structure;
    }
  }

  private async analyzeGameFlow(): Promise<any> {
    // Analyze main scene transitions and game flow
    const projectFilePath = path.join(this.projectPath, 'project.godot');
    let mainScene = 'MainMenu.tscn';

    try {
      const projectContent = await fs.readFile(projectFilePath, 'utf-8');
      const mainSceneMatch = projectContent.match(/run\/main_scene="([^"]+)"/);
      if (mainSceneMatch) {
        mainScene = mainSceneMatch[1];
      }
    } catch {
      // Use default
    }

    return {
      entryPoint: mainScene,
      flow: [
        'MainMenu → Game Setup',
        'Game Setup → Game Scene',  
        'Game Scene → Results',
        'Results → MainMenu'
      ],
      recommendations: [
        'Consider implementing a SceneManager for smooth transitions',
        'Add loading screens for heavy scenes',
        'Implement save/load system for game state persistence'
      ]
    };
  }

  private async identifyDesignPatterns(): Promise<any> {
    const patterns = {
      singleton: { count: 0, examples: [] as string[] },
      observer: { count: 0, examples: [] as string[] },
      state: { count: 0, examples: [] as string[] },
      factory: { count: 0, examples: [] as string[] },
    };

    // Analyze autoloads for Singleton pattern
    try {
      const projectFilePath = path.join(this.projectPath, 'project.godot');
      const projectContent = await fs.readFile(projectFilePath, 'utf-8');
      const autoloadMatches = projectContent.match(/\w+="[*]?res:\/\/[^"]+"/g) || [];
      patterns.singleton.count = autoloadMatches.length;
      patterns.singleton.examples = autoloadMatches.map(match => match.split('=')[0]);
    } catch {
      // Continue with other patterns
    }

    return {
      identified: patterns,
      recommendations: [
        'Good use of Singleton pattern for managers',
        'Consider implementing Observer pattern for game events',
        'State pattern could help with game phases management'
      ]
    };
  }

  private async createUIComponentTemplate(componentType: string, componentName: string, options: any): Promise<any> {
    const templates: Record<string, (name: string, options: any) => any> = {
      menu: this.createMenuTemplate,
      dialog: this.createDialogTemplate,
      hud: this.createHUDTemplate,
      card: this.createCardTemplate,
      board: this.createBoardTemplate,
    };

    const template = templates[componentType];
    if (!template) {
      throw new Error(`Unknown component type: ${componentType}`);
    }

    return template.call(this, componentName, options);
  }

  private createMenuTemplate(name: string, options: any): any {
    return {
      script: `extends Control
class_name ${name}

@export var button_scene: PackedScene
@export var fade_duration: float = 0.3

signal menu_action(action: String)

var _buttons: Array[Button] = []

func _ready() -> void:
	setup_menu()
	animate_in()

func setup_menu() -> void:
	# Setup menu buttons and layout
	pass

func animate_in() -> void:
	modulate.a = 0.0
	var tween = create_tween()
	tween.tween_property(self, "modulate:a", 1.0, fade_duration)

func _on_button_pressed(action: String) -> void:
	menu_action.emit(action)`,
      scene: `[gd_scene load_steps=2 format=3]

[ext_resource type="Script" path="res://scripts/ui/${name}.gd" id="1"]

[node name="${name}" type="Control"]
layout_mode = 3
anchors_preset = 15
script = ExtResource("1")`,
      usage: `# Usage example:
extends Node

func _ready():
	var menu = ${name}.new()
	add_child(menu)
	menu.menu_action.connect(_on_menu_action)

func _on_menu_action(action: String):
	match action:
		"start":
			start_game()
		"quit":
			quit_game()`
    };
  }

  private createDialogTemplate(name: string, options: any): any {
    return {
      script: `extends AcceptDialog
class_name ${name}

@export var auto_close_time: float = 0.0

signal dialog_result(result: String)

func _ready() -> void:
	setup_dialog()

func setup_dialog() -> void:
	# Setup dialog content
	if auto_close_time > 0:
		var timer = Timer.new()
		add_child(timer)
		timer.wait_time = auto_close_time
		timer.timeout.connect(hide)
		timer.start()

func show_dialog(title: String, message: String) -> void:
	self.title = title
	dialog_text = message
	popup_centered()`,
      scene: `[gd_scene load_steps=2 format=3]

[ext_resource type="Script" path="res://scripts/ui/${name}.gd" id="1"]

[node name="${name}" type="AcceptDialog"]
script = ExtResource("1")`,
      usage: `# Usage example:
var dialog = ${name}.new()
add_child(dialog)
dialog.show_dialog("Confirm", "Are you sure?")`
    };
  }

  private createHUDTemplate(name: string, options: any): any {
    return {
      script: `extends CanvasLayer
class_name ${name}

@export var health_bar: ProgressBar
@export var score_label: Label
@export var timer_label: Label

var _current_health: int = 100
var _current_score: int = 0
var _game_time: float = 0.0

func _ready() -> void:
	setup_hud()

func setup_hud() -> void:
	update_health(_current_health)
	update_score(_current_score)

func _process(delta: float) -> void:
	_game_time += delta
	update_timer(_game_time)

func update_health(health: int) -> void:
	_current_health = health
	if health_bar:
		health_bar.value = health

func update_score(score: int) -> void:
	_current_score = score
	if score_label:
		score_label.text = "Score: " + str(score)

func update_timer(time: float) -> void:
	if timer_label:
		var minutes = int(time) / 60
		var seconds = int(time) % 60
		timer_label.text = "%02d:%02d" % [minutes, seconds]`,
      scene: `[gd_scene load_steps=2 format=3]

[ext_resource type="Script" path="res://scripts/ui/${name}.gd" id="1"]

[node name="${name}" type="CanvasLayer"]
script = ExtResource("1")

[node name="HUDContainer" type="Control" parent="."]
layout_mode = 3
anchors_preset = 15

[node name="HealthBar" type="ProgressBar" parent="HUDContainer"]
layout_mode = 0
offset_right = 200.0
offset_bottom = 20.0

[node name="ScoreLabel" type="Label" parent="HUDContainer"]
layout_mode = 0
offset_top = 30.0
offset_right = 200.0
offset_bottom = 50.0`,
      usage: `# Usage example:
extends Node

var hud: ${name}

func _ready():
	hud = ${name}.new()
	add_child(hud)
	hud.update_health(80)
	hud.update_score(1500)`
    };
  }

  private createCardTemplate(name: string, options: any): any {
    return {
      script: `extends Control
class_name ${name}

@export var card_data: Resource
@export var hover_scale: float = 1.1
@export var animation_duration: float = 0.2

signal card_selected(card: ${name})
signal card_hovered(card: ${name}, hovered: bool)

var _original_scale: Vector2
var _is_hovered: bool = false

func _ready() -> void:
	_original_scale = scale
	setup_card()
	connect_signals()

func setup_card() -> void:
	if card_data:
		update_display()

func connect_signals() -> void:
	mouse_entered.connect(_on_mouse_entered)
	mouse_exited.connect(_on_mouse_exited)
	gui_input.connect(_on_gui_input)

func update_display() -> void:
	# Update card visual based on card_data
	pass

func _on_mouse_entered() -> void:
	_is_hovered = true
	animate_hover(true)
	card_hovered.emit(self, true)

func _on_mouse_exited() -> void:
	_is_hovered = false
	animate_hover(false)
	card_hovered.emit(self, false)

func animate_hover(hover: bool) -> void:
	var target_scale = _original_scale * hover_scale if hover else _original_scale
	var tween = create_tween()
	tween.tween_property(self, "scale", target_scale, animation_duration)

func _on_gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		card_selected.emit(self)`,
      scene: `[gd_scene load_steps=2 format=3]

[ext_resource type="Script" path="res://scripts/ui/${name}.gd" id="1"]

[node name="${name}" type="Control"]
layout_mode = 3
anchors_preset = 8
anchor_left = 0.5
anchor_top = 0.5
anchor_right = 0.5
anchor_bottom = 0.5
offset_left = -50.0
offset_top = -70.0
offset_right = 50.0
offset_bottom = 70.0
grow_horizontal = 2
grow_vertical = 2
script = ExtResource("1")`,
      usage: `# Usage example:
var card = ${name}.new()
add_child(card)
card.card_selected.connect(_on_card_selected)

func _on_card_selected(card: ${name}):
	print("Card selected: ", card.name)`
    };
  }

  private createBoardTemplate(name: string, options: any): any {
    return {
      script: `extends Control
class_name ${name}

@export var grid_size: Vector2i = Vector2i(8, 8)
@export var cell_size: Vector2 = Vector2(64, 64)
@export var grid_color: Color = Color.BLACK
@export var highlight_color: Color = Color.YELLOW

signal cell_clicked(position: Vector2i)
signal cell_hovered(position: Vector2i)

var _cells: Array[Array] = []
var _highlighted_cells: Array[Vector2i] = []

func _ready() -> void:
	setup_board()
	custom_minimum_size = Vector2(grid_size.x * cell_size.x, grid_size.y * cell_size.y)

func setup_board() -> void:
	_cells.resize(grid_size.y)
	for y in grid_size.y:
		_cells[y] = []
		_cells[y].resize(grid_size.x)

func _draw() -> void:
	draw_grid()
	draw_highlights()

func draw_grid() -> void:
	# Draw grid lines
	for x in grid_size.x + 1:
		var start = Vector2(x * cell_size.x, 0)
		var end = Vector2(x * cell_size.x, grid_size.y * cell_size.y)
		draw_line(start, end, grid_color, 2.0)
	
	for y in grid_size.y + 1:
		var start = Vector2(0, y * cell_size.y)
		var end = Vector2(grid_size.x * cell_size.x, y * cell_size.y)
		draw_line(start, end, grid_color, 2.0)

func draw_highlights() -> void:
	for pos in _highlighted_cells:
		var rect = Rect2(pos.x * cell_size.x, pos.y * cell_size.y, cell_size.x, cell_size.y)
		draw_rect(rect, highlight_color, false, 3.0)

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		var pos = get_cell_position(event.position)
		if is_valid_position(pos):
			cell_clicked.emit(pos)
	elif event is InputEventMouseMotion:
		var pos = get_cell_position(event.position)
		if is_valid_position(pos):
			cell_hovered.emit(pos)

func get_cell_position(mouse_pos: Vector2) -> Vector2i:
	return Vector2i(int(mouse_pos.x / cell_size.x), int(mouse_pos.y / cell_size.y))

func is_valid_position(pos: Vector2i) -> bool:
	return pos.x >= 0 and pos.x < grid_size.x and pos.y >= 0 and pos.y < grid_size.y

func highlight_cell(pos: Vector2i) -> void:
	if is_valid_position(pos) and pos not in _highlighted_cells:
		_highlighted_cells.append(pos)
		queue_redraw()

func clear_highlights() -> void:
	_highlighted_cells.clear()
	queue_redraw()`,
      scene: `[gd_scene load_steps=2 format=3]

[ext_resource type="Script" path="res://scripts/ui/${name}.gd" id="1"]

[node name="${name}" type="Control"]
layout_mode = 3
script = ExtResource("1")`,
      usage: `# Usage example:
var board = ${name}.new()
add_child(board)
board.cell_clicked.connect(_on_cell_clicked)

func _on_cell_clicked(position: Vector2i):
	print("Cell clicked at: ", position)
	board.highlight_cell(position)`
    };
  }

  private async analyzePerformanceIssues(): Promise<any> {
    const issues = [];
    const recommendations = [];
    const codeExamples = [];

    // Check for common performance issues
    try {
      const scriptsPath = path.join(this.projectPath, 'scripts');
      if (await fs.pathExists(scriptsPath)) {
        const scriptFiles = await this.getAllScriptFiles(scriptsPath);
        
        for (const scriptFile of scriptFiles) {
          const content = await fs.readFile(scriptFile, 'utf-8');
          const fileIssues = this.analyzeScriptPerformance(content, path.relative(this.projectPath, scriptFile));
          issues.push(...fileIssues);
        }
      }

      // Add general recommendations
      recommendations.push(
        "Use object pooling for frequently created/destroyed objects",
        "Implement level-of-detail (LOD) for complex scenes",
        "Use signals instead of polling for event handling",
        "Cache expensive calculations in variables",
        "Use yield/await for long operations to avoid blocking"
      );

      codeExamples.push({
        title: "Object Pooling Example",
        code: `# Object Pool Pattern
extends Node
class_name ObjectPool

var _pool: Array = []
var _scene: PackedScene

func _init(scene: PackedScene, initial_size: int = 10):
	_scene = scene
	for i in initial_size:
		var obj = _scene.instantiate()
		obj.set_process(false)
		obj.visible = false
		_pool.append(obj)

func get_object():
	if _pool.is_empty():
		return _scene.instantiate()
	
	var obj = _pool.pop_back()
	obj.set_process(true)
	obj.visible = true
	return obj

func return_object(obj):
	obj.set_process(false)
	obj.visible = false
	_pool.append(obj)`
      });

    } catch (error) {
      issues.push("Could not analyze scripts for performance issues");
    }

    return { issues, recommendations, codeExamples };
  }

  private async getAllScriptFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.lstat(fullPath);
      
      if (stat.isDirectory()) {
        const subFiles = await this.getAllScriptFiles(fullPath);
        files.push(...subFiles);
      } else if (item.endsWith('.gd')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private analyzeScriptPerformance(content: string, filename: string): string[] {
    const issues = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for common performance issues
      if (line.includes('_process(') || line.includes('_physics_process(')) {
        if (content.includes('find_node') || content.includes('get_node')) {
          issues.push(`${filename}:${i+1} - Avoid node lookups in process functions, cache references`);
        }
      }
      
      if (line.includes('instantiate()') && (line.includes('_process') || line.includes('_physics_process'))) {
        issues.push(`${filename}:${i+1} - Avoid instantiating objects in process functions, use object pooling`);
      }
      
      if (line.includes('queue_free()') && (line.includes('_process') || line.includes('_physics_process'))) {
        issues.push(`${filename}:${i+1} - Frequent object destruction in process functions can cause frame drops`);
      }
    }

    return issues;
  }

  private createNetworkSystemTemplate(networkType: string): any {
    const templates: Record<string, () => any> = {
      multiplayer: () => ({
        client: `extends Node
class_name MultiplayerClient

signal connected_to_server
signal disconnected_from_server
signal player_joined(id: int)
signal player_left(id: int)

var _peer: ENetMultiplayerPeer

func connect_to_server(address: String, port: int) -> void:
	_peer = ENetMultiplayerPeer.new()
	_peer.create_client(address, port)
	multiplayer.multiplayer_peer = _peer
	
	multiplayer.connected_to_server.connect(_on_connected_to_server)
	multiplayer.server_disconnected.connect(_on_server_disconnected)
	multiplayer.peer_connected.connect(_on_player_connected)
	multiplayer.peer_disconnected.connect(_on_player_disconnected)

func disconnect_from_server() -> void:
	if _peer:
		_peer.close()
		_peer = null

@rpc("any_peer")
func send_player_action(action: Dictionary) -> void:
	# Handle player action
	pass`,
        
        server: `extends Node
class_name MultiplayerServer

signal client_connected(id: int)
signal client_disconnected(id: int)

var _peer: ENetMultiplayerPeer
var _players: Dictionary = {}

func start_server(port: int, max_clients: int = 10) -> bool:
	_peer = ENetMultiplayerPeer.new()
	var result = _peer.create_server(port, max_clients)
	
	if result == OK:
		multiplayer.multiplayer_peer = _peer
		multiplayer.peer_connected.connect(_on_client_connected)
		multiplayer.peer_disconnected.connect(_on_client_disconnected)
		return true
	
	return false

func stop_server() -> void:
	if _peer:
		_peer.close()
		_peer = null
	_players.clear()

@rpc("any_peer")
func handle_player_action(action: Dictionary) -> void:
	var sender_id = multiplayer.get_remote_sender_id()
	# Process action from client
	broadcast_game_state.rpc(get_game_state())

@rpc("authority", "call_local")
func broadcast_game_state(state: Dictionary) -> void:
	# Update all clients with game state
	pass`,
        
        shared: `extends Node
class_name NetworkShared

enum MessageType {
	PLAYER_MOVE,
	GAME_START,
	GAME_END,
	CHAT_MESSAGE
}

static func create_message(type: MessageType, data: Dictionary) -> Dictionary:
	return {
		"type": type,
		"data": data,
		"timestamp": Time.get_unix_time_from_system()
	}`,
	
        setup: `# Network System Setup Instructions

1. Add AutoLoad singletons:
   - NetworkClient (client.gd)
   - NetworkServer (server.gd)
   - NetworkShared (shared.gd)

2. For Server:
   NetworkServer.start_server(7000, 4)

3. For Client:
   NetworkClient.connect_to_server("127.0.0.1", 7000)

4. Handle RPC calls:
   @rpc("any_peer", "call_local")
   func your_networked_function():
       pass`
      }),

      rest_api: () => ({
        client: `extends HTTPRequest
class_name APIClient

signal api_response(data: Dictionary)
signal api_error(error: String)

var base_url: String = ""
var headers: PackedStringArray = ["Content-Type: application/json"]

func _ready() -> void:
	request_completed.connect(_on_request_completed)

func get_request(endpoint: String) -> void:
	var url = base_url + endpoint
	request(url, headers, HTTPClient.METHOD_GET)

func post_request(endpoint: String, data: Dictionary) -> void:
	var url = base_url + endpoint
	var json_data = JSON.stringify(data)
	request(url, headers, HTTPClient.METHOD_POST, json_data)

func _on_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	if response_code == 200:
		var json = JSON.new()
		var parse_result = json.parse(body.get_string_from_utf8())
		if parse_result == OK:
			api_response.emit(json.get_data())
		else:
			api_error.emit("JSON parse error")
	else:
		api_error.emit("HTTP error: " + str(response_code))`,
        
        server: `# Server-side REST API (Node.js Express example)
const express = require('express');
const app = express();

app.use(express.json());

// Game state endpoint
app.get('/api/game/:id', (req, res) => {
  const gameId = req.params.id;
  // Fetch game state from database
  res.json({ gameId, state: 'active' });
});

// Player action endpoint
app.post('/api/game/:id/action', (req, res) => {
  const gameId = req.params.id;
  const action = req.body;
  // Process player action
  res.json({ success: true });
});

app.listen(3000);`,
        
        shared: `# Shared API Configuration
class_name APIConfig

const BASE_URL = "https://your-api.com/api"
const ENDPOINTS = {
	"game_state": "/game/{id}",
	"player_action": "/game/{id}/action",
	"leaderboard": "/leaderboard"
}`,
        
        setup: `# REST API Setup Instructions

1. Set up your backend server (Node.js, Python, etc.)
2. Configure CORS for Godot requests
3. In Godot, create APIClient instance:
   var api = APIClient.new()
   add_child(api)
   api.base_url = "https://your-api.com/api"
   api.api_response.connect(_on_api_response)`
      })
    };

    const template = templates[networkType];
    if (!template) {
      throw new Error(`Unknown network type: ${networkType}`);
    }

    return template();
  }
}