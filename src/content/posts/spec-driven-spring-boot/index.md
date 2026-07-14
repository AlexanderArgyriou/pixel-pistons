---
title: SDD with Spring boot
published: 2026-07-06
description: 'Spec Driven Development with spring boot'
image: './spec-spring.jpeg'
tags: [spring-boot, spec-driven, ai]
category: 'spring-boot'
draft: false 
lang: 'en'
commentsEnabled: true
---

# Spring Boot + Spec Driven Development

> Moving from **code first** development to **specification first** development with Spring Boot and AI.

---

# Introduction

For decades, software development looked like this:

```
Requirements
     ↓
 Developer writes code
     ↓
 Tests
     ↓
 Documentation
```

Unfortunately, the requirements were often forgotten after implementation.
The source of truth eventually became the **code**, not the business requirements.
With modern AI assistants (Claude, GPT-5.x, Copilot etc.), the workflow can fundamentally change.

Instead of asking:

> "How do I write this code?"

we ask

> "How do I specify exactly what the software should do?"

This is the main idea behind **Spec Driven Development (SDD)** discussed by Simon Martinelli in the Spring Office Hours podcast. [podcast](https://spring.io/blog/2026/05/04/spring-office-hours-podcast-S5E14)

The specification becomes the single source of truth.
Code becomes an implementation artifact that can be generated, verified, regenerated, and tested.

---

# Why Spec Driven Development?

Traditional development usually evolves like this:

```
Business Requirement
↓
Developer interpretation
↓
Implementation
↓
Tests
↓
Documentation
```

Notice that the original requirement is lost.

In Spec Driven Development:

```
Business Requirement
↓
Specification
↓
AI / Developer
↓
Generated Code
↓
Generated Tests
↓
Verification
```

The specification never disappears.

---

# Core Principles

## 1. The specification is the source of truth

Instead of saying

> "Create a UserService"

we describe

```
The system shall allow a user to register.
Email must be unique.
Password must contain:

- uppercase
- lowercase
- digit
- minimum length 10

Duplicate email returns HTTP 409.
```

Notice there is zero Java code.

---

## 2. Specifications are executable

A specification should answer

- What inputs exist?
- What outputs exist?
- Validation rules
- Error cases
- Security
- Constraints

The implementation should satisfy the specification.

---

## 3. AI writes code

Developers review.

AI generates.

Developers validate.

---

# Project Structure

A Spring Boot project might look like this

```
specs/
    user-registration.md
    login.md
    order.md

src/
    main/
    test/

prompts/
    generate-controller.md
    generate-tests.md
```

Instead of hundreds of Jira tickets becoming stale,
the specifications stay versioned with the code.

---

# Example Specification

File

```
specs/user-registration.md
```

```markdown
# User Registration

## Endpoint

POST /api/users

## Request

{
  "email": "john@example.com",
  "password": "Password123"
}

## Validation

Email

- required
- valid email
- unique

Password

- minimum length 10
- uppercase required
- lowercase required
- digit required

## Success

HTTP 201

{
   "id": UUID,
   "email": "john@example.com"
}

## Errors

400 Invalid request

409 Duplicate email
```

No implementation.

Only behavior.

---

# From Spec to Spring Boot

An AI assistant can generate

```
Controller
↓
DTO
↓
Validation
↓
Service
↓
Repository
↓
Tests
```

---

# Generated DTO

```java
public record UserRegistrationRequest(

    @Email
    @NotBlank
    String email,

    @NotBlank
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{10,}$"
    )
    String password

) {}
```

Notice how validation rules came directly from the specification.

---

# Generated Controller

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UserResponse> register(
            @Valid
            @RequestBody UserRegistrationRequest request
    ) {

        UserResponse response =
                service.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

}
```

Nothing magical.

The controller simply reflects the specification.

---

# Service Layer

```java
@Service
public class UserService {

    private final UserRepository repository;

    public UserResponse register(UserRegistrationRequest request) {

        if(repository.existsByEmail(request.email())) {
            throw new DuplicateEmailException();
        }

        User entity = new User(
                UUID.randomUUID(),
                request.email(),
                passwordEncoder.encode(request.password())
        );

        repository.save(entity);

        return UserResponse.from(entity);

    }

}
```

Again,
Business rules came from the specification.

---

# OpenAPI First

Spec Driven Development fits naturally with OpenAPI.

Example

```yaml
paths:
  /users:
    post:
      summary: Register user
      requestBody:
        required: true
      responses:
        "201":
          description: User created
        "409":
          description: Duplicate email
```

From this specification you can generate

- Controllers
- DTOs
- Clients
- Documentation

using tools like OpenAPI Generator.

---

# Testing from Specifications

Instead of manually writing tests, AI can derive them.

Example

```java
@Test
void duplicateEmailReturns409() {

    given(repository.existsByEmail(any()))
            .willReturn(true);

    mockMvc.perform(post("/api/users")
            .contentType(APPLICATION_JSON)
            .content(json))

            .andExpect(status().isConflict());

}
```

The specification explicitly required HTTP 409.

---

# Example Prompt

```
Using the specification below,
generate:

- DTO
- Controller
- Service
- Unit tests
- Integration tests

Requirements:

Use Spring Boot 4

Use Jakarta Validation

Use Problem Details

Do not invent business rules.

Only implement what is specified.
```

---

# AI Workflow

```
Business
↓
Specification
↓
Git
↓
AI
↓
Generated Code
↓
Developer Review
↓
Tests
↓
Production
```

Notice that AI is not replacing developers.
It is replacing repetitive implementation work.

---

# Keeping Specifications Close to Code

A practical repository might look like this

```
order-service/
    specs/
        create-order.md
        cancel-order.md
        payment.md
    src/
    prompts/
    docs/
```

Each pull request updates

- specification
- implementation
- tests

together.

---

# Example Evolution

## Version 1

```
Password minimum length

10
```

Later..

```
Password minimum length

12
```

AI regenerates

- validation
- tests
- documentation

without developers hunting through dozens of files.

---

# What Should Developers Still Do?

Spec Driven Development does **not** eliminate engineering.

Developers still make architectural decisions:

- Domain modeling
- Security
- Transactions
- Performance
- Distributed systems
- Observability
- Monitoring
- Database design

AI accelerates implementation.
Engineers remain responsible for correctness.

---

# Best Practices with Spring Boot

## Keep specifications small

One specification per use case.

Good:

```
Register User
```

Bad:

```
Entire User Management Module
```

---

## Focus on behavior

Good

```
Return HTTP 404 if user not found.
```

Bad

```
Use Optional.orElseThrow(...)
```

Specifications should never prescribe implementation.

---

## Define edge cases

Always specify

- invalid input
- duplicate data
- unauthorized access
- concurrency
- expected HTTP codes

---

## Let AI generate boilerplate

Spring Boot contains plenty of repetitive code:

- DTOs
- Controllers
- Validation
- Mapping
- Tests

These are ideal candidates for AI generation.

---

# Advantages

- Better communication with stakeholders
- Requirements remain the source of truth
- Easier onboarding
- Better AI-generated code
- Consistent APIs
- Easier test generation
- Less duplicated documentation

---

# Challenges

- Writing good specifications requires practice
- Ambiguous requirements still produce ambiguous code
- AI output must always be reviewed
- Architecture cannot be fully automated

---

# A Typical Development Cycle

```
1. Write specification
↓
2. Review with stakeholders
↓
3. Commit specification
↓
4. Generate implementation
↓
5. Review generated code
↓
6. Execute tests
↓
7. Deploy
```

---

# Conclusion

Spec Driven Development shifts the primary artifact of software engineering from **code** to **specifications**.

For Spring Boot teams, this approach works particularly well because:

- Spring's conventions make generated code predictable.
- Validation rules map naturally from specifications.
- OpenAPI integrates seamlessly with REST APIs.
- AI assistants excel at generating controllers, DTOs, services, and tests from well defined requirements.

The key insight is simple:

> **Code changes frequently. Requirements should not.**

When specifications become the single source of truth, Spring Boot becomes the execution platform, AI becomes the implementation assistant, and developers focus on solving business problems rather than writing repetitive boilerplate.

---

# Further Reading

- Spring Office Hours Podcast S5E14: Spec Driven Development with Simon Martinelli
- Spring Boot Reference Documentation
- OpenAPI Specification
- Spring REST Docs
- Spring AI
- OpenAPI Generator