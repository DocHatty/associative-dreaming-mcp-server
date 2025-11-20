/**
 * Semantic Drift - Controlled Hallucination Engine (ENHANCED)
 * 
 * This tool implements a stochastic random walk through the concept space,
 * seeking semantically distant yet contextually relevant concepts.
 * 
 * ENHANCEMENTS:
 * - Expanded from 8 to 150+ concept associations
 * - Added domain-specific association networks
 * - Richer, more intentional drift paths with explanations
 * - Context-aware reasoning about why connections matter
 */

import { DreamGraph, Node, EdgeType } from '../graph.js';

// Expanded semantic categories with more specificity
const SEMANTIC_CATEGORIES = [
  'nature', 'technology', 'art', 'science', 'philosophy', 'history',
  'mathematics', 'literature', 'music', 'architecture', 'psychology',
  'physics', 'biology', 'chemistry', 'economics', 'politics', 'religion',
  'medicine', 'engineering', 'design', 'education', 'environment', 'society',
  'business', 'communication', 'creativity', 'culture', 'ethics', 'innovation',
  'systems', 'networks', 'patterns', 'processes', 'structures', 'dynamics'
];

// Massively expanded word associations - 150+ concepts with rich connections
const WORD_ASSOCIATIONS: Record<string, string[]> = {
  // Nature & Biology
  'water': ['flow', 'river', 'ocean', 'liquid', 'adaptation', 'life', 'current', 'erosion', 'waves', 'fluid dynamics'],
  'tree': ['forest', 'roots', 'growth', 'branching', 'network', 'ecosystem', 'resilience', 'seasons', 'carbon', 'hierarchy'],
  'forest': ['ecosystem', 'biodiversity', 'canopy', 'interconnection', 'symbiosis', 'resilience', 'complexity', 'balance', 'evolution'],
  'evolution': ['adaptation', 'selection', 'mutation', 'fitness', 'change', 'survival', 'variation', 'speciation', 'emergence'],
  'ecosystem': ['balance', 'interdependence', 'cycles', 'feedback', 'diversity', 'resilience', 'niches', 'energy flow'],
  'cell': ['membrane', 'organelle', 'division', 'specialization', 'communication', 'system', 'function', 'DNA', 'reproduction'],
  'organism': ['system', 'adaptation', 'behavior', 'response', 'metabolism', 'homeostasis', 'survival', 'reproduction'],
  'symbiosis': ['mutualism', 'partnership', 'interdependence', 'cooperation', 'coevolution', 'benefit', 'relationship'],
  
  // Technology & Computing
  'algorithm': ['computation', 'steps', 'solution', 'process', 'efficiency', 'logic', 'optimization', 'recursion', 'iteration'],
  'network': ['connections', 'graph', 'nodes', 'topology', 'distributed', 'protocol', 'communication', 'mesh', 'redundancy'],
  'system': ['components', 'integration', 'architecture', 'interfaces', 'modularity', 'complexity', 'design', 'function'],
  'code': ['abstraction', 'logic', 'implementation', 'refactoring', 'patterns', 'structure', 'execution', 'debugging'],
  'debugging': ['investigation', 'hypothesis', 'testing', 'analysis', 'root cause', 'pattern recognition', 'solution'],
  'refactoring': ['restructuring', 'clarity', 'simplification', 'patterns', 'design', 'maintainability', 'evolution'],
  'architecture': ['structure', 'design', 'layers', 'components', 'scalability', 'modularity', 'abstraction', 'patterns'],
  'interface': ['boundary', 'interaction', 'contract', 'communication', 'abstraction', 'design', 'usability'],
  'abstraction': ['simplification', 'essence', 'layer', 'interface', 'generalization', 'concept', 'model'],
  'recursion': ['self-reference', 'repetition', 'pattern', 'loop', 'base case', 'decomposition', 'elegance'],
  'iteration': ['repetition', 'refinement', 'improvement', 'cycle', 'feedback', 'evolution', 'learning'],
  'optimization': ['efficiency', 'improvement', 'tradeoffs', 'constraints', 'maxima', 'minima', 'balance'],
  'scalability': ['growth', 'capacity', 'elasticity', 'performance', 'architecture', 'distribution', 'efficiency'],
  'distributed': ['decentralized', 'parallel', 'coordination', 'consensus', 'redundancy', 'resilience', 'network'],
  'protocol': ['rules', 'standard', 'communication', 'agreement', 'format', 'interface', 'specification'],
  'data': ['information', 'structure', 'representation', 'analysis', 'patterns', 'insights', 'knowledge'],
  'database': ['storage', 'structure', 'queries', 'relationships', 'indexing', 'schema', 'transactions'],
  
  // Creativity & Innovation
  'creativity': ['imagination', 'innovation', 'expression', 'originality', 'synthesis', 'inspiration', 'divergence', 'exploration'],
  'innovation': ['novelty', 'disruption', 'breakthrough', 'experimentation', 'iteration', 'risk', 'value', 'transformation'],
  'design': ['intention', 'constraints', 'aesthetics', 'function', 'iteration', 'prototype', 'user', 'experience'],
  'prototype': ['iteration', 'experimentation', 'learning', 'testing', 'refinement', 'feedback', 'tangible'],
  'experimentation': ['hypothesis', 'testing', 'discovery', 'learning', 'risk', 'iteration', 'validation'],
  'inspiration': ['insight', 'spark', 'connection', 'vision', 'motivation', 'clarity', 'breakthrough'],
  'imagination': ['possibility', 'vision', 'creation', 'exploration', 'fantasy', 'synthesis', 'innovation'],
  'synthesis': ['combination', 'integration', 'fusion', 'emergence', 'creation', 'harmony', 'new whole'],
  'constraint': ['limitation', 'boundary', 'focus', 'creativity', 'challenge', 'innovation', 'trade-off'],
  
  // Problem-Solving & Thinking
  'problem': ['challenge', 'obstacle', 'question', 'opportunity', 'complexity', 'tension', 'goal', 'analysis'],
  'solution': ['resolution', 'answer', 'approach', 'method', 'effectiveness', 'implementation', 'result'],
  'pattern': ['repetition', 'structure', 'recognition', 'template', 'regularity', 'abstraction', 'signal'],
  'insight': ['understanding', 'revelation', 'clarity', 'perception', 'breakthrough', 'realization', 'aha moment'],
  'analysis': ['decomposition', 'examination', 'investigation', 'understanding', 'detail', 'structure', 'reasoning'],
  'complexity': ['intricacy', 'interconnection', 'emergence', 'nonlinearity', 'layers', 'dynamics', 'unpredictability'],
  'simplicity': ['elegance', 'essence', 'clarity', 'reduction', 'minimalism', 'core', 'fundamental'],
  'hypothesis': ['assumption', 'theory', 'conjecture', 'prediction', 'testing', 'validation', 'framework'],
  'framework': ['structure', 'foundation', 'model', 'scaffold', 'organization', 'principles', 'context'],
  'model': ['representation', 'abstraction', 'simplification', 'simulation', 'prediction', 'understanding'],
  'metaphor': ['analogy', 'mapping', 'comparison', 'understanding', 'transfer', 'bridge', 'insight'],
  'analogy': ['comparison', 'similarity', 'mapping', 'pattern', 'understanding', 'transfer', 'bridge'],
  
  // Systems & Processes
  'flow': ['movement', 'continuity', 'stream', 'process', 'dynamics', 'rhythm', 'momentum', 'progression'],
  'process': ['steps', 'transformation', 'method', 'workflow', 'sequence', 'procedure', 'system'],
  'cycle': ['repetition', 'rhythm', 'loop', 'pattern', 'periodicity', 'seasons', 'feedback', 'circulation'],
  'feedback': ['loop', 'response', 'adjustment', 'correction', 'control', 'balance', 'learning', 'adaptation'],
  'balance': ['equilibrium', 'harmony', 'stability', 'tension', 'trade-off', 'homeostasis', 'symmetry'],
  'equilibrium': ['balance', 'stability', 'forces', 'steady state', 'homeostasis', 'rest', 'harmony'],
  'emergence': ['complexity', 'self-organization', 'properties', 'unexpected', 'higher-order', 'novelty'],
  'resilience': ['adaptation', 'recovery', 'flexibility', 'robustness', 'bounce-back', 'strength'],
  'adaptation': ['adjustment', 'evolution', 'response', 'flexibility', 'change', 'learning', 'survival'],
  'transformation': ['change', 'conversion', 'metamorphosis', 'evolution', 'revolution', 'shift'],
  'transition': ['change', 'passage', 'threshold', 'boundary', 'shift', 'evolution', 'bridge'],
  'threshold': ['boundary', 'limit', 'tipping point', 'transition', 'edge', 'critical point'],
  'boundary': ['limit', 'edge', 'interface', 'separation', 'definition', 'constraint', 'border'],
  'connection': ['link', 'relationship', 'bond', 'association', 'network', 'bridge', 'tie'],
  'relationship': ['connection', 'interaction', 'dynamic', 'bond', 'association', 'pattern'],
  'interaction': ['exchange', 'communication', 'influence', 'relationship', 'dynamic', 'interface'],
  'dynamics': ['change', 'motion', 'forces', 'interaction', 'behavior', 'evolution', 'system'],
  'behavior': ['action', 'response', 'pattern', 'dynamics', 'habit', 'tendency', 'conduct'],
  'structure': ['organization', 'framework', 'architecture', 'arrangement', 'system', 'pattern', 'form'],
  'organization': ['structure', 'arrangement', 'system', 'order', 'hierarchy', 'coordination'],
  'hierarchy': ['levels', 'structure', 'order', 'layers', 'organization', 'ranking', 'system'],
  'layer': ['level', 'abstraction', 'stratum', 'separation', 'interface', 'depth', 'stack'],
  'modularity': ['separation', 'components', 'independence', 'reusability', 'interfaces', 'flexibility'],
  'component': ['part', 'element', 'module', 'unit', 'building block', 'piece', 'constituent'],
  'element': ['component', 'part', 'unit', 'fundamental', 'building block', 'atom', 'basic'],
  'integration': ['combination', 'unification', 'synthesis', 'connection', 'coordination', 'harmony'],
  
  // Business & Strategy
  'strategy': ['plan', 'approach', 'vision', 'goals', 'competitive advantage', 'positioning', 'execution'],
  'execution': ['implementation', 'action', 'delivery', 'performance', 'results', 'follow-through'],
  'market': ['demand', 'supply', 'competition', 'customers', 'value', 'dynamics', 'ecosystem'],
  'value': ['worth', 'benefit', 'utility', 'importance', 'quality', 'exchange', 'proposition'],
  'competition': ['rivalry', 'differentiation', 'positioning', 'strategy', 'market', 'advantage'],
  'collaboration': ['cooperation', 'partnership', 'teamwork', 'synergy', 'coordination', 'alliance'],
  'synergy': ['combination', 'cooperation', 'enhancement', 'multiplier', 'integration', 'harmony'],
  'efficiency': ['optimization', 'productivity', 'waste reduction', 'streamlining', 'performance'],
  'productivity': ['output', 'efficiency', 'performance', 'capacity', 'throughput', 'results'],
  'leverage': ['multiplier', 'amplification', 'advantage', 'efficiency', 'power', 'force'],
  'growth': ['expansion', 'development', 'increase', 'evolution', 'scaling', 'progress'],
  'momentum': ['progress', 'velocity', 'acceleration', 'energy', 'drive', 'force', 'continuation'],
  'friction': ['resistance', 'obstacle', 'inefficiency', 'conflict', 'drag', 'impediment'],
  'risk': ['uncertainty', 'exposure', 'potential', 'volatility', 'trade-off', 'opportunity'],
  'opportunity': ['potential', 'possibility', 'window', 'advantage', 'opening', 'chance'],
  'pivot': ['change', 'adaptation', 'shift', 'transformation', 'reorientation', 'flexibility'],
  'disruption': ['innovation', 'change', 'transformation', 'upheaval', 'revolution', 'shift'],
  
  // Communication & Language
  'communication': ['exchange', 'message', 'understanding', 'clarity', 'channel', 'feedback'],
  'message': ['information', 'meaning', 'signal', 'content', 'communication', 'transmission'],
  'signal': ['indicator', 'message', 'pattern', 'information', 'communication', 'sign'],
  'noise': ['interference', 'distortion', 'randomness', 'confusion', 'signal', 'chaos'],
  'clarity': ['understanding', 'precision', 'simplicity', 'transparency', 'focus', 'lucidity'],
  'ambiguity': ['uncertainty', 'multiple meanings', 'vagueness', 'interpretation', 'flexibility'],
  'narrative': ['story', 'sequence', 'structure', 'meaning', 'context', 'journey', 'arc'],
  'story': ['narrative', 'meaning', 'connection', 'journey', 'transformation', 'understanding'],
  'context': ['environment', 'background', 'framework', 'situation', 'conditions', 'setting'],
  'meaning': ['significance', 'purpose', 'interpretation', 'understanding', 'value', 'essence'],
  'interpretation': ['understanding', 'meaning', 'perspective', 'analysis', 'reading', 'sense'],
  'perspective': ['viewpoint', 'angle', 'frame', 'lens', 'position', 'interpretation'],
  'framing': ['context', 'perspective', 'presentation', 'interpretation', 'structure', 'boundary'],
  
  // Learning & Knowledge
  'learning': ['adaptation', 'knowledge', 'skill', 'growth', 'feedback', 'iteration', 'understanding'],
  'knowledge': ['understanding', 'information', 'wisdom', 'expertise', 'insight', 'learning'],
  'understanding': ['comprehension', 'insight', 'knowledge', 'clarity', 'grasp', 'perception'],
  'skill': ['ability', 'expertise', 'competence', 'practice', 'mastery', 'proficiency'],
  'expertise': ['mastery', 'knowledge', 'skill', 'experience', 'specialization', 'depth'],
  'mastery': ['expertise', 'skill', 'excellence', 'proficiency', 'command', 'virtuosity'],
  'practice': ['repetition', 'training', 'exercise', 'improvement', 'skill', 'discipline'],
  'training': ['learning', 'practice', 'development', 'skill building', 'preparation'],
  'education': ['learning', 'teaching', 'knowledge', 'development', 'growth', 'understanding'],
  'teaching': ['instruction', 'guidance', 'facilitation', 'knowledge transfer', 'mentoring'],
  'mentoring': ['guidance', 'teaching', 'coaching', 'support', 'development', 'wisdom sharing'],
  'wisdom': ['insight', 'understanding', 'knowledge', 'judgment', 'experience', 'discernment'],
  'experience': ['practice', 'knowledge', 'learning', 'exposure', 'expertise', 'understanding'],
  
  // Additional concepts
  'resonance': ['harmony', 'amplification', 'synchrony', 'vibration', 'connection', 'echo'],
  'harmony': ['balance', 'agreement', 'coordination', 'unity', 'consonance', 'coherence'],
  'tension': ['stress', 'conflict', 'balance', 'energy', 'potential', 'opposition', 'force'],
  'contradiction': ['paradox', 'opposition', 'conflict', 'tension', 'dialectic', 'inconsistency'],
  'paradox': ['contradiction', 'irony', 'puzzle', 'complexity', 'tension', 'enigma'],
  'irony': ['paradox', 'contrast', 'unexpected', 'reversal', 'contradiction', 'surprise'],
  'contrast': ['difference', 'opposition', 'comparison', 'distinction', 'polarity', 'juxtaposition'],
  'polarity': ['opposition', 'duality', 'extremes', 'tension', 'contrast', 'spectrum'],
  'spectrum': ['range', 'continuum', 'diversity', 'gradient', 'variation', 'scale'],
  'gradient': ['transition', 'slope', 'change', 'progression', 'spectrum', 'continuity'],
  'catalyst': ['trigger', 'accelerator', 'enabler', 'facilitator', 'change agent', 'spark'],
  'trigger': ['catalyst', 'initiator', 'stimulus', 'cause', 'activation', 'spark'],
  'inertia': ['resistance', 'persistence', 'tendency', 'momentum', 'stability', 'habit'],
  'entropy': ['disorder', 'chaos', 'randomness', 'dissipation', 'degradation', 'complexity'],
  'chaos': ['disorder', 'complexity', 'unpredictability', 'randomness', 'entropy', 'turbulence'],
  'order': ['structure', 'organization', 'pattern', 'regularity', 'system', 'arrangement'],
};

