import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type {
  MessageParam,
  Tool,
  ToolResultBlockParam,
} from "@anthropic-ai/sdk/resources/messages";
import { getClient, getModel } from "../llm.js";
import type { Agent, AgentName, AgentResponse, AgentTool } from "../types.js";

const agentResponseSchema = z.object({
  answer: z.string(),
  facts: z.array(z.string()),
});

const MAX_TOOL_ROUNDS = 5;

// Shared logic for every agent
export abstract class BaseAgent implements Agent {
  abstract readonly name: AgentName;
  protected abstract readonly role: string;
  protected abstract readonly context: string;

  // The only tools this agent may use
  protected abstract readonly tools: AgentTool[];

  private buildSystemPrompt(): string {
    return [
      `You are the ${this.role} at Ami Comp.`,
      `Context: ${this.context}`,
      `Use your tools to fetch data before answering.`,
      `Use only facts returned by your tools.`,
      `Do not add outside knowledge, benchmarks, assumptions, causes, or missing information.`,
      `You may make conclusions only when they are directly supported by the tool data.`,
      `If the tools do not contain the answer, say so clearly.`,
      `Keep the answer short. In "facts", list the exact data points you used.`,
    ].join("\n");
  }

  // convert our tools into the Anthropic tool format
  private toAnthropicTools(): Tool[] {
    return this.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: { type: "object", properties: {}, required: [] },
    }));
  }

  // runs a tool by name - but only if it belongs to this agent!
  private runTool(name: string): unknown {
    const tool = this.tools.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`${this.name} agent has no tool named "${name}".`);
    }
    return tool.run();
  }

  async answer(question: string): Promise<AgentResponse> {
    const client = getClient();
    const model = getModel("smart");
    const anthropicTools = this.toAnthropicTools();
    const messages: MessageParam[] = [{ role: "user", content: question }];

    // agent call tools multiple times until it has enough information
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await client.messages.create({
        model,
        max_tokens: 1024,
        system: this.buildSystemPrompt(),
        messages,
        tools: anthropicTools,
      });

      const toolUses = response.content.filter((b) => b.type === "tool_use");

      // the model is ready to give its final answer
      if (toolUses.length === 0) break;

      messages.push({ role: "assistant", content: response.content });

      const toolResults: ToolResultBlockParam[] = toolUses.map((use) => ({
        type: "tool_result",
        tool_use_id: use.id,
        content: JSON.stringify(this.runTool(use.name)),
      }));

      messages.push({ role: "user", content: toolResults });
    }

    // Final call
    const final = await client.messages.parse({
      model,
      max_tokens: 1024,
      system: this.buildSystemPrompt(),
      messages,
      output_config: { format: zodOutputFormat(agentResponseSchema) },
    });

    if (!final.parsed_output) {
      throw new Error(`${this.name} agent returned no structured answer.`);
    }

    return { agent: this.name, ...final.parsed_output };
  }
}
