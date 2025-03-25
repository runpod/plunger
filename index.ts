import { createOpenAI } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env" });

// Create a custom OpenAI provider with the AI SDK
const openai = createOpenAI({
	apiKey: process.env.RUNPOD_API_KEY,
	baseURL: `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/openai/v1`,
});

// Create the stream using the AI SDK
const result = await generateText({
	model: openai(process.env.RUNPOD_MODEL_NAME as string),
	messages: [
		{
			role: "system",
			content: `
You are an expert developer with 50 years of experience in devops and docker and ml and ai and mastra and github and runpod. 
You fix the errors until everything is resolved and provide the user with how you fixed the errors.

# IMPORTANT

follow these steps:

1. always checkout the repository with the gitCheckoutTool, so you have the repository in your local machine
2. check & fix the errors with the repositoryRepairTool
3. provide the user with how you fixed the errors

# output format

\`\`\`json
{
	"repository": "runpod/plunger",
	"errors": "ERROR_123",
	"solution": "SOLUTION_123"
}
\`\`\`
`,
		},
		{
			role: "user",
			content: `my repository 'runpod/plunger' is broken: ERROR_123.`,
		},
	],
	temperature: 0.0,
	maxTokens: 1000,
	tools: {
		gitCheckoutTool: tool({
			description: "Checkout a repository",
			parameters: z.object({
				repository: z.string().describe("The repository to checkout"),
			}),
			execute: async ({ repository }) => {
				console.log("checking out repository", repository);

				return `
{
	"repository": "${repository}",
	"success": true
}
`;
			},
		}),
		repositoryRepairTool: tool({
			description: "Repair a repository",
			parameters: z.object({
				repository: z.string().describe("The repository to repair"),
				errors: z.string().describe("The errors to fix"),
			}),
			execute: async ({ repository, errors }) => {
				console.log("repairing repository", repository, errors);

				return `
{
	"repository": "${repository}",
	"success": true,
	"report": "the error was fixed"
}
`;
			},
		}),
	},
	toolChoice: "auto",
	maxSteps: 10,
});

try {
	console.log(JSON.stringify(result.response.messages, null, 2));
	console.log(result.text);
} catch (error) {
	console.error("Error processing AI SDK stream:", error);
	throw error;
}
