import { describe, it, expect } from 'vitest';
import {
  RESEARCHER_SYSTEM_PROMPT,
  buildFactExtractionPrompt,
  buildQueryDecompositionPrompt,
  buildReportSynthesisPrompt,
  buildSourceVerificationPrompt,
} from '../../../src/agents/researcher/prompts';

describe('Researcher Prompts', () => {
  it('exports system prompt and generates valid prompt templates', () => {
    expect(RESEARCHER_SYSTEM_PROMPT).toContain('Autonomous AI Research Analyst');

    const decompPrompt = buildQueryDecompositionPrompt('AI Safety', 'deep', ['Alignment', 'Robustness'], 'Focus on LLMs');
    expect(decompPrompt).toContain('AI Safety');
    expect(decompPrompt).toContain('deep');
    expect(decompPrompt).toContain('Alignment, Robustness');
    expect(decompPrompt).toContain('Focus on LLMs');

    const extractPrompt = buildFactExtractionPrompt('Sample content text here', 'AI Safety', 'Safety Paper');
    expect(extractPrompt).toContain('Safety Paper');
    expect(extractPrompt).toContain('Sample content text here');

    const verifyPrompt = buildSourceVerificationPrompt('nature.com', 'https://nature.com/article', 5);
    expect(verifyPrompt).toContain('nature.com');
    expect(verifyPrompt).toContain('5');

    const synthPrompt = buildReportSynthesisPrompt('AI Safety', 'standard', 'Facts summary', 'Sources summary');
    expect(synthPrompt).toContain('Facts summary');
    expect(synthPrompt).toContain('Sources summary');
  });
});
