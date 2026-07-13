---
title: "Building AI-Powered Spring Boot Applications: A Practical Guide to Spring AI"
published: 2026-07-11
description: "Learn how to integrate AI capabilities into your Spring Boot applications using Spring AI. Complete with working examples, best practices, and production-ready patterns."
category: "Java Development"
tags: ["Spring Boot", "Spring AI", "Java", "Artificial Intelligence", "OpenAI", "REST API"]
commentsEnabled: true
---

# Building AI-Powered Spring Boot Applications: A Practical Guide to Spring AI

AI isn't just for Python anymore. If you're a Java developer working with Spring Boot, you might think you're missing out on the AI revolution. Spoiler: you're not. Spring AI brings first-class AI integration to the Spring ecosystem, and it's surprisingly good.

In this article, I'll show you how to build AI-powered features into Spring Boot applications using real, production-ready code. We'll create an actual REST API that uses AI to generate content, and I'll walk you through the patterns I wish someone had shown me when I started.

## Why Spring AI?

Fair question. Python has LangChain, JavaScript has Vercel AI SDK. Why does Java need another AI framework?

Because **you're already using Spring**. Your production systems are Spring Boot. Your team knows Spring. Your infrastructure is tuned for Spring. Sure, you *could* rewrite everything in Python, or you could add a microservice in Node.js. Or you could use Spring AI and leverage what you already know.

Spring AI gives you:

- **Familiar abstractions**: If you understand `RestTemplate`, you'll understand `ChatClient`
- **Dependency injection**: Because manually managing API clients is 2005
- **Auto-configuration**: Add a dependency, set an API key, done
- **Multiple providers**: OpenAI, Azure, Anthropic, Ollama (local models), more coming
- **Spring Boot patterns**: Actuator metrics, configuration properties, the works

It's not trying to be LangChain for Java. It's trying to be the Spring way to do AI.

## What We're Building

We'll create a REST API that generates blog post summaries using AI. The requirements:

- POST an article (title + content)
- Get back an AI-generated summary
- Support different summary lengths (short, medium, long)
- Handle errors gracefully
- Make it production-ready (rate limiting, monitoring, etc.)

By the end, you'll have working code you can actually deploy. Let's go.

## Setup: Getting Started

First, the dependencies. I'm using Maven, but Gradle works the same way.

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

Next, configuration. Add this to `application.yml`:

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

The `${OPENAI_API_KEY}` pulls from your environment. Never commit API keys to version control. Set it locally:

```bash
export OPENAI_API_KEY=sk-your-key-here
```

For production, use proper secrets management (AWS Secrets Manager, HashiCorp Vault, etc.).

## Core Concepts: Understanding Spring AI

Before we dive into code, let's understand the key interfaces.

### ChatClient: Your Gateway to AI

`ChatClient` is the main interface. Think of it like `RestTemplate` but for AI models:

```java
@Autowired
private ChatClient chatClient;

public String chat(String message) {
    return chatClient.call(message);
}
```

That's it. You send a string, you get a string back. Of course, there's more to it—we'll get to structured outputs, streaming, and advanced patterns shortly.

### ChatOptions: Controlling AI Behavior

Every AI call has options:

```java
ChatOptions options = OpenAiChatOptions.builder()
    .withModel("gpt-4")
    .withTemperature(0.7)  // 0 = deterministic, 1 = creative
    .withMaxTokens(500)
    .build();
```

- **Model**: Which AI model to use (gpt-4, gpt-3.5-turbo, etc.)
- **Temperature**: Randomness (0.0 to 1.0). Low for facts, high for creativity.
- **Max Tokens**: Response length limit (roughly 1 token = 0.75 words)

You can set these globally (in `application.yml`) or per-request.

### PromptTemplate: Structured Prompts

Hardcoding prompts is a rookie mistake. Use templates:

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

This separates prompt engineering from application logic. Your prompts become first-class citizens, not buried in string concatenation.

## Building the Summarizer Service

Now let's build our article summarizer. We'll do this right: proper error handling, configuration, and testability.

### The Domain Model

First, define what we're working with:

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

Using records keeps it concise. The validation in the compact constructor ensures we never process invalid data.

### The AI Service

Here's where the magic happens:

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

