---
title: "Deterministic AI Agents with Embabel, Spring Boot, and Spring AI"
published: 2026-09-04
description: "A practical guide to embabel with spring boot/spring ai"
category: "Embabel"
tags: ["Spring Boot", "Spring AI", "Java", "Artificial Intelligence", "Embabel"]
commentsEnabled: true
image: ./Tower-of-babel.jpg
draft: false 
lang: 'en'
---

# Deterministic AI Agents with Embabel, Spring Boot, and Spring AI

Most "agentic AI" today asks you to write prose. You drop a `SYSTEM_PROMPT.md` or an
`AGENTS.md` into your repo, hope the model reads every instruction carefully, and hope a
chain of free text steps produces the same result twice in a row. That's fine for a demo.
It can be frustrated or even worse it can fall apart the moment you need something a business can actually rely on like a refund logic,
shipping decisions, anything touching money or customer trust etc.

This guide, is a small Spring Boot application [Github](https://github.com/AlexanderArgyriou/customer-support-embabel) that models a customer support workflow including an order lookup, refund processing, shipping processing demonstrating
[Embabel](https://github.com/embabel/embabel-agent), a JVM native agent framework "from the Spring creator" designed to author agentic flows that mix LLM prompted interactions with ordinary code and domain models [1]. No instruction Markdown files, no hand rolled prompt pipelines, just Java classes, records, and annotations a compiler checks before an LLM ever runs. 

## Agents, Actions, and Goals: Not a Prompt Chain, a Domain Model

Embabel models a flow in terms of **actions** (steps an agent can take), **goals** (what the agent is trying to achieve), **conditions** (assessed before and after each action), and a **domain model** of objects that inform all three [1]. Concretely, an agent is a plain class annotated `@Agent`, `@Action` methods are the steps, `@AchievesGoal` marks the step that completes the flow. Here's the minimal agent in this project:

```java
@Agent(name = "HelloAgent", description = "Say hello to someone")
public class HelloAgent {
    record Person(String name) {}
    record Greeting(String message) {}

    @Action(description = "Derive a person from the input")
    public Person derivePerson(UserInput input, Ai ai) {
        return ai.withDefaultLlm().createObject(
                String.format("derive person's name from the input: %s", input),
                Person.class);
    }

    @Action(description = "Generate a greeting for a person")
    @AchievesGoal(description = "Someone has been greeted")
    public Greeting generateGreeting(Person person, Ai ai) {
        return new Greeting(String.format("Hello %s", person.name()));
    }
}
```

There's no orchestration file describing step order. Embabel infers it from the method
signatures: `derivePerson` turns a `UserInput` into a `Person`, `generateGreeting` turns a
`Person` into a `Greeting`. The framework's planner reads these type level pre/post
conditions and assembles a path from start state to goal itself.

## GOAP: Planning Is a Real Algorithm, Not a Script

This is the part most agent frameworks skip. Embabel's default planning strategy is
**Goal Oriented Action Planning (GOAP)**, an A* algorithm implementation that selects and sequences actions dynamically based on current state and target goals [1][2]. Rather than a hardcoded finite state machine or a linear prompt chain, the platform re plans after *every* action completes,effectively running an OODA loop (Observe, Orient, Decide, Act), so it can react to new information the previous step produced [1]. This is also why adding new actions, goals, or domain objects extends what the system can do *without editing existing flow definitions*: the planner just has more moves available on its next search.

## Strong Typing as a Guardrail

Every action in `CustomerSupportAgent` consumes and produces a strongly typed Java record: `OrderInfo`, `OrderStatus`, `TaskOutput`:

```java
record OrderInfo(String orderId) { ... }
record OrderStatus(Status status) { }
record TaskOutput(String taskId, String orderId, String gatheredInfo) { }

@Action(description = "Extracts order information from user input")
public OrderInfo extract(UserInput userInput, OperationContext context) {
    return context.ai().withDefaultLlm().createObject(
            String.format("Extract the order number from input : %s", userInput),
            OrderInfo.class);
}
```

`createObject` constrains generation to the record's shape and deserializes directly into a real object. No more magic maps, as Embabel's own documentation puts it, describing strong typing and full refactoring support as a core differentiator versus other agent frameworks [1]. If the model can't produce a valid `OrderInfo`, the action fails visibly instead of quietly corrupting whatever runs next. Compare that to prompt chaining setups where the "contract" between steps is an English sentence in a `.md` file nobody enforces.

## Tools Live on the Objects That Own Them

Embabel exposes tools two ways: automatically, from methods on domain objects already in scope, and explicitly, via `PromptRunner.withToolObjects(...)` for anything additional [3]. This project uses the latter, scoping a tool to a single record instance:

```java
record OrderInfo(String orderId) {
    @Tool(description = "Retrieve order status for the given order")
    public Status getOrderStatus() {
        var statuses = Status.values();
        return statuses[ThreadLocalRandom.current().nextInt(statuses.length)];
    }
}

@Action(description = "Retrieves the status of an order")
public OrderStatus getOrderStatus(OrderInfo orderInfo, OperationContext context) {
    return context.ai().withDefaultLlm()
            .withToolObjects(List.of(orderInfo))
            .createObject(
                    String.format("Call the getOrderStatus tool for order %s and report the result as JSON.", orderInfo),
                    OrderStatus.class);
}
```

`@Tool` here is the standard Spring AI annotation [4]. Embabel extracts tool definitions from annotated instance methods and hands the LLM only what's on the object passed in. The model never sees a global bag of unrelated capabilities, it sees exactly the tool surface of the domain object relevant to the current step, the same way you'd scope an API in ordinary OO design.

## Deterministic Branching, Not Prompted Branching

`handleSupport` is regular code instead of asking the LLM to reason about control flow in prose:

```java
@Action(description = "Orchestrates order processing tasks")
public TaskOutput handleSupport(OrderInfo orderInfo, OrderStatus orderStatus, OperationContext context) {
    var taskId = UUID.randomUUID().toString();
    context.bind(TASK_ID, taskId);

    return switch (orderStatus.status()) {
        case PENDING   -> RunSubagent.fromAnnotatedInstance(shippingAgent, TaskOutput.class);
        case CANCELLED -> RunSubagent.fromAnnotatedInstance(refundAgent, TaskOutput.class);
        case SHIPPED   -> new TaskOutput(taskId, orderInfo.orderId(), "Order is shipped");
        default -> throw new IllegalStateException("Unexpected value: " + orderStatus);
    };
}
```

The LLM's job already finished one step earlier, when `extract` and `getOrderStatus`
produced typed values. Once `orderStatus.status()` is a Java enum, branching is a compiler checked `switch`, not a prompted decision. There's no risk of the model "changing its mind" about which path to take, because the branching logic lives in bytecode, not tokens.

## Subagents as First Class Delegation

`RefundAgent` and `ShippingAgent` are nested classes independently annotated `@Agent`, each with their own `@AchievesGoal` action. `CustomerSupportAgent` doesn't inline their behavior it delegates via `RunSubagent.fromAnnotatedInstance(instance, ReturnType.class)`, the documented way to invoke a subagent from an existing `@Agent` annotated instance [5], passing shared state through `context.bind()` / `context.get()` instead of string concatenation:

```java
@Agent(name = "RefundAgent", description = "Handles refund related tasks")
static class RefundAgent {
    @Action(description = "Processes a refund for the given order")
    @AchievesGoal(description = "Handles the refund process for an order")
    public TaskOutput processRefund(OrderInfo orderInfo, OperationContext context) {
        return new TaskOutput(context.get(TASK_ID).toString(), orderInfo.orderId(), "Refund processed");
    }
}
```

One important nuance from Embabel's own docs: `RunSubagent` results must be *returned*, not consumed afterward in the same method, the call transfers control to the subagent's plan, so code following it in the same branch won't run [5]. Each subagent stays independently testable and reasoned about, with its own narrow goal.

## What This Buys You

Strongly typed records as the only currency between steps, tools scoped to the objects that own them, GOAP driven planning instead of scripted prompt chains, subagents as ordinary delegated collaborators. Spring AI supplies the LLM plumbing.(`embabel-agent-starter`, configured here against a
local Ollama model via `embabel.models.default-llm=qwen3-coder:latest`), while Embabel adds the planning and typing layer on top. The result is an agent architecture you can actually put in a PR review, because it's just Java, no Markdown file of instructions to keep in sync, no hoping the model followed prose it may or may not have fully read.

## References

1. Embabel Agent — README, GitHub. https://github.com/embabel/embabel-agent
2. Chaudhari, V. "Goal Oriented Action Planning." Medium. https://medium.com/@vedantchaudhari/goal-oriented-action-planning-34035ed40d0b
3. Embabel Agent Reference Documentation — Tools. https://docs.embabel.com/embabel-agent/guide/1.5.0-SNAPSHOT/
4. Spring AI Reference Documentation — Tool Calling (`@Tool` annotation). https://docs.spring.io/spring-ai/reference/api/tools.html
5. Embabel Agent — `RunSubagent` API annotations reference. https://github.com/embabel/embabel-agent (embabel-agent-docs/src/main/asciidoc/reference/annotations/page.adoc)
