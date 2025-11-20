/**
 * Bisociative Synthesis - The Combinatorial Engine (ENHANCED)
 *
 * This tool forces the intersection of two unrelated matrices of thought.
 * Based on Arthur Koestler's theory of Bisociation and Conceptual Blending Theory.
 *
 * ENHANCEMENTS:
 * - Expanded from 6 to 15 diverse domains
 * - Context-aware, domain-specific mappings
 * - Richer explanations with actual cross-domain insights
 * - Better bridge concept generation
 */

import { DreamGraph, Node, EdgeType } from '../graph.js';

// Expanded domain categories - from 6 to 15 domains
const DOMAINS = [
  {
    name: 'biology',
    concepts: ['evolution', 'ecosystem', 'cell', 'organism', 'adaptation', 'metabolism', 
               'symbiosis', 'homeostasis', 'mutation', 'natural selection', 'biodiversity',
               'predator-prey', 'succession', 'fitness', 'speciation'],
    structures: ['hierarchical organization', 'feedback loops', 'distributed networks', 
                 'emergent properties', 'specialization', 'redundancy', 'modularity',
                 'self-organization', 'co-evolution', 'niche partitioning']
  },
  {
    name: 'architecture',
    concepts: ['structure', 'form', 'function', 'space', 'material', 'aesthetic', 
               'context', 'scale', 'proportion', 'rhythm', 'balance', 'threshold',
               'circulation', 'light', 'enclosure', 'tectonics'],
    structures: ['load-bearing systems', 'circulation patterns', 'modular components',
                 'layers', 'symmetry', 'negative space', 'environmental integration',
                 'structural honesty', 'spatial hierarchy', 'tension and compression']
  },
  {
    name: 'music',
    concepts: ['harmony', 'rhythm', 'melody', 'timbre', 'composition', 'dynamics',
               'texture', 'tempo', 'counterpoint', 'resolution', 'theme', 'motif',
               'dissonance', 'consonance', 'phrasing', 'development'],
    structures: ['patterns', 'repetition with variation', 'layering', 'tension and release',
                 'call and response', 'transitions', 'development', 'theme and variation',
                 'fugue', 'crescendo', 'harmonic progression']
  },
  {
    name: 'economics',
    concepts: ['market', 'value', 'exchange', 'scarcity', 'efficiency', 'incentive',
               'competition', 'equilibrium', 'growth', 'distribution', 'trade',
               'utility', 'opportunity cost', 'liquidity', 'leverage'],
    structures: ['feedback mechanisms', 'flows', 'game theory', 'network effects',
                 'optimization', 'resource allocation', 'supply chains', 'price signals',
                 'comparative advantage', 'diminishing returns']
  },
  {
    name: 'mythology',
    concepts: ['archetype', 'hero', 'journey', 'transformation', 'symbol', 'ritual',
               'divine', 'mortal', 'underworld', 'creation', 'destruction',
               'trickster', 'threshold', 'mentor', 'shadow'],
    structures: ['cyclical patterns', 'opposing forces', 'symbolic representations', 
                 'narrative arcs', 'thresholds', 'tests', 'metaphorical layers',
                 'death and rebirth', 'quest structure', 'cosmology']
  },
  {
    name: 'game design',
    concepts: ['rules', 'mechanics', 'balance', 'progression', 'engagement', 'challenge',
               'feedback', 'player agency', 'reward', 'strategy', 'emergence',
               'difficulty curve', 'flow state', 'mastery', 'meta-game'],
    structures: ['core loops', 'risk/reward systems', 'decision trees', 'progression curves', 
                 'balance triangles', 'economies', 'state machines', 'skill expression',
                 'positive/negative feedback', 'mechanical depth']
  },
  {
    name: 'urban planning',
    concepts: ['density', 'connectivity', 'zoning', 'public space', 'transit', 'growth',
               'community', 'infrastructure', 'mixed-use', 'walkability', 'sustainability',
               'nodes', 'corridors', 'edges', 'landmarks'],
    structures: ['grid patterns', 'hub-and-spoke', 'organic growth', 'layered networks',
                 'spatial hierarchy', 'land use patterns', 'transit-oriented development',
                 'urban fabric', 'neighborhood structure', 'regional systems']
  },
  {
    name: 'jazz improvisation',
    concepts: ['spontaneity', 'conversation', 'theme', 'variation', 'syncopation',
               'swing', 'call and response', 'blue notes', 'tension', 'release',
               'solo', 'comping', 'trading fours', 'groove', 'phrasing'],
    structures: ['cyclical structures', 'question and answer', 'building intensity',
                 'thematic development', 'motivic variation', 'polyrhythm', 'layered interaction',
                 'space and density', 'dynamic contrast', 'melodic storytelling']
  },
  {
    name: 'immune system',
    concepts: ['recognition', 'response', 'memory', 'specificity', 'tolerance',
               'adaptation', 'surveillance', 'elimination', 'self vs non-self',
               'antibody', 'antigen', 'inflammation', 'regulation'],
    structures: ['distributed detection', 'cascade amplification', 'memory storage',
                 'pattern recognition', 'adaptive response', 'multilayered defense',
                 'self-regulation', 'clonal selection', 'immune repertoire', 'tolerance mechanisms']
  },
  {
    name: 'supply chain',
    concepts: ['procurement', 'logistics', 'inventory', 'distribution', 'lead time',
               'bottleneck', 'throughput', 'optimization', 'resilience', 'visibility',
               'coordination', 'buffer', 'forecasting', 'fulfillment'],
    structures: ['network topology', 'push vs pull', 'just-in-time', 'hub-and-spoke',
                 'flow optimization', 'buffer management', 'information flow',
                 'constraint management', 'redundancy planning', 'demand propagation']
  },
  {
    name: 'gardening',
    concepts: ['cultivation', 'soil', 'season', 'pruning', 'nurturing', 'patience',
               'succession', 'companion planting', 'harvest', 'perennial', 'annual',
               'biodiversity', 'composting', 'microclimate', 'propagation'],
    structures: ['cyclical processes', 'layered systems', 'succession planning',
                 'symbiotic relationships', 'resource cycling', 'timing coordination',
                 'spatial arrangement', 'maintenance rhythm', 'seasonal adaptation']
  },
  {
    name: 'theater',
    concepts: ['performance', 'character', 'conflict', 'resolution', 'tension',
               'climax', 'denouement', 'subtext', 'blocking', 'timing',
               'ensemble', 'improvisation', 'rehearsal', 'audience'],
    structures: ['dramatic arc', 'act structure', 'scene progression', 'character development',
                 'tension building', 'ensemble dynamics', 'stage composition',
                 'rhythm and pacing', 'entrances and exits', 'rising action']
  },
  {
    name: 'martial arts',
    concepts: ['balance', 'center', 'flow', 'timing', 'distance', 'leverage',
               'awareness', 'adaptation', 'technique', 'principle', 'efficiency',
               'entry', 'evasion', 'control', 'release'],
    structures: ['circular motion', 'redirection', 'momentum transfer', 'rhythm disruption',
                 'spatial control', 'progressive refinement', 'principle-based response',
                 'continuous adjustment', 'energy management', 'tactical positioning']
  },
  {
    name: 'storytelling',
    concepts: ['narrative', 'character', 'conflict', 'arc', 'transformation',
               'stakes', 'theme', 'pacing', 'hook', 'payoff', 'tension',
               'resolution', 'perspective', 'voice', 'structure'],
    structures: ['three-act structure', 'hero\'s journey', 'nested loops', 'parallel threads',
                 'setup and payoff', 'escalation', 'cause and effect', 'emotional beats',
                 'dramatic irony', 'thematic resonance']
  },
  {
    name: 'epidemiology',
    concepts: ['transmission', 'reproduction rate', 'susceptible', 'infected', 'recovered',
               'vector', 'outbreak', 'containment', 'immunity', 'contact tracing',
               'incubation', 'virulence', 'reservoir', 'surveillance'],
    structures: ['network propagation', 'exponential growth', 'threshold dynamics',
                 'spatial spread patterns', 'intervention strategies', 'herd immunity',
                 'super-spreader events', 'compartmental models', 'feedback control']
  }
];

