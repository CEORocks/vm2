import { describe, it, expect } from 'vitest';
import { ResearcherAgent } from '../../../src/agents/researcher/researcher.agent';
import { MockLanguageModel } from '../../../src/llm/mock-llm';
import { ResearchQuery } from '../../../src/types/researcher.types';

describe('ResearcherAgent', () => {
  it('executes end-to-end research workflow and generates comprehensive report', async () => {
    const agent = new ResearcherAgent({
      verbose: false,
      enableDeepScraping: true,
      enableFactVerification: true,
    });

    const thoughts: string[] = [];
    const steps: string[] = [];
    agent.on('thought', (e) => { thoughts.push(e.data.message); });
    agent.on('step_start', (e) => { steps.push(e.data.step); });

    const query: ResearchQuery = {
      topic: 'Autonomous Multi-Agent AI Architectures',
      depth: 'standard',
      targetAspects: ['Architecture', 'Performance', 'Reliability'],
      maxSources: 3,
    };

    const report = await agent.execute(query);

    expect(report).toBeDefined();
    expect(report.id.startsWith('report-')).toBe(true);
    expect(report.topic).toBe(query.topic);
    expect(report.depth).toBe('standard');
    expect(report.executiveSummary.length).toBeGreaterThan(50);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.sources.length).toBeGreaterThan(0);
    expect(report.keyInsights.length).toBeGreaterThan(0);
    expect(report.limitations.length).toBeGreaterThan(0);
    expect(report.metadata.totalSourcesExamined).toBeGreaterThan(0);
    expect(report.metadata.averageSourceCredibility).toBeGreaterThan(0.6);

    expect(thoughts.length).toBeGreaterThan(0);
    expect(steps).toContain('search_planning');
    expect(steps).toContain('source_processing');
    expect(steps).toContain('report_synthesis');

    expect(agent.metrics.toolCallCount).toBeGreaterThan(0);
    expect(agent.status).toBe('completed');
  });

  it('supports LLM integration for query planning and executive summary', async () => {
    const mockLlm = new MockLanguageModel();
    mockLlm.queueResponse(JSON.stringify([
      'LLM generated query on multi-agent consensus',
      'LLM generated query on distributed token efficiency',
    ]));
    mockLlm.queueResponse('Executive Summary: Advanced agentic systems exhibit remarkable convergence speed.');

    const agent = new ResearcherAgent({
      model: mockLlm,
      depth: 'quick',
    } as any);

    const report = await agent.execute({
      topic: 'Agentic Consensus Algorithms',
      depth: 'quick',
      maxSources: 2,
    });

    expect(report).toBeDefined();
    expect(report.executiveSummary).toContain('Advanced agentic systems exhibit remarkable convergence speed');
    expect(agent.metrics.llmCallCount).toBeGreaterThanOrEqual(1);
    expect(agent.metrics.totalTokensUsed).toBeGreaterThan(0);
  });

  it('handles cancellation gracefully during execution', async () => {
    const agent = new ResearcherAgent();
    const abortController = new AbortController();

    const promise = agent.execute(
      { topic: 'Long running quantum AI research', depth: 'deep' },
      { contextId: 'cancel-ctx', startTime: Date.now(), signal: abortController.signal }
    );

    abortController.abort();
    await expect(promise).rejects.toThrow('Execution aborted');
    expect(agent.status).toBe('failed');
  });
});
