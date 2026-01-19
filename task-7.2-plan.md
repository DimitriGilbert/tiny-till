# Task 7.2 Implementation Plan: Edge Case Testing and Error Handling

## Overview
This plan outlines the comprehensive implementation of edge case testing, enhanced error handling, and recovery mechanisms for the tiny-till application.

## Current State Analysis

### Existing Infrastructure
- **Error Boundaries**: React error boundaries (`error-boundary.tsx`, `storage-error-boundary.tsx`, `validation-error-boundary.tsx`)
- **Error Management**: Error store with recovery actions, error logger with persistence
- **Storage Monitoring**: Storage quota detection via `useStorageStore`
- **Import Validation**: File validation with detailed error reporting
- **Testing Framework**: Playwright configured with 8 browser/device projects
- **Existing Tests**: Basic flow tests in `tests/examples/`

### Identified Gaps
1. No automated edge case tests for storage quota limits
2. Limited retry mechanisms for transient failures
3. Insufficient tests for corrupted file handling
4. No network failure simulation tests
5. Missing concurrent action stress tests
6. Recovery flows not comprehensively tested
7. Error messages could be more user-friendly

---

## Phase 1: Edge Case Test Suite Development

### 1.1 Storage Quota Testing
**Target File**: `apps/web/tests/edge-cases/storage-quota.spec.ts`

**Test Scenarios**:
- localStorage quota exceeded (5MB limit)
- IndexedDB quota exceeded (dynamic browser limits)
- Mixed storage exhaustion (both localStorage and IndexedDB)
- Storage cleanup with partial data loss
- Recovery after quota warning

**Implementation Details**:
- Mock storage quota limits using browser APIs
- Test warning threshold at 80% capacity
- Test critical threshold at 95% capacity
- Verify storage cleanup dialog functionality
- Test data migration when quota exceeded

**Files to Create**:
- `apps/web/tests/edge-cases/storage-quota.spec.ts`
- `apps/web/tests/fixtures/edge-case-fixtures.ts` - fixture data for edge cases

### 1.2 Corrupted File Import Testing
**Target File**: `apps/web/tests/edge-cases/corrupted-files.spec.ts`

**Test Scenarios**:
- Malformed JSON syntax (missing braces, quotes)
- Invalid UTF-8 encoding
- Truncated/cut-off files
- Version mismatch (older/newer catalog formats)
- Missing required fields
- Invalid data types (string instead of number for price)
- Circular references (if applicable)
- Extremely large numbers causing overflow
- Unicode handling in product names/prices

**Implementation Details**:
- Create fixture files for each corruption type
- Test validation error detection
- Test error message clarity
- Test preview modal behavior with corrupt files
- Test import rejection and user guidance

**Files to Create**:
- `apps/web/tests/fixtures/corrupted-catalogs/` - directory with test files
- `apps/web/tests/edge-cases/corrupted-files.spec.ts`

### 1.3 Network Failure Simulation
**Target File**: `apps/web/tests/edge-cases/network-failures.spec.ts`

**Test Scenarios**:
- Offline mode during import
- Network timeout during file upload
- Intermittent connection during large imports
- Service worker unavailability
- Background sync failure
- Slow network conditions (3G, 4G throttling)
- Multiple concurrent network requests
- Network restoration after failure

**Implementation Details**:
- Use Playwright's `context.setOffline()` API
- Simulate network conditions with `context.emulateNetwork()`
- Test offline banner visibility
- Test retry mechanisms
- Test data persistence across offline-online transitions
- Test service worker fallback behavior

**Files to Create**:
- `apps/web/tests/edge-cases/network-failures.spec.ts`

### 1.4 Concurrent User Actions
**Target File**: `apps/web/tests/edge-cases/concurrent-actions.spec.ts`

**Test Scenarios**:
- Rapid product creation/deletion
- Simultaneous imports on multiple tabs
- Concurrent tally updates
- Settings changes during active tally
- Theme switching during data operations
- Multiple browser tabs with same state
- Race conditions in storage operations

