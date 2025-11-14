# Phase 4 - Multi-Route Expansion: Comprehensive Test Cases

## Overview

Phase 4 focuses on implementing a **pluggable Exchange Connector** (e.g., BSE Star) that implements the pre-defined adapter interface from the Routing Hub. This enables multi-route order routing without changing core flows.

**Scope:**
- Exchange Connector implementation (adapter interface compliance)
- Route selection logic (rule-driven: scheme/transaction type/availability)
- Integration with Routing Hub
- Save2 and finalorderforsubmission flows
- IP/date/time stamping
- Error handling and fallback mechanisms
- Performance and observability

---

## Test Categories

### 1. Unit Tests - Exchange Connector Implementation

#### TC-P4-001: Exchange Connector Interface Compliance
**Objective:** Verify Exchange Connector implements all required interface methods

**Test Steps:**
1. Create Exchange Connector class implementing IConnector interface
2. Verify all required methods are implemented:
   - `submitOrder(order: Order): Promise<ConnectorResponse>`
   - `validateOrder(order: Order): Promise<ValidationResult>`
   - `getStatus(orderId: string): Promise<OrderStatus>`
   - `cancelOrder(orderId: string, reason: string): Promise<CancelResponse>`
   - `getConnectorType(): ConnectorType`
   - `isAvailable(): Promise<boolean>`

**Expected Result:**
- All interface methods are implemented
- TypeScript compilation succeeds
- No abstract method errors

**Priority:** Critical

---

#### TC-P4-002: Connector Type Identification
**Objective:** Verify connector correctly identifies itself as EXCHANGE type

**Test Steps:**
1. Instantiate Exchange Connector
2. Call `getConnectorType()`
3. Verify return value is `ConnectorType.EXCHANGE`

**Expected Result:**
- Returns `ConnectorType.EXCHANGE`
- Type matches expected enum value

**Priority:** Critical

---

#### TC-P4-003: Order Submission - Success Path
**Objective:** Verify successful order submission to exchange platform

**Test Steps:**
1. Create valid order with exchange-compatible scheme
2. Mock exchange API to return success response
3. Call `submitOrder(order)`
4. Verify response contains:
   - `success: true`
   - `exchangeRefNo: string` (similar to rtaRefNo)
   - `submittedAt: Date`
   - `traceId: string`

**Expected Result:**
- Order submitted successfully
- Exchange reference number generated
- Response structure matches interface contract
- Trace ID present for observability

**Priority:** Critical

---

#### TC-P4-004: Order Submission - Field Mapping
**Objective:** Verify correct mapping of order fields to exchange format

**Test Steps:**
1. Create order with all required fields:
   - ModelOrderID
   - Scheme code/ISIN
   - Transaction type (Purchase/Redemption/Switch)
   - Amount/Units
   - Bank details
   - Investor details
2. Call `submitOrder(order)`
3. Verify exchange API receives correctly mapped fields
4. Verify IP address, date (DDMMYYYY), time (hhmmss) are stamped

**Expected Result:**
- All order fields correctly mapped
- Exchange-specific format requirements met
- IP/date/time stamps present in logs
- No data loss during transformation

**Priority:** Critical

---

#### TC-P4-005: Order Validation - Valid Order
**Objective:** Verify validation passes for valid exchange orders

**Test Steps:**
1. Create order with:
   - Exchange-supported scheme
   - Valid transaction type
   - Required fields populated
2. Call `validateOrder(order)`
3. Verify validation result:
   - `isValid: true`
   - `errors: []`
   - `warnings: []` (if any)

**Expected Result:**
- Validation passes
- No errors returned
- Warnings (if any) are informational only

**Priority:** High

---

#### TC-P4-006: Order Validation - Invalid Scheme
**Objective:** Verify validation fails for non-exchange schemes

**Test Steps:**
1. Create order with RTA-only scheme (not exchange-supported)
2. Call `validateOrder(order)`
3. Verify validation result:
   - `isValid: false`
   - `errors` contains scheme compatibility error

**Expected Result:**
- Validation fails with appropriate error
- Error message indicates scheme not supported by exchange
- Error code follows standard format

**Priority:** High

---

#### TC-P4-007: Order Validation - Missing Required Fields
**Objective:** Verify validation catches missing required fields

**Test Steps:**
1. Create order missing required exchange fields (e.g., exchange-specific identifiers)
2. Call `validateOrder(order)`
3. Verify validation result:
   - `isValid: false`
   - `errors` list all missing fields
   - Each error has field name and description

