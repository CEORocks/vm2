import {
  AgentConfig,
  AgentEvent,
  AgentEventListener,
  AgentEventType,
  AgentExecutionContext,
  AgentMetrics,
  AgentStatus,
  IAgent,
} from '../types/agent.types';
import { ILanguageModel } from '../types/llm.types';
import { Logger } from '../utils/logger';
import { generateId } from '../utils/validators';

export abstract class BaseAgent<TInput = any, TOutput = any> implements IAgent<TInput, TOutput> {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly version: string;

  protected _status: AgentStatus = 'idle';
  protected _metrics: AgentMetrics = {
    totalExecutionTimeMs: 0,
    totalTokensUsed: 0,
    stepCount: 0,
    toolCallCount: 0,
    llmCallCount: 0,
  };

  protected model?: ILanguageModel;
  protected maxIterations: number;
  protected timeoutMs?: number;
  protected verbose: boolean;
  protected logger: Logger;
  private eventListeners: Map<AgentEventType, Set<AgentEventListener>> = new Map();
  private abortController: AbortController | null = null;

  constructor(config: AgentConfig = {}) {
    this.id = config.id ?? generateId('agent');
    this.name = config.name ?? this.constructor.name;
    this.description = config.description ?? '';
    this.version = config.version ?? '1.0.0';
    this.model = config.model;
    this.maxIterations = config.maxIterations ?? 10;
    this.timeoutMs = config.timeoutMs;
    this.verbose = config.verbose ?? false;
    this.logger = new Logger({
      prefix: this.name,
      level: this.verbose ? 'debug' : 'info',
    });
  }

  public get status(): AgentStatus {
    return this._status;
  }

  public get metrics(): AgentMetrics {
    return { ...this._metrics };
  }

  public setStatus(status: AgentStatus): void {
    const oldStatus = this._status;
    this._status = status;
    this.emit('status_change', { from: oldStatus, to: status });
    this.logger.debug(`Status changed from ${oldStatus} to ${status}`);
  }

  public on(event: AgentEventType, listener: AgentEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  public off(event: AgentEventType, listener: AgentEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  public emit<T = any>(type: AgentEventType, data: T): void {
    const event: AgentEvent<T> = {
      type,
      agentId: this.id,
      timestamp: Date.now(),
      data,
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          const res = listener(event);
          if (res instanceof Promise) {
            res.catch((err) => this.logger.error(`Error in event listener for ${type}`, err));
          }
        } catch (err) {
          this.logger.error(`Error in event listener for ${type}`, err);
        }
      }
    }
  }

  public async initialize(context?: AgentExecutionContext): Promise<void> {
    this.setStatus('initializing');
    this.abortController = new AbortController();
    await this.onInitialize(context);
    this.setStatus('idle');
  }

  protected async onInitialize(_context?: AgentExecutionContext): Promise<void> {
    // Subclasses may override
  }

  public async cleanup(): Promise<void> {
    await this.onCleanup();
    this.eventListeners.clear();
    this.setStatus('idle');
  }

  protected async onCleanup(): Promise<void> {
    // Subclasses may override
  }

  public cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.setStatus('failed');
    this.emit('error', { message: 'Agent execution was cancelled' });
    this.logger.warn(`Agent ${this.name} (${this.id}) was cancelled`);
  }

  public async execute(input: TInput, context?: AgentExecutionContext): Promise<TOutput> {
    const startTime = Date.now();
    this.setStatus('running');
    this.abortController = new AbortController();

    const signal = context?.signal ?? this.abortController.signal;

    let timeoutId: NodeJS.Timeout | null = null;
    if (this.timeoutMs && this.timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        this.cancel();
      }, this.timeoutMs);
    }

    try {
      this.checkAborted(signal);
      const result = await this.doExecute(input, {
        contextId: context?.contextId ?? generateId('ctx'),
        startTime,
        metadata: context?.metadata,
        signal,
      });

      const elapsed = Date.now() - startTime;
      this._metrics.totalExecutionTimeMs += elapsed;
      this.setStatus('completed');
      return result;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      this._metrics.totalExecutionTimeMs += elapsed;
      this.setStatus('failed');
      this.emit('error', { error: error.message || String(error) });
      this.logger.error(`Agent execution failed: ${error.message}`, error);
      throw error;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  protected checkAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
      throw new Error(`Execution aborted for agent ${this.name}`);
    }
  }

  protected incrementTokens(tokens: number): void {
    this._metrics.totalTokensUsed += tokens;
  }

  protected incrementStep(): void {
    this._metrics.stepCount += 1;
  }

  protected incrementToolCalls(): void {
    this._metrics.toolCallCount += 1;
  }

  protected incrementLLMCalls(): void {
    this._metrics.llmCallCount += 1;
  }

  protected abstract doExecute(
    input: TInput,
    context: AgentExecutionContext
  ): Promise<TOutput>;
}
