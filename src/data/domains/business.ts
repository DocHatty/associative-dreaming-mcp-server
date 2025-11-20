/**
 * Business Domain Semantic Associations
 * 
 * Specialized associations for business, strategy, and organizational terminology.
 * These extend the base semantic drift associations to handle domain-specific concepts.
 */

export interface WeightedAssociation {
  concept: string;
  distance: number; // 0.0 (very close) to 1.0 (very distant but connected)
  reason?: string;
}

export const BUSINESS_ASSOCIATIONS: Record<string, WeightedAssociation[]> = {
  "efficiency": [
    { concept: "friction", distance: 0.4, reason: "removing obstacles - inverse" },
    { concept: "leverage", distance: 0.5, reason: "force multiplication" },
    { concept: "elegance", distance: 0.6, reason: "simple effectiveness" },
    { concept: "streamline", distance: 0.3, reason: "reducing resistance" },
    { concept: "economy", distance: 0.4, reason: "resource optimization" }
  ],
  
  "optimization": [
    { concept: "evolution", distance: 0.4, reason: "iterative improvement" },
    { concept: "pruning", distance: 0.5, reason: "removing inefficiency" },
    { concept: "distillation", distance: 0.6, reason: "extracting essence" },
    { concept: "minimalism", distance: 0.7, reason: "achieving more with less" },
    { concept: "refinement", distance: 0.3, reason: "progressive enhancement" },
    { concept: "tuning", distance: 0.4, reason: "calibrating for performance" }
  ],
  
  "scalability": [
    { concept: "fractal", distance: 0.6, reason: "self-similar at all scales" },
    { concept: "virus", distance: 0.7, reason: "exponential replication" },
    { concept: "blueprint", distance: 0.4, reason: "reproducible pattern" },
    { concept: "compound interest", distance: 0.5, reason: "exponential growth" },
    { concept: "ecosystem", distance: 0.6, reason: "self-sustaining expansion" }
  ],
  
  "roi": [
    { concept: "harvest", distance: 0.5, reason: "reaping what was sown" },
    { concept: "echo", distance: 0.7, reason: "output responding to input" },
    { concept: "leverage", distance: 0.4, reason: "amplified returns" },
    { concept: "resonance", distance: 0.8, reason: "amplified effect" },
    { concept: "multiplier", distance: 0.3, reason: "gain factor" }
  ],
  
  "pipeline": [
    { concept: "assembly line", distance: 0.3, reason: "staged production" },
    { concept: "river", distance: 0.5, reason: "continuous flow" },
    { concept: "conveyor belt", distance: 0.2, reason: "automated progression" },
    { concept: "funnel", distance: 0.4, reason: "narrowing stages" },
    { concept: "digestive system", distance: 0.7, reason: "sequential processing" }
  ],
  
  "strategy": [
    { concept: "chess", distance: 0.3, reason: "planned moves" },
    { concept: "navigation", distance: 0.5, reason: "charting course" },
    { concept: "architecture", distance: 0.6, reason: "structural design" },
    { concept: "war", distance: 0.4, reason: "competitive positioning" },
    { concept: "compass", distance: 0.5, reason: "directional guidance" }
  ],
  
  "leverage": [
    { concept: "fulcrum", distance: 0.3, reason: "mechanical advantage" },
    { concept: "amplifier", distance: 0.4, reason: "force multiplication" },
    { concept: "catalyst", distance: 0.6, reason: "enabling disproportionate effect" },
    { concept: "keystone", distance: 0.7, reason: "critical supporting element" },
    { concept: "domino", distance: 0.6, reason: "triggering cascade" }
  ],
  
  "productivity": [
    { concept: "harvest", distance: 0.4, reason: "yield from effort" },
    { concept: "momentum", distance: 0.5, reason: "sustained motion" },
    { concept: "engine", distance: 0.5, reason: "converting input to output" },
    { concept: "cultivation", distance: 0.6, reason: "nurturing growth" },
    { concept: "flow state", distance: 0.7, reason: "effortless effectiveness" }
  ],
  
  "throughput": [
    { concept: "bandwidth", distance: 0.3, reason: "capacity for flow" },
    { concept: "artery", distance: 0.6, reason: "channel for volume" },
    { concept: "current", distance: 0.5, reason: "rate of flow" },
    { concept: "valve", distance: 0.4, reason: "controlling flow rate" },
    { concept: "metabolism", distance: 0.7, reason: "processing rate" }
  ],
  
  "bottleneck": [
    { concept: "choke point", distance: 0.2, reason: "constraint location" },
    { concept: "dam", distance: 0.5, reason: "blocking flow" },
    { concept: "hourglass", distance: 0.6, reason: "narrow passage" },
    { concept: "traffic jam", distance: 0.4, reason: "congestion point" },
    { concept: "pressure point", distance: 0.7, reason: "critical constraint" }
  ],
  
  "synergy": [
    { concept: "alchemy", distance: 0.7, reason: "whole exceeding parts" },
    { concept: "harmony", distance: 0.5, reason: "complementary combination" },
    { concept: "resonance", distance: 0.6, reason: "amplified interaction" },
    { concept: "symbiosis", distance: 0.4, reason: "mutually beneficial" },
    { concept: "jazz ensemble", distance: 0.8, reason: "improvised collaboration" }
  ],
  
  "disruption": [
    { concept: "earthquake", distance: 0.6, reason: "sudden upheaval" },
    { concept: "mutation", distance: 0.5, reason: "departure from norm" },
    { concept: "revolution", distance: 0.4, reason: "fundamental change" },
    { concept: "virus", distance: 0.7, reason: "rapid transformative spread" },
    { concept: "paradigm shift", distance: 0.3, reason: "framework transformation" }
  ],
  
  "innovation": [
    { concept: "mutation", distance: 0.5, reason: "variation from norm" },
    { concept: "alchemy", distance: 0.7, reason: "creating new value" },
    { concept: "remix", distance: 0.6, reason: "novel recombination" },
    { concept: "evolution", distance: 0.4, reason: "adaptive development" },
    { concept: "spark", distance: 0.7, reason: "igniting new possibilities" }
  ],
  
  "market": [
    { concept: "ecosystem", distance: 0.5, reason: "interdependent participants" },
    { concept: "conversation", distance: 0.7, reason: "exchange of value" },
    { concept: "ocean", distance: 0.7, reason: "waves of demand" },
    { concept: "bazaar", distance: 0.3, reason: "exchange venue" },
    { concept: "tide", distance: 0.6, reason: "cyclical movement" }
  ],
  
  "growth": [
    { concept: "cultivation", distance: 0.4, reason: "nurturing expansion" },
    { concept: "compound interest", distance: 0.5, reason: "accelerating increase" },
    { concept: "organism", distance: 0.6, reason: "organic development" },
    { concept: "crystallization", distance: 0.7, reason: "structured expansion" },
    { concept: "momentum", distance: 0.4, reason: "building force" }
  ]
};