**Expected Result:**
- Validation fails
- All missing fields identified
- Clear error messages for each missing field

**Priority:** High

---

#### TC-P4-008: Order Status Retrieval - Success
**Objective:** Verify status retrieval from exchange platform

**Test Steps:**
1. Submit order successfully (get exchangeRefNo)
2. Mock exchange API status endpoint
3. Call `getStatus(exchangeRefNo)`
4. Verify status response:
   - `orderId: string`
   - `status: OrderStatus` (Pending/Executed/Failed/etc.)
   - `lastUpdated: Date`
   - `exchangeRefNo: string`

**Expected Result:**
- Status retrieved successfully
- Status matches exchange platform state
- Timestamp reflects last update

**Priority:** High

---

#### TC-P4-009: Order Status Retrieval - Not Found
**Objective:** Verify handling of non-existent order status

**Test Steps:**
1. Call `getStatus('invalid-ref-no')`
2. Mock exchange API to return 404
3. Verify error handling:
   - Appropriate error thrown/caught
   - Error message indicates order not found
   - Error code follows standard format

**Expected Result:**
- Error handled gracefully
- Clear error message
- No system crash

**Priority:** Medium

---

#### TC-P4-010: Order Cancellation - Success
**Objective:** Verify successful order cancellation

**Test Steps:**
1. Submit order successfully
2. Call `cancelOrder(exchangeRefNo, 'Client request')`
3. Mock exchange API to return success
4. Verify cancellation response:
   - `success: true`
   - `cancelledAt: Date`
   - `reason: string`

**Expected Result:**
- Order cancelled successfully
- Cancellation reason recorded
- Timestamp captured

**Priority:** High

---

#### TC-P4-011: Order Cancellation - Already Executed
**Objective:** Verify handling of cancellation attempt on executed order

**Test Steps:**
1. Submit order
2. Mock order status as 'Executed'
3. Call `cancelOrder(exchangeRefNo, 'reason')`
4. Verify error handling:
   - Error indicates order cannot be cancelled
   - Error message includes current status
   - Error code indicates business rule violation

**Expected Result:**
- Cancellation rejected appropriately
- Clear error message
- Business rule enforced

**Priority:** High

---

#### TC-P4-012: Availability Check - Available
**Objective:** Verify connector availability check

**Test Steps:**
1. Mock exchange API health check endpoint
2. Call `isAvailable()`
3. Verify returns `true` when exchange is operational

**Expected Result:**
- Returns `true` when exchange is available
- Response time within acceptable limits

**Priority:** Medium

---

#### TC-P4-013: Availability Check - Unavailable
**Objective:** Verify handling when exchange is unavailable

**Test Steps:**
1. Mock exchange API to return error/timeout
2. Call `isAvailable()`
3. Verify returns `false` or throws appropriate error

**Expected Result:**
- Returns `false` or throws error
- Error logged for observability
- No system crash

**Priority:** Medium

---

### 2. Integration Tests - Routing Hub Integration

#### TC-P4-014: Route Selection - Exchange Route Chosen
**Objective:** Verify Routing Hub selects Exchange connector for eligible orders

**Test Steps:**
1. Configure routing rules to prefer exchange for specific schemes
2. Create order with exchange-eligible scheme
3. Submit order through Routing Hub
4. Verify:
   - Exchange connector is selected
   - Order routed to exchange (not RTA)
   - Route selection logged with reason

**Expected Result:**
- Exchange route selected correctly
- Routing decision logged
- Order processed through exchange connector

**Priority:** Critical

---

#### TC-P4-015: Route Selection - RTA Route Chosen (Fallback)
**Objective:** Verify Routing Hub falls back to RTA when exchange unavailable

**Test Steps:**
1. Configure routing rules to prefer exchange
2. Mock exchange connector as unavailable
3. Create order with exchange-eligible scheme
4. Submit order through Routing Hub
5. Verify:
   - RTA connector selected as fallback
   - Fallback reason logged
   - Order processed through RTA

**Expected Result:**
- Fallback to RTA works correctly
- Fallback reason captured in logs
- Order still processed successfully

**Priority:** Critical

---

#### TC-P4-016: Route Selection - Rule-Based by Scheme
**Objective:** Verify route selection based on scheme configuration

**Test Steps:**
1. Configure routing rules:
   - Scheme A → Exchange
   - Scheme B → RTA
2. Create orders for both schemes
3. Submit through Routing Hub
4. Verify each order routed to correct connector

