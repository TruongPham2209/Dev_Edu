# Backend Testing Guide — Dev-Edu

> Comprehensive testing documentation, rules, and best practices for the Dev-Edu Spring Boot backend system.

---

## 1. Overview

The Dev-Edu Backend features an extensive test suite built using **JUnit 5**, **Mockito**, and **Spring Boot Test**. The test suite covers unit tests for service implementations, schedulers, controllers, utility classes, MapStruct mappers, and Kafka event listeners.

---

## 2. Testing Stack & Tools

| Component | Framework / Library | Version | Purpose |
|---|---|---|---|
| **Test Runner** | JUnit 5 (Jupiter) | 5.x | Core testing framework |
| **Mocking Framework** | Mockito | 5.x | Dependencies mocking and verification |
| **Mapper Instantiation** | MapStruct Mappers Factory | 1.6.x | Real mapper instance binding via `Mappers.getMapper(...)` |
| **Assertions** | AssertJ / JUnit Assertions | 3.x | Fluent assertions for test expectations |
| **Integration Testing** | Spring Boot Test | 3.5.x | Context loading & web layer testing (`@SpringBootTest`, `@WebMvcTest`) |
| **Database Isolation** | H2 / Testcontainers / Mock Repository | — | In-memory or isolated database testing |

---

## 3. Test Package Structure

All test source files reside under `src/test/java/com/pht/dev_edu/`:

```
src/test/java/com/pht/dev_edu/
├── user/
│   └── service/
│       ├── UserServiceImplTest.java
│       └── ProfileServiceImplTest.java
├── course/
│   ├── service/
│   │   ├── CourseServiceImplTest.java
│   │   ├── CategoryServiceImplTest.java
│   │   ├── ReviewServiceImplTest.java
│   │   └── CourseDiscountServiceImplTest.java
│   └── scheduler/
│       ├── CourseSchedulerTest.java
│       └── CategorySchedulerTest.java
├── lecture/
│   ├── service/
│   │   ├── LectureServiceImplTest.java
│   │   ├── MaterialServiceImplTest.java
│   │   ├── ProgressServiceImplTest.java
│   │   └── CommentServiceImplTest.java
│   └── scheduler/
│       └── LectureSchedulerTest.java
├── enrollment/
│   ├── service/
│   │   ├── OrderServiceImplTest.java
│   │   ├── OrderItemServiceImplTest.java
│   │   └── EnrollmentServiceImplTest.java
│   └── scheduler/
│       └── OrderSchedulerTest.java
├── quiz/
│   ├── engine/
│   │   ├── DocumentPromotionServiceTest.java
│   │   ├── QuizGenerationEngineTest.java
│   │   └── QuizGenerationPipelineImplTest.java
│   └── service/
│       ├── CourseDocumentServiceImplTest.java
│       ├── GenerateQuizServiceImplTest.java
│       ├── QuizAccessServiceImplTest.java
│       ├── QuizAssignmentServiceImplTest.java
│       ├── QuizAttemptServiceImplTest.java
│       ├── QuizAuditServiceImplTest.java
│       ├── QuizGradingServiceImplTest.java
│       ├── QuizManagementServiceImplTest.java
│       ├── QuizQuestionServiceImplTest.java
│       └── QuizServiceImplTest.java
├── forum/
│   ├── service/
│   │   ├── PostServiceImplTest.java
│   │   ├── CommentServiceImplTest.java
│   │   └── SavedPostServiceImplTest.java
│   └── scheduler/
│       └── PostSchedulerTest.java
├── chat/
│   ├── controller/
│   │   └── ChatControllerTest.java
│   └── service/
│       ├── ChatServiceImplTest.java
│       ├── OpenAiServiceImplTest.java
│       └── CourseEmbeddingServiceImplTest.java
├── notification/
│   └── service/
│       ├── NotificationServiceImplTest.java
│       ├── NotificationPersonalServiceImplTest.java
│       └── NotificationGroupServiceImplTest.java
├── tracking/
│   ├── controller/
│   │   └── SubmissionTrackingControllerTest.java
│   ├── kafka/
│   │   └── TrackingEventListenerTest.java
│   └── service/
│       ├── SubmissionServiceImplTest.java
│       └── LogServiceImplTest.java
├── file/
│   └── service/
│       └── FileServiceImplTest.java
├── metric/
│   └── service/
│       └── MetricServiceImplTest.java
└── common/
    └── util/
        ├── SecurityContextUtilsTest.java
        ├── PagingUtilsTest.java
        ├── MapperUtilsTest.java
        ├── FileContentTypeUtilsTest.java
        └── ExceptionUtilsTest.java
```

---

## 4. MapStruct Mapper Testing Rules

> **Critical Rule**: When testing services or components that depend on MapStruct mappers (`*Mapper`), do **NOT** mock the mapper with an empty `@Mock` without stubs. Instead, use `@Spy` with the actual compiled MapStruct implementation:

```java
// ✅ RECOMMENDED: Use real MapStruct mapper instance via @Spy
@Spy
private QuizMapper quizMapper = Mappers.getMapper(QuizMapper.class);

// ✅ For manual constructor instantiation (tests without @InjectMocks):
private final QuizMapper quizMapper = Mappers.getMapper(QuizMapper.class);
private QuizServiceImpl quizService = new QuizServiceImpl(..., quizMapper, ...);

// ❌ FORBIDDEN: Empty @Mock will return null for all mapper conversions!
@Mock
private QuizMapper quizMapper;
```