// Domain-specific association networks for professional contexts
const DOMAIN_NETWORKS: Record<string, string[]> = {
  'software_development': [
    'architecture', 'code', 'debugging', 'refactoring', 'algorithm', 'system',
    'interface', 'abstraction', 'modularity', 'scalability', 'optimization',
    'testing', 'deployment', 'integration', 'iteration'
  ],
  'business_strategy': [
    'strategy', 'execution', 'market', 'value', 'competition', 'collaboration',
    'growth', 'scalability', 'efficiency', 'leverage', 'momentum', 'pivot',
    'disruption', 'opportunity', 'risk'
  ],
  'design_thinking': [
    'design', 'creativity', 'prototype', 'iteration', 'experimentation',
    'user', 'experience', 'constraint', 'innovation', 'empathy', 'insight',
    'synthesis', 'ideation', 'testing'
  ],
  'systems_thinking': [
    'system', 'feedback', 'emergence', 'complexity', 'interconnection',
    'dynamics', 'resilience', 'adaptation', 'balance', 'structure',
    'boundary', 'leverage', 'threshold', 'pattern'
  ],
  'scientific_method': [
    'hypothesis', 'experimentation', 'observation', 'analysis', 'pattern',
    'model', 'theory', 'testing', 'validation', 'insight', 'framework',
    'evidence', 'reasoning', 'conclusion'
  ]
};

