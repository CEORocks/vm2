import { describe, it, expect } from 'vitest';
import { VerifierTool } from '../../../src/agents/researcher/tools/verifier.tool';

describe('VerifierTool', () => {
  it('evaluates domain authority and verifies facts accurately', async () => {
    const verifier = new VerifierTool();
    const facts = [
      {
        id: 'f-1',
        statement: 'Multi-agent frameworks scale linearly up to 100 concurrent workers.',
        category: 'Performance',
        confidence: 0.90,
        sourceUrl: 'https://arxiv.org/abs/2401.12345',
        sourceTitle: 'Multi-Agent Scaling',
      },
    ];

    const result = await verifier.execute({
      url: 'https://arxiv.org/abs/2401.12345',
      facts,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.sourceVerifications.length).toBe(1);
    expect(result.data!.sourceVerifications[0].verified).toBe(true);
    expect(result.data!.sourceVerifications[0].domainAuthority).toBeGreaterThan(0.9);
    expect(result.data!.verifiedFacts.length).toBe(1);
    expect(result.data!.overallCredibilityScore).toBeGreaterThan(0.8);
  });

  it('correctly categorizes low-credibility or blog sources', async () => {
    const verifier = new VerifierTool();
    const facts = [
      {
        id: 'f-2',
        statement: 'Unverified claim from personal blog post.',
        category: 'General',
        confidence: 0.50,
        sourceUrl: 'https://randomblog.wordpress.com/post',
        sourceTitle: 'Blog Post',
      },
    ];

    const result = await verifier.execute({
      url: 'https://randomblog.wordpress.com/post',
      facts,
    });

    expect(result.success).toBe(true);
    expect(result.data!.sourceVerifications[0].biasRating).toBe('high');
    expect(result.data!.sourceVerifications[0].verified).toBe(false);
  });

  it('rejects invalid inputs', async () => {
    const verifier = new VerifierTool();
    const res1 = await verifier.execute({ url: '', facts: [] });
    expect(res1.success).toBe(false);

    const res2 = await verifier.execute({ url: 'https://example.com', facts: null as any });
    expect(res2.success).toBe(false);
  });
});