Let's break down what's happening:

1. **Prompt Template**: We define once, reuse everywhere. Notice the professional tone setting—that's prompt engineering.

2. **Content Truncation**: AI models have context limits. GPT-4 has 8,192 tokens (~6,000 words). We truncate long articles to stay within limits.

3. **Dynamic Token Limits**: Short summaries need fewer tokens. Why pay for unused tokens?

4. **Metadata Extraction**: The response includes token usage. Track this for cost monitoring.

This is production-ready code. Error handling comes next.

### Error Handling

AI calls can fail in creative ways. Let's handle them:

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

Now API failures return proper HTTP status codes and user-friendly messages.

### The REST Controller

Finally, expose it via REST:

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

The `@Operation` annotations generate OpenAPI/Swagger docs automatically. Visit `http://localhost:8080/swagger-ui.html` to see interactive API docs.

## Testing It Out

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

Beautiful. Three sentences, as requested.

## Advanced Patterns

Let's level up with some production patterns.

### Streaming Responses

For long summaries, streaming improves perceived performance:

```java
@GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> streamSummary(@Valid @RequestBody SummaryRequest request) {
    
    Prompt prompt = buildPrompt(request);
    
    // Stream tokens as they arrive
    return chatClient.stream(prompt)
        .map(response -> response.getResult().getOutput().getContent());
}
```

The client receives words as the AI generates them, not all at once. Users see progress.

### Conversation Memory

For multi-turn conversations, maintain context:

```java
@Service
public class ConversationalSummarizerService {

    private final ChatClient chatClient;
    private final Map<String, List<Message>> conversationHistory = new ConcurrentHashMap<>();

    public String continueConversation(String sessionId, String userMessage) {
        List<Message> history = conversationHistory.computeIfAbsent(
            sessionId,
            k -> new ArrayList<>()
        );

        // Add user message to history
        history.add(new UserMessage(userMessage));

        // Create prompt with full conversation history
        Prompt prompt = new Prompt(history);
        ChatResponse response = chatClient.call(prompt);

        // Add AI response to history
        String aiMessage = response.getResult().getOutput().getContent();
        history.add(new AssistantMessage(aiMessage));

        return aiMessage;
    }

    public void clearConversation(String sessionId) {
        conversationHistory.remove(sessionId);
    }
}
```

Now the AI remembers context across requests. "Make it shorter" works because the AI knows what "it" refers to.

### Structured Output with Function Calling

Want JSON output instead of text? Use function calling:

```java
public record SummaryStructured(
    String summary,
    List<String> keyPoints,
    String sentiment
) {}

public SummaryStructured summarizeStructured(Article article) {
    String functionDefinition = """
        {
          "name": "create_summary",
          "description": "Create a structured summary",
          "parameters": {
            "type": "object",
            "properties": {
              "summary": { "type": "string" },
              "keyPoints": { 
                "type": "array",
                "items": { "type": "string" }
              },
              "sentiment": { 
                "type": "string",
                "enum": ["positive", "negative", "neutral"]
              }
            },
            "required": ["summary", "keyPoints", "sentiment"]
          }
        }
        """;

    OpenAiChatOptions options = OpenAiChatOptions.builder()
        .withFunction("create_summary", functionDefinition)
        .build();

    // ... make call and parse function result ...
}
```

The AI returns structured data you can parse reliably. No more regex parsing of text responses.

## Production Considerations

### Rate Limiting

OpenAI has rate limits. Implement your own to avoid surprises:

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

This uses the bucket4j library. Adjust the rate based on your OpenAI tier.

### Monitoring and Metrics

Track AI usage with Micrometer:

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

Export these to Prometheus, Datadog, or your monitoring tool of choice.

### Cost Tracking

AI isn't free. Track costs:

```java
public class CostCalculator {
    
    // GPT-4 pricing (as of 2024)
    private static final double INPUT_COST_PER_1K = 0.03;
    private static final double OUTPUT_COST_PER_1K = 0.06;

    public double calculateCost(int inputTokens, int outputTokens) {
        double inputCost = (inputTokens / 1000.0) * INPUT_COST_PER_1K;
        double outputCost = (outputTokens / 1000.0) * OUTPUT_COST_PER_1K;
        return inputCost + outputCost;
    }
}
```