**Expected Result:**
- Scheme A → Exchange
- Scheme B → RTA
- Routing decisions match configuration

**Priority:** High

---

#### TC-P4-017: Route Selection - Rule-Based by Transaction Type
**Objective:** Verify route selection based on transaction type

**Test Steps:**
1. Configure routing rules:
   - Purchase → Exchange preferred
   - Redemption → RTA preferred
2. Create orders for both transaction types
3. Submit through Routing Hub
4. Verify each order routed correctly

**Expected Result:**
- Purchase orders → Exchange
- Redemption orders → RTA
- Transaction type rules applied correctly

**Priority:** High

---

#### TC-P4-018: Route Selection - Availability-Based
**Objective:** Verify route selection considers connector availability

**Test Steps:**
1. Configure routing to prefer exchange
2. Toggle exchange availability:
   - Available → should route to exchange
   - Unavailable → should route to RTA
3. Submit orders in both scenarios
4. Verify routing adapts to availability

**Expected Result:**
- Available: routes to exchange
- Unavailable: routes to RTA
- Availability check performed before routing

**Priority:** High

---

#### TC-P4-019: Save2 Integration - Exchange Route
**Objective:** Verify Save2 flow works with Exchange connector

**Test Steps:**
1. Submit order through Routing Hub (exchange route)
2. Verify Save2 called with:
   - ModelOrderID
   - Connector type: EXCHANGE
   - Order details
3. Verify Save2 response includes orderId
4. Verify orderId linked to exchangeRefNo

**Expected Result:**
- Save2 called correctly
- ModelOrderID present
- OrderId generated and linked
- Exchange reference captured

**Priority:** Critical

---

#### TC-P4-020: Final Order Submission - Exchange Route
**Objective:** Verify finalorderforsubmission with Exchange connector

**Test Steps:**
1. Complete Save2 successfully (get orderId)
2. Call finalorderforsubmission with:
   - orderId
   - orderPaymentReference
   - pgPaymentReferenceNo
3. Verify exchange connector receives payment references
4. Verify exchangeRefNo returned and persisted
5. Verify IP/date/time stamps in logs

**Expected Result:**
- Payment references passed correctly
- Exchange reference number generated
- All references persisted in Order Book
- Audit trail complete

**Priority:** Critical

---

#### TC-P4-021: Idempotency - Duplicate Submission
**Objective:** Verify idempotent handling of duplicate submissions

**Test Steps:**
1. Submit same order twice with same ModelOrderID
2. Verify:
   - First submission creates new order
   - Second submission returns existing orderId (not duplicate)
   - Exchange connector not called twice
   - Idempotency key logged

**Expected Result:**
- No duplicate orders created
- Existing orderId returned
- Exchange called only once
- Idempotency enforced

**Priority:** High

---

#### TC-P4-022: Error Handling - Exchange API Failure
**Objective:** Verify graceful handling of exchange API failures

**Test Steps:**
1. Mock exchange API to return error (500/timeout)
2. Submit order through Routing Hub
3. Verify:
   - Error caught and logged
   - Order status updated to 'Failed'
   - Error details stored
   - Fallback to RTA considered (if configured)
   - Trace ID present in error logs

**Expected Result:**
- Error handled gracefully
- Order marked as failed
- Error details captured
- System remains stable
- Observability maintained

**Priority:** Critical

---

#### TC-P4-023: Error Handling - Partial Failure Recovery
**Objective:** Verify recovery from partial exchange failures

**Test Steps:**
1. Mock exchange API to fail after partial processing
2. Submit order
3. Verify:
   - Partial state detected
   - Recovery mechanism triggered
   - Order status reflects partial state
   - Retry logic applied (if applicable)

**Expected Result:**
- Partial failure detected
- Recovery attempted
- State accurately reflected
- No data inconsistency

**Priority:** Medium

---

### 3. Route Selection Logic Tests

#### TC-P4-024: Rule Priority - Multiple Rules Match
**Objective:** Verify rule priority when multiple rules match

**Test Steps:**
1. Configure multiple routing rules:
   - Scheme-based rule
   - Transaction type rule
   - Default rule
2. Create order matching multiple rules
3. Verify highest priority rule applied
4. Verify rule priority order logged

**Expected Result:**
- Highest priority rule applied
- Priority order respected
- Decision logged with rule used

**Priority:** High

---

#### TC-P4-025: Rule Evaluation - Scheme Whitelist
**Objective:** Verify scheme whitelist for exchange routing

