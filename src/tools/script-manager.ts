import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { GodotScript, GodotMethod, GodotProperty, GodotSignal, McpToolResponse } from '../types/index.js';

export class GodotScriptManager {
  constructor(private projectPath: string) {}

  async listScripts(includeAnalysis: boolean = false): Promise<McpToolResponse> {
    try {
      const scriptFiles = await glob('**/*.gd', {
        cwd: this.projectPath,
        ignore: ['**/node_modules/**', '**/dist/**'],
      });

      const scripts = [];
      
      for (const scriptFile of scriptFiles) {
        const scriptPath = path.join(this.projectPath, scriptFile);
        const scriptName = path.basename(scriptFile, '.gd');
        
        if (includeAnalysis) {
          const scriptData = await this.parseScriptFile(scriptPath);
          scripts.push({
            name: scriptName,
            path: scriptFile,
            ...scriptData,
          });
        } else {
          scripts.push({
            name: scriptName,
            path: scriptFile,
          });
        }
      }

      return {
        success: true,
        data: {
          scripts,
          totalCount: scripts.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list scripts',
      };
    }
  }

  async analyzeScript(scriptPath: string): Promise<McpToolResponse> {
    try {
      const fullPath = path.join(this.projectPath, scriptPath);
      
      if (!await fs.pathExists(fullPath)) {
        return {
          success: false,
          error: `Script file not found: ${scriptPath}`,
        };
      }

      const scriptData = await this.parseScriptFile(fullPath);
      
      return {
        success: true,
        data: {
          path: scriptPath,
          ...scriptData,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze script',
      };
    }
  }

  async generateTemplate(templateType: string, className: string, extendsClass: string = 'Node'): Promise<McpToolResponse> {
    try {
      const template = this.getScriptTemplate(templateType, className, extendsClass);
      
      return {
        success: true,
        data: {
          templateType,
          className,
          extendsClass,
          code: template,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate template',
      };
    }
  }

  private async parseScriptFile(filePath: string): Promise<Partial<GodotScript>> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      const script: Partial<GodotScript> = {
        methods: [],
        properties: [],
        signals: [],
      };
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Parse class definition
        if (line.startsWith('class_name ')) {
          script.className = line.split(' ')[1];
        }
        
        // Parse extends
        if (line.startsWith('extends ')) {
          script.extends = line.split(' ')[1];
        }
        
        // Parse signals
        if (line.startsWith('signal ')) {
          const signal = this.parseSignal(line);
          if (signal) {
            script.signals!.push(signal);
          }
        }
        
        // Parse properties/variables
        if (line.startsWith('@export') || line.startsWith('var ') || line.startsWith('const ')) {
          const property = this.parseProperty(line, lines[i - 1]);
          if (property) {
            script.properties!.push(property);
          }
        }
        
        // Parse functions
        if (line.startsWith('func ')) {
          const method = this.parseMethod(line);
          if (method) {
            script.methods!.push(method);
          }
        }
      }
      
      return script;
    } catch (error) {
      throw new Error(`Failed to parse script file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseSignal(line: string): GodotSignal | null {
    // Parse: signal signal_name(param1: Type, param2: Type)
    const match = line.match(/signal\s+(\w+)(\(([^)]*)\))?/);
    if (!match) return null;
    
    const name = match[1];
    const paramString = match[3] || '';
    const parameters = this.parseParameters(paramString);
    
    return { name, parameters };
  }

  private parseProperty(line: string, previousLine?: string): GodotProperty | null {
    let exported = false;
    let actualLine = line;
    
    // Check if previous line has @export
    if (previousLine && previousLine.trim().startsWith('@export')) {
      exported = true;
    }
    
    // Parse variable declaration
    const varMatch = actualLine.match(/(var|const)\s+(\w+)(\s*:\s*(\w+))?(\s*=\s*(.+))?/);
    if (!varMatch) return null;
    
    const name = varMatch[2];
    const type = varMatch[4];
    const value = varMatch[6];
    
    return {
      name,
      type,
      value,
      exported,
    };
  }

  private parseMethod(line: string): GodotMethod | null {
    // Parse: func method_name(param1: Type, param2: Type) -> ReturnType:
    const match = line.match(/func\s+(\w+)\(([^)]*)\)(\s*->\s*(\w+))?:/);
    if (!match) return null;
    
    const name = match[1];
    const paramString = match[2] || '';
    const returnType = match[4];
    const parameters = this.parseParameters(paramString);
    
    // Determine visibility (GDScript doesn't have explicit visibility, but convention)
    const visibility = name.startsWith('_') ? 'private' : 'public';
    
    return {
      name,
      parameters,
      returnType,
      visibility,
    };
  }

  private parseParameters(paramString: string): Array<{ name: string; type?: string; defaultValue?: any }> {
    if (!paramString.trim()) return [];
    
    return paramString.split(',').map(param => {
      const trimmed = param.trim();
      const parts = trimmed.split(':');
      
      if (parts.length === 1) {
        // No type specified
        const nameAndDefault = parts[0].split('=');
        return {
          name: nameAndDefault[0].trim(),
          defaultValue: nameAndDefault[1]?.trim(),
        };
      } else {
        // Type specified
        const name = parts[0].trim();
        const typeAndDefault = parts[1].split('=');
        return {
          name,
          type: typeAndDefault[0].trim(),
          defaultValue: typeAndDefault[1]?.trim(),
        };
      }
    });
  }

  private getScriptTemplate(templateType: string, className: string, extendsClass: string): string {
    const templates: Record<string, (className: string, extendsClass: string) => string> = {
      singleton: (name, base) => `extends ${base}

# ${name} - Global singleton manager
# Handles ${name.toLowerCase()} functionality across the application

signal ${name.toLowerCase()}_changed

var _instance: ${name}

func _ready() -> void:
	_instance = self
	initialize()

func initialize() -> void:
	# Initialize ${name.toLowerCase()} system
	pass

func get_instance() -> ${name}:
	return _instance
`,

      player: (name, base) => `extends ${base}
class_name ${name}

# ${name} - Player controller
# Handles player input, movement, and game interactions

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

func initialize_player() -> void:
	_is_alive = true
	health_changed.emit(health)

func handle_input() -> void:
	_input_vector = Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")

func update_movement(delta: float) -> void:
	if _input_vector != Vector2.ZERO:
		position += _input_vector * speed * delta

func take_damage(amount: int) -> void:
	health -= amount
	health_changed.emit(health)
	
	if health <= 0:
		die()

func die() -> void:
	_is_alive = false
	player_died.emit()
`,

      ui_controller: (name, base) => `extends ${base}
class_name ${name}

# ${name} - UI Controller
# Manages UI elements and user interactions

@export var fade_duration: float = 0.3

signal ui_interaction(action: String)

var _is_visible: bool = false

func _ready() -> void:
	setup_ui()
	connect_signals()

func setup_ui() -> void:
	# Initialize UI elements
	pass

func connect_signals() -> void:
	# Connect UI signals
	pass

func show_ui(animated: bool = true) -> void:
	if _is_visible:
		return
		
	_is_visible = true
	visible = true
	
	if animated:
		var tween = create_tween()
		modulate.a = 0.0
		tween.tween_property(self, "modulate:a", 1.0, fade_duration)
	else:
		modulate.a = 1.0

func hide_ui(animated: bool = true) -> void:
	if not _is_visible:
		return
		
	_is_visible = false
	
	if animated:
		var tween = create_tween()
		tween.tween_property(self, "modulate:a", 0.0, fade_duration)
		tween.tween_callback(func(): visible = false)
	else:
		visible = false
		modulate.a = 0.0
`,

      manager: (name, base) => `extends ${base}
class_name ${name}

# ${name} - Manager class
# Handles ${name.toLowerCase().replace('manager', '')} system management

signal ${name.toLowerCase()}_updated

var _data: Dictionary = {}
var _is_initialized: bool = false

func _ready() -> void:
	initialize()

func initialize() -> void:
	if _is_initialized:
		return
		
	_is_initialized = true
	load_data()
	${name.toLowerCase()}_updated.emit()

func load_data() -> void:
	# Load manager data
	pass

func save_data() -> void:
	# Save manager data
	pass

func get_data(key: String, default_value = null):
	return _data.get(key, default_value)

func set_data(key: String, value) -> void:
	_data[key] = value
	${name.toLowerCase()}_updated.emit()

func reset() -> void:
	_data.clear()
	${name.toLowerCase()}_updated.emit()
`,

      game_object: (name, base) => `extends ${base}
class_name ${name}

# ${name} - Game Object
# Generic game object with common functionality

@export var object_id: String
@export var is_active: bool = true

signal object_activated
signal object_deactivated
signal object_destroyed

var _initialized: bool = false

func _ready() -> void:
	initialize()

func initialize() -> void:
	if _initialized:
		return
		
	_initialized = true
	setup_object()

func setup_object() -> void:
	# Setup object-specific functionality
	pass

func activate() -> void:
	is_active = true
	set_process(true)
	set_physics_process(true)
	object_activated.emit()

func deactivate() -> void:
	is_active = false
	set_process(false)
	set_physics_process(false)
	object_deactivated.emit()

func destroy() -> void:
	object_destroyed.emit()
	queue_free()
`,
    };

    const template = templates[templateType];
    if (!template) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    return template(className, extendsClass);
  }
}