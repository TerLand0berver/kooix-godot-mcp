import fs from 'fs-extra';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { McpToolResponse } from '../types/index.js';

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

export class GodotDebugger {
  private projectPath: string;
  private activeSessions: Map<string, DebugSession> = new Map();
  private godotProcesses: Map<string, ChildProcess> = new Map();

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  async analyzeErrorLog(logContent?: string): Promise<McpToolResponse> {
    try {
      let content = logContent;
      
      if (!content) {
        // Try to find Godot log files
        const logPath = await this.findGodotLogFile();
        if (logPath) {
          content = await fs.readFile(logPath, 'utf-8');
        } else {
          return {
            success: false,
            error: 'No log content provided and could not find Godot log file',
          };
        }
      }

      const errors = this.parseLogContent(content);
      const analysis = this.analyzeErrors(errors);
      
      return {
        success: true,
        data: {
          errors: errors.filter(e => e.type === 'error'),
          warnings: errors.filter(e => e.type === 'warning'),
          analysis,
          suggestions: this.generateErrorSuggestions(errors),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze error log',
      };
    }
  }

  async startDebugSession(sessionId?: string): Promise<McpToolResponse> {
    try {
      const id = sessionId || this.generateSessionId();
      
      if (this.activeSessions.has(id)) {
        return {
          success: false,
          error: `Debug session ${id} already exists`,
        };
      }

      const session: DebugSession = {
        id,
        startTime: new Date(),
        errors: [],
        warnings: [],
        status: 'running',
        projectPath: this.projectPath,
      };

      this.activeSessions.set(id, session);
      
      // Start monitoring Godot process if available
      const godotProcess = await this.startGodotWithLogging(id);
      if (godotProcess) {
        this.godotProcesses.set(id, godotProcess);
      }

      return {
        success: true,
        data: {
          sessionId: id,
          startTime: session.startTime,
          status: session.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start debug session',
      };
    }
  }

  async stopDebugSession(sessionId: string): Promise<McpToolResponse> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: `Debug session ${sessionId} not found`,
        };
      }

      session.endTime = new Date();
      session.status = 'stopped';

      // Stop Godot process if running
      const process = this.godotProcesses.get(sessionId);
      if (process) {
        process.kill();
        this.godotProcesses.delete(sessionId);
      }

      const sessionData = {
        ...session,
        duration: session.endTime.getTime() - session.startTime.getTime(),
        totalErrors: session.errors.length,
        totalWarnings: session.warnings.length,
      };

      this.activeSessions.delete(sessionId);