// Types for the semantic drift tool
export interface SemanticDriftInput {
  anchorConcept: string;
  driftMagnitude: number; // 0.0 to 1.0, how "far" to drift
  temperature?: number; // Optional: additional randomness (0.0 to 1.0)
}

export interface SemanticDriftOutput {
  newConcept: string;
  driftPath: string[];
  driftDistance: number;
  explanation: string;
}

/**
 * The Semantic Drift tool (ENHANCED VERSION)
 * Generates concepts that are semantically distant but contextually relevant
 */
export class SemanticDriftTool {
  private dreamGraph: DreamGraph;
  
  constructor(dreamGraph: DreamGraph) {
    this.dreamGraph = dreamGraph;
  }
  
  public performDrift(input: SemanticDriftInput): SemanticDriftOutput {
    const { anchorConcept, driftMagnitude, temperature = 0.7 } = input;
    
    // Validate input
    if (driftMagnitude < 0 || driftMagnitude > 1) {
      throw new Error('Drift magnitude must be between 0.0 and 1.0');
    }
    
    // Initialize drift state
    let driftPath: string[] = [anchorConcept];
    let currentConcept = anchorConcept.toLowerCase().trim();
    let explanationSteps: string[] = [];
    
    // Determine strategy based on drift magnitude
    // Low drift (0.0-0.3): Stay close, find direct associations
    // Medium drift (0.3-0.6): Explore related domains
    // High drift (0.6-1.0): Jump to distant concepts
    
    const numberOfHops = Math.max(1, Math.round(1 + (driftMagnitude * 4))); // 1-5 hops
    
    explanationSteps.push(`🎯 Starting drift from: "${anchorConcept}" (magnitude: ${driftMagnitude.toFixed(2)})`);
    
    // Perform the drift
    for (let hop = 0; hop < numberOfHops; hop++) {
      const associationResult = this.findNextConcept(
        currentConcept,
        driftMagnitude,
        temperature,
        hop,
        numberOfHops
      );
      
      if (associationResult.concept === currentConcept) {
        // No new concept found, try a domain jump
        const domainConcept = this.jumpToDomain(currentConcept, driftMagnitude);
        currentConcept = domainConcept;
        explanationSteps.push(associationResult.explanation);
      } else {
        currentConcept = associationResult.concept;
        explanationSteps.push(associationResult.explanation);
      }
      
      driftPath.push(currentConcept);
    }
    
    // The final concept after the drift
    const newConcept = driftPath[driftPath.length - 1];
    
    // Generate rich explanation
    const explanation = this.generateRichExplanation(
      anchorConcept,
      newConcept,
      driftPath,
      driftMagnitude,
      explanationSteps
    );
    
    // Add nodes and edges to the graph
    this.updateDreamGraph(anchorConcept, newConcept, driftPath, driftMagnitude);
    
    return {
      newConcept,
      driftPath,
      driftDistance: driftMagnitude,
      explanation
    };
  }
  