Log this per request. You'll want to know which endpoints are expensive.

### Caching

Identical requests should return cached results:

```java
@Service
public class CachedSummarizerService {
    
    private final ArticleSummarizerService summarizerService;
    private final CacheManager cacheManager;

    @Cacheable(value = "summaries", key = "#request")
    public SummaryResponse summarize(SummaryRequest request) {
        return summarizerService.summarize(request);
    }
}
```

Use Redis for distributed caching in production. Spring Cache makes it trivial.

## Comparing Providers

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

The `ChatClient` interface stays the same. Only the configuration changes. This is huge for:
- Testing (use cheaper models in dev)
- Vendor lock-in avoidance
- Cost optimization (route requests based on complexity)

## Common Pitfalls and How to Avoid Them

### 1. Ignoring Token Limits

**Problem**: Sending 10,000-word articles to GPT-4 when it has an 8k token limit.

**Solution**: Truncate or chunk content. Know your model's limits.

### 2. Forgetting Temperature

**Problem**: Using temperature 1.0 for factual summaries gets creative (wrong) answers.

**Solution**: Use 0.0-0.3 for facts, 0.7-1.0 for creative content.

### 3. No Retry Logic

**Problem**: API calls fail. Your app crashes.

**Solution**: Use Spring Retry:

```java
@Retryable(
    value = AiServiceException.class,
    maxAttempts = 3,
    backoff = @Backoff(delay = 1000, multiplier = 2)
)
public SummaryResponse summarize(SummaryRequest request) {
    // ... implementation ...
}
```

### 4. Exposing Raw AI Responses

**Problem**: AI sometimes generates inappropriate or incorrect content.

**Solution**: Validate responses. Add moderation. Use guardrails.

```java
public SummaryResponse summarize(SummaryRequest request) {
    SummaryResponse response = summarizerService.summarize(request);
    
    if (containsInappropriateContent(response.summary())) {
        throw new ContentModerationException("Response failed content checks");
    }
    
    return response;
}
```

### 5. Hardcoding Prompts

**Problem**: Prompt engineering happens in Java strings. Changes require redeployment.

**Solution**: Store prompts in a database or configuration service. Load dynamically.

## Real-World Use Cases

Where does this actually make sense?

**Content Generation**:
- Blog summaries (like we built)
- Product descriptions
- Email drafts
- Social media posts

**Analysis**:
- Sentiment analysis
- Classification
- Entity extraction
- Translation

**Conversational Interfaces**:
- Customer support bots
- FAQ answering
- Document Q&A

**Code Assistance**:
- Code review suggestions
- Documentation generation
- Test case generation

The key is **augmentation, not replacement**. AI assists humans; it doesn't replace them (yet).

## Performance Tips

1. **Batch Requests**: If you need to summarize 100 articles, batch them. Send 10 articles per prompt.

2. **Use Faster Models for Simple Tasks**: GPT-3.5 is 10x cheaper and 2x faster than GPT-4. Use it for simple tasks.

3. **Async Processing**: Don't make users wait for AI. Use `@Async` and return job IDs:

```java
@Async
public CompletableFuture<SummaryResponse> summarizeAsync(SummaryRequest request) {
    return CompletableFuture.completedFuture(summarize(request));
}
```

4. **Prompt Caching**: Identical prompts hit the cache. Structure prompts to maximize cache hits.

5. **Local Models for Dev**: Use Ollama with Llama 2 locally. Zero cost, faster iteration.

## Wrapping Up

Spring AI brings AI to the Spring ecosystem in a way that feels... natural. It's not trying to reinvent everything in Java—it's leveraging what Spring does best: sensible abstractions, auto-configuration, and production-ready patterns.

The code we built today is more than a tutorial. It's a foundation. Add authentication, persist summaries, connect to your CMS, deploy to Kubernetes—it scales because it's Spring.

If you're a Java shop wondering how to add AI without rewriting everything in Python, this is your answer. Spring AI meets you where you are.

Try the code. Break it. Improve it. And when you deploy your first AI-powered Spring Boot app, drop a comment below. I want to hear what you built.

## Further Reading

- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Complete Example Code](https://github.com/yourusername/spring-ai-examples)

Now go build something intelligent.
