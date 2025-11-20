/**
 * Oblique Constraint - The Entropy Injector V2.0
 *
 * This tool implements Brian Eno's Oblique Strategies and SCAMPER techniques.
 * It acts as a "Circuit Breaker" for linear rigidity by introducing
 * deliberate constraints that force creative thinking and pattern breaking.
 *
 * V2.0: Added context-aware constraint selection that analyzes the block
 * description to pick relevant constraints and generate specific application hints.
 */

import { DreamGraph, Node, EdgeType } from '../graph.js';
import fs from 'fs';
import path from 'path';

// Types for block analysis
interface BlockAnalysis {
  keywords: string[];
  problemType: 'technical' | 'creative' | 'strategic' | 'interpersonal';
  sentiment: 'stuck' | 'exploring' | 'deciding' | 'executing';
}

// Types for the oblique constraint tool
export interface ObliqueConstraintInput {
  currentBlock: string; // Description of the impasse/block
  constraintType?: 'oblique' | 'scamper' | 'creative' | 'random'; // Optional: specific type of constraint
}

export interface ObliqueConstraintOutput {
  constraint: string;
  constraintType: string;
  applicationHints: string[];
  explanation: string;
}

/**
 * The Oblique Constraint tool
 * Injects creative constraints to break linear thinking
 */
export class ObliqueConstraintTool {
  private dreamGraph: DreamGraph;
  private strategies: string[] = [];
  private scamperStrategies: string[] = [];
  private creativeConstraints: string[] = [];
  
  constructor(dreamGraph: DreamGraph) {
    this.dreamGraph = dreamGraph;
    this.loadConstraints();
  }
  
  /**
   * Loads the oblique strategies and other constraints from the JSON file
   */
  private loadConstraints(): void {
    try {
      // Path is relative to where the process is run
      const dataPath = path.join(process.cwd(), 'src', 'data', 'oblique-strategies.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      this.strategies = data.strategies || [];
      this.scamperStrategies = data.scamperStrategies || [];
      this.creativeConstraints = data.creativeConstraints || [];
      
      // Fallback in case file loading fails
      if (this.strategies.length === 0) {
        this.strategies = [
          "Honor thy error as a hidden intention",
          "Remove specifics and convert to ambiguities",
          "What would your closest friend do?",
          "Use an old idea"
        ];
      }
    } catch (error) {
      console.error('Error loading constraints:', error);
      // Fallback constraints
      this.strategies = [
        "Honor thy error as a hidden intention",
        "Remove specifics and convert to ambiguities",
        "What would your closest friend do?",
        "Use an old idea"
      ];
      this.scamperStrategies = [
        "Substitute: What can you substitute?",
        "Combine: What can you combine or bring together somehow?",
        "Adapt: What can you adapt for use as a solution?"
      ];
      this.creativeConstraints = [
        "Work with only 3 elements",
        "Express the solution without using industry terms",
        "What if the opposite were true?"
      ];
    }
  }
  
  public generateConstraint(input: ObliqueConstraintInput): ObliqueConstraintOutput {
    const { currentBlock, constraintType = 'random' } = input;
    
    // Analyze the block to understand context
    const blockAnalysis = this.analyzeBlock(currentBlock);
    
    // Select constraint based on context analysis
    let selectedConstraint = "";
    let selectedType = constraintType;
    
    if (constraintType === 'random') {
      // Context-aware selection
      const result = this.selectContextAwareConstraint(blockAnalysis);
      selectedConstraint = result.constraint;
      selectedType = result.type;
    } else {
      // Specific constraint type (still context-aware within that type)
      switch (constraintType) {
        case 'oblique':
          selectedConstraint = this.selectBestConstraint(this.strategies, blockAnalysis);
          selectedType = 'oblique';
          break;
        case 'scamper':
          selectedConstraint = this.selectBestConstraint(this.scamperStrategies, blockAnalysis);
          selectedType = 'scamper';
          break;
        case 'creative':
          selectedConstraint = this.selectBestConstraint(this.creativeConstraints, blockAnalysis);
          selectedType = 'creative';
          break;
      }
    }
    
    // Generate context-specific application hints
    const applicationHints = this.generateSpecificApplicationHints(
      selectedConstraint,
      currentBlock,
      blockAnalysis
    );
    
    // Generate explanation
    const explanation = this.generateExplanation(selectedConstraint, selectedType, currentBlock);
    
    // Update the dream graph
    this.updateDreamGraph(currentBlock, selectedConstraint, selectedType);
    
    return {
      constraint: selectedConstraint,
      constraintType: selectedType,
      applicationHints,
      explanation
    };
  }
  
  /**
   * Analyzes the block description to extract keywords, problem type, and sentiment
   */
  private analyzeBlock(block: string): BlockAnalysis {
    const lowerBlock = block.toLowerCase();
    
    // Extract keywords (words longer than 3 characters, excluding common words)
    const commonWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'were', 'their', 'there', 'what', 'when', 'where', 'which', 'while', 'should', 'could', 'would']);
    const keywords = block
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    // Detect problem type
    const technicalTerms = ['code', 'bug', 'system', 'implement', 'architecture', 'api', 'database', 'performance', 'technical', 'algorithm', 'function', 'class', 'method'];
    const creativeTerms = ['design', 'creative', 'idea', 'concept', 'visual', 'aesthetic', 'artistic', 'innovative', 'original', 'brainstorm'];
    const strategicTerms = ['strategy', 'plan', 'direction', 'goal', 'objective', 'approach', 'decision', 'priority', 'business', 'growth'];
    const interpersonalTerms = ['team', 'communication', 'conflict', 'people', 'relationship', 'collaborate', 'stakeholder', 'user', 'client', 'feedback'];
    
