import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { GodotScene, GodotNode, McpToolResponse } from '../types/index.js';

export class GodotSceneManager {
  constructor(private projectPath: string) {}

  async listScenes(includeDetails: boolean = false): Promise<McpToolResponse> {
    try {
      const sceneFiles = await glob('**/*.tscn', {
        cwd: this.projectPath,
        ignore: ['**/node_modules/**', '**/dist/**'],
      });

      const scenes = [];
      
      for (const sceneFile of sceneFiles) {
        const scenePath = path.join(this.projectPath, sceneFile);
        const sceneName = path.basename(sceneFile, '.tscn');
        
        if (includeDetails) {
          const sceneData = await this.parseSceneFile(scenePath);
          scenes.push({
            name: sceneName,
            path: sceneFile,
            ...sceneData,
          });
        } else {
          scenes.push({
            name: sceneName,
            path: sceneFile,
          });
        }
      }

      return {
        success: true,
        data: {
          scenes,
          totalCount: scenes.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list scenes',
      };
    }
  }

  async analyzeScene(scenePath: string): Promise<McpToolResponse> {
    try {
      const fullPath = path.join(this.projectPath, scenePath);
      
      if (!await fs.pathExists(fullPath)) {
        return {
          success: false,
          error: `Scene file not found: ${scenePath}`,
        };
      }

      const sceneData = await this.parseSceneFile(fullPath);
      
      return {
        success: true,
        data: {
          name: path.basename(scenePath, '.tscn'),
          path: scenePath,
          ...sceneData,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze scene',
      };
    }
  }

  private async parseSceneFile(filePath: string): Promise<Partial<GodotScene>> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      let rootNode = '';
      const nodes: GodotNode[] = [];
      let currentNode: Partial<GodotNode> | null = null;
      let currentSection = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          // Save previous node if exists
          if (currentNode && currentNode.name) {
            nodes.push(currentNode as GodotNode);
          }
          
          currentSection = trimmed.slice(1, -1);
          currentNode = null;
          
          // Parse node sections
          if (currentSection.startsWith('node ')) {
            currentNode = this.parseNodeSection(currentSection);
            if (!rootNode && currentNode.name) {
              rootNode = currentNode.name;
            }
          }
          continue;
        }
        
        // Parse node properties
        if (currentNode && trimmed.includes('=')) {
          const [key, value] = trimmed.split('=', 2);
          if (!currentNode.properties) {
            currentNode.properties = {};
          }
          currentNode.properties[key.trim()] = value.trim();
        }
      }
      
      // Add last node
      if (currentNode && currentNode.name) {
        nodes.push(currentNode as GodotNode);
      }
      
      // Build node hierarchy
      const nodeHierarchy = this.buildNodeHierarchy(nodes);
      
      return {
        rootNode,
        nodes: nodeHierarchy,
      };
    } catch (error) {
      throw new Error(`Failed to parse scene file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseNodeSection(section: string): Partial<GodotNode> {
    // Parse: [node name="NodeName" type="NodeType" parent="ParentPath"]
    const node: Partial<GodotNode> = {
      properties: {},
      children: [],
    };
    
    const nameMatch = section.match(/name="([^"]+)"/);
    if (nameMatch) {
      node.name = nameMatch[1];
    }
    
    const typeMatch = section.match(/type="([^"]+)"/);
    if (typeMatch) {
      node.type = typeMatch[1];
    }
    
    const parentMatch = section.match(/parent="([^"]+)"/);
    if (parentMatch) {
      node.parent = parentMatch[1];
    }
    
    return node;
  }

  private buildNodeHierarchy(flatNodes: GodotNode[]): GodotNode[] {
    const nodeMap = new Map<string, GodotNode>();
    const rootNodes: GodotNode[] = [];
    
    // Create node map
    for (const node of flatNodes) {
      nodeMap.set(node.name, { ...node, children: [] });
    }
    
    // Build hierarchy
    for (const node of flatNodes) {
      const nodeInstance = nodeMap.get(node.name);
      if (!nodeInstance) continue;
      
      if (node.parent) {
        const parentNode = nodeMap.get(node.parent);
        if (parentNode) {
          parentNode.children.push(nodeInstance);
        } else {
          // Parent not found, treat as root
          rootNodes.push(nodeInstance);
        }
      } else {
        rootNodes.push(nodeInstance);
      }
    }
    
    return rootNodes;
  }
}