**Test Steps:**
1. Configure exchange scheme whitelist
2. Create orders:
   - Whitelisted scheme → should route to exchange
   - Non-whitelisted scheme → should route to RTA
3. Submit orders
4. Verify routing matches whitelist

**Expected Result:**
- Whitelisted schemes → Exchange
- Non-whitelisted → RTA
- Whitelist check performed correctly

**Priority:** High

---

#### TC-P4-026: Rule Evaluation - Transaction Type Filtering
**Objective:** Verify transaction type filtering in routing rules

**Test Steps:**
1. Configure exchange to support only Purchase transactions
2. Create orders:
   - Purchase → should route to exchange
   - Redemption → should route to RTA
   - Switch → should route to RTA
3. Submit orders
4. Verify routing based on transaction type

**Expected Result:**
- Purchase → Exchange
- Redemption/Switch → RTA
- Transaction type filtering works

**Priority:** High

---

#### TC-P4-027: Rule Evaluation - Date/Time Based Rules
**Objective:** Verify date/time-based routing rules

**Test Steps:**
1. Configure routing rule:
   - Exchange available: 9:00 AM - 3:30 PM
   - Outside hours → RTA
2. Submit orders:
   - During exchange hours → Exchange
   - Outside hours → RTA
3. Verify routing adapts to time

**Expected Result:**
- During hours → Exchange
- Outside hours → RTA
- Time-based rules applied correctly

**Priority:** Medium

---

#### TC-P4-028: Rule Evaluation - Dynamic Availability Check
**Objective:** Verify dynamic availability check in routing

**Test Steps:**
1. Configure routing to check availability dynamically
2. Toggle exchange availability during test
3. Submit orders at different availability states
4. Verify routing adapts to current availability

**Expected Result:**
- Available → Exchange
- Unavailable → RTA
- Dynamic check performed each time

**Priority:** High

---

### 4. Error Handling & Edge Cases

#### TC-P4-029: Network Timeout Handling
**Objective:** Verify handling of network timeouts

**Test Steps:**
1. Mock exchange API to timeout
2. Configure timeout threshold
3. Submit order
4. Verify:
   - Timeout detected
   - Error logged with timeout details
   - Order status updated appropriately
   - Retry logic considered (if applicable)

**Expected Result:**
- Timeout handled gracefully
- Error logged
- Order status reflects timeout
- System stable

**Priority:** High

---

#### TC-P4-030: Invalid Response Format
**Objective:** Verify handling of invalid response format from exchange

**Test Steps:**
1. Mock exchange API to return invalid JSON/malformed response
2. Submit order
3. Verify:
   - Invalid format detected
   - Error logged with response details
   - Order marked as failed
   - Error message indicates format issue

**Expected Result:**
- Invalid format detected
- Error handled gracefully
- Clear error message
- Order status updated

**Priority:** Medium

---

#### TC-P4-031: Concurrent Order Submissions
**Objective:** Verify handling of concurrent order submissions

**Test Steps:**
1. Submit multiple orders concurrently to exchange
2. Verify:
   - All orders processed
   - No race conditions
   - Each order gets unique exchangeRefNo
   - Order integrity maintained

**Expected Result:**
- All orders processed successfully
- No data corruption
- Unique references for each order
- Thread-safe operation

**Priority:** High

---

#### TC-P4-032: Large Order Handling
**Objective:** Verify handling of large orders (amount/units)

**Test Steps:**
1. Create order with very large amount/units
2. Submit to exchange
3. Verify:
   - Order accepted (if within limits)
   - Or rejected with appropriate error
   - Validation checks large values
   - No overflow issues

**Expected Result:**
- Large orders handled correctly
- Validation enforces limits
- No overflow/underflow
- Clear error if exceeds limits

**Priority:** Medium

---

#### TC-P4-033: Special Characters in Fields
**Objective:** Verify handling of special characters in order fields

**Test Steps:**
1. Create order with special characters in:
   - Investor name
   - Bank name
   - Address fields
2. Submit to exchange
3. Verify:
   - Special characters handled correctly
   - Encoding/escaping applied
   - No data corruption
   - Exchange receives clean data

**Expected Result:**
- Special characters handled
- Data integrity maintained
- Exchange receives valid data
- No encoding issues

**Priority:** Medium

---

#### TC-P4-034: Missing Optional Fields
**Objective:** Verify handling of missing optional fields

**Test Steps:**
1. Create order with required fields only (optional fields missing)
2. Submit to exchange
3. Verify:
   - Order accepted if optional fields truly optional
   - Default values applied (if applicable)
   - No errors for missing optional fields

