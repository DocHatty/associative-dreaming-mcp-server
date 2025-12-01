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
    resetSession?: boolean;
}
export interface DriftMetrics {
    semanticDistance: number;
    targetChaos: number;
    calibration: "conservative" | "on-target" | "wild";
    isStuck: boolean;
    suggestion?: string;
}
export interface SessionAnalytics {
    totalDrifts: number;
    avgSemanticDistance: number;
    maxSemanticDistance: number;
    minSemanticDistance: number;
    collisionTensions: number[];
    avgCollisionTension: number;
    uniqueConcepts: number;
    stuckCount: number;
    calibrationHistory: string[];
}
export declare class AssociativeDreamingServer {
    private dreamHistory;
    private collisions;
    private driftDistances;
    private collisionTensions;
    private calibrationHistory;
    private stuckCount;
    private disableDreamLogging;
    constructor();
    reset(): void;
    /**
     * Basic Porter-style stemming (handles common suffixes)
     * Not perfect, but catches grief/grieving, run/running, etc.
     */
    private stem;
    /**
     * Check if two words belong to the same conceptual cluster
     */
    private inSameCluster;
    /**
     * Check if any words from two concepts share a conceptual cluster
     */
    private shareConceptualCluster;
    private computeSemanticDistance;
    private detectStuck;
    private calibrateDrift;
    private getSuggestion;
    /**
     * Normalize concept to sentence case for consistent display
     */
    private toSentenceCase;
    private getAnalytics;
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
