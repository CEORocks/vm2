import { describe, it, expect } from 'vitest';
import { ExtractorTool } from '../../../src/agents/researcher/tools/extractor.tool';

describe('ExtractorTool', () => {
  it('extracts structured facts, statistics, and entities from content', async () => {
    const extractor = new ExtractorTool();
    const content = `
      Antigravity Agentic Framework achieved a 42% throughput gain across enterprise benchmarks.
      Researchers from Google Deepmind observed statistical significance with p < 0.01.
      Distributed orchestration protocols mitigated single-point failures and reduced system latency to 12ms.
    `;

    const result = await extractor.execute({
      content,
      topic: 'Agentic Architectures',
      sourceUrl: 'https://nature.com/articles/ai-study',
      sourceTitle: 'Study on Agent Architectures',
      targetCategories: ['Architecture', 'Performance', 'Reliability'],
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.facts.length).toBeGreaterThan(0);
    expect(result.data!.facts[0].statement).toBeDefined();
    expect(result.data!.facts[0].confidence).toBeGreaterThanOrEqual(0.7);
    expect(result.data!.keyStatistics.length).toBeGreaterThan(0);
  });

  it('rejects empty content or topic', async () => {
    const extractor = new ExtractorTool();
    const res1 = await extractor.execute({
      content: '',
      topic: 'Topic',
      sourceUrl: 'https://example.com',
      sourceTitle: 'Example',
    });
    expect(res1.success).toBe(false);

    const res2 = await extractor.execute({
      content: 'Some text content',
      topic: '',
      sourceUrl: 'https://example.com',
      sourceTitle: 'Example',
    });
    expect(res2.success).toBe(false);
  });
});