// Enhanced structural patterns with richer examples
const ISOMORPHIC_PATTERNS = [
  {
    name: 'hierarchy',
    description: 'Layered organization with relationships of control, composition, or abstraction',
    examples: {
      'biology': 'ecosystem → community → population → organism → organ → cell',
      'architecture': 'building → floor → room → zone → element → detail',
      'software': 'system → application → module → function → statement',
      'organization': 'corporation → division → department → team → individual'
    },
    mappingHints: ['levels', 'containment', 'abstraction', 'delegation', 'emergence']
  },
  {
    name: 'network',
    description: 'Decentralized connections between nodes enabling distributed exchange',
    examples: {
      'biology': 'neural networks, mycelial networks, food webs',
      'social': 'social networks, collaboration networks, trade networks',
      'technology': 'internet, peer-to-peer, distributed systems',
      'transportation': 'road networks, airline routes, shipping lanes'
    },
    mappingHints: ['nodes', 'edges', 'topology', 'connectivity', 'flow', 'hubs']
  },
  {
    name: 'cycle',
    description: 'Processes that return to starting point, creating loops and rhythms',
    examples: {
      'nature': 'water cycle, carbon cycle, seasons, circadian rhythms',
      'economics': 'business cycles, boom and bust, circular economy',
      'narrative': 'hero\'s journey, eternal return, cyclical history'
    },
    mappingHints: ['repetition', 'rhythm', 'periodicity', 'return', 'renewal']
  },
  {
    name: 'emergence',
    description: 'Complex wholes arising from simpler parts through interaction',
    examples: {
      'biology': 'consciousness from neurons, flocking from individual birds',
      'physics': 'temperature from molecular motion, phase transitions',
      'social': 'culture from individuals, market behavior from trades',
      'computing': 'intelligence from simple rules, Conway\'s Game of Life'
    },
    mappingHints: ['collective behavior', 'self-organization', 'higher-order properties', 'unexpected outcomes']
  },
  {
    name: 'feedback',
    description: 'Outputs returning as inputs, creating self-regulating loops',
    examples: {
      'biology': 'homeostasis, predator-prey dynamics, hormone regulation',
      'engineering': 'thermostats, cruise control, autopilots',
      'economics': 'price mechanisms, compound interest, network effects',
      'social': 'reputation systems, viral loops, echo chambers'
    },
    mappingHints: ['reinforcement', 'dampening', 'amplification', 'stability', 'runaway effects']
  },
  {
    name: 'symmetry-breaking',
    description: 'Transition from uniform to differentiated states',
    examples: {
      'physics': 'phase transitions, crystallization, magnetization',
      'biology': 'embryonic development, cell differentiation, pattern formation',
      'social': 'wealth inequality, city formation, specialization',
      'design': 'focal points, emphasis, contrast, asymmetric balance'
    },
    mappingHints: ['differentiation', 'specialization', 'contrast', 'focal points', 'divergence']
  },
  {
    name: 'tension-resolution',
    description: 'Build-up of potential followed by release and equilibrium',
    examples: {
      'music': 'dissonance to consonance, crescendo to resolution',
      'narrative': 'conflict to resolution, tension to climax',
      'physics': 'stress and strain, potential and kinetic energy',
      'architecture': 'compression and release, structural tension'
    },
    mappingHints: ['build-up', 'release', 'equilibrium', 'expectation', 'satisfaction']
  },
  {
    name: 'layering',
    description: 'Stacked levels of abstraction or organization',
    examples: {
      'computing': 'OSI model, software layers, abstraction levels',
      'architecture': 'structure, skin, services, space plan',
      'biology': 'organism, tissue, cellular, molecular',
      'design': 'content, structure, presentation layers'
    },
    mappingHints: ['abstraction', 'encapsulation', 'interface', 'separation of concerns']
  },
  {
    name: 'flow',
    description: 'Continuous movement through a system with varying dynamics',
    examples: {
      'fluid': 'laminar and turbulent flow, eddies, currents',
      'traffic': 'throughput, congestion, merging, bottlenecks',
      'information': 'data pipelines, information cascades',
      'economics': 'cash flow, supply chains, resource allocation'
    },
    mappingHints: ['throughput', 'bottleneck', 'velocity', 'obstruction', 'pathway']
  },
  {
    name: 'call-response',
    description: 'Alternating exchange creating dialogue and interaction',
    examples: {
      'music': 'antiphony, question-answer phrases, trading solos',
      'communication': 'conversation, debate, negotiation',
      'biology': 'predator-prey adaptation, co-evolution',
      'theater': 'dialogue, ensemble interaction'
    },
    mappingHints: ['dialogue', 'reciprocity', 'turn-taking', 'exchange', 'interaction']
  }
];

