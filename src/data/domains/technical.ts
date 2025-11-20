/**
 * Technical Domain Semantic Associations
 * 
 * Specialized associations for technical, software, and systems terminology.
 * These extend the base semantic drift associations to handle domain-specific concepts.
 */

export interface WeightedAssociation {
  concept: string;
  distance: number; // 0.0 (very close) to 1.0 (very distant but connected)
  reason?: string;
}

export const TECHNICAL_ASSOCIATIONS: Record<string, WeightedAssociation[]> = {
  "integration": [
    { concept: "translation", distance: 0.4, reason: "between systems" },
    { concept: "symbiosis", distance: 0.6, reason: "mutual benefit" },
    { concept: "bridge", distance: 0.3, reason: "connecting separated parts" },
    { concept: "weaving", distance: 0.7, reason: "intertwining threads" },
    { concept: "synthesis", distance: 0.5, reason: "combining into whole" }
  ],
  
  "api": [
    { concept: "interface", distance: 0.2, reason: "boundary for interaction" },
    { concept: "protocol", distance: 0.3, reason: "communication rules" },
    { concept: "handshake", distance: 0.5, reason: "establishing connection" },
    { concept: "translator", distance: 0.6, reason: "language intermediary" },
    { concept: "contract", distance: 0.4, reason: "defined agreement" }
  ],
  
  "deployment": [
    { concept: "launch", distance: 0.2, reason: "initiation" },
    { concept: "migration", distance: 0.5, reason: "moving to new environment" },
    { concept: "birth", distance: 0.7, reason: "bringing into the world" },
    { concept: "release", distance: 0.3, reason: "making available" },
    { concept: "transplant", distance: 0.6, reason: "moving to new host" }
  ],
  
  "system": [
    { concept: "organism", distance: 0.5, reason: "complex integrated whole" },
    { concept: "ecosystem", distance: 0.6, reason: "interconnected components" },
    { concept: "machine", distance: 0.3, reason: "functional assembly" },
    { concept: "constellation", distance: 0.7, reason: "related elements forming pattern" },
    { concept: "network", distance: 0.4, reason: "connected nodes" }
  ],
  
  "interface": [
    { concept: "membrane", distance: 0.6, reason: "selective boundary" },
    { concept: "door", distance: 0.5, reason: "point of passage" },
    { concept: "skin", distance: 0.7, reason: "protective contact layer" },
    { concept: "diplomat", distance: 0.8, reason: "mediating between parties" },
    { concept: "surface", distance: 0.4, reason: "point of interaction" }
  ],
  
  "architecture": [
    { concept: "blueprint", distance: 0.3, reason: "structural plan" },
    { concept: "skeleton", distance: 0.5, reason: "supporting framework" },
    { concept: "city planning", distance: 0.6, reason: "organized structure" },
    { concept: "composition", distance: 0.4, reason: "arrangement of parts" },
    { concept: "DNA", distance: 0.7, reason: "encoded structure" }
  ],
  
  "automation": [
    { concept: "reflex", distance: 0.5, reason: "automatic response" },
    { concept: "clockwork", distance: 0.4, reason: "mechanical repetition" },
    { concept: "habit", distance: 0.6, reason: "learned automaticity" },
    { concept: "robot", distance: 0.2, reason: "autonomous execution" },
    { concept: "muscle memory", distance: 0.7, reason: "unconscious execution" }
  ],
  
  "infrastructure": [
    { concept: "foundation", distance: 0.3, reason: "supporting base" },
    { concept: "skeleton", distance: 0.5, reason: "structural framework" },
    { concept: "circulatory system", distance: 0.7, reason: "distribution network" },
    { concept: "nervous system", distance: 0.6, reason: "communication backbone" },
    { concept: "root system", distance: 0.7, reason: "hidden support network" }
  ],
  
  "protocol": [
    { concept: "etiquette", distance: 0.5, reason: "communication rules" },
    { concept: "ritual", distance: 0.6, reason: "prescribed sequence" },
    { concept: "grammar", distance: 0.4, reason: "structural rules" },
    { concept: "treaty", distance: 0.5, reason: "agreed framework" },
    { concept: "choreography", distance: 0.7, reason: "coordinated sequence" }
  ],
  
  "framework": [
    { concept: "scaffold", distance: 0.3, reason: "supporting structure" },
    { concept: "skeleton", distance: 0.4, reason: "structural base" },
    { concept: "trellis", distance: 0.6, reason: "guide for growth" },
    { concept: "paradigm", distance: 0.5, reason: "conceptual structure" },
    { concept: "constitution", distance: 0.6, reason: "organizing principles" }
  ],
  
  "middleware": [
    { concept: "translator", distance: 0.4, reason: "between languages" },
    { concept: "intermediary", distance: 0.3, reason: "connecting parties" },
    { concept: "adapter", distance: 0.3, reason: "compatibility layer" },
    { concept: "diplomat", distance: 0.7, reason: "negotiating between systems" },
    { concept: "bridge", distance: 0.4, reason: "spanning gap" }
  ],
  
  "scalability": [
    { concept: "elasticity", distance: 0.4, reason: "flexible expansion" },
    { concept: "fractal", distance: 0.6, reason: "self-similar at scales" },
    { concept: "modularity", distance: 0.3, reason: "expandable units" },
    { concept: "virus", distance: 0.7, reason: "exponential replication" },
    { concept: "cell division", distance: 0.6, reason: "growth through splitting" }
  ],
  
  "debugging": [
    { concept: "detective work", distance: 0.4, reason: "investigating clues" },
    { concept: "archaeology", distance: 0.6, reason: "uncovering hidden layers" },
    { concept: "medical diagnosis", distance: 0.5, reason: "identifying problem" },
    { concept: "exorcism", distance: 0.8, reason: "removing unwanted presence" },
    { concept: "troubleshooting", distance: 0.2, reason: "systematic problem solving" }
  ],
  
  "refactoring": [
    { concept: "renovation", distance: 0.4, reason: "improving structure" },
    { concept: "editing", distance: 0.5, reason: "improving without changing meaning" },
    { concept: "evolution", distance: 0.6, reason: "gradual improvement" },
    { concept: "decluttering", distance: 0.5, reason: "removing unnecessary" },
    { concept: "distillation", distance: 0.7, reason: "extracting essence" }
  ],
  
  "migration": [
    { concept: "journey", distance: 0.5, reason: "moving between places" },
    { concept: "translation", distance: 0.6, reason: "changing context" },
    { concept: "transplant", distance: 0.5, reason: "moving to new host" },
    { concept: "metamorphosis", distance: 0.7, reason: "transformative movement" },
    { concept: "exodus", distance: 0.6, reason: "mass relocation" }
  ]
};
