import { ILanguageModel } from './llm.types';
import { ResearchReport } from './researcher.types';

export type WritingAudience = 'general' | 'technical' | 'executive' | 'academic' | 'casual';

export type WritingFormat =
  | 'article'
  | 'report'
  | 'blog_post'
  | 'executive_summary'
  | 'technical_guide'
  | 'markdown_doc';

export type WritingTone =
  | 'authoritative'
  | 'conversational'
  | 'objective'
  | 'persuasive'
  | 'educational';

export type CitationStyle = 'numbered' | 'inline' | 'footnote' | 'author_date';

export interface WritingBrief {
  topic: string;
  targetAudience?: WritingAudience;
  format?: WritingFormat;
  tone?: WritingTone;
  citationStyle?: CitationStyle;
  minWords?: number;
  maxWords?: number;
  researchReport?: ResearchReport;
  keyPointsToCover?: string[];
  styleGuidelines?: string[];
  customInstructions?: string;
}

export interface OutlineSection {
  sectionId: string;
  heading: string;
  level: number;
  description: string;
  targetWords: number;
  keyPoints: string[];
  sourceCitations: string[];
}

export interface ContentOutline {
  title: string;
  subtitle?: string;
  targetWordCount: number;
  sections: OutlineSection[];
}

export interface DraftSection {
  sectionId: string;
  heading: string;
  level: number;
  body: string;
  wordCount: number;
  citations: string[];
}

export interface ReferenceItem {
  citationKey: string;
  title: string;
  url: string;
  domain: string;
  author?: string;
  publishedDate?: string;
}

export interface ContentDraft {
  title: string;
  subtitle?: string;
  outline: ContentOutline;
  sections: DraftSection[];
  fullText: string;
  totalWordCount: number;
  references: ReferenceItem[];
  metadata: {
    version: number;
    tone: WritingTone;
    targetAudience: WritingAudience;
    format: WritingFormat;
    generatedAt: string;
  };
}

export interface SectionCritique {
  sectionId: string;
  heading: string;
  critique: string;
  suggestions: string[];
  wordCountScore: number;
  flowScore: number;
}

export interface ReviewFeedback {
  overallScore: number;
  readabilityScore: number;
  coherenceScore: number;
  toneAlignmentScore: number;
  factualAccuracyScore: number;
  suggestedImprovements: string[];
  sectionCritiques: SectionCritique[];
}

export interface WriterResult {
  id: string;
  draft: ContentDraft;
  review?: ReviewFeedback;
  revisionCount: number;
  finalMarkdown: string;
  executionTimeMs: number;
}

export interface WriterOptions {
  model?: ILanguageModel;
  maxRevisionPasses?: number;
  autoReview?: boolean;
  strictCitations?: boolean;
  customOutline?: ContentOutline;
  verbose?: boolean;
}