    const technicalScore = technicalTerms.filter(term => lowerBlock.includes(term)).length;
    const creativeScore = creativeTerms.filter(term => lowerBlock.includes(term)).length;
    const strategicScore = strategicTerms.filter(term => lowerBlock.includes(term)).length;
    const interpersonalScore = interpersonalTerms.filter(term => lowerBlock.includes(term)).length;
    
    let problemType: BlockAnalysis['problemType'] = 'creative';
    const maxScore = Math.max(technicalScore, creativeScore, strategicScore, interpersonalScore);
    
    if (maxScore === technicalScore && technicalScore > 0) problemType = 'technical';
    else if (maxScore === strategicScore && strategicScore > 0) problemType = 'strategic';
    else if (maxScore === interpersonalScore && interpersonalScore > 0) problemType = 'interpersonal';
    
    // Detect sentiment
    const stuckTerms = ['stuck', 'blocked', 'can\'t', 'unable', 'struggling', 'problem', 'issue', 'challenge', 'difficulty'];
    const exploringTerms = ['exploring', 'considering', 'thinking', 'wondering', 'curious', 'investigate', 'research', 'understand'];
    const decidingTerms = ['choose', 'decide', 'select', 'which', 'option', 'alternative', 'versus', 'compare'];
    const executingTerms = ['implement', 'build', 'create', 'develop', 'execute', 'doing', 'working', 'making'];
    
    const stuckScore = stuckTerms.filter(term => lowerBlock.includes(term)).length;
    const exploringScore = exploringTerms.filter(term => lowerBlock.includes(term)).length;
    const decidingScore = decidingTerms.filter(term => lowerBlock.includes(term)).length;
    const executingScore = executingTerms.filter(term => lowerBlock.includes(term)).length;
    
    let sentiment: BlockAnalysis['sentiment'] = 'stuck';
    const maxSentiment = Math.max(stuckScore, exploringScore, decidingScore, executingScore);
    
