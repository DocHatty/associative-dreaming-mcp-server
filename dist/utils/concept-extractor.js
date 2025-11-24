/**
 * AUTHENTIC CONCEPT EXTRACTOR V1.0
 *
 * Real NLP concept extraction using:
 * - compromise: Real linguistic analysis (POS tagging, NER)
 * - natural: Statistical importance (TF-IDF)
 * - stopword: Noise removal
 */
import nlp from "compromise";
import natural from "natural";
// @ts-ignore - stopword package lacks TypeScript declarations
import { removeStopwords } from "stopword";
const { TfIdf, WordTokenizer } = natural;
// ============================================================================
// CONCEPT EXTRACTOR CLASS
// ============================================================================
export class ConceptExtractor {
    tfidf;
    tokenizer;
    constructor() {
        this.tfidf = new TfIdf();
        this.tokenizer = new WordTokenizer();
    }
    extractConcepts(text, options = {}) {
        const { maxConcepts = 10, minImportance = 0.3 } = options;
        const steps = [];
        const warnings = [];
        let fallbackUsed = false;
        if (!text || text.trim().length === 0) {
            warnings.push("Empty input text - cannot extract concepts");
            return this.emptyResult(steps, warnings);
        }
        steps.push("Received text input, length: " + text.length);
        // Step 1: Tokenization and stopword removal
        const tokens = this.tokenizer.tokenize(text.toLowerCase());
        const tokensWithoutStopwords = removeStopwords(tokens);
        const stopwordsRemoved = tokens.length - tokensWithoutStopwords.length;
        steps.push(`Tokenized into ${tokens.length} tokens`);
        steps.push(`Removed ${stopwordsRemoved} stopwords`);
        // Step 2: NLP analysis with compromise
        const doc = nlp(text);
        // ✅ FIX: Add type annotation to avoid implicit any
        const nounPhrases = doc.nouns().out("array");
        const filteredNounPhrases = nounPhrases
            .filter((np) => np.split(" ").length <= 4)
            .map((np) => np.toLowerCase().trim())
            .filter((np) => np.length > 2);
        steps.push(`Extracted ${filteredNounPhrases.length} noun phrases`);
        // Extract named entities
        const entities = this.extractNamedEntities(doc);
        steps.push(`Extracted ${entities.length} named entities`);
        // Step 3: Compute TF-IDF scores
        this.tfidf.addDocument(text);
        const tfidfScores = this.computeTfIdfScores(text);
        steps.push(`Computed TF-IDF scores for ${Object.keys(tfidfScores).length} terms`);
        // Step 4: Combine all extraction methods
        const conceptCandidates = new Map();
        // Add noun phrases
        for (const phrase of filteredNounPhrases) {
            if (conceptCandidates.has(phrase))
                continue;
            conceptCandidates.set(phrase, {
                text: phrase,
                extractionMethod: "noun-phrase",
                importance: this.calculateImportance(phrase, tfidfScores),
                confidence: 0.8,
                metadata: {
                    tfidfScore: tfidfScores[phrase] || 0,
                    partOfSpeech: "noun-phrase",
                },
            });
        }
        // Add named entities
        for (const entity of entities) {
            if (conceptCandidates.has(entity.text)) {
                const existing = conceptCandidates.get(entity.text);
                existing.importance = Math.min(1.0, existing.importance * 1.2);
                existing.metadata.entityType = entity.type;
            }
            else {
                conceptCandidates.set(entity.text, {
                    text: entity.text,
                    extractionMethod: "named-entity",
                    importance: this.calculateImportance(entity.text, tfidfScores),
                    confidence: 0.85,
                    metadata: {
                        tfidfScore: tfidfScores[entity.text] || 0,
                        entityType: entity.type,
                    },
                });
            }
        }
        // Step 5: Fallback to keyword extraction if needed
        if (conceptCandidates.size < 3) {
            fallbackUsed = true;
            warnings.push("Insufficient concepts from NLP analysis, using keyword fallback");
            const keywords = this.extractKeywords(text, tfidfScores, tokensWithoutStopwords);
            steps.push(`Fallback: extracted ${keywords.length} keywords`);
            for (const keyword of keywords) {
                if (!conceptCandidates.has(keyword)) {
                    conceptCandidates.set(keyword, {
                        text: keyword,
                        extractionMethod: "fallback",
                        importance: this.calculateImportance(keyword, tfidfScores),
                        confidence: 0.5,
                        metadata: {
                            tfidfScore: tfidfScores[keyword] || 0,
                        },
                    });
                }
            }
        }
        // Step 6: Filter and rank
        const conceptsBeforeFiltering = conceptCandidates.size;
        const concepts = Array.from(conceptCandidates.values())
            .filter((c) => c.importance >= minImportance)
            .sort((a, b) => b.importance - a.importance)
            .slice(0, maxConcepts);
        steps.push(`Filtered from ${conceptsBeforeFiltering} to ${concepts.length} concepts`);
        // Step 7: Calculate overall confidence
        const avgConfidence = concepts.length > 0
            ? concepts.reduce((sum, c) => sum + c.confidence, 0) / concepts.length
            : 0;
        return {
            concepts,
            extractionMethod: fallbackUsed
                ? "compromise-nlp + tfidf + keyword-fallback"
                : "compromise-nlp + tfidf",
            confidence: avgConfidence,
            fallbackUsed,
            statistics: {
                totalTokens: tokens.length,
                uniqueTokens: new Set(tokens).size,
                nounPhrases: filteredNounPhrases.length,
                namedEntities: entities.length,
                stopwordsRemoved,
                conceptsBeforeFiltering,
                conceptsAfterFiltering: concepts.length,
            },
            transparency: {
                steps,
                warnings,
            },
        };
    }
    extractNamedEntities(doc) {
        const entities = [];
        doc.people().out("array").forEach((person) => {
            entities.push({ text: person.toLowerCase(), type: "person" });
        });
        doc.places().out("array").forEach((place) => {
            entities.push({ text: place.toLowerCase(), type: "place" });
        });
        doc.organizations().out("array").forEach((org) => {
            entities.push({ text: org.toLowerCase(), type: "organization" });
        });
        doc.topics().out("array").forEach((topic) => {
            entities.push({ text: topic.toLowerCase(), type: "topic" });
        });
        return entities;
    }
    computeTfIdfScores(text) {
        const scores = {};
        this.tfidf.listTerms(0).forEach((item) => {
            scores[item.term] = item.tfidf;
        });
        return scores;
    }
    calculateImportance(text, tfidfScores) {
        const words = text.split(" ");
        const avgTfidf = words.reduce((sum, word) => {
            return sum + (tfidfScores[word.toLowerCase()] || 0);
        }, 0) / words.length;
        const normalized = Math.min(1.0, avgTfidf / 5);
        const phraseBoost = words.length > 1 ? 1.1 : 1.0;
        return Math.min(1.0, normalized * phraseBoost);
    }
    extractKeywords(text, tfidfScores, tokens) {
        const keywords = Array.from(new Set(tokens))
            .map((token) => ({
            word: token,
            score: tfidfScores[token] || 0,
        }))
            .filter((k) => k.word.length > 3)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((k) => k.word);
        return keywords;
    }
    emptyResult(steps, warnings) {
        return {
            concepts: [],
            extractionMethod: "none",
            confidence: 0,
            fallbackUsed: false,
            statistics: {
                totalTokens: 0,
                uniqueTokens: 0,
                nounPhrases: 0,
                namedEntities: 0,
                stopwordsRemoved: 0,
                conceptsBeforeFiltering: 0,
                conceptsAfterFiltering: 0,
            },
            transparency: {
                steps,
                warnings,
            },
        };
    }
}
// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================
export const conceptExtractor = new ConceptExtractor();
export function extractConcepts(text, maxConcepts = 10) {
    return conceptExtractor.extractConcepts(text, { maxConcepts });
}
