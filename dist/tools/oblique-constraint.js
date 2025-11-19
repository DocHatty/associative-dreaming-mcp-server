/**
 * Oblique Constraint - The Entropy Injector
 *
 * This tool implements Brian Eno's Oblique Strategies and SCAMPER techniques.
 * It acts as a "Circuit Breaker" for linear rigidity by introducing
 * deliberate constraints that force creative thinking and pattern breaking.
 */
import { EdgeType } from '../graph.js';
import fs from 'fs';
import path from 'path';
/**
 * The Oblique Constraint tool
 * Injects creative constraints to break linear thinking
 */
export class ObliqueConstraintTool {
    dreamGraph;
    strategies = [];
    scamperStrategies = [];
    creativeConstraints = [];
    constructor(dreamGraph) {
        this.dreamGraph = dreamGraph;
        this.loadConstraints();
    }
    /**
     * Loads the oblique strategies and other constraints from the JSON file
     */
    loadConstraints() {
        try {
            // Path is relative to the module location, not the working directory
            const moduleDir = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-zA-Z]:)/, '$1');
            const dataPath = path.join(moduleDir, '..', 'data', 'oblique-strategies.json');
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
        }
        catch (error) {
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
    generateConstraint(input) {
        const { currentBlock, constraintType = 'random' } = input;
        // Select the appropriate constraint based on type or randomize
        let selectedConstraint = "";
        let selectedType = constraintType;
        if (constraintType === 'random') {
            // Random selection from all constraint types
            const randomType = Math.floor(Math.random() * 3);
            switch (randomType) {
                case 0:
                    selectedType = 'oblique';
                    selectedConstraint = this.getRandomElement(this.strategies);
                    break;
                case 1:
                    selectedType = 'scamper';
                    selectedConstraint = this.getRandomElement(this.scamperStrategies);
                    break;
                case 2:
                    selectedType = 'creative';
                    selectedConstraint = this.getRandomElement(this.creativeConstraints);
                    break;
            }
        }
        else {
            // Specific constraint type
            switch (constraintType) {
                case 'oblique':
                    selectedConstraint = this.getRandomElement(this.strategies);
                    break;
                case 'scamper':
                    selectedConstraint = this.getRandomElement(this.scamperStrategies);
                    break;
                case 'creative':
                    selectedConstraint = this.getRandomElement(this.creativeConstraints);
                    break;
            }
        }
        // Generate application hints based on the constraint and the current block
        const applicationHints = this.generateApplicationHints(selectedConstraint, currentBlock);
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
     * Generates practical application hints for the constraint
     */
    generateApplicationHints(constraint, currentBlock) {
        const hints = [];
        // Extract key terms from the current block
        const blockWords = new Set(currentBlock.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3));
        // Generate constraint-specific hints
        if (constraint.toLowerCase().includes('substitute')) {
            hints.push('Replace a core assumption with its opposite');
            hints.push('Swap out the primary approach with a completely different one');
        }
        else if (constraint.toLowerCase().includes('combine')) {
            hints.push('Merge two seemingly unrelated elements from your problem');
            hints.push('Integrate opposing viewpoints into a unified approach');
        }
        else if (constraint.toLowerCase().includes('remove') || constraint.toLowerCase().includes('eliminate')) {
            hints.push('Remove what you consider the most essential element');
            hints.push('Simplify by eliminating the most complex part');
        }
        else if (constraint.toLowerCase().includes('reverse') || constraint.toLowerCase().includes('opposite')) {
            hints.push('Reverse the order of steps or priorities');
            hints.push('Consider the inverse of your current assumption');
        }
        else {
            // Generic hints
            hints.push('Apply this constraint literally to your current approach');
            hints.push('Use this as a metaphor rather than a direct instruction');
            hints.push('Consider how this constraint reveals hidden assumptions');
        }
        // Add a block-specific hint if possible
        if (blockWords.size > 0) {
            // Pick a random word from the block
            const blockWordsArray = Array.from(blockWords);
            const randomWord = blockWordsArray[Math.floor(Math.random() * blockWordsArray.length)];
            hints.push(`Apply this constraint specifically to the "${randomWord}" aspect of your problem`);
        }
        return hints;
    }
    /**
     * Generates an explanation of the oblique constraint
     */
    generateExplanation(constraint, constraintType, currentBlock) {
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
    updateDreamGraph(currentBlock, constraint, constraintType) {
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
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Error adding edge to graph:', error);
        }
        // Visit the constraint node in the dream graph
        this.dreamGraph.visitNode(constraintId);
    }
    /**
     * Gets a random element from an array
     */
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}
