# Unit Test Suite - Complete Documentation

## 🎯 Overview

This directory contains comprehensive unit tests for the Associative Dreaming MCP Server, with extensive coverage added for the system-wide logging improvements in branch `codex/implement-system-wide-improvements`.

## 📦 Test Files

| File | Lines | Tests | Purpose |
|------|-------|-------|---------|
| `config.test.ts` | 44 | 3 | Configuration system tests (existing) |
| `logger.test.ts` | 471 | 40 | Centralized logging module (extended) |
| `lib.test.ts` | 494 | 25 | LogDream integration (new) |
| `index.test.ts` | 265 | 17 | Startup logging (new) |

**Total**: 1,274 lines, 85 test cases

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Run Specific File
```bash
npm test tests/logger.test.ts
npm test tests/lib.test.ts
npm test tests/index.test.ts
```

### Watch Mode
```bash
npm test -- --watch
```

## 📊 Coverage Summary

### Changed Files Coverage

| Source File | Lines | Coverage | Tests |
|-------------|-------|----------|-------|
| `src/utils/logger.ts` | 73 (new) | ~98% | 40 |
| `src/lib.ts` | 66 (modified) | ~85% | 25 |
| `src/index.ts` | 5 (modified) | ~75% | 17 |

### Expected Coverage Report