**Implementation Details**:
- Use multiple contexts/pages in tests
- Test storage conflict resolution
- Test optimistic update rollback
- Test state synchronization across tabs
- Test event ordering guarantees

**Files to Create**:
- `apps/web/tests/edge-cases/concurrent-actions.spec.ts`

### 1.5 Error Recovery Flows
**Target File**: `apps/web/tests/edge-cases/recovery-flows.spec.ts`

**Test Scenarios**:
- React error boundary recovery
- Storage recovery dialog functionality
- Import error retry mechanism
- Manual error acknowledgment
- Automatic retry for transient errors
- Recovery action execution
- Error log export and analysis
- Recovery success/failure tracking

**Implementation Details**:
- Test each recovery action in error store
- Verify recovery flow UI components
- Test recovery statistics tracking
- Test error resolution status updates
- Verify recovery action suggestions are actionable

**Files to Create**:
- `apps/web/tests/edge-cases/recovery-flows.spec.ts`

---

## Phase 2: Enhanced Error Handling Infrastructure

### 2.1 Retry Mechanism Implementation
**Target File**: `apps/web/src/lib/retry-handler.ts`

**Features**:
- Exponential backoff strategy
- Configurable retry attempts
- Retry condition predicates
- Jitter for distributed retries
- Maximum delay cap
- Retry cancellation support
- Retry statistics tracking

**API Design**:
```typescript
interface RetryOptions {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  jitter: boolean
  retryCondition: (error: Error) => boolean
  onRetry?: (attempt: number, error: Error) => void
}

function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T>
```

**Integration Points**:
- Storage operations (IndexedDB, localStorage)
- Network requests (if any)
- File import processing
- Service worker operations

### 2.2 Enhanced Error Boundaries
**Files to Modify**:
- `apps/web/src/components/error-boundary.tsx`
- `apps/web/src/components/storage-error-boundary.tsx`
- `apps/web/src/components/validation-error-boundary.tsx`

**Enhancements**:
- Add automatic retry for recoverable errors
- Implement progressive recovery (attempt multiple strategies)
- Add recovery progress indicators
- Enhanced error categorization
- Better user guidance messages
- Recovery action suggestions with buttons
- Error severity-based UI changes
- Recovery telemetry for analytics

**New Component**: `apps/web/src/components/recovery-progress.tsx`
- Visual indicator of recovery attempts
- Progress bar for multi-step recovery
- Estimated time remaining
- Cancel recovery option

### 2.3 User-Friendly Error Messages
**Target File**: `apps/web/src/lib/user-friendly-error-messages.ts`

**Features**:
- Technical to user-friendly translation
- Actionable guidance for each error type
- Context-aware messages (what was the user doing?)
- Multi-language support structure (future-proof)
- Error severity visualization
- Recovery suggestion mapping

**Message Categories**:
- Storage errors (quota, corruption, access)
- Import errors (validation, format, version)
- Network errors (offline, timeout, server)
- Validation errors (field-specific, business rules)
- Runtime errors (unexpected, fallback)

**Examples**:
```
Technical: "QuotaExceededError: localStorage quota exceeded"
User-Friendly: "Storage Full: Your browser storage is almost full. Please clear old data or remove some products to continue."

Technical: "SyntaxError: Unexpected token } in JSON at position 42"
User-Friendly: "Invalid File: The file contains a formatting error. Please ensure the file is a valid JSON file exported from this app."
```

### 2.4 Network State Management
**Target File**: `apps/web/src/stores/network-store.ts`

**Features**:
- Online/offline state tracking
- Network quality monitoring
- Connection type detection
- Background sync status
- Pending operations queue
- Automatic retry queue
- Network change event handling

**API Design**:
```typescript
interface NetworkState {
  isOnline: boolean
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g'
  downlink: number // Mbps
  rtt: number // Round-trip time
  saveData: boolean

  pendingOperations: QueueItem[]
  retryQueue: QueueItem[]
}
```

---

## Phase 3: Test Infrastructure Enhancement

