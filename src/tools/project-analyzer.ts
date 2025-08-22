import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { GodotProject, McpToolResponse } from '../types/index.js';

export class GodotProjectAnalyzer {
  constructor(private projectPath: string) {}

  async getProjectInfo(): Promise<McpToolResponse> {
    try {
      const projectFilePath = path.join(this.projectPath, 'project.godot');
      
      if (!await fs.pathExists(projectFilePath)) {
        return {
          success: false,
          error: 'project.godot file not found. This does not appear to be a Godot project.',
        };
      }

      const projectContent = await fs.readFile(projectFilePath, 'utf-8');
      const project = this.parseProjectFile(projectContent);
      
      // Get additional project statistics
      const stats = await this.getProjectStatistics();
      
      return {
        success: true,
        data: {
          ...project,
          path: this.projectPath,
          statistics: stats,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze project',
      };
    }
  }

  private parseProjectFile(content: string): Partial<GodotProject> {
    const lines = content.split('\n');
    const project: Partial<GodotProject> = {
      autoloads: {},
    };

    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (trimmed.startsWith(';') || trimmed === '') continue;
      
      // Section headers
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSection = trimmed.slice(1, -1);
        continue;
      }
      
      // Key-value pairs
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) continue;
      
      const key = trimmed.slice(0, equalIndex).trim();
      const value = trimmed.slice(equalIndex + 1).trim();
      
      switch (currentSection) {
        case 'application':
          this.parseApplicationSection(key, value, project);
          break;
        case 'autoload':
          this.parseAutoloadSection(key, value, project);
          break;
      }
    }
    
    return project;
  }

  private parseApplicationSection(key: string, value: string, project: Partial<GodotProject>): void {
    switch (key) {
      case 'config/name':
        project.name = this.parseStringValue(value);
        break;
      case 'config/description':
        project.description = this.parseStringValue(value);
        break;
      case 'run/main_scene':
        project.mainScene = this.parseStringValue(value);
        break;
      case 'config/icon':
        project.icon = this.parseStringValue(value);
        break;
      case 'config/features':
        project.features = this.parseArrayValue(value);
        break;
    }
  }

  private parseAutoloadSection(key: string, value: string, project: Partial<GodotProject>): void {
    if (project.autoloads) {
      // Remove the "*" prefix if present (indicates singleton)
      const scriptPath = value.startsWith('"*') 
        ? this.parseStringValue(value.slice(1))
        : this.parseStringValue(value);
      project.autoloads[key] = scriptPath;
    }
  }

  private parseStringValue(value: string): string {
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    return value;
  }

  private parseArrayValue(value: string): string[] {
    // Parse PackedStringArray format: PackedStringArray("value1", "value2")
    const match = value.match(/PackedStringArray\((.*)\)/);
    if (match) {
      const content = match[1];
      return content.split(',').map(item => 
        this.parseStringValue(item.trim())
      ).filter(item => item.length > 0);
    }
    return [];
  }

  private async getProjectStatistics(): Promise<Record<string, any>> {
    try {
      const [scenes, scripts, assets] = await Promise.all([
        this.countFiles('**/*.tscn'),
        this.countFiles('**/*.gd'),
        this.countFiles('**/*.{png,jpg,jpeg,svg,wav,ogg,mp3}'),
      ]);

      return {
        sceneCount: scenes,
        scriptCount: scripts,
        assetCount: assets,
        projectSize: await this.getDirectorySize(),
      };
    } catch (error) {
      return {
        error: 'Failed to calculate project statistics',
      };
    }
  }

  private async countFiles(pattern: string): Promise<number> {
    try {
      const files = await glob(pattern, {
        cwd: this.projectPath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      });
      return files.length;
    } catch {
      return 0;
    }
  }

  private async getDirectorySize(): Promise<string> {
    try {
      const stats = await fs.stat(this.projectPath);
      const sizeInBytes = stats.size;
      
      if (sizeInBytes < 1024) return `${sizeInBytes} B`;
      if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
      if (sizeInBytes < 1024 * 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } catch {
      return 'Unknown';
    }
  }
}