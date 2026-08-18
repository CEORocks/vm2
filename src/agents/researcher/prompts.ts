import { ResearchDepth } from '../../types/researcher.types';

export const RESEARCHER_SYSTEM_PROMPT = `
You are an expert Autonomous AI Research Analyst specialized in deep academic, technical, and industry research.
Your goal is to gather verifiable facts, analyze complex topics, cross-check claims against authoritative sources, and synthesize comprehensive research reports.

Core Principles:
1. Objectivity: Present balanced findings backed by empirical evidence and citations.
2. Fact Verification: Distinguish confirmed facts from unverified claims and assign credibility scores.
3. Multi-Aspect Investigation: Decompose topics into architectural, performance, reliability, and market dimensions.
4. Structured Synthesis: Deliver findings with clear takeaways, limitations, and transparent source tracking.
`.trim();

export function buildQueryDecompositionPrompt(
  topic: string,
  depth: ResearchDepth = 'standard',
  targetAspects?: string[],
  customInstructions?: string
): string {
  return `
Deconstruct the following research topic into search queries and key investigation angles:

Topic: "${topic}"
Research Depth: "${depth}"
${targetAspects && targetAspects.length > 0 ? `Target Aspects: ${targetAspects.join(', ')}` : ''}
${customInstructions ? `Custom Instructions: ${customInstructions}` : ''}

Generate 3-5 targeted search queries focusing on:
1. Foundational architecture and definitions
2. Performance benchmarks and quantitative data
3. Practical implementations and industry case studies
4. Known limitations and trade-offs

Format your response as a JSON array of search query strings:
["query 1", "query 2", "query 3"]
`.trim();
}

export function buildFactExtractionPrompt(
  content: string,
  topic: string,
  sourceTitle: string
): string {
  return `
Extract key factual statements, statistical figures, and domain entities from the following source content:

Topic: "${topic}"
Source: "${sourceTitle}"
Content Snippet:
"""
${content.slice(0, 3000)}
"""

Extract structured facts in JSON format with properties:
- statement: string (concise verifiable claim)
- category: string ('Architecture' | 'Performance' | 'Reliability' | 'Market Trends' | 'Methodology')
- confidence: number (0.0 to 1.0)
- quoteSnippet: string (direct quote snippet from text)
`.trim();
}

export function buildSourceVerificationPrompt(
  domain: string,
  url: string,
  factsCount: number
): string {
  return `
Evaluate the credibility, domain authority, and bias rating for the following source:
URL: ${url}
Domain: ${domain}
Facts Contributed: ${factsCount}

Assess:
1. Domain authority score (0.0 to 1.0)
2. Credibility score (0.0 to 1.0)
3. Bias rating ('low' | 'moderate' | 'high')
4. Verification status (true if credibility >= 0.70)
`.trim();
}

export function buildReportSynthesisPrompt(
  topic: string,
  depth: ResearchDepth,
  factsSummary: string,
  sourcesSummary: string
): string {
  return `
Synthesize a comprehensive Research Report based on verified findings:

Topic: "${topic}"
Depth: "${depth}"

Verified Facts Summary:
${factsSummary}

Sources Examined:
${sourcesSummary}

Produce a structured report including:
1. Executive Summary
2. Findings grouped by aspect with confidence scores
3. Key Takeaways and actionable insights
4. Limitations and uncertainty analysis
`.trim();
}