// Types for the bisociative synthesis tool
export interface BisociativeSynthesisInput {
  matrixA: string;
  matrixB?: string;
  blendType?: string;
}

export interface BisociativeSynthesisOutput {
  bridgeConcept: string;
  matrixA: string;
  matrixB: string;
  pattern: string;
  mapping: Record<string, string>;
  explanation: string;
}

/**
 * The Bisociative Synthesis tool (ENHANCED VERSION)
 * Combines concepts from different matrices of thought
 */
export class BisociativeSynthesisTool {
  private dreamGraph: DreamGraph;
  
  constructor(dreamGraph: DreamGraph) {
    this.dreamGraph = dreamGraph;
  }
  
  public performSynthesis(input: BisociativeSynthesisInput): BisociativeSynthesisOutput {
    const { matrixA, matrixB, blendType } = input;
    
    if (!matrixA || matrixA.trim() === '') {
      throw new Error('Matrix A (problem domain) is required');
    }
    
    // Select or validate matrixB
    const selectedMatrixB = matrixB || this.selectComplementaryDomain(matrixA);
    
    // Find the best isomorphism
    const isomorphism = this.findIsomorphism(matrixA, selectedMatrixB, blendType);
    
    // Create context-aware mapping
    const mapping = this.createContextAwareMapping(matrixA, selectedMatrixB, isomorphism);
    
    // Generate bridge concept
    const bridgeConcept = this.generateBridgeConcept(matrixA, selectedMatrixB, isomorphism, mapping);
    
    // Create rich explanation
    const explanation = this.createRichExplanation(matrixA, selectedMatrixB, isomorphism, mapping, bridgeConcept);
    
    // Update graph
    this.updateDreamGraph(matrixA, selectedMatrixB, isomorphism, bridgeConcept);
    
    return {
      bridgeConcept,
      matrixA,
      matrixB: selectedMatrixB,
      pattern: isomorphism.name,
      mapping,
      explanation
    };
  }
  
