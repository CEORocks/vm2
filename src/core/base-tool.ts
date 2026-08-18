import { ToolDefinition } from '../types/llm.types';
import { ITool, ToolContext, ToolExecutionResult } from '../types/tool.types';

export abstract class BaseTool<TInput = any, TOutput = any> implements ITool<TInput, TOutput> {
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly definition: ToolDefinition;

  public async execute(
    input: TInput,
    context?: ToolContext
  ): Promise<ToolExecutionResult<TOutput>> {
    const startTime = Date.now();

    try {
      if (context?.signal?.aborted) {
        return {
          success: false,
          error: `Tool execution aborted for ${this.name}`,
          executionTimeMs: Date.now() - startTime,
        };
      }

      this.validateInput(input);
      const data = await this.doExecute(input, context);

      return {
        success: true,
        data,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || String(error),
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  protected validateInput(_input: TInput): void {
    // Default validation (subclasses can override)
  }

  protected abstract doExecute(
    input: TInput,
    context?: ToolContext
  ): Promise<TOutput>;
}
