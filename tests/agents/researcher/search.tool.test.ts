import { describe, it, expect } from 'vitest';
import { SearchTool } from '../../../src/agents/researcher/tools/search.tool';

describe('SearchTool', () => {
  it('has proper tool definition', () => {
    const tool = new SearchTool();
    expect(tool.name).toBe('web_search');
    expect(tool.definition.parameters.required).toContain('query');
  });

  it('performs search and returns matching seed results', async () => {
    const tool = new SearchTool();
    const result = await tool.execute({ query: 'multi-agent systems architecture' });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.results.length).toBeGreaterThan(0);
    expect(result.data!.query).toBe('multi-agent systems architecture');
  });

  it('generates dynamic results for novel queries and respects limit', async () => {
    const tool = new SearchTool();
    const result = await tool.execute({ query: 'Quantum Computing in Drug Discovery', limit: 3 });

    expect(result.success).toBe(true);
    expect(result.data!.results.length).toBe(3);
  });

  it('filters results by domains and excludeDomains', async () => {
    const tool = new SearchTool();
    const result = await tool.execute({
      query: 'AI agents',
      limit: 10,
      domains: ['arxiv.org', 'mit.edu'],
    });

    expect(result.success).toBe(true);
    result.data!.results.forEach((item) => {
      expect(['arxiv.org', 'mit.edu'].some((d) => item.domain.includes(d))).toBe(true);
    });

    const excluded = await tool.execute({
      query: 'AI agents',
      limit: 10,
      excludeDomains: ['techcrunch.com'],
    });

    expect(excluded.success).toBe(true);
    excluded.data!.results.forEach((item) => {
      expect(item.domain).not.toBe('techcrunch.com');
    });
  });

  it('fails on empty search query', async () => {
    const tool = new SearchTool();
    const result = await tool.execute({ query: '' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('non-empty string');
  });
});
