import { ToolDefinition } from '../types/llm.types';
import { ITool, ToolContext, ToolExecutionResult } from '../types/tool.types';

export class ToolRegistry {
  private tools: Map<string, ITool> = new Map();

  public register(tool: ITool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name "${tool.name}" is already registered.`);
    }
    this.tools.set(tool.name, tool);
  }

  public get<TInput = any, TOutput = any>(name: string): ITool<TInput, TOutput> | undefined {
    return this.tools.get(name) as ITool<TInput, TOutput> | undefined;
  }

  public has(name: string): boolean {
    return this.tools.has(name);
  }

  public getAll(): ITool[] {
    return Array.from(this.tools.values());
  }

  public getDefinitions(): ToolDefinition[] {
    return this.getAll().map((tool) => tool.definition);
  }

  public async execute<TInput = any, TOutput = any>(
    name: string,
    input: TInput,
    context?: ToolContext
  ): Promise<ToolExecutionResult<TOutput>> {
    const tool = this.get<TInput, TOutput>(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool "${name}" not found in registry.`,
        executionTimeMs: 0,
      };
    }
    return tool.execute(input, context);
  }

  public unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  public clear(): void {
    this.tools.clear();
  }
}

export const defaultToolRegistry = new ToolRegistry();
