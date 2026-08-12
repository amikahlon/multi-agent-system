# Multi-Agent System

A simple TypeScript app with two AI agents: Finance and HR.

A router reads the question and decides if it needs Finance, HR, both agents, or no agent.

Built with the Claude API.

## How It Works

```text
Question
   ↓
Router
   ↓
Finance / HR / Both / None
   ↓
Agent Tools
   ↓
Orchestrator (if both are selected)
   ↓
Final Answer
```

For example:

- `"What is our monthly revenue?"` → Finance
- `"How many open roles do we have?"` → HR
- `"Should we hire more people?"` → Finance + HR
- `"What roles are open at Microsoft?"` → No agent

## Design Decisions

- **Separate agents** - Finance and HR have their own roles, data and tools.
- **Limited access** - each agent can only call its own tools. Finance cannot access HR tools and HR cannot access Finance tools.
- **Tool use** - agents use tools to get the data they need instead of getting all company data in the prompt.
- **Router** - selects only the agents needed for the question. It can also select no agent for an out-of-scope question.
- **Orchestrator** - if both agents are selected, they run in parallel and the `Orchestrator` function combines their answers into one recommendation.
- **Structured output** - Zod schemas are used to keep Claude responses in a clear and valid format.
- **Model choice** - a fast model is used for routing and a stronger model is used for agent answers and recommendations.

## How to Run

You need Node.js 20+ and an Anthropic API key.

```bash
npm install
cp .env.example .env
```

Add your API key to `.env`:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

Run the project:

```bash
npm run dev
```

You can change the test question in `src/index.ts`:

```ts
const DEMO_QUESTIONS = ["Should we hire more people?"];
```

Or ask a question directly:

```bash
npm run dev -- "How many open roles do we have?"
```

The terminal shows which agents were selected, why they were selected, and the final answer.

## Data

For this demo, Finance and HR data are stored in local JSON files.

The same tools could later connect to real databases or APIs.
