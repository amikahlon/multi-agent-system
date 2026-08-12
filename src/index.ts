import { ask } from "./ask.js";

const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

// ###############################################################################
const DEMO_QUESTIONS = [
  "Should we hire more people?",
  // "What roles are open at Microsoft?",
];
// ###############################################################################

async function main(): Promise<void> {
  const custom = process.argv.slice(2).join(" ").trim();
  const questions = custom ? [custom] : DEMO_QUESTIONS;

  for (const question of questions) {
    console.log("\n" + "=".repeat(70));
    console.log(`Q: ${question}`);

    const { decision, result } = await ask(question);

    console.log(`Route: [${decision.agents.join(", ")}] - ${decision.reason}`);

    if ("finalRecommendation" in result) {
      // Joint recommendation
      for (const response of result.responses) {
        console.log(`\n  [${response.agent}] ${response.answer}`);
      }

      console.log(
        `\n  >> Joint recommendation:\n  ${GREEN}${result.finalRecommendation}${RESET}`,
      );
    } else if ("agent" in result) {
      // Single agent answer
      console.log(`\n  [${result.agent}] ${GREEN}${result.answer}${RESET}`);

      console.log(`  Facts: ${result.facts.join("; ")}`);
    } else {
      // No relevant agent
      console.log(`\n  ${GREEN}${result.answer}${RESET}`);
      console.log(`  [log only] ${result.internalReason}`);
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
