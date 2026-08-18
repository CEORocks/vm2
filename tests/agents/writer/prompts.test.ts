import { describe, it, expect } from 'vitest';
import {
  WRITER_SYSTEM_PROMPT,
  buildOutlinePrompt,
  buildReviewCritiquePrompt,
  buildRevisionPrompt,
  buildSectionDraftingPrompt,
} from '../../../src/agents/writer/prompts';

describe('Writer Prompts', () => {
  it('exports system prompt and creates outline/section/review prompts', () => {
    expect(WRITER_SYSTEM_PROMPT).toContain('World-Class Technical and Academic Writer');

    const outlinePrompt = buildOutlinePrompt({
      topic: 'Agent Architectures',
      targetAudience: 'executive',
      format: 'executive_summary',
      tone: 'authoritative',
      minWords: 300,
      maxWords: 600,
      keyPointsToCover: ['Cost', 'ROI'],
      styleGuidelines: ['No jargon'],
      customInstructions: 'Be concise',
      researchReport: {
        id: 'rep-1',
        topic: 'Agent Architectures',
        depth: 'standard',
        executiveSummary: 'Exec summary test',
        findings: [{ aspect: 'Architecture', summary: 'Summary', facts: [], sources: [], keyTakeaways: [], confidenceScore: 0.9 }],
        sources: [],
        keyInsights: [],
        limitations: [],
        totalFactsFound: 1,
        generatedAt: '2024-01-01',
        metadata: { totalQueriesExecuted: 1, totalSourcesExamined: 1, executionTimeMs: 100, averageSourceCredibility: 0.9 },
      },
    });
    expect(outlinePrompt).toContain('Agent Architectures');
    expect(outlinePrompt).toContain('Exec summary test');
    expect(outlinePrompt).toContain('Cost, ROI');
    expect(outlinePrompt).toContain('No jargon');

    const sectionPrompt = buildSectionDraftingPrompt(
      { topic: 'Agent Architectures' },
      {
        sectionId: 'sec-1',
        heading: 'Architecture Intro',
        level: 2,
        description: 'Intro desc',
        targetWords: 200,
        keyPoints: ['Key 1'],
        sourceCitations: ['1'],
      },
      [{ sectionId: 'sec-0', heading: 'Preamble', level: 2, body: 'Pre', wordCount: 1, citations: [] }],
      'numbered'
    );
    expect(sectionPrompt).toContain('Architecture Intro');
    expect(sectionPrompt).toContain('Preamble');

    const reviewPrompt = buildReviewCritiquePrompt(
      { topic: 'Agent Architectures' },
      {
        title: 'Draft Title',
        outline: { title: 'Draft Title', targetWordCount: 500, sections: [] },
        sections: [{ sectionId: 'sec-1', heading: 'Sec 1', level: 2, body: 'Body text', wordCount: 2, citations: [] }],
        fullText: 'Draft full text',
        totalWordCount: 500,
        references: [],
        metadata: { version: 1, tone: 'authoritative', targetAudience: 'technical', format: 'article', generatedAt: '2024-01-01' },
      }
    );
    expect(reviewPrompt).toContain('Draft Title');

    const revisionPrompt = buildRevisionPrompt(
      { topic: 'Agent Architectures' },
      { sectionId: 'sec-1', heading: 'Sec 1', level: 2, body: 'Old body', wordCount: 2, citations: [] },
      { sectionId: 'sec-1', heading: 'Sec 1', critique: 'Needs polish', suggestions: ['Add stats'], wordCountScore: 80, flowScore: 80 }
    );
    expect(revisionPrompt).toContain('Needs polish');
    expect(revisionPrompt).toContain('Add stats');
  });
});