  /**
   * Selects a complementary domain that's different enough to be interesting
   */
  private selectComplementaryDomain(matrixA: string): string {
    const normalized = matrixA.toLowerCase();
    
    // Filter out domains too similar to matrixA
    const eligibleDomains = DOMAINS.filter(domain => {
      const domainName = domain.name.toLowerCase();
      // Exclude if domain name appears in query or vice versa
      if (normalized.includes(domainName) || domainName.includes(normalized)) {
        return false;
      }
      // Exclude if many concepts match
      const matchingConcepts = domain.concepts.filter(c => 
        normalized.includes(c.toLowerCase()) || c.toLowerCase().includes(normalized)
      );
      return matchingConcepts.length < 3;
    });
    
    if (eligibleDomains.length === 0) {
      // Fallback to any random domain
      return DOMAINS[Math.floor(Math.random() * DOMAINS.length)].name;
    }
    
    // Prefer domains with more structural richness
    const richDomains = eligibleDomains.filter(d => d.structures.length >= 8);
    const selectionPool = richDomains.length > 0 ? richDomains : eligibleDomains;
    
    return selectionPool[Math.floor(Math.random() * selectionPool.length)].name;
  }
  
  /**
   * Finds the best isomorphic pattern
   */
  private findIsomorphism(
    matrixA: string,
    matrixB: string,
    preferredPattern?: string
  ): typeof ISOMORPHIC_PATTERNS[0] {
    // If preferred pattern specified and valid, use it
    if (preferredPattern) {
      const pattern = ISOMORPHIC_PATTERNS.find(p => 
        p.name.toLowerCase() === preferredPattern.toLowerCase()
      );
      if (pattern) return pattern;
    }
    
    // Score patterns based on relevance to both domains
    const patternScores = ISOMORPHIC_PATTERNS.map(pattern => {
      let score = 0;
      const normalizedA = matrixA.toLowerCase();
      const normalizedB = matrixB.toLowerCase();
      
      // Check if pattern keywords appear in domain descriptions
      const patternKeywords = [
        ...pattern.mappingHints,
        ...pattern.description.toLowerCase().split(' ')
      ];
      
      patternKeywords.forEach(keyword => {
        if (normalizedA.includes(keyword)) score += 1;
        if (normalizedB.includes(keyword)) score += 1;
      });
      
      // Check if pattern examples mention domains
      Object.keys(pattern.examples).forEach(exampleDomain => {
        if (normalizedA.includes(exampleDomain) || exampleDomain.includes(normalizedA)) score += 3;
        if (normalizedB.includes(exampleDomain) || exampleDomain.includes(normalizedB)) score += 3;
      });
      
      // Add randomness to prevent same pattern always winning
      score += Math.random() * 2;
      
      return { pattern, score };
    });
    
    // Return highest scoring pattern
    patternScores.sort((a, b) => b.score - a.score);
    return patternScores[0].pattern;
  }
  
