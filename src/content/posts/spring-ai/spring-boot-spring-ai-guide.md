---
title: "Building AI-Powered Spring Boot Apps with Spring AI"
published: 2026-07-11
description: "A practical guide to integrating AI into Spring Boot applications using Spring AI, with real code examples and production patterns."
category: "Java Development"
tags: ["Spring Boot", "Spring AI", "Java", "Artificial Intelligence", "OpenAI", "REST API"]
commentsEnabled: true
image: ./springai.jpg
---

# Building AI-Powered Spring Boot Apps with Spring AI

If you're working with Spring Boot and feeling left out of the AI wave, don't. Spring AI brings AI integration to the Spring ecosystem without forcing you to rewrite everything in Python.

I'll walk through building an AI powered REST API using real code. We'll create an article summarizer that actually works in production.

## Why Bother?

Your stack is already Spring Boot. Your team knows Spring. Your infrastructure runs Spring. Why add Python microservices or learn new frameworks when Spring AI works with what you have?

You get familiar patterns (`ChatClient` feels like `RestTemplate`), dependency injection, auto configuration, and support for multiple AI providers like OpenAI, Azure, Anthropic, or local models via Ollama.

## The Project

We're building a REST API that takes articles and returns AI-generated summaries. You'll be able to specify summary length and get actual production-ready code.

## Setup

Here are the Maven dependencies:

```xml
<project>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <dependencies>
        <!-- Spring Boot Web for REST API -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Spring AI for OpenAI integration -->
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
            <version>1.0.0-M1</version>
        </dependency>
        
        <!-- For API documentation (optional but recommended) -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>
    </dependencies>
</project>
```

Configuration in `application.yml`:

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4
          temperature: 0.7
          max-tokens: 500

# Application-specific settings
app:
  ai:
    rate-limit:
      requests-per-minute: 10
    timeout-seconds: 30
```

Set your API key as an environment variable:

```bash
export OPENAI_API_KEY=sk-your-key-here
```

## Core Concepts

### ChatClient

The main interface. Send a string, get a string back:

```java
@Autowired
private ChatClient chatClient;

public String chat(String message) {
    return chatClient.call(message);
}
```

### ChatOptions

Control AI behavior with options:

```java
ChatOptions options = OpenAiChatOptions.builder()
    .withModel("gpt-4")
    .withTemperature(0.7)  // 0 = deterministic, 1 = creative
    .withMaxTokens(500)
    .build();
```

**Temperature** controls randomness (0 = deterministic, 1 = creative). **Max tokens** limits response length. Set these globally or per-request.

### PromptTemplate

Don't hardcode prompts. Use templates:

```java
String template = """
    Summarize the following article in {length} sentences.
    
    Title: {title}
    Content: {content}
    
    Summary:
    """;

PromptTemplate promptTemplate = new PromptTemplate(template);
Prompt prompt = promptTemplate.create(Map.of(
    "length", "3",
    "title", article.getTitle(),
    "content", article.getContent()
));

String summary = chatClient.call(prompt).getResult();
```

## Building the Summarizer

### Domain Model

```java
package com.example.aisummary.model;

public record Article(String title, String content) {
    public Article {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title cannot be blank");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content cannot be blank");
        }
    }
}

public record SummaryRequest(Article article, SummaryLength length) {}

public enum SummaryLength {
    SHORT(3),
    MEDIUM(5),
    LONG(10);
    
    private final int sentences;
    
    SummaryLength(int sentences) {
        this.sentences = sentences;
    }
    
    public int getSentences() {
        return sentences;
    }
}

public record SummaryResponse(String summary, int tokensUsed) {}
```

### The Service

```java
package com.example.aisummary.service;

