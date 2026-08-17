# Backend Testing Guide — Dev-Edu

> Comprehensive testing documentation for the Dev-Edu Spring Boot backend system.

---

## 1. Overview

The Dev-Edu Backend features an extensive test suite built using **JUnit 5**, **Mockito**, and **Spring Boot Test**. The test suite covers unit tests for service implementations, schedulers, controllers, utility classes, and Kafka event listeners.

---

## 2. Testing Stack & Tools

| Component | Framework / Library | Version | Purpose |
|---|---|---|---|
| **Test Runner** | JUnit 5 (Jupiter) | 5.x | Core testing framework |
| **Mocking Framework** | Mockito | 5.x | Dependencies mocking and verification |
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
│   └── service/
│       ├── QuizServiceImplTest.java
│       ├── QuizQuestionServiceImplTest.java
│       ├── QuizAttemptServiceImplTest.java
│       ├── QuizGradingServiceImplTest.java
│       └── GenerateQuizServiceImplTest.java
├── forum/
│   ├── service/
│   │   ├── PostServiceImplTest.java
│   │   ├── CommentServiceImplTest.java
│   │   └── SavedPostServiceImplTest.java
│   └── scheduler/
│       └── PostSchedulerTest.java
├── chat/
│   └── service/
│       ├── OpenAiServiceImplTest.java
│       └── CourseEmbeddingServiceImplTest.java
├── notification/
│   └── service/
│       ├── NotificationServiceImplTest.java
│       ├── NotificationPersonalServiceImplTest.java
│       └── NotificationGroupServiceImplTest.java
├── tracking/
│   ├── service/
│   │   ├── SubmissionServiceImplTest.java
│   │   └── LogServiceImplTest.java
│   ├── kafka/
│   │   └── TrackingEventListenerTest.java
│   └── controller/
│       └── SubmissionTrackingControllerTest.java
├── file/
│   └── service/
│       └── FileServiceImplTest.java
├── metric/
│   └── service/impl/
│       └── MetricServiceImplTest.java
└── common/
    └── util/
        ├── SecurityContextUtilsTest.java
        ├── PagingUtilsTest.java
        ├── MapperUtilsTest.java
        └── FileContentTypeUtilsTest.java
```

---

## 4. Running Tests

### 4.1 Run All Tests

To execute the entire test suite via Maven:

```bash
# Using Maven wrapper (recommended)
./mvnw test

# Or standard Maven command
mvn test
```

### 4.2 Run Specific Test Class

To run a single test class:

```bash
mvn test -Dtest=UserServiceImplTest
```

### 4.3 Run Specific Package

To execute tests within a specific module package:

```bash
mvn test -Dtest="com.pht.dev_edu.quiz.service.*"
```

### 4.4 Run Specific Test Method

```bash
mvn test -Dtest=UserServiceImplTest#testRegisterUser_Success
```

---

## 5. Testing Conventions & Best Practices

1. **Naming Convention**: Test class names must end with `Test` (e.g., `UserServiceImplTest`). Test method names should describe scenario and expected outcome: `given<Scenario>_when<Action>_then<ExpectedResult>()`.
2. **AAA Pattern**: Arrange, Act, Assert structure in test bodies:
   - **Arrange**: Setup mock returns and input DTOs.
   - **Act**: Invoke the service or component method.
   - **Assert**: Verify results and verify interaction behavior using Mockito (`verify(...)`).
3. **Mocking External Services**: External integrations (Cloudflare R2 S3 SDK, OpenAI API, Brevo Mailer, VNPay) must be mocked in unit tests to ensure fast and deterministic execution.
4. **Virtual Thread Context**: Ensure tests running with Spring Boot context support Java 21 Virtual Threads (`spring.threads.virtual.enabled=true`).