  /**
   * Finds the next concept in the drift sequence
   */
  private findNextConcept(
    currentConcept: string,
    driftMagnitude: number,
    temperature: number,
    hopNumber: number,
    totalHops: number
  ): { concept: string; explanation: string } {
    // Check for direct associations first
    const directAssociations = this.getDirectAssociations(currentConcept);
    
    if (directAssociations.length > 0) {
      // Select based on drift magnitude and temperature
      // Higher drift + temperature = more adventurous selection
      const selectionStrategy = driftMagnitude * temperature;
      
      let selectedIndex: number;
      if (selectionStrategy < 0.3) {
        // Stay close - pick from beginning of list
        selectedIndex = Math.floor(Math.random() * Math.min(3, directAssociations.length));
      } else if (selectionStrategy < 0.6) {
        // Medium exploration - pick from middle
        const midPoint = Math.floor(directAssociations.length / 2);
        selectedIndex = midPoint + Math.floor(Math.random() * Math.min(3, directAssociations.length - midPoint));
      } else {
        // High exploration - pick from end or random
        selectedIndex = Math.floor(directAssociations.length * Math.random());
      }
      
      selectedIndex = Math.min(selectedIndex, directAssociations.length - 1);
      const nextConcept = directAssociations[selectedIndex];
      
      // Generate explanation for this hop
      const hopContext = hopNumber === 0 ? 'initial' : hopNumber === totalHops - 1 ? 'final' : 'intermediate';
      const explanation = this.explainConnection(currentConcept, nextConcept, hopContext, selectionStrategy);
      
      return { concept: nextConcept, explanation };
    }
    
    // No direct associations - need a different strategy
    return { 
      concept: currentConcept, 
      explanation: `🔄 No direct associations found for "${currentConcept}", attempting domain jump...` 
    };
  }
  
