import { openRouter } from "@/lib/open-router";
import type { Message } from "@openrouter/sdk/models";
import { tools } from "./config";
import { extractProviderErrorMessage } from "./utils";


// model: "nvidia/nemotron-3-nano-30b-a3b:free",
export async function sendOpenRouterChat(messages: Message[]) {
    try {
        return await openRouter.chat.send({
            chatGenerationParams: {
                model: "nvidia/nemotron-3-nano-30b-a3b:free",
                messages,
                tools,
                toolChoice: "auto",
            },
        });
    } catch (error) {
        const providerErrorMessage = extractProviderErrorMessage(error);
        if (providerErrorMessage) {
            throw new Error(`OpenRouter request failed: ${providerErrorMessage}`);
        }

        throw error;
    }
}
