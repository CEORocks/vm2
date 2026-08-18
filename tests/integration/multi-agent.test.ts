import { describe, it, expect } from 'vitest';
import { ResearcherAgent } from '../../src/agents/researcher';
import { WriterAgent } from '../../src/agents/writer';
import { AgentRegistry, ToolRegistry } from '../../src/core';
import { ResearchQuery } from '../../src/types/researcher.types';
import { WritingBrief } from '../../src/types/writer.types';

describe('Multi-Agent Integration: Researcher -> Writer Pipeline', () => {
  it('seamlessly executes end-to-end research-to-publication pipeline', async () => {
    // 1. Setup registries and agents
    const agentRegistry = new AgentRegistry();
    const toolRegistry = new ToolRegistry();

    const researcher = new ResearcherAgent({
      name: 'PrimaryResearcher',
      verbose: false,
      enableDeepScraping: true,
      enableFactVerification: true,
    });

    const writer = new WriterAgent({
      name: 'PrimaryWriter',
      verbose: false,
      autoReview: true,
      maxRevisionPasses: 1,
    });

    agentRegistry.register(researcher);
    agentRegistry.register(writer);

    expect(agentRegistry.has('PrimaryResearcher')).toBe(true);
    expect(agentRegistry.has('PrimaryWriter')).toBe(true);

    // 2. Execute Research Stage
    const researchTopic = 'Zero-Trust Security in Autonomous Agent Networks';
    const query: ResearchQuery = {
      topic: researchTopic,
      depth: 'standard',
      targetAspects: ['Cryptographic Identity', 'Behavioral Anomaly Detection', 'Fault-Tolerant Consensus'],
      maxSources: 3,
    };

    const researchReport = await researcher.execute(query);

    expect(researchReport).toBeDefined();
    expect(researchReport.topic).toBe(researchTopic);
    expect(researchReport.findings.length).toBeGreaterThanOrEqual(1);
    expect(researchReport.sources.length).toBeGreaterThanOrEqual(1);
    expect(researchReport.totalFactsFound).toBeGreaterThanOrEqual(1);

    // 3. Hand off research report to Writer Agent
    const writingBrief: WritingBrief = {
      topic: researchTopic,
      targetAudience: 'technical',
      format: 'report',
      tone: 'authoritative',
      citationStyle: 'numbered',
      researchReport,
      keyPointsToCover: [
        'Mutual TLS and cryptographic attestation for agent RPCs',
        'Real-time anomaly detection in tool call trajectories',
        'Byzantine fault tolerance under adversarial agent compromise',
      ],
    };

    const writerResult = await writer.execute(writingBrief);

    expect(writerResult).toBeDefined();
    expect(writerResult.draft.title).toContain(researchTopic);
    expect(writerResult.draft.references.length).toBe(researchReport.sources.length);
    expect(writerResult.finalMarkdown).toContain('## References & Source Citations');
    expect(writerResult.review).toBeDefined();
    expect(writerResult.review!.overallScore).toBeGreaterThanOrEqual(75);

    // 4. Verify metrics across both agents
    expect(researcher.metrics.toolCallCount).toBeGreaterThan(0);
    expect(researcher.metrics.stepCount).toBeGreaterThan(0);
    expect(writer.metrics.stepCount).toBeGreaterThan(0);
    expect(researcher.status).toBe('completed');
    expect(writer.status).toBe('completed');
  });
});