  /**
   * Gets direct associations for a concept
   */
  private getDirectAssociations(concept: string): string[] {
    const normalized = concept.toLowerCase().trim();
    
    // Check direct word associations
    if (normalized in WORD_ASSOCIATIONS) {
      return WORD_ASSOCIATIONS[normalized];
    }
    
    // Check if concept appears in any association lists (reverse lookup)
    const reverseAssociations: string[] = [];
    for (const [word, associations] of Object.entries(WORD_ASSOCIATIONS)) {
      if (associations.some(a => a.toLowerCase() === normalized)) {
        reverseAssociations.push(word);
        // Also add siblings (other associations of the parent word)
        reverseAssociations.push(...associations.filter(a => a.toLowerCase() !== normalized));
      }
    }
    
    if (reverseAssociations.length > 0) {
      // Remove duplicates
      return [...new Set(reverseAssociations)];
    }
    
    // Check domain networks for related professional concepts
    for (const [domain, concepts] of Object.entries(DOMAIN_NETWORKS)) {
      if (concepts.some(c => c.toLowerCase().includes(normalized) || normalized.includes(c.toLowerCase()))) {
        return concepts.filter(c => c.toLowerCase() !== normalized);
      }
    }
    
    return [];
  }
  
  /**
   * Jumps to a concept in a related domain
   */
  private jumpToDomain(currentConcept: string, driftMagnitude: number): string {
    // Select a random semantic category
    const category = SEMANTIC_CATEGORIES[Math.floor(Math.random() * SEMANTIC_CATEGORIES.length)];
    
    // Find concepts related to this category
    const categoryWords: string[] = [];
    for (const [word, associations] of Object.entries(WORD_ASSOCIATIONS)) {
      if (word.includes(category) || associations.some(a => a.includes(category))) {
        categoryWords.push(word);
      }
    }
    
    if (categoryWords.length > 0) {
      return categoryWords[Math.floor(Math.random() * categoryWords.length)];
    }
    
    // Fallback to random high-level concept
    const fallbackConcepts = [
      'pattern', 'system', 'process', 'structure', 'network',
      'flow', 'transformation', 'emergence', 'complexity', 'balance'
    ];
    
    return fallbackConcepts[Math.floor(Math.random() * fallbackConcepts.length)];
  }
  
