import { createOpenAI } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.development" });

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
				"You are a helpful assistant that can answer questions and help with tasks. you can use tools if they are needed to answer the questions of the user, but if the tools is not needed, then you just answer the question",
		},
		{
			role: "user",
			content: "what is weather in Berlin Charlottenburg?",
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
