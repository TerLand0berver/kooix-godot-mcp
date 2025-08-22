#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { program } from 'commander';
import path from 'path';
import { GodotProjectAnalyzer } from './tools/project-analyzer.js';
import { GodotSceneManager } from './tools/scene-manager.js';
import { GodotScriptManager } from './tools/script-manager.js';
import { GameDevTools } from './tools/game-dev-tools.js';
import { GodotDebugger } from './tools/godot-debugger.js';
import { McpToolRequest, McpToolResponse } from './types/index.js';

class GodotMcpServer {
  private server: Server;
  private projectPath: string;
  private projectAnalyzer: GodotProjectAnalyzer;
  private sceneManager: GodotSceneManager;
  private scriptManager: GodotScriptManager;
  private gameDevTools: GameDevTools;
  private debugger: GodotDebugger;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = path.resolve(projectPath);
    this.server = new Server({
      name: 'godot-mcp',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.projectAnalyzer = new GodotProjectAnalyzer(this.projectPath);
    this.sceneManager = new GodotSceneManager(this.projectPath);
    this.scriptManager = new GodotScriptManager(this.projectPath);
    this.gameDevTools = new GameDevTools(this.projectPath);
    this.debugger = new GodotDebugger(this.projectPath);

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const response = await this.handleToolCall({
          toolName: request.params.name,
          arguments: request.params.arguments || {},
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getAvailableTools(): Tool[] {
    return [
      // Project Analysis Tools
      {
        name: 'get_project_info',
        description: 'Get Godot project information including configuration, autoloads, and metadata',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_scenes',
        description: 'List all scenes in the Godot project',
        inputSchema: {
          type: 'object',
          properties: {
            includeDetails: {
              type: 'boolean',
              description: 'Include detailed scene structure information',
              default: false,
            },
          },
        },
      },
      {
        name: 'list_scripts',
        description: 'List all GDScript files in the project',
        inputSchema: {
          type: 'object',
          properties: {
            includeAnalysis: {
              type: 'boolean',
              description: 'Include script analysis (methods, properties, etc.)',
              default: false,
            },
          },
        },
      },
      // Scene Management Tools
      {
        name: 'analyze_scene',
        description: 'Analyze a specific scene file and return its structure',
        inputSchema: {
          type: 'object',
          properties: {
            scenePath: {
              type: 'string',
              description: 'Relative path to the scene file',
            },
          },
          required: ['scenePath'],
        },
      },
      // Script Management Tools
      {
        name: 'analyze_script',
        description: 'Analyze a GDScript file and return its structure',
        inputSchema: {
          type: 'object',
          properties: {
            scriptPath: {
              type: 'string',
              description: 'Relative path to the script file',
            },
          },
          required: ['scriptPath'],
        },
      },
      {
        name: 'generate_script_template',
        description: 'Generate a GDScript template for common patterns',
        inputSchema: {
          type: 'object',
          properties: {
            templateType: {
              type: 'string',
              enum: ['singleton', 'player', 'ui_controller', 'manager', 'game_object'],
              description: 'Type of script template to generate',
            },
            className: {
              type: 'string',
              description: 'Name of the class',
            },
            extendsClass: {
              type: 'string',
              description: 'Base class to extend from',
              default: 'Node',
            },
          },
          required: ['templateType', 'className'],
        },
      },
      // Game Development Tools
      {
        name: 'analyze_game_architecture',
        description: 'Analyze the overall game architecture including managers, scenes, and design patterns',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'generate_ui_component',
        description: 'Generate UI component templates for common game elements',
        inputSchema: {
          type: 'object',
          properties: {
            componentType: {
              type: 'string',
              enum: ['menu', 'dialog', 'hud', 'card', 'board'],
              description: 'Type of UI component to generate',
            },
            componentName: {
              type: 'string',
              description: 'Name of the UI component',
            },
            options: {
              type: 'object',
              description: 'Additional options for component generation',
              default: {},
            },
          },
          required: ['componentType', 'componentName'],
        },
      },
      {
        name: 'optimize_game_performance',
        description: 'Analyze project for performance issues and provide optimization recommendations',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'generate_network_system',
        description: 'Generate networking system templates for multiplayer games',
        inputSchema: {
          type: 'object',
          properties: {
            networkType: {
              type: 'string',
              enum: ['multiplayer', 'rest_api'],
              description: 'Type of networking system to generate',
            },
          },
          required: ['networkType'],
        },
      },
      // Debug and Error Analysis Tools
      {
        name: 'analyze_error_log',
        description: 'Analyze Godot error logs and provide suggestions for fixes',
        inputSchema: {
          type: 'object',
          properties: {
            logContent: {
              type: 'string',
              description: 'Error log content to analyze (optional - will try to find log file)',
            },
          },
        },
      },
      {
        name: 'start_debug_session',
        description: 'Start a debug session to monitor errors and warnings',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Optional custom session ID',
            },
          },
        },
      },
      {
        name: 'stop_debug_session',
        description: 'Stop an active debug session and get results',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Debug session ID to stop',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'get_debug_session',
        description: 'Get information about an active debug session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Debug session ID to query',
            },
          },
          required: ['sessionId'],
        },
      },
      {
        name: 'analyze_crash_dump',
        description: 'Analyze crash information and provide debugging guidance',
        inputSchema: {
          type: 'object',
          properties: {
            crashInfo: {
              type: 'string',
              description: 'Crash dump or error information',
            },
          },
          required: ['crashInfo'],
        },
      },
      {
        name: 'diagnose_project',
        description: 'Perform comprehensive project health diagnosis',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'suggest_fix',
        description: 'Get specific fix suggestions for error messages',
        inputSchema: {
          type: 'object',
          properties: {
            errorMessage: {
              type: 'string',
              description: 'The error message to analyze',
            },
            context: {
              type: 'string',
              description: 'Additional context about the error (optional)',
            },
          },
          required: ['errorMessage'],
        },
      },
    ];
  }

  private async handleToolCall(request: McpToolRequest): Promise<McpToolResponse> {
    switch (request.toolName) {
      case 'get_project_info':
        return await this.projectAnalyzer.getProjectInfo();

      case 'list_scenes':
        return await this.sceneManager.listScenes(request.arguments.includeDetails);

      case 'list_scripts':
        return await this.scriptManager.listScripts(request.arguments.includeAnalysis);

      case 'analyze_scene':
        return await this.sceneManager.analyzeScene(request.arguments.scenePath);

      case 'analyze_script':
        return await this.scriptManager.analyzeScript(request.arguments.scriptPath);

      case 'generate_script_template':
        return await this.scriptManager.generateTemplate(
          request.arguments.templateType,
          request.arguments.className,
          request.arguments.extendsClass
        );

      case 'analyze_game_architecture':
        return await this.gameDevTools.analyzeGameArchitecture();

      case 'generate_ui_component':
        return await this.gameDevTools.generateUIComponent(
          request.arguments.componentType,
          request.arguments.componentName,
          request.arguments.options || {}
        );

      case 'optimize_game_performance':
        return await this.gameDevTools.optimizeGamePerformance();

      case 'generate_network_system':
        return await this.gameDevTools.generateNetworkSystem(request.arguments.networkType);

      case 'analyze_error_log':
        return await this.debugger.analyzeErrorLog(request.arguments.logContent);

      case 'start_debug_session':
        return await this.debugger.startDebugSession(request.arguments.sessionId);

      case 'stop_debug_session':
        return await this.debugger.stopDebugSession(request.arguments.sessionId);

      case 'get_debug_session':
        return await this.debugger.getDebugSession(request.arguments.sessionId);

      case 'analyze_crash_dump':
        return await this.debugger.analyzeCrashDump(request.arguments.crashInfo);

      case 'diagnose_project':
        return await this.debugger.diagnoseProject();

      case 'suggest_fix':
        return await this.debugger.suggestFix(request.arguments.errorMessage, request.arguments.context);

      default:
        throw new Error(`Unknown tool: ${request.toolName}`);
    }
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Godot MCP server started');
  }
}

// CLI setup
program
  .name('godot-mcp')
  .description('Model Context Protocol server for Godot game engine')
  .version('1.0.0')
  .option('-p, --project <path>', 'Path to Godot project', process.cwd())
  .action(async (options) => {
    const server = new GodotMcpServer(options.project);
    await server.start();
  });

if (require.main === module) {
  program.parse();
}