export interface DreamInput {
    concept: string;
    chaosLevel?: number;
    semanticDistance?: number;
    isReturn?: boolean;
    returnsTo?: string;
    isCollision?: boolean;
    collidesWith?: string;
    reset?: boolean;
}
export interface CheckInput {
    topic: string;
    attempts?: number;
    errors?: string[];
    sentiment?: "neutral" | "curious" | "frustrated" | "stuck" | "exploring";
    signal?: string;
}
export declare class AssociativeDreamingServer {
    private path;
    private distances;
    private stuckCount;
    private topicCounts;
    private errorCounts;
    private checkCount;
    private logging;
    constructor();
    /**
     * Simple stemmer - removes common suffixes to match "maps" with "map"
     */
    private stem;
    private distance;
    private isStuck;
    dream(input: DreamInput): {
        content: Array<{
            type: "text";
            text: string;
        }>;
        structuredContent: Record<string, unknown>;
    };
    check(input: CheckInput): {
        content: Array<{
            type: "text";
            text: string;
        }>;
        structuredContent: Record<string, unknown>;
    };
}