### 3.1 Test Utilities
**Target File**: `apps/web/tests/utils/edge-case-helpers.ts`

**Utilities**:
- Storage quota mocking
- Network condition simulation
- Corrupted file generation
- Concurrent action orchestration
- Error injection helpers
- Recovery flow assertions
- Telemetry verification

### 3.2 Fixtures for Edge Cases
**Target Directory**: `apps/web/tests/fixtures/edge-cases/`

**Fixture Types**:
1. **Storage Fixtures** (`storage-fixtures.ts`)
   - Large catalog files for quota testing
   - Partial data states
   - Corrupted IndexedDB states

2. **Corrupted File Fixtures** (`corrupted-files/`)
   - `malformed-json.json`
   - `truncated-file.json`
   - `version-mismatch.json`
   - `missing-fields.json`
   - `invalid-types.json`
   - `unicode-issues.json`

3. **Network Fixtures** (`network-fixtures.ts`)
   - Mock offline scenarios
   - Slow network configs
   - Intermittent connection patterns

4. **Concurrent Action Fixtures** (`concurrent-fixtures.ts`)
   - Parallel operation sequences
   - Race condition scenarios
   - State conflict patterns

### 3.3 Test Data Factories
**Target File**: `apps/web/tests/factories/edge-case-factory.ts`

**Factory Functions**:
- `createCorruptedCatalog(corruptionType: CorruptionType): File`
- `createLargeCatalog(productCount: number, imageSize?: number): File`
- `createNetworkScenario(scenarioType: NetworkScenario): NetworkConfig`
- `createConcurrentOperations(operationTypes: OperationType[]): Operation[]`

### 3.4 Test Configuration Updates
**Target File**: `apps/web/playwright.config.ts`

**Updates**:
- Add edge case test projects
- Configure slow-motion for debugging
- Add video recording for all edge case tests
- Configure custom timeouts for slow operations
- Add network throttling presets
- Add storage mocking configuration

---

## Phase 4: Documentation and Findings

### 4.1 Edge Cases Documentation
**Target File**: `apps/web/docs/edge-cases.md`

**Content Structure**:
1. Introduction
2. Storage Edge Cases
   - Quota limits per browser
   - Detection thresholds
   - Recovery strategies
3. File Import Edge Cases
   - Corruption types
   - Validation patterns
   - User guidance
4. Network Edge Cases
   - Offline behavior
   - Timeout handling
   - Sync strategies
5. Concurrency Edge Cases
   - Race conditions
   - State conflicts
   - Synchronization
6. Known Issues
7. Future Improvements

### 4.2 Error Handling Guide
**Target File**: `apps/web/docs/error-handling-guide.md`

**Content**:
- Error handling architecture
- Error categorization
- Recovery strategy selection
- Best practices for new features
- Testing guidelines for error scenarios
- Troubleshooting common errors

### 4.3 Test Execution Report Template
**Target File**: `apps/web/tests/reports/edge-case-report-template.md`

**Template Sections**:
- Test Coverage Summary
- Browser Compatibility Matrix
- Issues Found by Category
- Severity Assessment
- Recommended Fixes
- Regression Test Requirements
- Performance Impact Analysis

---

## Phase 5: Implementation and Testing Execution

### 5.1 Implementation Order

**Week 1: Test Infrastructure**
1. Create test utilities and helpers
2. Build edge case fixtures
3. Update Playwright configuration
4. Set up test data factories

**Week 2: Storage and File Tests**
1. Implement storage quota tests
2. Create corrupted file tests
3. Run tests across all browsers
4. Document findings

**Week 3: Network and Concurrency**
1. Build network failure tests
2. Implement concurrent action tests
3. Test recovery flows
4. Document findings

**Week 4: Infrastructure Enhancements**
1. Implement retry mechanism
2. Enhance error boundaries
3. Create user-friendly messages
4. Add network state management

**Week 5: Integration and Fixes**
1. Integrate all enhancements
2. Fix identified issues
3. Regression testing
4. Final documentation

### 5.2 Test Execution Strategy