import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ArticleSummarizerService {

    private static final String SUMMARY_TEMPLATE = """
        You are a professional editor summarizing articles for busy readers.
        
        Summarize the following article in exactly {length} concise sentences.
        Focus on the main points and key takeaways.
        
        Article Title: {title}
        
        Article Content:
        {content}
        
        Summary (exactly {length} sentences):
        """;

    private final ChatClient chatClient;
    private final PromptTemplate promptTemplate;

    public ArticleSummarizerService(ChatClient chatClient) {
        this.chatClient = chatClient;
        this.promptTemplate = new PromptTemplate(SUMMARY_TEMPLATE);
    }

    public SummaryResponse summarize(SummaryRequest request) {
        // Build the prompt with variables
        Prompt prompt = promptTemplate.create(Map.of(
            "title", request.article().title(),
            "content", truncateContent(request.article().content()),
            "length", String.valueOf(request.length().getSentences())
        ));

        // Configure for this specific request
        OpenAiChatOptions options = OpenAiChatOptions.builder()
            .withTemperature(0.5)  // Lower for consistent summaries
            .withMaxTokens(calculateMaxTokens(request.length()))
            .build();

        // Make the AI call
        ChatResponse response = chatClient.call(
            new Prompt(prompt.getContents(), options)
        );

        // Extract the result
        String summary = response.getResult()
            .getOutput()
            .getContent();
        
        int tokensUsed = response.getMetadata()
            .getUsage()
            .getTotalTokens();

        return new SummaryResponse(summary, tokensUsed);
    }

    private String truncateContent(String content) {
        // Limit to ~4000 tokens worth of text (~3000 words)
        // GPT-4 has 8k context window, leave room for prompt + response
        int maxChars = 15000;
        return content.length() > maxChars 
            ? content.substring(0, maxChars) + "..."
            : content;
    }

    private int calculateMaxTokens(SummaryLength length) {
        // Rough estimate: each sentence needs ~20-30 tokens
        return length.getSentences() * 30 + 50; // +50 for buffer
    }
}
```

Key points:

- **Truncate content**: GPT-4 has an 8k token limit (~6k words). We truncate long articles.
- **Dynamic token limits**: Different summary lengths need different token budgets.
- **Track metadata**: Response includes token usage for cost monitoring.

### Error Handling

```java
package com.example.aisummary.exception;

public class AiServiceException extends RuntimeException {
    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}

@ControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<ErrorResponse> handleAiServiceException(AiServiceException ex) {
        log.error("AI service error", ex);
        return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(new ErrorResponse(
                "AI service temporarily unavailable",
                "Please try again later"
            ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(IllegalArgumentException ex) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(
                "Invalid request",
                ex.getMessage()
            ));
    }

    record ErrorResponse(String error, String message) {}
}
```

And update the service to use it:

```java
public SummaryResponse summarize(SummaryRequest request) {
    try {
        // ... existing code ...
    } catch (Exception e) {
        throw new AiServiceException(
            "Failed to generate summary for: " + request.article().title(),
            e
        );
    }
}
```

### REST Controller

```java
package com.example.aisummary.controller;

import com.example.aisummary.model.*;
import com.example.aisummary.service.ArticleSummarizerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/summaries")
@Tag(name = "Article Summarization", description = "AI-powered article summarization")
public class SummaryController {

    private final ArticleSummarizerService summarizerService;

    public SummaryController(ArticleSummarizerService summarizerService) {
        this.summarizerService = summarizerService;
    }

    @PostMapping
    @Operation(
        summary = "Summarize an article",
        description = "Generate an AI-powered summary of the provided article"
    )
    public ResponseEntity<SummaryResponse> summarizeArticle(
            @Valid @RequestBody SummaryRequest request) {
        
        SummaryResponse response = summarizerService.summarize(request);
        return ResponseEntity.ok(response);
    }
}
```

## Testing

Start your application:

```bash
mvn spring-boot:run
```

Then make a request:

```bash
curl -X POST http://localhost:8080/api/v1/summaries \
  -H "Content-Type: application/json" \
  -d '{
    "article": {
      "title": "The Future of Java",
      "content": "Java has been around for nearly 30 years, and it is not going anywhere. With modern features like records, pattern matching, and virtual threads, Java is faster and more expressive than ever. The JVM ecosystem continues to innovate, with frameworks like Spring, Quarkus, and Micronaut pushing boundaries..."
    },
    "length": "SHORT"
  }'
```

Response:

```json
{
  "summary": "Java remains relevant after 30 years with modern features like records and virtual threads. The JVM ecosystem continues to thrive with innovative frameworks. Java's combination of performance and expressiveness ensures its future.",
  "tokensUsed": 127
}
```

You get a clean three-sentence summary as requested.

## Production Patterns

### Streaming for Long Responses

```java
@GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> streamSummary(@Valid @RequestBody SummaryRequest request) {
    
    Prompt prompt = buildPrompt(request);
    
    // Stream tokens as they arrive
    return chatClient.stream(prompt)
        .map(response -> response.getResult().getOutput().getContent());
}
```

Users see progress as the AI generates text.

### Rate Limiting

```java
@Component
public class RateLimiter {
    
