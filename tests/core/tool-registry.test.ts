import { describe, it, expect } from 'vitest';
import { AgentRegistry, ToolRegistry } from '../../src/core';
import { BaseTool } from '../../src/core/base-tool';
import { ToolDefinition } from '../../src/types/llm.types';

class MockTool extends BaseTool<{ text: string }, { upper: string }> {
  public readonly name = 'mock_upper';
  public readonly description = 'Converts text to uppercase';
  public readonly definition: ToolDefinition = {
    name: 'mock_upper',
    description: 'Converts text to uppercase',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
  };

  protected async doExecute(input: { text: string }): Promise<{ upper: string }> {
    return { upper: input.text.toUpperCase() };
  }
}

describe('ToolRegistry', () => {
  it('registers, retrieves, and executes tools', async () => {
    const registry = new ToolRegistry();
    const tool = new MockTool();

    registry.register(tool);
    expect(registry.has('mock_upper')).toBe(true);
    expect(registry.get('mock_upper')).toBe(tool);
    expect(registry.getAll().length).toBe(1);
    expect(registry.getDefinitions().length).toBe(1);

    const execResult = await registry.execute('mock_upper', { text: 'hello' });
    expect(execResult.success).toBe(true);
    expect(execResult.data).toEqual({ upper: 'HELLO' });

    const missingResult = await registry.execute('non_existent', {});
    expect(missingResult.success).toBe(false);
    expect(missingResult.error).toContain('not found');

    registry.unregister('mock_upper');
    expect(registry.has('mock_upper')).toBe(false);

    registry.register(tool);
    registry.clear();
    expect(registry.getAll().length).toBe(0);
  });

  it('throws error when registering duplicate tool names', () => {
    const registry = new ToolRegistry();
    const tool = new MockTool();
    registry.register(tool);
    expect(() => registry.register(tool)).toThrow('already registered');
  });
});

describe('AgentRegistry', () => {
  it('registers and looks up agents by ID and Name', () => {
    const registry = new AgentRegistry();
    const mockAgent: any = {
      id: 'agent-123',
      name: 'SpecialAgent',
      status: 'idle',
      metrics: {},
    };

    registry.register(mockAgent);
    expect(registry.has('agent-123')).toBe(true);
    expect(registry.has('SpecialAgent')).toBe(true);
    expect(registry.get('agent-123')).toBe(mockAgent);
    expect(registry.get('SpecialAgent')).toBe(mockAgent);
    expect(registry.getAll().length).toBe(1);

    registry.unregister('agent-123');
    expect(registry.has('agent-123')).toBe(false);
  });
});
