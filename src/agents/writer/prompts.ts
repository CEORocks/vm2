import { CitationStyle, ContentDraft, DraftSection, OutlineSection, SectionCritique, WritingBrief } from '../../types/writer.types';

export const WRITER_SYSTEM_PROMPT = `
You are a World-Class Technical and Academic Writer and Content Strategist.
Your objective is to craft lucid, highly authoritative, structured, and impeccably cited articles, whitepapers, executive reports, and guides.

Core Writing Directives:
1. Audience Alignment: Adapt depth, vocabulary, and tone strictly to target audience (general, technical, executive, academic, casual).
2. Structural Precision: Build clear hierarchies with logical progressions, informative headers, and cohesive section transitions.
3. Fact Grounding & Citations: Faithfully represent verified facts from provided research with rigorous citation styling.
4. Editorial Polish: Ensure grammatical precision, high readability scores, and compelling analytical narratives.
`.trim();

export function buildOutlinePrompt(brief: WritingBrief): string {
  const targetWords = brief.maxWords ? Math.floor((brief.minWords || 500 + brief.maxWords) / 2) : 1000;
  const researchSummary = brief.researchReport
    ? `Executive Summary: ${brief.researchReport.executiveSummary}\nFindings: ${brief.researchReport.findings.map(f => f.aspect).join(', ')}`
    : 'No pre-existing research report provided. Rely on domain knowledge.';

  return `
Create a comprehensive Content Outline for the following writing task:

Topic: "${brief.topic}"
Target Audience: "${brief.targetAudience ?? 'technical'}"
Format: "${brief.format ?? 'article'}"
Tone: "${brief.tone ?? 'authoritative'}"
Target Word Count: ${targetWords}
${brief.keyPointsToCover ? `Key Points: ${brief.keyPointsToCover.join(', ')}` : ''}
${brief.styleGuidelines ? `Style Guidelines: ${brief.styleGuidelines.join(', ')}` : ''}
${brief.customInstructions ? `Custom Instructions: ${brief.customInstructions}` : ''}

Context / Research:
${researchSummary}

Return a JSON object conforming to ContentOutline:
{
  "title": string,
  "subtitle": string,
  "targetWordCount": number,
  "sections": [
    {
      "sectionId": string,
      "heading": string,
      "level": number,
      "description": string,
      "targetWords": number,
      "keyPoints": string[],
      "sourceCitations": string[]
    }
  ]
}
`.trim();
}

export function buildSectionDraftingPrompt(
  brief: WritingBrief,
  section: OutlineSection,
  previousSections: DraftSection[],
  citationStyle: CitationStyle = 'numbered'
): string {
  const prevHeadings = previousSections.map(s => s.heading).join(' -> ');

  return `
Draft the content for section "${section.heading}" (Level ${section.level}):

Topic: "${brief.topic}"
Target Audience: "${brief.targetAudience ?? 'technical'}"
Tone: "${brief.tone ?? 'authoritative'}"
Citation Style: "${citationStyle}"
Target Word Count for this section: ${section.targetWords} words

Section Description: ${section.description}
Key Points to Cover:
${section.keyPoints.map(p => `- ${p}`).join('\n')}

Previous Sections Written:
${prevHeadings ? prevHeadings : 'None (First section)'}

Produce in-depth, high quality prose formatted in clean markdown. Ensure all factual claims are clearly articulated.
`.trim();
}

export function buildReviewCritiquePrompt(
  brief: WritingBrief,
  draft: ContentDraft
): string {
  return `
Critique and evaluate the following content draft:

Title: "${draft.title}"
Format: "${brief.format ?? 'article'}"
Audience: "${brief.targetAudience ?? 'technical'}"
Tone: "${brief.tone ?? 'authoritative'}"
Total Word Count: ${draft.totalWordCount} (Target: ${draft.outline.targetWordCount})

Draft Sections Summary:
${draft.sections.map(s => `[${s.heading}] (${s.wordCount} words): ${s.body.slice(0, 150)}...`).join('\n')}

Evaluate across dimensions (0-100 score):
- Readability
- Coherence & flow
- Tone alignment
- Factual grounding

Return a JSON object conforming to ReviewFeedback:
{
  "overallScore": number,
  "readabilityScore": number,
  "coherenceScore": number,
  "toneAlignmentScore": number,
  "factualAccuracyScore": number,
  "suggestedImprovements": string[],
  "sectionCritiques": [
    {
      "sectionId": string,
      "heading": string,
      "critique": string,
      "suggestions": string[],
      "wordCountScore": number,
      "flowScore": number
    }
  ]
}
`.trim();
}

export function buildRevisionPrompt(
  brief: WritingBrief,
  section: DraftSection,
  critique: SectionCritique
): string {
  return `
Revise and enhance the following section based on editorial critique:

Section Heading: "${section.heading}"
Current Content:
"""
${section.body}
"""

Critique: ${critique.critique}
Suggested Improvements:
${critique.suggestions.map(s => `- ${s}`).join('\n')}

Refine the prose to maximize clarity, authority, and flow while preserving all key insights.
`.trim();
}
