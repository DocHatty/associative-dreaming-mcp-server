/**
 * Associative Dreaming Server - The Yin to Sequential Thinking's Yang
 *
 * PHILOSOPHY:
 * Sequential Thinking = Linear progression with revision/branching (Yang)
 * Associative Dreaming = Rhizomatic wandering with return/collision (Yin)
 *
 * Sequential Thinking tracks: thought → thought → thought (with backtrack)
 * Associative Dreaming tracks: concept ↔ concept ↔ concept (with collision)
 *
 * THE LLM DOES ALL THE CREATIVE WORK.
 * The server just tracks the wandering.
 *
 * ~90 lines. Elegant. Minimal. Trusting.
 */
export interface DreamData {
    concept: string;
    driftDepth: number;
    maxDrift: number;
    chaosLevel: number;
    needsMoreDrift: boolean;
    isReturn?: boolean;
    returnsTo?: string;
    isCollision?: boolean;
    collidesWith?: string;
    collisionId?: string;
}
export declare class AssociativeDreamingServer {
    private dreamHistory;
    private collisions;
    private disableDreamLogging;
    constructor();
    private formatDream;
    processDream(input: DreamData): {
        content: Array<{
            type: "text";
            text: string;
        }>;
        structuredContent?: Record<string, unknown>;
        isError?: boolean;
    };
}
