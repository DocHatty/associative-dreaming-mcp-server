import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AssociativeDreamingServer } from '../lib.js';

// Mock chalk to avoid ESM issues
vi.mock('chalk', () => {
  const chalkMock = {
    yellow: (str: string) => str,
    green: (str: string) => str,
    blue: (str: string) => str,
    cyan: (str: string) => str,
    magenta: (str: string) => str,
  };
  return { default: chalkMock };
});

describe('AssociativeDreamingServer', () => {
  let server: AssociativeDreamingServer;

  beforeEach(() => {
    process.env.DISABLE_DREAM_LOGGING = 'true';
    server = new AssociativeDreamingServer();
  });

  describe('basic functionality', () => {
    it('should process a single drift', () => {
      const result = server.processDream({
        concept: 'code review',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      expect(result.isError).toBeUndefined();
      expect(result.structuredContent?.driftDepth).toBe(1);
      expect(result.structuredContent?.thePath).toContain('🌀 code review');
    });

    it('should track multiple drifts', () => {
      server.processDream({
        concept: 'code review',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'confession',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.6,
        needsMoreDrift: true,
      });

      expect(result.structuredContent?.dreamHistoryLength).toBe(2);
      expect(result.structuredContent?.thePath).toHaveLength(2);
    });

    it('should handle session reset', () => {
      server.processDream({
        concept: 'first concept',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'new start',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
        resetSession: true,
      });

      expect(result.structuredContent?.dreamHistoryLength).toBe(1);
      expect(result.structuredContent?.thePath).toHaveLength(1);
    });

    it('should auto-adjust maxDrift if driftDepth exceeds it', () => {
      const result = server.processDream({
        concept: 'test',
        driftDepth: 10,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      expect(result.structuredContent?.maxDrift).toBe(10);
    });
  });

  describe('semantic distance measurement', () => {
    it('should return 0 for identical concepts', () => {
      server.processDream({
        concept: 'test concept',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'test concept',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      expect(result.structuredContent?.metrics?.semanticDistance).toBe(0);
    });

    it('should return high distance for very different concepts', () => {
      server.processDream({
        concept: 'quantum physics',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.9,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'banana bread recipe',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.9,
        needsMoreDrift: true,
      });

      const distance = result.structuredContent?.metrics?.semanticDistance as number;
      expect(distance).toBeGreaterThan(0.7);
    });

    it('should return moderate distance for related concepts', () => {
      server.processDream({
        concept: 'machine learning',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'deep learning neural networks',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const distance = result.structuredContent?.metrics?.semanticDistance as number;
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(0.8);
    });

    it('should handle short concepts gracefully', () => {
      server.processDream({
        concept: 'AI',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'ML',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      expect(result.isError).toBeUndefined();
      expect(result.structuredContent?.metrics?.semanticDistance).toBeDefined();
    });

    it('should handle empty strings gracefully', () => {
      server.processDream({
        concept: 'test',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: '',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      expect(result.isError).toBeUndefined();
      expect(result.structuredContent?.metrics?.semanticDistance).toBe(1);
    });
  });

  describe('drift calibration', () => {
    it('should mark as conservative when drift is much less than chaos level', () => {
      server.processDream({
        concept: 'software development',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.9,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'software engineering',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.9,
        needsMoreDrift: true,
      });

      expect(result.structuredContent?.metrics?.calibration).toBe('conservative');
    });

    it('should mark as wild when drift exceeds chaos level significantly', () => {
      server.processDream({
        concept: 'cats',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.1,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'quantum entanglement theory',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.1,
        needsMoreDrift: true,
      });

      expect(result.structuredContent?.metrics?.calibration).toBe('wild');
    });
  });

  describe('collision tension', () => {
    it('should compute collision tension for collision operations', () => {
      server.processDream({
        concept: 'code review',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'permission structures',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.6,
        needsMoreDrift: false,
        isCollision: true,
        collidesWith: 'ritual absolution',
        collisionId: 'test-collision',
      });

      expect(result.structuredContent?.collisionTension).toBeDefined();
      expect(result.structuredContent?.collisionTension).toBeGreaterThan(0);
    });

    it('should return high tension for distant concepts', () => {
      server.processDream({
        concept: 'start',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'API design',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.9,
        needsMoreDrift: false,
        isCollision: true,
        collidesWith: 'funeral rituals',
        collisionId: 'high-tension',
      });

      const tension = result.structuredContent?.collisionTension as number;
      expect(tension).toBeGreaterThan(0.6);
    });

    it('should track collision chains', () => {
      server.processDream({
        concept: 'concept A',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
        isCollision: true,
        collidesWith: 'concept B',
        collisionId: 'chain-1',
      });

      const result = server.processDream({
        concept: 'concept C',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: false,
        isCollision: true,
        collidesWith: 'concept D',
        collisionId: 'chain-1',
      });

      expect(result.structuredContent?.collisionChains).toContain('chain-1');
    });
  });

  describe('stuck detection', () => {
    it('should detect when path is stuck in similar concepts', () => {
      server.processDream({
        concept: 'software development',
        driftDepth: 1,
        maxDrift: 10,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      server.processDream({
        concept: 'software engineering',
        driftDepth: 2,
        maxDrift: 10,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'software design',
        driftDepth: 3,
        maxDrift: 10,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      expect(result.structuredContent?.metrics?.isStuck).toBe(true);
    });

    it('should not flag as stuck when concepts are diverse', () => {
      server.processDream({
        concept: 'code review',
        driftDepth: 1,
        maxDrift: 10,
        chaosLevel: 0.7,
        needsMoreDrift: true,
      });

      server.processDream({
        concept: 'confession booth',
        driftDepth: 2,
        maxDrift: 10,
        chaosLevel: 0.7,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'ritual absolution',
        driftDepth: 3,
        maxDrift: 10,
        chaosLevel: 0.7,
        needsMoreDrift: true,
      });

      expect(result.structuredContent?.metrics?.isStuck).toBe(false);
    });
  });

  describe('session analytics', () => {
    it('should track analytics across session', () => {
      for (let i = 1; i <= 5; i++) {
        server.processDream({
          concept: `concept ${i} unique ${Math.random()}`,
          driftDepth: i,
          maxDrift: 5,
          chaosLevel: 0.5,
          needsMoreDrift: i < 5,
        });
      }

      const result = server.processDream({
        concept: 'final concept',
        driftDepth: 6,
        maxDrift: 6,
        chaosLevel: 0.5,
        needsMoreDrift: false,
      });

      const analytics = result.structuredContent?.analytics as Record<string, unknown>;
      expect(analytics.totalDrifts).toBe(6);
      expect(analytics.avgSemanticDistance).toBeGreaterThan(0);
    });

    it('should track unique concepts correctly', () => {
      server.processDream({
        concept: 'repeated concept',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      server.processDream({
        concept: 'repeated concept',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'different concept',
        driftDepth: 3,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: false,
      });

      const analytics = result.structuredContent?.analytics as Record<string, unknown>;
      expect(analytics.totalDrifts).toBe(3);
      expect(analytics.uniqueConcepts).toBe(2);
    });
  });

  describe('return operation', () => {
    it('should handle return to earlier concept', () => {
      server.processDream({
        concept: 'code review',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      server.processDream({
        concept: 'confession',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.6,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'code review transformed',
        driftDepth: 3,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: false,
        isReturn: true,
        returnsTo: 'code review',
      });

      expect(result.structuredContent?.thePath).toContain('🔄 code review transformed');
      expect(result.structuredContent?.metrics).toBeNull();
    });
  });

  describe('output formatting', () => {
    it('should include path in readable output', () => {
      server.processDream({
        concept: 'test concept',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'second concept',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: false,
      });

      const text = result.content[0].text;
      expect(text).toContain('The Path:');
      expect(text).toContain('🌀 test concept');
      expect(text).toContain('🌀 second concept');
      expect(text).toContain('Drift 2 of 5');
      expect(text).toContain('Arrived.');
    });

    it('should show metrics in output', () => {
      server.processDream({
        concept: 'first',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'completely different thing entirely',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const text = result.content[0].text;
      expect(text).toContain('📊 Drift Metrics:');
      expect(text).toContain('Target chaos:');
      expect(text).toContain('Measured distance:');
      expect(text).toContain('Calibration:');
    });

    it('should show collision tension in output', () => {
      server.processDream({
        concept: 'start',
        driftDepth: 1,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = server.processDream({
        concept: 'collision result',
        driftDepth: 2,
        maxDrift: 5,
        chaosLevel: 0.5,
        needsMoreDrift: false,
        isCollision: true,
        collidesWith: 'other concept',
        collisionId: 'test',
      });

      const text = result.content[0].text;
      expect(text).toContain('💥 Collision Tension:');
    });
  });

  describe('with logging enabled', () => {
    let serverWithLogging: AssociativeDreamingServer;

    beforeEach(() => {
      delete process.env.DISABLE_DREAM_LOGGING;
      serverWithLogging = new AssociativeDreamingServer();
    });

    afterEach(() => {
      process.env.DISABLE_DREAM_LOGGING = 'true';
    });

    it('should format and log regular drifts', () => {
      const result = serverWithLogging.processDream({
        concept: 'Test drift with logging',
        driftDepth: 1,
        maxDrift: 3,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });
      expect(result.isError).toBeUndefined();
    });

    it('should format and log return operations', () => {
      serverWithLogging.processDream({
        concept: 'First concept',
        driftDepth: 1,
        maxDrift: 3,
        chaosLevel: 0.5,
        needsMoreDrift: true,
      });

      const result = serverWithLogging.processDream({
        concept: 'Return concept',
        driftDepth: 2,
        maxDrift: 3,
        chaosLevel: 0.5,
        needsMoreDrift: false,
        isReturn: true,
        returnsTo: 'First concept',
      });
      expect(result.isError).toBeUndefined();
    });

    it('should format and log collision operations', () => {
      const result = serverWithLogging.processDream({
        concept: 'Collision result',
        driftDepth: 1,
        maxDrift: 3,
        chaosLevel: 0.5,
        needsMoreDrift: false,
        isCollision: true,
        collidesWith: 'Other concept',
        collisionId: 'test-chain',
      });
      expect(result.isError).toBeUndefined();
    });
  });
});