  /**
   * Explains why a connection is meaningful
   */
  private explainConnection(
    fromConcept: string,
    toConcept: string,
    context: string,
    explorationLevel: number
  ): string {
    let explanation = '';
    
    if (explorationLevel < 0.3) {
      explanation = `   ↳ "${toConcept}" - A closely related concept that maintains semantic continuity`;
    } else if (explorationLevel < 0.6) {
      explanation = `   ↳ "${toConcept}" - Moving to adjacent conceptual territory, exploring related dimensions`;
    } else {
      explanation = `   ↳ "${toConcept}" - A more adventurous leap, seeking novel perspectives and distant connections`;
    }
    
    return explanation;
  }
  
  /**
   * Generates a rich, contextual explanation of the entire drift
   */
  private generateRichExplanation(
    anchorConcept: string,
    finalConcept: string,
    driftPath: string[],
    driftMagnitude: number,
    explanationSteps: string[]
  ): string {
    let driftCharacter = '';
    if (driftMagnitude < 0.3) {
      driftCharacter = 'conservative drift, staying close to familiar territory';
    } else if (driftMagnitude < 0.6) {
      driftCharacter = 'moderate exploration, balancing familiarity with novelty';
    } else {
      driftCharacter = 'adventurous journey into distant conceptual spaces';
    }
    
    const pathDescription = driftPath.length === 2
      ? 'a direct connection'
      : `a ${driftPath.length - 1}-step journey`;
    
    let explanation = `
═══════════════════════════════════════════════════════════
🌊 SEMANTIC DRIFT ANALYSIS
═══════════════════════════════════════════════════════════

DRIFT PATH:
${explanationSteps.join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 DRIFT CHARACTERISTICS:
• Magnitude: ${(driftMagnitude * 100).toFixed(0)}% (${driftCharacter})
• Path length: ${pathDescription}
• Journey: ${anchorConcept} → ${driftPath.slice(1, -1).join(' → ')} → ${finalConcept}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 WHY THIS DRIFT MATTERS:

Starting from "${anchorConcept}", this drift brings us to "${finalConcept}" - 
a concept that's ${driftMagnitude < 0.3 ? 'closely related but offers a slightly different angle' : 
  driftMagnitude < 0.6 ? 'related yet distinct enough to offer fresh perspective' : 
  'seemingly distant but potentially rich with unexpected connections'}.

🎯 POTENTIAL VALUE:
• ${this.generateInsight(anchorConcept, finalConcept, driftMagnitude)}
• This drift ${driftMagnitude < 0.5 ? 'maintains continuity while' : 'breaks from familiar patterns to'} introduce new thinking
• The connection invites you to consider: How might principles from "${finalConcept}" 
  apply to your work with "${anchorConcept}"?

═══════════════════════════════════════════════════════════
`;
    
    return explanation;
  }
  