    if (maxSentiment === exploringScore && exploringScore > 0) sentiment = 'exploring';
    else if (maxSentiment === decidingScore && decidingScore > 0) sentiment = 'deciding';
    else if (maxSentiment === executingScore && executingScore > 0) sentiment = 'executing';
    
    return {
      keywords,
      problemType,
      sentiment
    };
  }
  
  /**
   * Selects a context-aware constraint based on block analysis
   */
  private selectContextAwareConstraint(analysis: BlockAnalysis): { constraint: string; type: 'oblique' | 'scamper' | 'creative' } {
    // Build a combined pool of all constraints with their types
    const allConstraints: Array<{ constraint: string; type: 'oblique' | 'scamper' | 'creative' }> = [
      ...this.strategies.map(c => ({ constraint: c, type: 'oblique' as const })),
      ...this.scamperStrategies.map(c => ({ constraint: c, type: 'scamper' as const })),
      ...this.creativeConstraints.map(c => ({ constraint: c, type: 'creative' as const }))
    ];
    
    // Score each constraint
    const scoredConstraints = allConstraints.map(item => ({
      ...item,
      score: this.scoreConstraintRelevance(item.constraint, analysis)
    }));
    
    // Sort by score (descending)
    scoredConstraints.sort((a, b) => b.score - a.score);
    
    // Pick from top 5 to maintain some randomness while favoring relevant constraints
    const topCandidates = scoredConstraints.slice(0, 5);
    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    
    return {
      constraint: selected.constraint,
      type: selected.type
    };
  }
  
  /**
   * Selects the best constraint from a specific list based on analysis
   */
  private selectBestConstraint(constraints: string[], analysis: BlockAnalysis): string {
    const scoredConstraints = constraints.map(constraint => ({
      constraint,
      score: this.scoreConstraintRelevance(constraint, analysis)
    }));
    
    scoredConstraints.sort((a, b) => b.score - a.score);
    
    // Pick from top 3 to maintain some randomness
    const topCandidates = scoredConstraints.slice(0, Math.min(3, constraints.length));
    return topCandidates[Math.floor(Math.random() * topCandidates.length)].constraint;
  }
  
  /**
   * Scores how relevant a constraint is to the block analysis
   */
  private scoreConstraintRelevance(constraint: string, analysis: BlockAnalysis): number {
    let score = 0;
    const lowerConstraint = constraint.toLowerCase();
    
    // Score based on problem type
    switch (analysis.problemType) {
      case 'technical':
        if (lowerConstraint.includes('system') || lowerConstraint.includes('structure') || 
            lowerConstraint.includes('simplif') || lowerConstraint.includes('eliminate')) {
          score += 3;
        }
        break;
      case 'creative':
        if (lowerConstraint.includes('imagine') || lowerConstraint.includes('dream') || 
            lowerConstraint.includes('metaphor') || lowerConstraint.includes('ambigui')) {
          score += 3;
        }
        break;
      case 'strategic':
        if (lowerConstraint.includes('reverse') || lowerConstraint.includes('opposite') || 
            lowerConstraint.includes('perspective') || lowerConstraint.includes('adapt')) {
          score += 3;
        }
        break;
      case 'interpersonal':
        if (lowerConstraint.includes('friend') || lowerConstraint.includes('other') || 
            lowerConstraint.includes('collaborate') || lowerConstraint.includes('combine')) {
          score += 3;
        }
        break;
    }
    
    // Score based on sentiment
    switch (analysis.sentiment) {
      case 'stuck':
        if (lowerConstraint.includes('error') || lowerConstraint.includes('destroy') || 
            lowerConstraint.includes('remove') || lowerConstraint.includes('opposite')) {
          score += 2;
        }
        break;
      case 'exploring':
        if (lowerConstraint.includes('what if') || lowerConstraint.includes('adapt') || 
            lowerConstraint.includes('modify') || lowerConstraint.includes('use')) {
          score += 2;
        }
        break;
      case 'deciding':
        if (lowerConstraint.includes('choose') || lowerConstraint.includes('either') || 
            lowerConstraint.includes('combine') || lowerConstraint.includes('substitute')) {
          score += 2;
        }
        break;
      case 'executing':
        if (lowerConstraint.includes('simple') || lowerConstraint.includes('focus') || 
            lowerConstraint.includes('essential') || lowerConstraint.includes('limit')) {
          score += 2;
        }
        break;
    }
    
    // Boost score if keywords match
    const keywordMatches = analysis.keywords.filter(keyword => 
      lowerConstraint.includes(keyword)
    ).length;
    score += keywordMatches;
    
    return score;
  }
  
  /**
   * Generates specific application hints tailored to the actual problem
   */
  private generateSpecificApplicationHints(
    constraint: string,
    currentBlock: string,
    analysis: BlockAnalysis
  ): string[] {
    const hints: string[] = [];
    const lowerConstraint = constraint.toLowerCase();
    
    // Generate hints based on constraint type and block analysis
    if (lowerConstraint.includes('substitute') || lowerConstraint.includes('replace')) {
      hints.push(`In your ${analysis.problemType} problem, try replacing your core approach with something completely different`);
      if (analysis.keywords.length > 0) {
        const keyword = analysis.keywords[0];
        hints.push(`What if you substituted "${keyword}" with its opposite or inverse?`);
      }
    } else if (lowerConstraint.includes('combine') || lowerConstraint.includes('merge')) {
      hints.push(`Look for two contradictory elements in your ${analysis.problemType} challenge and merge them`);
      if (analysis.keywords.length >= 2) {
        hints.push(`Try combining "${analysis.keywords[0]}" and "${analysis.keywords[1]}" in an unexpected way`);
      }
    } else if (lowerConstraint.includes('remove') || lowerConstraint.includes('eliminate')) {
      hints.push(`What would happen if you removed the element you consider most essential?`);
      if (analysis.keywords.length > 0) {
        hints.push(`Try solving this without using "${analysis.keywords[0]}" at all`);
      }
    } else if (lowerConstraint.includes('reverse') || lowerConstraint.includes('opposite')) {
      hints.push(`Reverse the order or priority of your ${analysis.problemType} approach`);
      hints.push('What if the opposite of your current assumption were true?');
    } else if (lowerConstraint.includes('adapt') || lowerConstraint.includes('modify')) {
      hints.push(`How might you adapt a solution from a completely different domain?`);
      if (analysis.problemType === 'technical') {
        hints.push('Could you borrow an approach from nature, art, or social systems?');
      }
    } else if (lowerConstraint.includes('simplif') || lowerConstraint.includes('limit')) {
      hints.push(`Reduce your solution to its absolute minimum`);
      hints.push(`Work with only the 3 most essential elements`);
    } else {
      // Generic context-aware hints
      hints.push(`Apply this constraint to your ${analysis.problemType} problem literally`);
      hints.push(`Use this as a metaphor for your current ${analysis.sentiment} state`);
    }
    
    // Add sentiment-specific hint
    switch (analysis.sentiment) {
      case 'stuck':
        hints.push('This constraint is designed to break you out of your current impasse');
        break;
      case 'exploring':
        hints.push('Use this to expand your exploration in an unexpected direction');
        break;
      case 'deciding':
        hints.push('Apply this constraint to reveal which option has more creative potential');
        break;
      case 'executing':
        hints.push('Let this constraint refine your execution approach');
        break;
    }
    
    // Add problem-type specific hint
    if (analysis.problemType === 'technical') {
      hints.push('Consider how this constraint might expose architectural assumptions');
    } else if (analysis.problemType === 'creative') {
      hints.push('Let this constraint guide you toward more innovative expressions');
    } else if (analysis.problemType === 'strategic') {
      hints.push('Use this to challenge your strategic assumptions');
    } else if (analysis.problemType === 'interpersonal') {
      hints.push('Apply this to improve communication and collaboration dynamics');
    }
    
    return hints;
  }
  
  
  /**
   * Generates an explanation of the oblique constraint
   */
  private generateExplanation(constraint: string, constraintType: string, currentBlock: string): string {
    let explanation = '';
    
    switch (constraintType) {
      case 'oblique':
        explanation = `
OBLIQUE STRATEGY: "${constraint}"

This oblique strategy comes from Brian Eno and Peter Schmidt's card-based approach to breaking creative blocks. It's deliberately ambiguous and open to interpretation, designed to disrupt linear thinking.

The purpose of this constraint is to:
1. Introduce randomness to break you out of repetitive thought patterns
2. Force you to reconsider your assumptions about the problem
3. Create a productive tension between constraint and freedom

Your block: "${currentBlock}"

This constraint suggests that you might be stuck in a particular mode of thinking. By applying an unexpected rule or perspective, you may discover approaches that were previously invisible to you. Oblique strategies are especially effective when you feel you've exhausted all logical possibilities.
`;
        break;
      
      case 'scamper':
        explanation = `
SCAMPER TECHNIQUE: "${constraint}"

SCAMPER is an acronym for Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, and Reverse. This technique is a structured way to generate new ideas through directed transformations.

The purpose of this constraint is to:
1. Provide a specific transformation lens to view your problem through
2. Encourage systematic exploration of variations
3. Transform existing ideas rather than starting from scratch

Your block: "${currentBlock}"

This technique suggests making deliberate modifications to your current approach. By systematically altering elements of your existing solution, you can discover innovative variations without the pressure of generating entirely new ideas from nothing.
`;
        break;
      
      case 'creative':
        explanation = `
CREATIVE CONSTRAINT: "${constraint}"

Creative constraints deliberately limit options to force innovative thinking. When we have unlimited possibilities, we often default to familiar patterns. Constraints paradoxically enhance creativity by necessitating novel solutions.

The purpose of this constraint is to:
1. Focus attention on specific aspects of the problem
2. Prevent defaulting to conventional approaches
3. Force integration of seemingly incompatible elements

Your block: "${currentBlock}"

This constraint provides a specific limitation to work within. Like a poet working with a strict meter or rhyme scheme, the limitations can lead to surprising creative discoveries that might never emerge in an unconstrained environment.
`;
        break;
    }
    
    return explanation;
  }
  
  /**
   * Updates the dream graph with the oblique constraint
   */
  private updateDreamGraph(currentBlock: string, constraint: string, constraintType: string): void {
    // Create IDs for the nodes
    const blockId = `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const constraintId = `constraint-${Date.now()}-${Math.floor(Math.random() * 1000)}-${constraintType}`;
    
    // Add block node
    try {
      this.dreamGraph.addNode({
        id: blockId,
        content: currentBlock,
        creationTimestamp: Date.now(),
        source: 'oblique_constraint',
        metadata: { isBlock: true }
      });
    } catch (error) {
      console.error('Error adding block node to graph:', error);
    }
    
    // Add constraint node
    try {
      this.dreamGraph.addNode({
        id: constraintId,
        content: constraint,
        creationTimestamp: Date.now(),
        source: 'oblique_constraint',
        metadata: { isConstraint: true, constraintType }
      });
    } catch (error) {
      console.error('Error adding constraint node to graph:', error);
    }
    
    // Add edge
    try {
      this.dreamGraph.addEdge({
        source: blockId,
        target: constraintId,
        type: EdgeType.TRANSFORMS_INTO,
        weight: 0.9,
        metadata: { relationship: 'constraints' }
      });
    } catch (error) {
      console.error('Error adding edge to graph:', error);
    }
    
    // Visit the constraint node in the dream graph
    this.dreamGraph.visitNode(constraintId);
  }
  
  /**
   * Gets a random element from an array
   */
  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