  /**
   * Creates context-aware mappings based on actual domain content
   */
  private createContextAwareMapping(
    domainA: string,
    domainB: string,
    pattern: typeof ISOMORPHIC_PATTERNS[0]
  ): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    // Find domain objects
    const domainBObj = DOMAINS.find(d => d.name.toLowerCase() === domainB.toLowerCase());
    
    if (!domainBObj) {
      // Generic fallback
      return {
        'element': 'component',
        'process': 'transformation',
        'structure': 'organization',
        'relationship': 'connection'
      };
    }
    
    // Create pattern-specific mappings using actual domain concepts
    const hints = pattern.mappingHints;
    const concepts = domainBObj.concepts;
    const structures = domainBObj.structures;
    
    // Map based on pattern type
    switch (pattern.name) {
      case 'hierarchy':
        mapping['system'] = concepts[0] || 'whole';
        mapping['subsystem'] = concepts[2] || 'part';
        mapping['levels'] = structures[0] || 'layers';
        mapping['emergence'] = 'higher-order properties';
        mapping['composition'] = structures[6] || 'modularity';
        break;
        
      case 'network':
        mapping['nodes'] = concepts[1] || 'entities';
        mapping['connections'] = 'relationships';
        mapping['topology'] = structures[0] || 'structure';
        mapping['flow'] = concepts[4] || 'exchange';
        mapping['hubs'] = 'central nodes';
        break;
        
      case 'cycle':
        mapping['phases'] = concepts[3] || 'stages';
        mapping['rhythm'] = structures[1] || 'periodicity';
        mapping['renewal'] = concepts[5] || 'regeneration';
        mapping['feedback'] = 'return loop';
        mapping['timing'] = 'temporal coordination';
        break;
        
      case 'emergence':
        mapping['components'] = concepts[2] || 'elements';
        mapping['interaction'] = 'collective behavior';
        mapping['whole'] = concepts[0] || 'system';
        mapping['properties'] = structures[3] || 'characteristics';
        mapping['spontaneous'] = 'self-organizing';
        break;
        
      case 'feedback':
        mapping['input'] = concepts[7] || 'stimulus';
        mapping['output'] = concepts[8] || 'response';
        mapping['adjustment'] = structures[1] || 'regulation';
        mapping['amplification'] = 'reinforcement';
        mapping['dampening'] = 'stabilization';
        break;
        
      case 'symmetry-breaking':
        mapping['uniformity'] = 'homogeneous state';
        mapping['differentiation'] = concepts[4] || 'specialization';
        mapping['catalyst'] = concepts[9] || 'trigger';
        mapping['pattern'] = structures[9] || 'organization';
        mapping['divergence'] = 'branching';
        break;
        
      case 'tension-resolution':
        mapping['build-up'] = concepts[4] || 'accumulation';
        mapping['peak'] = 'maximum tension';
        mapping['release'] = concepts[6] || 'resolution';
        mapping['equilibrium'] = structures[2] || 'balance';
        mapping['anticipation'] = 'expectation';
        break;
        
      case 'layering':
        mapping['layers'] = structures[3] || 'strata';
        mapping['interface'] = 'boundary';
        mapping['abstraction'] = concepts[5] || 'simplification';
        mapping['encapsulation'] = structures[6] || 'containment';
        mapping['depth'] = 'complexity levels';
        break;
        
      case 'flow':
        mapping['throughput'] = concepts[8] || 'rate';
        mapping['channel'] = structures[1] || 'pathway';
        mapping['bottleneck'] = 'constraint';
        mapping['velocity'] = concepts[7] || 'speed';
        mapping['turbulence'] = structures[8] || 'disruption';
        break;
        
      case 'call-response':
        mapping['initiation'] = concepts[0] || 'stimulus';
        mapping['answer'] = concepts[1] || 'response';
        mapping['dialogue'] = structures[0] || 'exchange';
        mapping['turn-taking'] = 'alternation';
        mapping['reciprocity'] = concepts[6] || 'mutual influence';
        break;
        
      default:
        // Generic mapping
        mapping['element'] = concepts[0] || 'component';
        mapping['process'] = concepts[4] || 'transformation';
        mapping['structure'] = structures[0] || 'organization';
        mapping['relationship'] = 'connection';
    }
    