**Expected Result:**
- Optional fields handled correctly
- Defaults applied where needed
- No false errors
- Order processed successfully

**Priority:** Low

---

### 5. Performance Tests

#### TC-P4-035: Response Time - Order Submission
**Objective:** Verify order submission meets performance requirements

**Test Steps:**
1. Submit order to exchange
2. Measure response time
3. Verify:
   - p95 response time ≤ 2s (configurable)
   - p99 response time within acceptable limits
   - Timeout threshold respected

**Expected Result:**
- Response time within SLA
- Performance metrics logged
- No performance degradation

**Priority:** High

---

#### TC-P4-036: Response Time - Status Check
**Objective:** Verify status check performance

**Test Steps:**
1. Call `getStatus()` multiple times
2. Measure response time
3. Verify:
   - Response time ≤ 1s (typical)
   - No performance degradation
   - Caching considered (if applicable)

**Expected Result:**
- Status check fast
- Performance acceptable
- Caching effective (if implemented)

**Priority:** Medium

---

#### TC-P4-037: Load Test - Multiple Orders
**Objective:** Verify system handles load of multiple orders

**Test Steps:**
1. Submit 100 orders concurrently
2. Monitor:
   - Response times
   - Error rates
   - System resources
   - Exchange API rate limits
3. Verify:
   - All orders processed
   - Performance within limits
   - No system degradation

**Expected Result:**
- System handles load
- Performance maintained
- Error rate acceptable
- Rate limits respected

**Priority:** High

---

#### TC-P4-038: Throughput Test
**Objective:** Verify system throughput

**Test Steps:**
1. Submit orders at sustained rate (e.g., 10 orders/second)
2. Run for extended period (e.g., 5 minutes)
3. Monitor:
   - Throughput maintained
   - No degradation over time
   - Error rates stable
4. Verify:
   - Sustained throughput achieved
   - No memory leaks
   - System stable

**Expected Result:**
- Sustained throughput achieved
- System stable over time
- No resource leaks
- Performance consistent

**Priority:** Medium

---

### 6. Security & Audit Tests

#### TC-P4-039: IP Address Stamping
**Objective:** Verify IP address captured in audit logs

**Test Steps:**
1. Submit order through Routing Hub
2. Verify audit logs contain:
   - Source IP address
   - Timestamp (date: DDMMYYYY, time: hhmmss)
   - Order details
3. Verify IP logged for all exchange interactions

**Expected Result:**
- IP address captured
- Format: standard IP format
- Logged for all operations
- Audit trail complete

**Priority:** Critical

---

#### TC-P4-040: Date/Time Stamping
**Objective:** Verify date/time stamps in correct format

**Test Steps:**
1. Submit order
2. Verify logs contain:
   - Date: DDMMYYYY format
   - Time: hhmmss format (24-hour)
   - Timezone: UTC (or configured)
3. Verify timestamps accurate

**Expected Result:**
- Date format: DDMMYYYY
- Time format: hhmmss
- Timestamps accurate
- Timezone consistent

**Priority:** Critical

---

#### TC-P4-041: Trace ID Propagation
**Objective:** Verify trace IDs propagated through exchange flow

**Test Steps:**
1. Submit order with trace ID
2. Verify trace ID:
   - Passed to exchange connector
   - Included in exchange API calls
   - Present in all logs
   - Enables end-to-end tracing
3. Verify trace ID unique per request

**Expected Result:**
- Trace ID propagated
- Present in all logs
- Enables end-to-end tracing
- Unique per request

**Priority:** High

---

#### TC-P4-042: Audit Log Completeness
**Objective:** Verify all exchange operations logged

**Test Steps:**
1. Perform various operations:
   - Order submission
   - Status check
   - Cancellation
   - Validation
2. Verify each operation logged with:
   - Operation type
   - Timestamp
   - User/System identifier
   - Order details
   - Result (success/failure)
   - Error details (if failed)

**Expected Result:**
- All operations logged
- Log entries complete
- Audit trail comprehensive
- Compliance requirements met

**Priority:** Critical

---

#### TC-P4-043: Sensitive Data Masking
**Objective:** Verify sensitive data masked in logs

**Test Steps:**
1. Submit order with sensitive data:
   - PAN
   - Bank account numbers
   - Aadhaar (if applicable)
2. Verify logs:
   - Sensitive data masked
   - Only last 4 digits visible (where applicable)
   - Full data not exposed

