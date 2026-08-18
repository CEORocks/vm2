import { describe, it, expect } from 'vitest';
import {
  safeJsonParse,
  isValidUrl,
  extractDomain,
  truncateText,
  countWords,
  generateId,
  sanitizeHtml,
} from '../../src/utils/validators';

describe('validators & helpers', () => {
  describe('safeJsonParse', () => {
    it('parses valid JSON string', () => {
      const res = safeJsonParse('{"key": "value"}', {});
      expect(res).toEqual({ key: 'value' });
    });

    it('parses markdown code block JSON', () => {
      const markdown = '```json\n{"topics": ["AI", "Agents"]}\n```';
      const res = safeJsonParse(markdown, {});
      expect(res).toEqual({ topics: ['AI', 'Agents'] });
    });

    it('returns fallback for invalid JSON', () => {
      const fallback = { fallback: true };
      const res = safeJsonParse('invalid json string', fallback);
      expect(res).toBe(fallback);
    });
  });

  describe('isValidUrl', () => {
    it('returns true for valid http and https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://arxiv.org/abs/1234')).toBe(true);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('extractDomain', () => {
    it('extracts clean domain without www', () => {
      expect(extractDomain('https://www.example.com/test')).toBe('example.com');
      expect(extractDomain('https://nature.com/articles/123')).toBe('nature.com');
    });

    it('returns "unknown" for invalid URLs', () => {
      expect(extractDomain('invalid-url')).toBe('unknown');
    });
  });

  describe('truncateText', () => {
    it('does not truncate if length is within limit', () => {
      expect(truncateText('short text', 20)).toBe('short text');
    });

    it('truncates and appends suffix if exceeding limit', () => {
      expect(truncateText('this is a longer piece of text', 15, '...')).toBe('this is a lo...');
    });
  });

  describe('countWords', () => {
    it('counts words accurately', () => {
      expect(countWords('hello world from agent')).toBe(4);
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs with given prefix', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');
      expect(id1.startsWith('test-')).toBe(true);
      expect(id2.startsWith('test-')).toBe(true);
      expect(id1).not.toBe(id2);
    });
  });

  describe('sanitizeHtml', () => {
    it('removes script, style, and html tags', () => {
      const html = '<div><h1>Title</h1><script>alert("bad")</script><p>Clean content &amp; info</p></div>';
      const clean = sanitizeHtml(html);
      expect(clean).toContain('Title');
      expect(clean).toContain('Clean content & info');
      expect(clean).not.toContain('alert');
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('<div>');
    });
  });
});