    return mapping;
  }
  
  /**
   * Generates a compelling bridge concept
   */
  private generateBridgeConcept(
    domainA: string,
    domainB: string,
    pattern: typeof ISOMORPHIC_PATTERNS[0],
    mapping: Record<string, string>
  ): string {
    // More creative templates that actually blend the domains
    const templates = [
      `${capitalize(domainA)} as ${domainB}-style ${pattern.name}`,
      `The ${domainB} model of ${domainA}`,
      `${capitalize(domainA)}: A ${pattern.name} informed by ${domainB}`,
      `${capitalize(domainB)}-inspired ${pattern.name} in ${domainA}`,
      `Reimagining ${domainA} through ${domainB}'s ${pattern.name}`,
      `${capitalize(domainA)}'s hidden ${domainB}: Uncovering ${pattern.name}`,
      `From ${domainB} to ${domainA}: ${capitalize(pattern.name)} as bridge`,
      `${capitalize(domainA)} orchestrated with ${domainB} ${pattern.name}`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  /**
   * Creates a rich, actionable explanation
   */
  private createRichExplanation(
    domainA: string,
    domainB: string,
    pattern: typeof ISOMORPHIC_PATTERNS[0],
    mapping: Record<string, string>,
    bridgeConcept: string
  ): string {
    // Get actual examples from the pattern
    const exampleKeys = Object.keys(pattern.examples);
    const relevantExample = pattern.examples[exampleKeys[0]] || 'various manifestations';
    
    // Find the domain object for richer context
    const domainBObj = DOMAINS.find(d => d.name.toLowerCase() === domainB.toLowerCase());
    const domainBConcepts = domainBObj ? domainBObj.concepts.slice(0, 4).join(', ') : domainB;
    
    return `
╔═══════════════════════════════════════════════════════════╗
║     BISOCIATIVE SYNTHESIS: ${pattern.name.toUpperCase()}                   
╚═══════════════════════════════════════════════════════════╝

🔮 BRIDGE CONCEPT:
"${bridgeConcept}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 STRUCTURAL PATTERN: ${pattern.name}
${pattern.description}

Examples of this pattern:
• ${relevantExample}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 CONCEPTUAL MAPPING:
Translating from ${domainA} to ${domainB}:

${Object.entries(mapping).map(([key, value]) => 
  `   • ${key} ──→ ${value}`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 WHY THIS CONNECTION MATTERS:

The ${pattern.name} pattern provides a powerful lens for examining ${domainA}.
By mapping onto ${domainB} (which deals with ${domainBConcepts}), we can:

1. **Reveal Hidden Structure**: The ${pattern.name} in ${domainB} highlights 
   similar patterns that might be invisible in ${domainA}'s native context.

2. **Import Proven Principles**: ${domainB} has evolved sophisticated approaches 
   to handling ${pattern.name}—principles directly applicable to ${domainA}.

3. **Generate Novel Solutions**: The conceptual distance creates creative 
   tension, forcing fresh perspectives on familiar ${domainA} challenges.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ACTIONABLE INSIGHTS:

Ask yourself:
• If ${domainA} operated like ${domainB}, what would change?
• Which ${domainB} principles could directly transfer to ${domainA}?
• What ${domainB} failure modes should ${domainA} avoid?
• How might ${domainB} practitioners approach your ${domainA} challenge?

Try this exercise:
Take a specific ${domainA} problem you're facing. Reframe it completely 
in ${domainB} terms using the mapping above. What solutions emerge from 
this ${domainB} perspective? Which could translate back to ${domainA}?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌉 THE BRIDGE:
"${bridgeConcept}" is not just a metaphor—it's a functional framework 
for viewing ${domainA} through the structural wisdom of ${domainB}.

╔═══════════════════════════════════════════════════════════╗
`;
  }
  
  /**
   * Updates the dream graph
   */
  private updateDreamGraph(
    domainA: string,
    domainB: string,
    pattern: typeof ISOMORPHIC_PATTERNS[0],
    bridgeConcept: string
  ): void {
    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 10000);
    
    const domainAId = `bisoc-domainA-${timestamp}-${rand}`;
    const domainBId = `bisoc-domainB-${timestamp}-${rand}`;
    const bridgeId = `bisoc-bridge-${timestamp}-${rand}`;
    
    try {
      this.dreamGraph.addNode({
        id: domainAId,
        content: domainA,
        creationTimestamp: timestamp,
        source: 'bisociative_synthesis',
        metadata: { role: 'problem_domain', pattern: pattern.name }
      });
    } catch (error) {
      // Node may exist
    }
    
    try {
      this.dreamGraph.addNode({
        id: domainBId,
        content: domainB,
        creationTimestamp: timestamp,
        source: 'bisociative_synthesis',
        metadata: { role: 'stimulus_domain', pattern: pattern.name }
      });
    } catch (error) {
      // Node may exist
    }
    
    try {
      this.dreamGraph.addNode({
        id: bridgeId,
        content: bridgeConcept,
        creationTimestamp: timestamp,
        source: 'bisociative_synthesis',
        metadata: {
          role: 'bridge_concept',
          pattern: pattern.name,
          domains: [domainA, domainB]
        }
      });
    } catch (error) {
      console.error('Error adding bridge node:', error);
    }
    
    // Create edges
    try {
      this.dreamGraph.addEdge({
        source: domainAId,
        target: bridgeId,
        type: EdgeType.SYNTHESIZED_FROM,
        weight: 0.8,
        metadata: { pattern: pattern.name, role: 'problem_domain' }
      });
      
      this.dreamGraph.addEdge({
        source: domainBId,
        target: bridgeId,
        type: EdgeType.SYNTHESIZED_FROM,
        weight: 0.8,
        metadata: { pattern: pattern.name, role: 'stimulus_domain' }
      });
    } catch (error) {
      console.error('Error adding edges:', error);
    }
    
    try {
      this.dreamGraph.visitNode(bridgeId);
    } catch (error) {
      // Silent
    }
  }
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
