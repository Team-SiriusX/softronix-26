import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";

// Infer types from the Hono route
type RequestType = InferRequestType<typeof client.api.clerk.$post>["json"];
type ResponseType = InferResponseType<typeof client.api.clerk.$post>;

export const useSendChatMessage = () => {
  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (data) => {
      const response = await client.api.clerk.$post({
        json: data,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return await response.json();
    },
  });
};