      return {
        success: true,
        data: sessionData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop debug session',
      };
    }
  }

  async getDebugSession(sessionId: string): Promise<McpToolResponse> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          error: `Debug session ${sessionId} not found`,
        };
      }

      return {
        success: true,
        data: {
          ...session,
          isActive: session.status === 'running',
          recentErrors: session.errors.slice(-10),
          recentWarnings: session.warnings.slice(-10),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get debug session',
      };
    }
  }

  async analyzeCrashDump(crashInfo: string): Promise<McpToolResponse> {
    try {
      const analysis = this.parseCrashDump(crashInfo);
      const suggestions = this.generateCrashSuggestions(analysis);
      
      return {
        success: true,
        data: {
          crashType: analysis.type,
          location: analysis.location,
          stackTrace: analysis.stackTrace,
          possibleCauses: analysis.causes,
          suggestions,
          fixExamples: this.generateFixExamples(analysis),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze crash dump',
      };
    }
  }

  async diagnoseProject(): Promise<McpToolResponse> {
    try {
      const diagnostics = {
        projectStructure: await this.checkProjectStructure(),
        scriptErrors: await this.checkScriptSyntax(),
        sceneErrors: await this.checkSceneIntegrity(),
        dependencyIssues: await this.checkDependencies(),
        performanceIssues: await this.checkPerformanceIssues(),
      };

      const overallHealth = this.calculateProjectHealth(diagnostics);
      
      return {
        success: true,
        data: {
          health: overallHealth,
          diagnostics,
          recommendations: this.generateHealthRecommendations(diagnostics),
          priorityFixes: this.identifyPriorityFixes(diagnostics),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to diagnose project',
      };
    }
  }

  async suggestFix(errorMessage: string, context?: string): Promise<McpToolResponse> {
    try {
      const errorPattern = this.identifyErrorPattern(errorMessage);
      const suggestions = this.getFixSuggestions(errorPattern, context);
      
      return {
        success: true,
        data: {
          errorType: errorPattern.type,
          category: errorPattern.category,
          suggestions,
          codeExamples: errorPattern.examples,
          documentation: errorPattern.docs,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to suggest fix',
      };
    }
  }

  private async findGodotLogFile(): Promise<string | null> {
    const possiblePaths = [
      path.join(this.projectPath, '.godot', 'logs'),
      path.join(process.env.APPDATA || '', 'Godot', 'logs'),
      path.join(process.env.HOME || '', '.local', 'share', 'godot', 'logs'),
    ];

    for (const logDir of possiblePaths) {
      try {
        if (await fs.pathExists(logDir)) {
          const files = await fs.readdir(logDir);
          const logFiles = files.filter(f => f.endsWith('.log')).sort().reverse();
          if (logFiles.length > 0) {
            return path.join(logDir, logFiles[0]);
          }
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  private parseLogContent(content: string): GodotError[] {
    const lines = content.split('\n');
    const errors: GodotError[] = [];

    for (const line of lines) {
      const error = this.parseLogLine(line);
      if (error) {
        errors.push(error);
      }
    }

    return errors;
  }

  private parseLogLine(line: string): GodotError | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Parse different Godot log formats
    const patterns = [
      // Error pattern: ERROR: message at: file:line
      /^ERROR:\s*(.+?)\s+at:\s+(.+):(\d+)/,
      // Warning pattern: WARNING: message at: file:line  
      /^WARNING:\s*(.+?)\s+at:\s+(.+):(\d+)/,
      // Script error pattern
      /^(.+\.gd):(\d+):\s*(.+)/,
      // General error pattern
      /^(ERROR|WARNING|INFO):\s*(.+)/,
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return this.createErrorFromMatch(match, trimmed);
      }
    }

    return null;
  }

  private createErrorFromMatch(match: RegExpMatchArray, originalLine: string): GodotError {
    const error: GodotError = {
      type: 'error',
      message: '',
      timestamp: new Date().toISOString(),
    };

    if (match[0].startsWith('ERROR:')) {
      error.type = 'error';
      error.message = match[1];
      if (match[2]) error.file = match[2];
      if (match[3]) error.line = parseInt(match[3]);
    } else if (match[0].startsWith('WARNING:')) {
      error.type = 'warning';
      error.message = match[1];
      if (match[2]) error.file = match[2];
      if (match[3]) error.line = parseInt(match[3]);
    } else if (match[1]?.endsWith('.gd')) {
      error.type = 'error';
      error.file = match[1];
      error.line = parseInt(match[2]);
      error.message = match[3];
    } else {
      error.type = match[1]?.toLowerCase() as any || 'error';
      error.message = match[2] || originalLine;
    }

    error.category = this.categorizeError(error.message);
    return error;
  }

  private categorizeError(message: string): string {
    const categories = {
      syntax: ['syntax error', 'unexpected token', 'expected'],
      runtime: ['null reference', 'index out of bounds', 'division by zero'],
      scene: ['scene not found', 'node not found', 'invalid scene'],
      resource: ['resource not found', 'failed to load', 'missing resource'],
      network: ['connection failed', 'timeout', 'network error'],
      audio: ['audio', 'sound', 'music'],
      physics: ['collision', 'physics', 'rigidbody'],
      input: ['input', 'mouse', 'keyboard'],
    };

    const lowerMessage = message.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  private analyzeErrors(errors: GodotError[]): any {
    const analysis = {
      totalErrors: errors.filter(e => e.type === 'error').length,
      totalWarnings: errors.filter(e => e.type === 'warning').length,
      categories: {} as Record<string, number>,
      files: {} as Record<string, number>,
      patterns: [] as string[],
    };

    errors.forEach(error => {
      // Count by category
      const category = error.category || 'unknown';
      analysis.categories[category] = (analysis.categories[category] || 0) + 1;

      // Count by file
      if (error.file) {
        analysis.files[error.file] = (analysis.files[error.file] || 0) + 1;
      }
    });

    // Identify common patterns
    analysis.patterns = this.identifyErrorPatterns(errors);

    return analysis;
  }

  private identifyErrorPatterns(errors: GodotError[]): string[] {
    const patterns: string[] = [];
    const messages = errors.map(e => e.message);

    // Check for repeated errors
    const messageCounts: Record<string, number> = {};
    messages.forEach(msg => {
      messageCounts[msg] = (messageCounts[msg] || 0) + 1;
    });

    Object.entries(messageCounts).forEach(([message, count]) => {
      if (count > 3) {
        patterns.push(`Repeated error: "${message}" (${count} times)`);
      }
    });

    // Check for cascading errors
    const fileErrors = errors.filter(e => e.file);
    const fileGroups = this.groupBy(fileErrors, e => e.file!);
    
    Object.entries(fileGroups).forEach(([file, fileErrorList]) => {
      if (fileErrorList.length > 5) {
        patterns.push(`Multiple errors in ${file} (${fileErrorList.length} errors)`);
      }
    });

    return patterns;
  }

  private generateErrorSuggestions(errors: GodotError[]): string[] {
    const suggestions: string[] = [];
    const categories = this.groupBy(errors, e => e.category || 'unknown');

    Object.entries(categories).forEach(([category, categoryErrors]) => {
      const count = categoryErrors.length;
      switch (category) {
        case 'syntax':
          suggestions.push(`${count} syntax errors found. Check for missing semicolons, brackets, or typos.`);
          break;
        case 'runtime':
          suggestions.push(`${count} runtime errors. Add null checks and bounds validation.`);
          break;
        case 'scene':
          suggestions.push(`${count} scene errors. Verify scene paths and node references.`);
          break;
        case 'resource':
          suggestions.push(`${count} resource errors. Check file paths and resource existence.`);
          break;
      }
    });

    return suggestions;
  }

  private generateSessionId(): string {
    return `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async startGodotWithLogging(sessionId: string): Promise<ChildProcess | null> {
    try {
      // Try to find Godot executable
      const godotPath = await this.findGodotExecutable();
      if (!godotPath) return null;

      const process = spawn(godotPath, ['--path', this.projectPath, '--verbose'], {
        stdio: 'pipe',
      });

      const session = this.activeSessions.get(sessionId);
      if (!session) return null;

      process.stdout?.on('data', (data) => {
        const output = data.toString();
        const errors = this.parseLogContent(output);
        session.errors.push(...errors.filter(e => e.type === 'error'));
        session.warnings.push(...errors.filter(e => e.type === 'warning'));
      });

      process.stderr?.on('data', (data) => {
        const output = data.toString();
        const errors = this.parseLogContent(output);
        session.errors.push(...errors);
      });

      process.on('exit', (code) => {
        if (code !== 0) {
          session.status = 'crashed';
        } else {
          session.status = 'stopped';
        }
      });

      return process;
    } catch {
      return null;
    }
  }

  private async findGodotExecutable(): Promise<string | null> {
    const possibleNames = ['godot', 'godot.exe', 'Godot', 'Godot.exe'];
    
    // Check PATH
    for (const name of possibleNames) {
      try {
        const result = spawn('which', [name], { stdio: 'pipe' });
        if (result.exitCode === 0) {
          return name;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  private parseCrashDump(crashInfo: string): any {
    const analysis = {
      type: 'unknown',
      location: null as string | null,
      stackTrace: [] as string[],
      causes: [] as string[],
    };

    const lines = crashInfo.split('\n');
    
    for (const line of lines) {
      if (line.includes('Segmentation fault') || line.includes('SIGSEGV')) {
        analysis.type = 'segmentation_fault';
        analysis.causes.push('Memory access violation', 'Null pointer dereference', 'Buffer overflow');
      } else if (line.includes('Stack overflow') || line.includes('SIGSTK')) {
        analysis.type = 'stack_overflow';
        analysis.causes.push('Infinite recursion', 'Excessive local variables', 'Deep function calls');
      } else if (line.includes('at ') && line.includes(':')) {
        const match = line.match(/at (.+):(\d+)/);
        if (match) {
          analysis.location = `${match[1]}:${match[2]}`;
          analysis.stackTrace.push(line.trim());
        }
      }
    }

    return analysis;
  }

  private generateCrashSuggestions(analysis: any): string[] {
    const suggestions: string[] = [];

    switch (analysis.type) {
      case 'segmentation_fault':
        suggestions.push(
          'Add null checks before accessing objects',
          'Validate array indices before access',
          'Use safe references instead of direct memory access'
        );
        break;
      case 'stack_overflow':
        suggestions.push(
          'Check for infinite recursion in your code',
          'Reduce local variable usage in deep functions',
          'Consider iterative solutions instead of recursive ones'
        );
        break;
      default:
        suggestions.push('Enable debug mode for more detailed crash information');
    }

    return suggestions;
  }

  private generateFixExamples(analysis: any): any[] {
    const examples: any[] = [];

    if (analysis.type === 'segmentation_fault') {
      examples.push({
        title: 'Null Check Example',
        before: `func _ready():
    player.health = 100  # May crash if player is null`,
        after: `func _ready():
    if player != null:
        player.health = 100
    else:
        print("Player not found!")`
      });
    }

    return examples;
  }

  private async checkProjectStructure(): Promise<any> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for required files
    const requiredFiles = ['project.godot'];
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectPath, file);
      if (!await fs.pathExists(filePath)) {
        issues.push(`Missing required file: ${file}`);
      }
    }

    // Check directory structure
    const recommendedDirs = ['scenes', 'scripts', 'assets'];
    for (const dir of recommendedDirs) {
      const dirPath = path.join(this.projectPath, dir);
      if (!await fs.pathExists(dirPath)) {
        recommendations.push(`Consider creating ${dir} directory for better organization`);
      }
    }

    return { issues, recommendations };
  }

  private async checkScriptSyntax(): Promise<any> {
    const issues: string[] = [];
    
    try {
      const scriptFiles = await this.getAllGDScripts();
      
      for (const scriptFile of scriptFiles) {
        const content = await fs.readFile(scriptFile, 'utf-8');
        const syntaxIssues = this.checkGDScriptSyntax(content, scriptFile);
        issues.push(...syntaxIssues);
      }
    } catch (error) {
      issues.push('Failed to check script syntax');
    }

    return { issues, count: issues.length };
  }

  private checkGDScriptSyntax(content: string, filePath: string): string[] {
    const issues: string[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Basic syntax checks
      if (line.includes('func ') && !line.includes(':')) {
        issues.push(`${filePath}:${lineNum} - Missing colon after function declaration`);
      }
      
      if (line.trim().startsWith('if ') && !line.includes(':')) {
        issues.push(`${filePath}:${lineNum} - Missing colon after if statement`);
      }
    }

    return issues;
  }

  private async checkSceneIntegrity(): Promise<any> {
    const issues: string[] = [];
    
    try {
      const sceneFiles = await this.getAllScenes();
      
      for (const sceneFile of sceneFiles) {
        const content = await fs.readFile(sceneFile, 'utf-8');
        const sceneIssues = this.validateScene(content, sceneFile);
        issues.push(...sceneIssues);
      }
    } catch (error) {
      issues.push('Failed to check scene integrity');
    }

    return { issues, count: issues.length };
  }

  private validateScene(content: string, filePath: string): string[] {
    const issues: string[] = [];

    // Check for missing scripts
    const scriptMatches = content.match(/script\s*=\s*ExtResource\([^)]+\)/g);
    if (scriptMatches) {
      for (const match of scriptMatches) {
        // Could check if script files exist
      }
    }

    return issues;
  }

  private async checkDependencies(): Promise<any> {
    const issues: string[] = [];
    
    // Check autoloads
    try {
      const projectContent = await fs.readFile(path.join(this.projectPath, 'project.godot'), 'utf-8');
      const autoloadMatches = projectContent.match(/\w+="[*]?res:\/\/[^"]+"/g) || [];
      
      for (const autoload of autoloadMatches) {
        const pathMatch = autoload.match(/"([^"]+)"/);
        if (pathMatch) {
          const scriptPath = pathMatch[1].replace('res://', '');
          const fullPath = path.join(this.projectPath, scriptPath);
          
          if (!await fs.pathExists(fullPath)) {
            issues.push(`Missing autoload script: ${scriptPath}`);
          }
        }
      }
    } catch {
      issues.push('Could not check autoload dependencies');
    }

    return { issues, count: issues.length };
  }

  private async checkPerformanceIssues(): Promise<any> {
    const issues: string[] = [];
    
    try {
      const scriptFiles = await this.getAllGDScripts();
      
      for (const scriptFile of scriptFiles) {
        const content = await fs.readFile(scriptFile, 'utf-8');
        const perfIssues = this.analyzeScriptPerformance(content, scriptFile);
        issues.push(...perfIssues);
      }
    } catch {
      issues.push('Failed to analyze performance');
    }

    return { issues, count: issues.length };
  }

  private analyzeScriptPerformance(content: string, filePath: string): string[] {
    const issues: string[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      // Check for expensive operations in _process
      if (content.includes('func _process(') || content.includes('func _physics_process(')) {
        if (line.includes('find_node(') || line.includes('get_node(')) {
          issues.push(`${filePath}:${lineNum} - Node lookup in process function - cache the reference`);
        }
        
        if (line.includes('instantiate()')) {
          issues.push(`${filePath}:${lineNum} - Object instantiation in process function - use object pooling`);
        }
      }
    }

    return issues;
  }

  private calculateProjectHealth(diagnostics: any): string {
    let score = 100;
    
    score -= diagnostics.projectStructure.issues.length * 5;
    score -= diagnostics.scriptErrors.count * 3;
    score -= diagnostics.sceneErrors.count * 2;
    score -= diagnostics.dependencyIssues.count * 4;
    score -= diagnostics.performanceIssues.count * 2;

    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }

  private generateHealthRecommendations(diagnostics: any): string[] {
    const recommendations: string[] = [];
    
    if (diagnostics.scriptErrors.count > 0) {
      recommendations.push('Fix script syntax errors to prevent runtime issues');
    }
    
    if (diagnostics.performanceIssues.count > 5) {
      recommendations.push('Address performance issues to improve game responsiveness');
    }
    
    if (diagnostics.dependencyIssues.count > 0) {
      recommendations.push('Resolve missing dependencies to prevent crashes');
    }

    return recommendations;
  }

  private identifyPriorityFixes(diagnostics: any): string[] {
    const fixes: string[] = [];
    
    // High priority: crashes and errors
    if (diagnostics.dependencyIssues.count > 0) {
      fixes.push('Missing dependencies (High Priority)');
    }
    
    if (diagnostics.scriptErrors.count > 0) {
      fixes.push('Script syntax errors (High Priority)');
    }
    
    // Medium priority: performance and warnings
    if (diagnostics.performanceIssues.count > 3) {
      fixes.push('Performance optimizations (Medium Priority)');
    }

    return fixes;
  }

  private identifyErrorPattern(errorMessage: string): any {
    const patterns = {
      nullReference: {
        type: 'Null Reference',
        category: 'runtime',
        keywords: ['null', 'invalid get index', 'invalid call'],
        examples: [{
          title: 'Null Check',
          code: `if node != null:
    node.do_something()`
        }],
        docs: 'Always check if objects exist before using them'
      },
      sceneNotFound: {
        type: 'Scene Not Found',
        category: 'resource',
        keywords: ['scene not found', 'failed to load scene'],
        examples: [{
          title: 'Scene Loading',
          code: `var scene = load("res://scenes/MyScene.tscn")
if scene:
    var instance = scene.instantiate()`
        }],
        docs: 'Verify scene paths are correct and files exist'
      }
    };

    const lowerMessage = errorMessage.toLowerCase();
    
    for (const pattern of Object.values(patterns)) {
      if (pattern.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return pattern;
      }
    }

    return {
      type: 'Unknown Error',
      category: 'general',
      examples: [],
      docs: 'Check Godot documentation for more information'
    };
  }

  private getFixSuggestions(errorPattern: any, context?: string): string[] {
    const suggestions: string[] = [];
    
    switch (errorPattern.type) {
      case 'Null Reference':
        suggestions.push(
          'Add null checks before accessing objects',
          'Initialize variables before use',
          'Use is_valid() for object validation'
        );
        break;
      case 'Scene Not Found':
        suggestions.push(
          'Verify the scene path is correct',
          'Check if the scene file exists',
          'Use resource preloading for frequently used scenes'
        );
        break;
      default:
        suggestions.push('Check the Godot documentation for this error type');
    }

    return suggestions;
  }

  private async getAllGDScripts(): Promise<string[]> {
    const scripts: string[] = [];
    await this.walkDirectory(this.projectPath, (filePath) => {
      if (filePath.endsWith('.gd')) {
        scripts.push(filePath);
      }
    });
    return scripts;
  }

  private async getAllScenes(): Promise<string[]> {
    const scenes: string[] = [];
    await this.walkDirectory(this.projectPath, (filePath) => {
      if (filePath.endsWith('.tscn')) {
        scenes.push(filePath);
      }
    });
    return scenes;
  }

  private async walkDirectory(dir: string, callback: (filePath: string) => void): Promise<void> {
    try {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.lstat(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          await this.walkDirectory(fullPath, callback);
        } else if (stat.isFile()) {
          callback(fullPath);
        }
      }
    } catch {
      // Ignore errors for inaccessible directories
    }
  }

  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((result, item) => {
      const key = keyFn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
      return result;
    }, {} as Record<string, T[]>);
  }
}