**Browser Matrix**:
- Desktop: Chrome, Firefox, Safari (Webkit)
- Mobile: Chrome on Android, Safari on iOS (via device emulation)
- Viewports: Mobile (320-428px), Tablet (768-1024px), Desktop (1920px)

**Test Categories**:
1. **Critical**: Blocking bugs, data loss scenarios
2. **High**: Major UX issues, frequent edge cases
3. **Medium**: Uncommon but recoverable scenarios
4. **Low**: Rare edge cases with workarounds

**Test Execution Commands**:
```bash
# All edge case tests
npm run test -- tests/edge-cases

# Specific category
npm run test -- tests/edge-cases/storage-quota.spec.ts

# All browsers
npm run test:all -- tests/edge-cases

# Mobile only
npm run test:mobile -- tests/edge-cases

# Desktop only
npm run test:desktop -- tests/edge-cases
```

### 5.3 Issue Categorization and Remediation

**Issue Categories**:

1. **Storage Issues**
   - Critical: Data loss during quota exceeded
   - High: Unclear quota warning messages
   - Medium: Inefficient storage usage
   - Low: Quota estimation inaccuracies

2. **Import Issues**
   - Critical: Data corruption from invalid files
   - High: Unclear validation errors
   - Medium: Large import performance
   - Low: Version compatibility warnings

3. **Network Issues**
   - Critical: No offline mode support
   - High: No retry for transient failures
   - Medium: Slow network UI feedback
   - Low: Network quality detection

4. **Concurrency Issues**
   - Critical: State corruption with concurrent tabs
   - High: Race conditions in storage
   - Medium: UI inconsistency during concurrent ops
   - Low: Performance degradation

**Remediation Priority**:
1. Fix all Critical issues (block release)
2. Address High issues (UX blockers)
3. Resolve Medium issues (improvements)
4. Document Low issues (future work)

---

## Phase 6: Regression Testing

### 6.1 Regression Test Suite
**Target File**: `apps/web/tests/regression/edge-case-regression.spec.ts`

**Test Coverage**:
- Re-test all fixed edge cases
- Verify no new issues introduced
- Test interactions between fixes
- Performance regression checks
- Browser-specific regression tests

### 6.2 Automated Regression Testing
**Integration with CI/CD**:
- Add edge case tests to CI pipeline
- Run on every PR
- Fail build on regression detection
- Generate regression reports

### 6.3 Monitoring and Alerting
**Metrics to Track**:
- Error rates by type
- Recovery success rates
- Storage usage trends
- Network failure rates
- Concurrent operation conflicts

---

## File Changes Summary

### New Files to Create

**Test Files**:
1. `apps/web/tests/edge-cases/storage-quota.spec.ts`
2. `apps/web/tests/edge-cases/corrupted-files.spec.ts`
3. `apps/web/tests/edge-cases/network-failures.spec.ts`
4. `apps/web/tests/edge-cases/concurrent-actions.spec.ts`
5. `apps/web/tests/edge-cases/recovery-flows.spec.ts`
6. `apps/web/tests/regression/edge-case-regression.spec.ts`

**Utilities**:
7. `apps/web/tests/utils/edge-case-helpers.ts`
8. `apps/web/tests/factories/edge-case-factory.ts`

**Fixtures**:
9. `apps/web/tests/fixtures/edge-case-fixtures.ts`
10. `apps/web/tests/fixtures/edge-cases/storage-fixtures.ts`
11. `apps/web/tests/fixtures/edge-cases/network-fixtures.ts`
12. `apps/web/tests/fixtures/edge-cases/concurrent-fixtures.ts`
13. `apps/web/tests/fixtures/edge-cases/corrupted-files/malformed-json.json`
14. `apps/web/tests/fixtures/edge-cases/corrupted-files/truncated-file.json`
15. `apps/web/tests/fixtures/edge-cases/corrupted-files/version-mismatch.json`
16. `apps/web/tests/fixtures/edge-cases/corrupted-files/missing-fields.json`
17. `apps/web/tests/fixtures/edge-cases/corrupted-files/invalid-types.json`
18. `apps/web/tests/fixtures/edge-cases/corrupted-files/unicode-issues.json`

