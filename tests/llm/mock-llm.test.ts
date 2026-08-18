import { describe, it, expect } from 'vitest';
import { MockLanguageModel } from '../../src/llm/mock-llm';

describe('MockLanguageModel', () => {
  it('generates completions using default canned responses', async () => {
    const llm = new MockLanguageModel();
    const res = await llm.generateCompletion([
      { role: 'user', content: 'What is the speed of light?' },
    ]);

    expect(res.content).toBeDefined();
    expect(res.finishReason).toBe('stop');
    expect(res.usage).toBeDefined();
    expect(llm.getCallHistory().length).toBe(1);
  });

  it('handles responseQueue in FIFO order', async () => {
    const llm = new MockLanguageModel();
    llm.queueResponse('First response');
    llm.queueResponse({
      content: 'Second response',
      finishReason: 'stop',
      usage: { promptTokens: 5, completionTokens: 5, totalTokens: 10 },
    });

    const res1 = await llm.generateCompletion([{ role: 'user', content: 'Query 1' }]);
    expect(res1.content).toBe('First response');

    const res2 = await llm.generateCompletion([{ role: 'user', content: 'Query 2' }]);
    expect(res2.content).toBe('Second response');
  });

  it('handles custom string or function setResponse', async () => {
    const llm = new MockLanguageModel();
    llm.setResponse('Static mock response');

    const res = await llm.generateCompletion([{ role: 'user', content: 'hello' }]);
    expect(res.content).toBe('Static mock response');

    llm.setResponse((messages) => ({
      content: `Echo: ${messages[0].content}`,
      finishReason: 'stop',
    }));

    const res2 = await llm.generateCompletion([{ role: 'user', content: 'custom prompt' }]);
    expect(res2.content).toBe('Echo: custom prompt');
  });

  it('counts tokens and manages history', () => {
    const llm = new MockLanguageModel();
    expect(llm.countTokens('This is a 30 character test string.')).toBeGreaterThan(0);

    llm.clearHistory();
    expect(llm.getCallHistory().length).toBe(0);

    llm.queueResponse('test');
    llm.clearQueue();
  });
});
