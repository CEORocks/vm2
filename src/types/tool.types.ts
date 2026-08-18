import { ToolDefinition } from './llm.types';

export interface ToolContext {
  agentId?: string;
  contextId?: string;
  signal?: AbortSignal;
  metadata?: Record<string, any>;
}

export interface ToolExecutionResult<TOutput = any> {
  success: boolean;
  data?: TOutput;
  error?: string;
  executionTimeMs: number;
}

export interface ITool<TInput = any, TOutput = any> {
  readonly name: string;
  readonly description: string;
  readonly definition: ToolDefinition;

  execute(input: TInput, context?: ToolContext): Promise<ToolExecutionResult<TOutput>>;
}