### Why this rule is required:
1. **Prevents `NullPointerException` & False Failures**: An unstubbed `@Mock` returns `null` for all mapping calls, leading to broken assertion chains in downstream logic.
2. **Validates Mapping Logic Integrity**: Using the real MapStruct implementation validates that all entity ↔ DTO property mappings execute correctly during unit test runs.
3. **Allows Targeted Stubbing if Needed**: Since it is annotated with `@Spy`, specific custom methods can still be selectively overridden with `doReturn(...).when(...)` if required.

---

## 5. Test Documentation & Commenting Rules (Mô tả Test)

> **Mandatory Rule**: 100% of test classes (`*Test.java`) must contain a standardized test description, branch analysis block, and structured test methods.

### 5.1. Analysis & Branch Coverage Block (`/* <analysis> ... </analysis> */`)
Include a structured analysis comment detailing:
1. **Target Class**: Name of the class under test.
2. **Method Analysis**: List each method, outlining:
   - `branches`: Conditional branches, guard clauses, filter predicates.
   - `paths`: Identified execution paths (`[P1: ...]`, `[P2: ...]`, etc.).
   - `planned tests`: Mapping of planned unit test method names to the specific paths tested (`[shouldDoXWhenY -> P1]`).

*Example:*
```java
/*
 * <analysis>
 * QuizAttemptServiceImpl
 * - submitAttempt(UUID attemptId, String username)
 *   - branches:
 *       if attempt not found -> DataNotFoundException
 *       if attempt already submitted -> return existing attempt result
 *       if attempt has essay questions -> status = GRADING
 *       if attempt is all auto-gradable -> status = GRADED
 *   - paths:
 *       [P1: attempt not found -> DataNotFoundException]
 *       [P2: already submitted -> idempotent return]
 *       [P3: essay questions -> status GRADING]
 *       [P4: all objective -> status GRADED]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenAttemptNotFound -> P1]
 *       [shouldReturnExistingWhenAlreadySubmitted -> P2]
 *       [shouldTransitionToGradingWhenEssayQuestionsPresent -> P3]
 *       [shouldTransitionToGradedWhenAllQuestionsAutoGraded -> P4]
 * </analysis>
 */
```

### 5.2. Javadoc Test Header (`/** ... */`)
Include a standard Javadoc block immediately above the test class definition:
- **Purpose**: High-level functional goal of the test suite.
- **Test Scope**: Methods under test.
- **Covered Scenarios**: Detailed checklist of tested behaviors (happy paths, edge cases, error conditions).
- **Mocked Dependencies**: Explicit list of injected `@Mock` beans and static utility mocks (`MockedStatic`).
- **Not Covered & Notes**: Assumptions and limitations (e.g. pure unit tests vs integrated databases).

*Example:*
```java
/**
 * ============================================================================
 * Unit Test for QuizAttemptServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify quiz attempt submission, auto vs manual grading status transitions, and attempt review lookup rules.
 *
 * Test Scope
 * ----------
 * - submitAttempt(UUID, String)
 * - getAttemptReview(UUID, String, boolean)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Auto-grading attempt submission (transitions to GRADED and revokes active session token)
 * ✓ Essay question attempt submission (transitions to GRADING for manual teacher evaluation)
 * ✓ Idempotent submission for already submitted/graded attempts
 * ✓ Review access restriction when attempt is still IN_PROGRESS
 * ✓ Review data retrieval for submitted/graded attempts
 *
 * Mocked Dependencies
 * -------------------
 * - QuizAttemptRepo
 * - QuizMapper
 * - RedisUtils (static)
 */
```

### 5.3. Test Method `@DisplayName` and AAA Structure
- Annotate each test with `@DisplayName("<methodName> - <condition> - should <expectedBehavior>")`.
- Explicitly format test bodies into 3 distinct sections using comments:
  - `// Arrange`: Initialize test fixtures, request DTOs, and Mockito `when(...)` stubs.
  - `// Act`: Execute the target method under test.
  - `// Assert`: Assert output values (`assertThat(...)`) and verify interactions (`verify(...)`).

---

## 6. Running Tests

### 6.1 Run All Tests

To execute the entire test suite via Maven:

```bash
# Using Maven wrapper (recommended)
./mvnw test

# Or standard Maven command
mvn test
```

### 6.2 Run Specific Test Class

To run a single test class:

```bash
mvn test -Dtest=UserServiceImplTest
```

### 6.3 Run Specific Package

To execute tests within a specific module package:

```bash
mvn test -Dtest="com.pht.dev_edu.quiz.service.*"
```

### 6.4 Run Specific Test Method

```bash
mvn test -Dtest=UserServiceImplTest#testRegisterUser_Success
```

---

## 7. General Testing Best Practices

1. **Naming Convention**: Test class names must end with `Test` (e.g., `UserServiceImplTest`).
2. **Mocking External Services**: External integrations (Cloudflare R2 S3 SDK, OpenAI API, Brevo Mailer, VNPay) must be mocked in unit tests to ensure fast and deterministic execution.
3. **Static Mock Cleanup**: Always close static mocks (e.g., `MockedStatic<RedisUtils>`) in an `@AfterEach` teardown method or `try-with-resources` block.
4. **Virtual Thread Compatibility**: Ensure tests running with Spring Boot context support Java 21 Virtual Threads (`spring.threads.virtual.enabled=true`).
