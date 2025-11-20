/**
 * Medical Domain Semantic Associations
 * 
 * Specialized associations for medical, healthcare, and diagnostic terminology.
 * These extend the base semantic drift associations to handle domain-specific concepts.
 */

export interface WeightedAssociation {
  concept: string;
  distance: number; // 0.0 (very close) to 1.0 (very distant but connected)
  reason?: string;
}

export const MEDICAL_ASSOCIATIONS: Record<string, WeightedAssociation[]> = {
  "radiology": [
    { concept: "diagnosis", distance: 0.2, reason: "core function" },
    { concept: "imaging", distance: 0.1, reason: "primary tool" },
    { concept: "pattern recognition", distance: 0.4, reason: "cognitive skill" },
    { concept: "archaeology", distance: 0.7, reason: "uncovering hidden information" },
    { concept: "detective work", distance: 0.6, reason: "piecing together clues" },
    { concept: "translation", distance: 0.6, reason: "interpreting visual signs" }
  ],
  
  "diagnosis": [
    { concept: "hypothesis", distance: 0.3, reason: "scientific method" },
    { concept: "puzzle", distance: 0.5, reason: "assembling pieces" },
    { concept: "prophecy", distance: 0.8, reason: "predicting outcomes" },
    { concept: "translation", distance: 0.6, reason: "interpreting signs" },
    { concept: "detective work", distance: 0.4, reason: "investigating evidence" },
    { concept: "pattern matching", distance: 0.3, reason: "recognizing symptoms" }
  ],
  
  "imaging": [
    { concept: "photography", distance: 0.2, reason: "visual capture" },
    { concept: "x-ray vision", distance: 0.3, reason: "seeing through" },
    { concept: "revelation", distance: 0.7, reason: "making visible the invisible" },
    { concept: "microscope", distance: 0.4, reason: "magnifying details" },
    { concept: "transparency", distance: 0.6, reason: "revealing internal structure" }
  ],
  
  "workflow": [
    { concept: "river", distance: 0.4, reason: "continuous flow" },
    { concept: "assembly line", distance: 0.3, reason: "sequential processing" },
    { concept: "jazz", distance: 0.7, reason: "improvised coordination" },
    { concept: "choreography", distance: 0.6, reason: "orchestrated movement" },
    { concept: "pipeline", distance: 0.2, reason: "staged progression" },
    { concept: "current", distance: 0.5, reason: "directional movement" }
  ],
  
  "patient": [
    { concept: "subject", distance: 0.2, reason: "focus of study" },
    { concept: "puzzle", distance: 0.6, reason: "unique case to solve" },
    { concept: "story", distance: 0.5, reason: "personal narrative" },
    { concept: "ecosystem", distance: 0.7, reason: "complex interacting systems" },
    { concept: "canvas", distance: 0.7, reason: "surface for examination" }
  ],
  
  "protocol": [
    { concept: "recipe", distance: 0.3, reason: "step-by-step instructions" },
    { concept: "ritual", distance: 0.5, reason: "prescribed sequence" },
    { concept: "algorithm", distance: 0.4, reason: "systematic procedure" },
    { concept: "tradition", distance: 0.6, reason: "established practice" },
    { concept: "playbook", distance: 0.4, reason: "strategic guideline" }
  ],
  
  "scan": [
    { concept: "search", distance: 0.2, reason: "systematic examination" },
    { concept: "reconnaissance", distance: 0.5, reason: "exploratory survey" },
    { concept: "archaeology", distance: 0.7, reason: "uncovering layers" },
    { concept: "reading", distance: 0.4, reason: "interpreting information" },
    { concept: "sonar", distance: 0.6, reason: "sensing through barriers" }
  ],
  
  "treatment": [
    { concept: "intervention", distance: 0.2, reason: "active modification" },
    { concept: "gardening", distance: 0.7, reason: "nurturing growth" },
    { concept: "repair", distance: 0.4, reason: "fixing what's broken" },
    { concept: "alchemy", distance: 0.8, reason: "transformation process" },
    { concept: "calibration", distance: 0.5, reason: "restoring balance" }
  ],
  
  "symptom": [
    { concept: "clue", distance: 0.3, reason: "evidence of condition" },
    { concept: "smoke", distance: 0.5, reason: "indicator of fire" },
    { concept: "messenger", distance: 0.6, reason: "carrying information" },
    { concept: "signal", distance: 0.4, reason: "communication from body" },
    { concept: "tip of iceberg", distance: 0.7, reason: "visible part of larger issue" }
  ],
  
  "prognosis": [
    { concept: "forecast", distance: 0.3, reason: "predicting future state" },
    { concept: "prophecy", distance: 0.6, reason: "foreseeing outcome" },
    { concept: "trajectory", distance: 0.4, reason: "projected path" },
    { concept: "crystal ball", distance: 0.8, reason: "glimpsing future" },
    { concept: "compass", distance: 0.6, reason: "indicating direction" }
  ],
  
  "healthcare": [
    { concept: "gardening", distance: 0.6, reason: "cultivating wellness" },
    { concept: "maintenance", distance: 0.4, reason: "preserving function" },
    { concept: "ecosystem", distance: 0.5, reason: "integrated system" },
    { concept: "safety net", distance: 0.4, reason: "protective system" },
    { concept: "stewardship", distance: 0.6, reason: "responsible care" }
  ],
  
  "medical record": [
    { concept: "biography", distance: 0.4, reason: "life story" },
    { concept: "map", distance: 0.5, reason: "charting journey" },
    { concept: "ledger", distance: 0.3, reason: "chronological record" },
    { concept: "fossil record", distance: 0.8, reason: "preserved history" },
    { concept: "manuscript", distance: 0.6, reason: "written history" }
  ],
  
  "triage": [
    { concept: "sorting", distance: 0.2, reason: "categorizing by priority" },
    { concept: "filter", distance: 0.4, reason: "separating urgent from routine" },
    { concept: "queue", distance: 0.3, reason: "organizing sequence" },
    { concept: "battlefield strategy", distance: 0.7, reason: "allocating limited resources" },
    { concept: "air traffic control", distance: 0.6, reason: "managing critical timing" }
  ]
};
