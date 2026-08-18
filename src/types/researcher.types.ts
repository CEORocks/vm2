import { ILanguageModel } from './llm.types';
import { ITool } from './tool.types';

export type ResearchDepth = 'quick' | 'standard' | 'deep';

export interface ResearchQueryFilter {
  dateRange?: {
    start?: string;
    end?: string;
  };
  domains?: string[];
  excludeDomains?: string[];
}

export interface ResearchQuery {
  topic: string;
  depth?: ResearchDepth;
  maxSources?: number;
  targetAspects?: string[];
  filters?: ResearchQueryFilter;
  customInstructions?: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  publishedDate?: string;
  score?: number;
  author?: string;
}

export interface SearchInput {
  query: string;
  limit?: number;
  domains?: string[];
  excludeDomains?: string[];
}

export interface SearchOutput {
  query: string;
  results: SearchResultItem[];
  totalMatches: number;
}

export interface ScraperInput {
  url: string;
  maxLength?: number;
  extractMetadata?: boolean;
}

export interface ScraperOutput {
  url: string;
  title: string;
  content: string;
  cleanText: string;
  wordCount: number;
  author?: string;
  publishedDate?: string;
  metadata: Record<string, any>;
}

export interface ExtractedFact {
  id: string;
  statement: string;
  category: string;
  confidence: number;
  sourceUrl: string;
  sourceTitle: string;
  quoteSnippet?: string;
  timestamp?: string;
}

export interface ExtractorInput {
  content: string;
  topic: string;
  sourceUrl: string;
  sourceTitle: string;
  targetCategories?: string[];
}

export interface ExtractorOutput {
  topic: string;
  facts: ExtractedFact[];
  entities: string[];
  keyStatistics: string[];
}

export interface SourceVerification {
  url: string;
  domain: string;
  domainAuthority: number;
  credibilityScore: number;
  biasRating: 'low' | 'moderate' | 'high';
  verified: boolean;
  verificationNotes: string;
}

export interface VerifierInput {
  url: string;
  facts: ExtractedFact[];
  domain?: string;
}

export interface VerifierOutput {
  sourceVerifications: SourceVerification[];
  verifiedFacts: ExtractedFact[];
  unverifiedFacts: ExtractedFact[];
  overallCredibilityScore: number;
}

export interface ResearchFinding {
  aspect: string;
  summary: string;
  facts: ExtractedFact[];
  sources: string[];
  keyTakeaways: string[];
  confidenceScore: number;
}

export interface ResearchSource {
  url: string;
  title: string;
  domain: string;
  credibilityScore: number;
  verified: boolean;
  factsContributed: number;
}

export interface ResearchReport {
  id: string;
  topic: string;
  depth: ResearchDepth;
  executiveSummary: string;
  findings: ResearchFinding[];
  sources: ResearchSource[];
  keyInsights: string[];
  limitations: string[];
  totalFactsFound: number;
  generatedAt: string;
  metadata: {
    totalQueriesExecuted: number;
    totalSourcesExamined: number;
    executionTimeMs: number;
    averageSourceCredibility: number;
  };
}

export interface ResearcherOptions {
  model?: ILanguageModel;
  maxSearchRounds?: number;
  maxSourcesPerRound?: number;
  credibilityThreshold?: number;
  enableDeepScraping?: boolean;
  enableFactVerification?: boolean;
  searchTool?: ITool<SearchInput, SearchOutput>;
  scraperTool?: ITool<ScraperInput, ScraperOutput>;
  extractorTool?: ITool<ExtractorInput, ExtractorOutput>;
  verifierTool?: ITool<VerifierInput, VerifierOutput>;
  verbose?: boolean;
}
