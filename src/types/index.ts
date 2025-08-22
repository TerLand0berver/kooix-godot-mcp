export interface GodotProject {
  name: string;
  description: string;
  version: string;
  features: string[];
  mainScene: string;
  icon: string;
  autoloads: Record<string, string>;
  path: string;
}

export interface GodotScene {
  name: string;
  path: string;
  rootNode: string;
  nodes: GodotNode[];
}

export interface GodotNode {
  name: string;
  type: string;
  parent?: string;
  properties: Record<string, any>;
  children: GodotNode[];
}

export interface GodotScript {
  path: string;
  className?: string;
  extends?: string;
  methods: GodotMethod[];
  properties: GodotProperty[];
  signals: GodotSignal[];
}

export interface GodotMethod {
  name: string;
  parameters: GodotParameter[];
  returnType?: string;
  visibility: 'public' | 'private' | 'protected';
}

export interface GodotParameter {
  name: string;
  type?: string;
  defaultValue?: any;
}

export interface GodotProperty {
  name: string;
  type?: string;
  value?: any;
  exported: boolean;
}

export interface GodotSignal {
  name: string;
  parameters: GodotParameter[];
}

export interface McpToolRequest {
  toolName: string;
  arguments: Record<string, any>;
}

export interface McpToolResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface GodotError {
  type: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  stackTrace?: string[];
  timestamp?: string;
  category?: string;
}

export interface DebugSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  errors: GodotError[];
  warnings: GodotError[];
  status: 'running' | 'stopped' | 'crashed';
  projectPath: string;
}

export interface DiagnosticResult {
  health: string;
  diagnostics: {
    projectStructure: any;
    scriptErrors: any;
    sceneErrors: any;
    dependencyIssues: any;
    performanceIssues: any;
  };
  recommendations: string[];
  priorityFixes: string[];
}