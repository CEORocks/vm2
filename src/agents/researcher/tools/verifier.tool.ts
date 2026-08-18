import { BaseTool } from '../../../core/base-tool';
import { ToolDefinition } from '../../../types/llm.types';
import { ExtractedFact, SourceVerification, VerifierInput, VerifierOutput } from '../../../types/researcher.types';
import { ToolContext } from '../../../types/tool.types';
import { extractDomain } from '../../../utils/validators';

export class VerifierTool extends BaseTool<VerifierInput, VerifierOutput> {
  public readonly name = 'fact_verifier';
  public readonly description = 'Evaluates domain authority, source credibility, bias rating, and verifies extracted factual statements.';

  public readonly definition: ToolDefinition = {
    name: this.name,
    description: this.description,
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The source URL to verify.',
        },
        domain: {
          type: 'string',
          description: 'The domain name of the source (optional, inferred from url).',
        },
        facts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              statement: { type: 'string' },
              category: { type: 'string' },
              confidence: { type: 'number' },
              sourceUrl: { type: 'string' },
              sourceTitle: { type: 'string' },
            },
            required: ['statement', 'confidence'],
          },
          description: 'List of extracted facts to verify against credibility standards.',
        },
      },
      required: ['url', 'facts'],
    },
  };

  protected validateInput(input: VerifierInput): void {
    if (!input.url || typeof input.url !== 'string') {
      throw new Error('Verifier requires a valid source URL.');
    }
    if (!Array.isArray(input.facts)) {
      throw new Error('Verifier requires an array of facts.');
    }
  }

  protected async doExecute(
    input: VerifierInput,
    _context?: ToolContext
  ): Promise<VerifierOutput> {
    const url = input.url;
    const domain = input.domain || extractDomain(url);
    const facts = input.facts;

    const { domainAuthority, credibilityScore, biasRating, notes } = this.evaluateDomainCredibility(domain);

    const sourceVerification: SourceVerification = {
      url,
      domain,
      domainAuthority,
      credibilityScore,
      biasRating,
      verified: credibilityScore >= 0.70,
      verificationNotes: notes,
    };

    const verifiedFacts: ExtractedFact[] = [];
    const unverifiedFacts: ExtractedFact[] = [];

    facts.forEach(fact => {
      const adjustedConfidence = Number(((fact.confidence * 0.6) + (credibilityScore * 0.4)).toFixed(2));
      const updatedFact: ExtractedFact = {
        ...fact,
        confidence: Math.min(0.99, Math.max(0.1, adjustedConfidence)),
      };

      if (updatedFact.confidence >= 0.72 && sourceVerification.verified) {
        verifiedFacts.push(updatedFact);
      } else {
        unverifiedFacts.push(updatedFact);
      }
    });

    const factScoreSum = facts.reduce((acc, f) => acc + f.confidence, 0);
    const avgFactScore = facts.length > 0 ? factScoreSum / facts.length : credibilityScore;
    const overallScore = Number(((credibilityScore * 0.5) + (avgFactScore * 0.5)).toFixed(2));

    return {
      sourceVerifications: [sourceVerification],
      verifiedFacts,
      unverifiedFacts,
      overallCredibilityScore: overallScore,
    };
  }

  private evaluateDomainCredibility(domain: string): {
    domainAuthority: number;
    credibilityScore: number;
    biasRating: 'low' | 'moderate' | 'high';
    notes: string;
  } {
    const lower = domain.toLowerCase();

    if (lower.endsWith('.edu') || lower.endsWith('.gov') || lower.includes('arxiv.org') || lower.includes('nature.com') || lower.includes('mit.edu')) {
      return {
        domainAuthority: 0.96,
        credibilityScore: 0.95,
        biasRating: 'low',
        notes: 'Peer-reviewed academic/institutional domain with rigorous editorial and scientific oversight.',
      };
    }

    if (lower.includes('bloomberg') || lower.includes('wsj') || lower.includes('reuters') || lower.includes('acm.org') || lower.includes('ieee.org')) {
      return {
        domainAuthority: 0.90,
        credibilityScore: 0.89,
        biasRating: 'low',
        notes: 'High-tier authoritative publication with established fact-checking protocols.',
      };
    }

    if (lower.includes('techcrunch') || lower.includes('wired') || lower.includes('theverge') || lower.includes('venturebeat')) {
      return {
        domainAuthority: 0.82,
        credibilityScore: 0.80,
        biasRating: 'moderate',
        notes: 'Reputable technology news outlet; journalistic analysis with industry focus.',
      };
    }

    if (lower.includes('medium.com') || lower.includes('substack.com') || lower.includes('blog')) {
      return {
        domainAuthority: 0.60,
        credibilityScore: 0.62,
        biasRating: 'high',
        notes: 'User-generated blog platform. Requires independent cross-verification.',
      };
    }

    return {
      domainAuthority: 0.75,
      credibilityScore: 0.76,
      biasRating: 'moderate',
      notes: 'Standard web domain with general reputability.',
    };
  }
}
