import {
  ChatMessage,
  CompletionOptions,
  CompletionResult,
  ILanguageModel,
} from '../types/llm.types';

export type ResponseHandler = (
  messages: ChatMessage[],
  options?: CompletionOptions
) => CompletionResult | Promise<CompletionResult>;

export class MockLanguageModel implements ILanguageModel {
  private responseQueue: Array<CompletionResult | ResponseHandler> = [];
  private defaultHandler?: ResponseHandler;
  private callHistory: Array<{ messages: ChatMessage[]; options?: CompletionOptions }> = [];

  constructor(defaultHandler?: ResponseHandler) {
    this.defaultHandler = defaultHandler;
  }

  public setResponse(
    response: string | CompletionResult | ResponseHandler
  ): void {
    if (typeof response === 'string') {
      this.defaultHandler = () => ({
        content: response,
        finishReason: 'stop',
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
      });
    } else if (typeof response === 'function') {
      this.defaultHandler = response;
    } else {
      this.defaultHandler = () => response;
    }
  }

  public queueResponse(
    response: string | CompletionResult | ResponseHandler
  ): void {
    if (typeof response === 'string') {
      this.responseQueue.push({
        content: response,
        finishReason: 'stop',
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 },
      });
    } else if (typeof response === 'function') {
      this.responseQueue.push(response);
    } else {
      this.responseQueue.push(response);
    }
  }

  public async generateCompletion(
    messages: ChatMessage[],
    options?: CompletionOptions
  ): Promise<CompletionResult> {
    this.callHistory.push({ messages: [...messages], options });

    if (this.responseQueue.length > 0) {
      const next = this.responseQueue.shift()!;
      if (typeof next === 'function') {
        return next(messages, options);
      }
      return next;
    }

    if (this.defaultHandler) {
      return this.defaultHandler(messages, options);
    }

    // Smart default response generation
    const lastMessage = messages[messages.length - 1]?.content || '';
    const totalPromptChars = messages.reduce((acc, m) => acc + m.content.length, 0);
    const estimatedTokens = Math.max(1, Math.ceil(totalPromptChars / 4));

    if (options?.responseFormat === 'json' || lastMessage.toLowerCase().includes('json')) {
      return {
        content: JSON.stringify({
          status: 'success',
          summary: 'Generated mock response based on prompt context.',
          data: { topic: 'Sample Topic', keyPoints: ['Point 1', 'Point 2'] },
        }),
        finishReason: 'stop',
        usage: {
          promptTokens: estimatedTokens,
          completionTokens: 25,
          totalTokens: estimatedTokens + 25,
        },
      };
    }

    return {
      content: `Mock AI response for query: ${lastMessage.slice(0, 50)}...`,
      finishReason: 'stop',
      usage: {
        promptTokens: estimatedTokens,
        completionTokens: 30,
        totalTokens: estimatedTokens + 30,
      },
    };
  }

  public countTokens(text: string): number {
    return Math.max(1, Math.ceil(text.length / 4));
  }

  public getCallHistory(): Array<{ messages: ChatMessage[]; options?: CompletionOptions }> {
    return [...this.callHistory];
  }

  public clearHistory(): void {
    this.callHistory = [];
  }

  public clearQueue(): void {
    this.responseQueue = [];
  }
}
