import { ChatMessage, ILanguageModel } from './llm.types';

export type AgentStatus = 'idle' | 'initializing' | 'running' | 'completed' | 'failed' | 'paused';

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
}

export interface AgentExecutionContext {
  contextId: string;
  startTime: number;
  metadata?: Record<string, any>;
  signal?: AbortSignal;
}

export type AgentEventType =
  | 'status_change'
  | 'step_start'
  | 'step_end'
  | 'tool_start'
  | 'tool_end'
  | 'thought'
  | 'message'
  | 'error';

export interface AgentEvent<T = any> {
  type: AgentEventType;
  agentId: string;
  timestamp: number;
  data: T;
}

export type AgentEventListener<T = any> = (event: AgentEvent<T>) => void | Promise<void>;

export interface AgentMetrics {
  totalExecutionTimeMs: number;
  totalTokensUsed: number;
  stepCount: number;
  toolCallCount: number;
  llmCallCount: number;
}

export interface AgentConfig {
  id?: string;
  name?: string;
  description?: string;
  version?: string;
  model?: ILanguageModel;
  maxIterations?: number;
  timeoutMs?: number;
  verbose?: boolean;
}

export interface IAgent<TInput, TOutput> {
  readonly id: string;
  readonly name: string;
  readonly status: AgentStatus;
  readonly metrics: AgentMetrics;

  initialize(context?: AgentExecutionContext): Promise<void>;
  execute(input: TInput, context?: AgentExecutionContext): Promise<TOutput>;
  cleanup(): Promise<void>;
  cancel(): void;

  on(event: AgentEventType, listener: AgentEventListener): void;
  off(event: AgentEventType, listener: AgentEventListener): void;
}