**Expected Result:**
- Sensitive data masked
- Masking rules applied
- Compliance maintained
- Security requirements met

**Priority:** High

---

#### TC-P4-044: Authentication/Authorization
**Objective:** Verify exchange connector uses proper authentication

**Test Steps:**
1. Verify exchange API calls include:
   - Authentication tokens/keys
   - Proper headers
   - Secure transmission (HTTPS)
2. Verify:
   - Credentials stored securely
   - No credentials in logs
   - Token rotation supported (if applicable)

**Expected Result:**
- Authentication implemented
- Credentials secure
- No credential exposure
- Secure transmission

**Priority:** Critical

---

### 7. Data Integrity Tests

#### TC-P4-045: Order Data Consistency
**Objective:** Verify order data consistency across systems

**Test Steps:**
1. Submit order through Routing Hub
2. Verify data consistency:
   - Order Book data matches submitted order
   - Exchange reference linked correctly
   - Payment references linked correctly
   - Status synchronized
3. Verify no data loss or corruption

**Expected Result:**
- Data consistent across systems
- References linked correctly
- No data loss
- Integrity maintained

**Priority:** Critical

---

#### TC-P4-046: Reference Number Uniqueness
**Objective:** Verify exchange reference numbers are unique

**Test Steps:**
1. Submit multiple orders
2. Verify each order gets unique exchangeRefNo
3. Verify no duplicates
4. Verify reference format consistent

**Expected Result:**
- All references unique
- Format consistent
- No duplicates
- Uniqueness enforced

**Priority:** High

---

#### TC-P4-047: Transaction Rollback on Failure
**Objective:** Verify transaction rollback on partial failures

**Test Steps:**
1. Mock scenario: Save2 succeeds, exchange submission fails
2. Submit order
3. Verify:
   - Partial state rolled back
   - Order status reflects failure
   - No orphaned records
   - Data integrity maintained

**Expected Result:**
- Rollback successful
- No orphaned records
- Data integrity maintained
- State consistent

**Priority:** High

---

### 8. End-to-End Tests

#### TC-P4-048: E2E - Complete Order Flow via Exchange
**Objective:** Verify complete order flow from submission to settlement via exchange

**Test Steps:**
1. Create order in RM Office UI
2. Submit for authorization
3. Authorize order
4. Verify Routing Hub selects exchange route
5. Verify Save2 called with ModelOrderID
6. Verify finalorderforsubmission with payment references
7. Verify exchangeRefNo generated and persisted
8. Verify order appears in Order Book with exchange details
9. Verify status updates flow correctly
10. Verify settlement completion

**Expected Result:**
- Complete flow works end-to-end
- All steps executed correctly
- Status transitions accurate
- References captured
- Order Book updated

**Priority:** Critical

---

#### TC-P4-049: E2E - Exchange Route with Fallback to RTA
**Objective:** Verify fallback mechanism works end-to-end

**Test Steps:**
1. Configure routing to prefer exchange
2. Create order eligible for exchange
3. Mock exchange as unavailable
4. Submit order
5. Verify:
   - Exchange checked first
   - Fallback to RTA triggered
   - Order processed via RTA
   - Fallback reason logged
   - Order Book shows RTA route (not exchange)

**Expected Result:**
- Fallback mechanism works
- Order processed successfully
- Route correctly identified
- Logs reflect fallback

**Priority:** High

---

#### TC-P4-050: E2E - Multiple Routes Concurrent
**Objective:** Verify system handles orders via different routes concurrently

**Test Steps:**
1. Create multiple orders:
   - Some eligible for exchange
   - Some eligible for RTA
2. Submit all orders concurrently
3. Verify:
   - Each order routed correctly
   - Exchange orders processed via exchange
   - RTA orders processed via RTA
   - No cross-contamination
   - All orders completed successfully

**Expected Result:**
- Multiple routes work concurrently
- Routing decisions correct
- No interference between routes
- All orders processed

**Priority:** High

---

#### TC-P4-051: E2E - Order Status Synchronization
**Objective:** Verify order status synchronized across systems

**Test Steps:**
1. Submit order via exchange
2. Simulate status updates from exchange:
   - Pending → In Progress
   - In Progress → Executed
   - Executed → Settled
3. Verify:
   - Status updates reflected in Order Book
   - Status transitions logged
   - Timestamps accurate
   - Status history maintained

**Expected Result:**
- Status synchronized
- Updates reflected correctly
- History maintained
- Timestamps accurate

**Priority:** High

---

### 9. Observability & Monitoring Tests

