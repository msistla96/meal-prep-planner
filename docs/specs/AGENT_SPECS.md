# AGENT SPECIFICATIONS

## How should agent run?
- Run as a separate process that keeps tabs on grocery lists and items that can expire. Limit how long it runs without doing anything otherwise it can take up memory.


## What can agent do?
- Grocery Lists
- Grocery Items
- Meal plans


## Lifecycle of an agent

New User

Agent prerequisites
- User created and registered
- Atleast one grocery list
    - Are expiry dates needed? 
    - If optional, how does agent handle?
- User Profile
- Tools


Existing User

Agent prerequisites
- Atleast one grocery list
    - Are expiry dates needed? 
    - If optional, how does agent handle?
- User Profile
- Tools
- User past meal plans
- User history with agent

Example workflow of agent


## Framework

Uses single agent for now

Langchain - 
Langgraph - Used for agents that follow a graph like step thinking
Agent SDKs - Strands, Claude, Open Router, Codex
Own implementation - Have to manage state, memory and multi turn.

## LLM choice

Open source models
- GPT
- Kimi
- Qwen
etc

Use Open Router for now so that it can dynamically change models
    - Need to see effect on responses.
Or use one model by default. Research free tier limits or consider hosting locally.

Open Router SDK vs API - pros vs cons


## Future Work

## Capability level

Agent error handling
- If agent crashes?
- Self healing agent?
    - May need cloud deployment for this.

- If user hasn't used app for a long time?

- Restrict Agent's permissions on DB level
    - Delete operations
    - Edit operations for certain models.

How does Grocery list get scanned?
- OCR/PDF parser or Apple/third party notes app? Or multi modal LLM?
    - If parser doing decent,  no need for LLM yet.
- Integration with grocery apps like Doordash
    - Applied for early cli access, pending approval.

How does user actions influence agent?
    - Correct number of items in grocery list after agent presents meal plan
    - User actions like deleting plan, updating profile etc.
    - Handle advanced memory management.

Multi agents?

- Experiment with updating UI based on type of meal plan - A2UI?
- Learn from user inputs and preferences i.e user uses tomatoes a lot in their food, user likes to eat high protein versions of calorie foods like mac and cheese etc.
- Act on Grocery Item alerts - keep as separate async job that checks expiry dates and alerts. Requires experimenting with DoorDash CLI or any other grocery store CLI.

Refactor codebase


### Production level

How to setup distribution and deployment
    - Web app hosted on cloud?
    - Local Docker for testing e2e

Monitoring agent actions and responses

Guardrails before agent
    - Agent should not answer about unrelated questions.
    - Agent should 