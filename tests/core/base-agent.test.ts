import { describe, it, expect, vi } from 'vitest';
import { BaseAgent } from '../../src/core/base-agent';
import { AgentExecutionContext } from '../../src/types/agent.types';

class TestAgent extends BaseAgent<{ value: number }, { result: number }> {
  public initialized = false;
  public cleanedUp = false;

  protected async onInitialize(): Promise<void> {
    this.initialized = true;
  }

  protected async onCleanup(): Promise<void> {
    this.cleanedUp = true;
  }

  protected async doExecute(
    input: { value: number },
    context: AgentExecutionContext
  ): Promise<{ result: number }> {
    this.checkAborted(context.signal);
    this.incrementStep();
    this.incrementTokens(50);
    this.incrementToolCalls();
    this.incrementLLMCalls();

    if (input.value < 0) {
      throw new Error('Negative values not supported');
    }

    return { result: input.value * 2 };
  }
}

describe('BaseAgent', () => {
  it('handles standard lifecycle and metrics tracking', async () => {
    const agent = new TestAgent({ name: 'CalculatorAgent', verbose: false });
    expect(agent.status).toBe('idle');
    expect(agent.name).toBe('CalculatorAgent');

    await agent.initialize();
    expect(agent.initialized).toBe(true);
    expect(agent.status).toBe('idle');

    const statusChanges: string[] = [];
    agent.on('status_change', (e) => {
      statusChanges.push(e.data.to);
    });

    const output = await agent.execute({ value: 21 });
    expect(output.result).toBe(42);
    expect(agent.status).toBe('completed');
    expect(statusChanges).toContain('running');
    expect(statusChanges).toContain('completed');

    const metrics = agent.metrics;
    expect(metrics.stepCount).toBe(1);
    expect(metrics.totalTokensUsed).toBe(50);
    expect(metrics.toolCallCount).toBe(1);
    expect(metrics.llmCallCount).toBe(1);
    expect(metrics.totalExecutionTimeMs).toBeGreaterThanOrEqual(0);

    await agent.cleanup();
    expect(agent.cleanedUp).toBe(true);
  });

  it('handles execution failures and emits error events', async () => {
    const agent = new TestAgent();
    let caughtErrorEvent = false;

    agent.on('error', () => {
      caughtErrorEvent = true;
    });

    await expect(agent.execute({ value: -5 })).rejects.toThrow('Negative values not supported');
    expect(agent.status).toBe('failed');
    expect(caughtErrorEvent).toBe(true);
  });

  it('handles cancellation properly', async () => {
    const agent = new TestAgent();
    const abortController = new AbortController();
    abortController.abort();

    await expect(
      agent.execute({ value: 10 }, { contextId: 'test-ctx', startTime: Date.now(), signal: abortController.signal })
    ).rejects.toThrow('Execution aborted');
    expect(agent.status).toBe('failed');
  });

  it('removes event listeners via off()', () => {
    const agent = new TestAgent();
    const listener = vi.fn();

    agent.on('thought', listener);
    agent.emit('thought', { message: 'hello' });
    expect(listener).toHaveBeenCalledTimes(1);

    agent.off('thought', listener);
    agent.emit('thought', { message: 'world' });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