    private final Bucket bucket;

    public RateLimiter(@Value("${app.ai.rate-limit.requests-per-minute}") int requestsPerMinute) {
        Bandwidth limit = Bandwidth.classic(
            requestsPerMinute,
            Refill.intervally(requestsPerMinute, Duration.ofMinutes(1))
        );
        this.bucket = Bucket.builder().addLimit(limit).build();
    }

    public void checkLimit() {
        if (!bucket.tryConsume(1)) {
            throw new RateLimitExceededException("Too many requests");
        }
    }
}

// In service
public SummaryResponse summarize(SummaryRequest request) {
    rateLimiter.checkLimit();
    // ... rest of implementation ...
}
```

### Monitoring and Caching

Track usage with Micrometer metrics and cache identical requests:

```java
@Component
public class AiMetrics {
    
    private final MeterRegistry registry;
    private final Counter requestCounter;
    private final Timer responseTimer;
    private final Counter tokensCounter;

    public AiMetrics(MeterRegistry registry) {
        this.registry = registry;
        this.requestCounter = Counter.builder("ai.requests")
            .description("Total AI requests")
            .register(registry);
        this.responseTimer = Timer.builder("ai.response.time")
            .description("AI response time")
            .register(registry);
        this.tokensCounter = Counter.builder("ai.tokens.used")
            .description("Total tokens consumed")
            .register(registry);
    }

    public void recordRequest() {
        requestCounter.increment();
    }

    public void recordResponse(long milliseconds, int tokens) {
        responseTimer.record(milliseconds, TimeUnit.MILLISECONDS);
        tokensCounter.increment(tokens);
    }
}
```

```java
@Service
public class CachedSummarizerService {
    
    @Cacheable(value = "summaries", key = "#request")
    public SummaryResponse summarize(SummaryRequest request) {
        return summarizerService.summarize(request);
    }
}
```

Use Redis for distributed caching in production.

## Switching AI Providers

Spring AI supports multiple providers. Switching is easy:

```yaml
# OpenAI
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}

# Or Azure OpenAI
spring:
  ai:
    azure:
      openai:
        api-key: ${AZURE_OPENAI_KEY}
        endpoint: ${AZURE_OPENAI_ENDPOINT}

# Or Anthropic (Claude)
spring:
  ai:
    anthropic:
      api-key: ${ANTHROPIC_API_KEY}

# Or local models with Ollama
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
```

The `ChatClient` interface stays the same regardless of provider. Great for testing with cheaper models or avoiding vendor lock-in.

## Common Mistakes

1. **Ignoring token limits**: Know your model's context window. Truncate or chunk content.
2. **Wrong temperature**: Use 0.0-0.3 for facts, 0.7-1.0 for creative content.
3. **No retry logic**: Add `@Retryable` with exponential backoff.
4. **Exposing raw responses**: Validate AI output before returning to users.
5. **Hardcoded prompts**: Store prompts in config so you can update without redeploying.

## Where This Makes Sense

AI works well for content generation (summaries, descriptions, emails), analysis (sentiment, classification), conversational interfaces (support bots, Q&A), and code assistance (reviews, documentation).

The key is augmentation, not replacement. AI assists; it doesn't replace humans.

## Performance Tips

- Batch requests when possible
- Use GPT-3.5 for simple tasks (10x cheaper, 2x faster)
- Process AI calls asynchronously with `@Async`
- Use local models (Ollama) for development

## Wrapping Up

Spring AI integrates cleanly with the Spring ecosystem. The code we built is production-ready—add authentication, persistence, and deploy it.

If you're wondering how to add AI without rewriting everything in Python, this is your path. Spring AI meets you where you are.

**Resources**: [Spring AI Docs](https://docs.spring.io/spring-ai/reference/) • [OpenAI API Reference](https://platform.openai.com/docs/api-reference) • [Prompt Engineering Guide](https://www.promptingguide.ai/)