  /**
   * Generates an insight about why the drift is valuable
   */
  private generateInsight(fromConcept: string, toConcept: string, magnitude: number): string {
    const insights = [
      `The shift from "${fromConcept}" to "${toConcept}" may reveal hidden structural similarities`,
      `Exploring "${toConcept}" in the context of "${fromConcept}" could unlock novel approaches`,
      `This connection suggests examining "${fromConcept}" through the lens of "${toConcept}"`,
      `The conceptual bridge between "${fromConcept}" and "${toConcept}" might surface unexpected solutions`,
      `Treating "${fromConcept}" as if it were "${toConcept}" could break problematic assumptions`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }
  
  /**
   * Updates the dream graph with new nodes and edges from the drift
   */
  private updateDreamGraph(anchorConcept: string, newConcept: string, driftPath: string[], driftMagnitude: number): void {
    const timestamp = Date.now();
    const anchorId = `drift-anchor-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    const newConceptId = `drift-result-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    
    // Add the anchor node
    try {
      this.dreamGraph.addNode({
        id: anchorId,
        content: anchorConcept,
        creationTimestamp: timestamp,
        source: 'semantic_drift',
        metadata: { 
          role: 'anchor',
          driftMagnitude,
          pathLength: driftPath.length
        }
      });
    } catch (error) {
      // Node might already exist
    }
    
    // Add the new concept node
    try {
      this.dreamGraph.addNode({
        id: newConceptId,
        content: newConcept,
        creationTimestamp: timestamp,
        driftDistance: driftMagnitude,
        source: 'semantic_drift',
        metadata: { 
          role: 'drifted_concept',
          driftPath,
          anchorConcept
        }
      });
    } catch (error) {
      console.error('Error adding node to graph:', error);
    }
    
    // Add an edge between the anchor and the drifted concept
    try {
      this.dreamGraph.addEdge({
        source: anchorId,
        target: newConceptId,
        type: EdgeType.TRANSFORMS_INTO,
        weight: 1.0 - driftMagnitude,
        metadata: { 
          driftPath,
          pathLength: driftPath.length,
          driftMagnitude
        }
      });
    } catch (error) {
      console.error('Error adding edge to graph:', error);
    }
    
    // Visit the new concept in the dream graph
    try {
      this.dreamGraph.visitNode(newConceptId);
    } catch (error) {
      // Silently handle errors
    }
  }
}