#### TC-P4-052: Structured Logging
**Objective:** Verify structured logging for all operations

**Test Steps:**
1. Perform various operations
2. Verify logs contain:
   - Structured JSON format
   - orderId, modelOrderId, exchangeRefNo
   - Operation type
   - Timestamp
   - Result (success/failure)
   - Error codes (if applicable)
   - Trace ID
3. Verify logs queryable and searchable

**Expected Result:**
- Logs structured
- All required fields present
- Logs searchable
- Observability enabled

**Priority:** High

---

#### TC-P4-053: Error Code Standardization
**Objective:** Verify error codes follow standard format

**Test Steps:**
1. Trigger various error scenarios
2. Verify error codes:
   - Follow standard format (e.g., EXCH-XXX)
   - Unique per error type
   - Include in logs
   - Documented
3. Verify error messages clear and actionable

**Expected Result:**
- Error codes standardized
- Format consistent
- Codes documented
- Messages clear

**Priority:** Medium

---

#### TC-P4-054: Metrics Collection
**Objective:** Verify metrics collected for monitoring

**Test Steps:**
1. Perform operations
2. Verify metrics collected:
   - Order submission count (by route)
   - Success/failure rates
   - Response times
   - Error rates
   - Availability status
3. Verify metrics exposed for monitoring tools

**Expected Result:**
- Metrics collected
- Exposed for monitoring
- Enable dashboards
- Support alerting

**Priority:** Medium

---

#### TC-P4-055: Health Check Endpoint
**Objective:** Verify health check endpoint for exchange connector

**Test Steps:**
1. Call health check endpoint
2. Verify response includes:
   - Connector status (available/unavailable)
   - Exchange platform status
   - Last check timestamp
   - Response time
3. Verify health check used by routing logic

**Expected Result:**
- Health check endpoint exists
- Returns accurate status
- Used by routing
- Supports monitoring

**Priority:** Medium

---

### 10. Configuration & Deployment Tests

#### TC-P4-056: Configuration Validation
**Objective:** Verify configuration validation on startup

**Test Steps:**
1. Provide invalid configuration:
   - Missing required fields
   - Invalid URLs
   - Invalid credentials
2. Start system
3. Verify:
   - Configuration validated
   - Errors reported clearly
   - System does not start with invalid config

**Expected Result:**
- Configuration validated
- Errors clear
- System fails fast on invalid config

**Priority:** High

---

#### TC-P4-057: Configuration Hot Reload
**Objective:** Verify configuration can be updated without restart (if supported)

**Test Steps:**
1. Update routing rules configuration
2. Verify:
   - Changes applied without restart
   - New rules effective immediately
   - Old orders not affected
   - Changes logged

**Expected Result:**
- Configuration reloaded
- Changes effective
- No disruption
- Changes logged

**Priority:** Low

---

#### TC-P4-058: Environment-Specific Configuration
**Objective:** Verify environment-specific configurations work

**Test Steps:**
1. Configure different settings for:
   - Development
   - Staging
   - Production
2. Verify:
   - Correct config loaded per environment
   - No cross-environment contamination
   - Environment variables respected

**Expected Result:**
- Environment configs work
- No contamination
- Variables respected

**Priority:** Medium

---

### 11. Regression Tests

#### TC-P4-059: RTA Route Unaffected
**Objective:** Verify existing RTA routes still work after exchange connector addition

**Test Steps:**
1. Create orders eligible for RTA route
2. Submit orders
3. Verify:
   - RTA connector still works
   - No regression in RTA flow
   - RTA orders not affected by exchange code
   - Performance unchanged

**Expected Result:**
- RTA route works as before
- No regression
- Performance maintained
- Backward compatibility

**Priority:** Critical

---

#### TC-P4-060: Core Flows Unchanged
**Objective:** Verify core order management flows unchanged

**Test Steps:**
1. Execute core flows:
   - Order submission
   - Authorization
   - Order Book queries
   - Status updates
2. Verify:
   - All flows work as before
   - No breaking changes
   - API contracts maintained
   - UI unchanged (unless required)

**Expected Result:**
- Core flows unchanged
- No breaking changes
- Backward compatibility
- Existing functionality preserved

**Priority:** Critical

---

## Test Execution Summary

### Test Coverage Matrix

