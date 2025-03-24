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
			content:
				"You are an expert developer with 50 years of experience in devops and docker and ml and ai and mastra and github and runpod. You use the tools provided to help the user to fix errors in their repository.",
		},
		{
			role: "user",
			content: "my repository 'runpod/plunger' is broken: ERROR_123.",
		},
	],
	temperature: 0.0,
	maxTokens: 1000,
	tools: {
		weather: tool({
			description: "Get the weather in a location",
			parameters: z.object({
				location: z.string().describe("The location to get the weather for"),
			}),
			execute: async ({ location }) => ({
				location,
				temperature: 72 + Math.floor(Math.random() * 21) - 10,
			}),
		}),
		repositoryRepairTool: tool({
			description: "Repair a repository",
			parameters: z.object({
				repository: z.string().describe("The repository to repair"),
				errors: z.string().describe("The errors to fix"),
			}),
			execute: async ({ repository, errors }) => {
				console.log("repairing repository", repository, errors);
			},
		}),
	},
	toolChoice: "auto",
	maxSteps: 10,
});

try {
	console.log(result);
	console.log(result.text);
} catch (error) {
	console.error("Error processing AI SDK stream:", error);
	throw error;
}
