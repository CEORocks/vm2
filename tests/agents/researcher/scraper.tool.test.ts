import { describe, it, expect } from 'vitest';
import { ScraperTool } from '../../../src/agents/researcher/tools/scraper.tool';

describe('ScraperTool', () => {
  it('scrapes valid URL, sanitizes content, and extracts metadata', async () => {
    const scraper = new ScraperTool();
    const result = await scraper.execute({
      url: 'https://nature.com/articles/s41586-ai-breakthrough',
      maxLength: 3000,
      extractMetadata: true,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.title).toBeDefined();
    expect(result.data!.cleanText.length).toBeGreaterThan(0);
    expect(result.data!.cleanText).not.toContain('<script>');
    expect(result.data!.wordCount).toBeGreaterThan(0);
    expect(result.data!.metadata.domain).toBe('nature.com');
  });

  it('rejects invalid or malformed URLs', async () => {
    const scraper = new ScraperTool();
    const result = await scraper.execute({ url: 'invalid-url-string' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid URL format');
  });

  it('respects maxLength truncation', async () => {
    const scraper = new ScraperTool();
    const result = await scraper.execute({
      url: 'https://arxiv.org/abs/2401.12345',
      maxLength: 50,
    });

    expect(result.success).toBe(true);
    expect(result.data!.cleanText.length).toBeLessThanOrEqual(50);
  });
});