| Category | Test Cases | Critical | High | Medium | Low |
|----------|-----------|----------|------|--------|-----|
| Unit Tests | TC-P4-001 to TC-P4-013 | 3 | 6 | 4 | 0 |
| Integration Tests | TC-P4-014 to TC-P4-023 | 4 | 5 | 1 | 0 |
| Route Selection | TC-P4-024 to TC-P4-028 | 0 | 4 | 1 | 0 |
| Error Handling | TC-P4-029 to TC-P4-034 | 0 | 2 | 3 | 1 |
| Performance | TC-P4-035 to TC-P4-038 | 0 | 2 | 2 | 0 |
| Security & Audit | TC-P4-039 to TC-P4-044 | 3 | 2 | 1 | 0 |
| Data Integrity | TC-P4-045 to TC-P4-047 | 1 | 2 | 0 | 0 |
| E2E Tests | TC-P4-048 to TC-P4-051 | 1 | 3 | 0 | 0 |
| Observability | TC-P4-052 to TC-P4-055 | 0 | 2 | 2 | 0 |
| Configuration | TC-P4-056 to TC-P4-058 | 0 | 1 | 1 | 1 |
| Regression | TC-P4-059 to TC-P4-060 | 2 | 0 | 0 | 0 |
| **Total** | **60** | **14** | **27** | **15** | **2** |

### Priority Distribution
- **Critical (14):** Must pass before production deployment
- **High (27):** Should pass before production, blockers for release
- **Medium (15):** Important but not blockers
- **Low (2):** Nice to have, can be deferred

### Test Execution Strategy

1. **Phase 1 - Unit Tests (Week 1)**
   - Execute TC-P4-001 to TC-P4-013
   - Target: 100% pass rate for Critical and High priority

2. **Phase 2 - Integration Tests (Week 2)**
   - Execute TC-P4-014 to TC-P4-023
   - Execute TC-P4-024 to TC-P4-028 (Route Selection)
   - Target: 100% pass rate for Critical and High priority

3. **Phase 3 - System Tests (Week 3)**
   - Execute TC-P4-029 to TC-P4-047 (Error Handling, Performance, Security, Data Integrity)
   - Execute TC-P4-052 to TC-P4-055 (Observability)
   - Target: 100% pass rate for Critical, 95%+ for High priority

4. **Phase 4 - E2E & Regression (Week 4)**
   - Execute TC-P4-048 to TC-P4-051 (E2E)
   - Execute TC-P4-059 to TC-P4-060 (Regression)
   - Execute TC-P4-056 to TC-P4-058 (Configuration)
   - Target: 100% pass rate for all

### Acceptance Criteria

Phase 4 is considered complete when:
- ✅ All Critical priority tests pass (14/14)
- ✅ All High priority tests pass (27/27)
- ✅ 90%+ of Medium priority tests pass (14/15)
- ✅ Code coverage ≥ 80% for Exchange Connector
- ✅ Performance requirements met (p95 ≤ 2s)
- ✅ Security and audit requirements met
- ✅ No regression in existing RTA flows
- ✅ Documentation complete (API docs, deployment guide)

---

## Test Data Requirements

### Test Orders
- Exchange-eligible schemes (whitelisted)
- RTA-only schemes
- Various transaction types (Purchase, Redemption, Switch)
- Different amounts (min, max, typical)
- Full redemption/switch orders
- Orders with nominees
- Orders with special characters

### Test Configuration
- Routing rules (scheme-based, transaction-based, availability-based)
- Exchange connector configuration
- Timeout settings
- Retry policies
- Health check intervals

### Mock Data
- Exchange API responses (success, failure, timeout)
- Order status responses
- Availability responses
- Error responses

---

## Test Environment Requirements

### Infrastructure
- Test exchange platform (mock or sandbox)
- Test Routing Hub
- Test Order Service
- Test database
- Monitoring/logging tools

### Tools
- Jest (unit tests)
- Playwright (E2E tests)
- Mock service tools
- Performance testing tools
- Log aggregation tools

---

## Notes

1. **Field Specs Deferred:** As per BRD, exact exchange-platform field specs are deferred. Tests should be flexible to accommodate future field requirements.

2. **Interface Compliance:** All tests assume Exchange Connector implements the IConnector interface defined in Routing Hub. Interface definition should be reviewed before test execution.

3. **Mock vs Real:** Initial tests can use mocked exchange APIs. Integration tests should use sandbox/test exchange environment when available.

4. **Performance Baselines:** Establish performance baselines before Phase 4 to compare against.

5. **Observability:** Ensure all tests verify observability requirements (logging, tracing, metrics).

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Owner:** Development Team  
**Reviewers:** QA Team, Architecture Team