**Library Files**:
19. `apps/web/src/lib/retry-handler.ts`
20. `apps/web/src/lib/user-friendly-error-messages.ts`
21. `apps/web/src/stores/network-store.ts`

**Components**:
22. `apps/web/src/components/recovery-progress.tsx`

**Documentation**:
23. `apps/web/docs/edge-cases.md`
24. `apps/web/docs/error-handling-guide.md`
25. `apps/web/tests/reports/edge-case-report-template.md`

### Files to Modify

1. `apps/web/playwright.config.ts` - Add edge case projects, network throttling
2. `apps/web/src/components/error-boundary.tsx` - Add retry, progressive recovery
3. `apps/web/src/components/storage-error-boundary.tsx` - Enhance recovery
4. `apps/web/src/components/validation-error-boundary.tsx` - Enhance recovery
5. `apps/web/src/stores/error-store.ts` - Add retry statistics
6. `apps/web/src/stores/storage-store.ts` - Enhance quota handling
7. `apps/web/src/hooks/useCatalogImport.ts` - Add retry on import failure
8. `apps/web/package.json` - Add test scripts for edge cases

---

## Success Criteria

### Functional Requirements
- [ ] All edge case tests pass across all configured browsers
- [ ] Error boundaries recover from all tested error scenarios
- [ ] Retry mechanisms successfully handle transient failures
- [ ] User-friendly error messages displayed for all error types
- [ ] Storage quota warnings and recovery work correctly
- [ ] Corrupted files are properly rejected with clear guidance
- [ ] Network failures are handled gracefully with offline support
- [ ] Concurrent actions don't cause data corruption
- [ ] Recovery flows complete successfully for recoverable errors
- [ ] No regression in existing functionality

### Non-Functional Requirements
- [ ] Test execution time < 15 minutes for full edge case suite
- [ ] Error recovery completes within 5 seconds for most scenarios
- [ ] Memory usage doesn't increase significantly during tests
- [ ] All documentation is complete and accurate
- [ ] Code follows existing project conventions
- [ ] TypeScript compilation succeeds without errors
- [ ] Build succeeds without warnings
- [ ] Lint passes without errors

### Quality Requirements
- [ ] 90%+ test coverage for edge case code paths
- [ ] All critical issues fixed
- [ ] All high-priority issues fixed
- [ ] Medium-priority issues documented
- [ ] Regression tests in place for all fixes

---

## Risk Assessment

### High Risk Areas
1. **Storage Quota Manipulation**: Browser APIs for quota estimation vary significantly
2. **Network Simulation**: Playwright network emulation may not perfectly match real-world conditions
3. **Concurrency Testing**: Timing-dependent tests may be flaky
4. **Data Loss Scenarios**: Testing actual data loss requires careful state management

### Mitigation Strategies
1. Use feature detection for storage APIs, implement graceful degradation
2. Supplement automated tests with manual network testing
3. Use proper synchronization and retries in concurrency tests
4. Never test data loss on production-like data, use test fixtures only

### Known Limitations
1. Some browser-specific edge cases may require physical device testing
2. Service worker behavior in automated tests differs from production
3. IndexedDB quota limits vary by browser and cannot be precisely controlled

---

## Timeline Estimate

- **Phase 1**: 5 days (Test Suite Development)
- **Phase 2**: 4 days (Infrastructure Enhancement)
- **Phase 3**: 3 days (Test Infrastructure)
- **Phase 4**: 2 days (Documentation)
- **Phase 5**: 5 days (Implementation and Testing)
- **Phase 6**: 3 days (Regression Testing)

**Total Estimated Effort**: 22 days

---

## Next Steps

1. Review and approve this implementation plan
2. Set up test infrastructure (fixtures, utilities)
3. Begin Phase 1: Test Suite Development
4. Execute tests across all browsers
5. Document findings as they are discovered
6. Implement fixes based on priority
7. Perform regression testing
8. Update documentation with final findings
