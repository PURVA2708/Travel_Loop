import { api } from '@/lib/api';

export type AssistantChatMessage = { role: 'user' | 'assistant'; content: string };

export type AssistantAction = { type: 'navigate'; path: string };

export type AssistantChatResponse = {
  reply: string;
  action: AssistantAction | null;
};

export async function chatWithAssistant(messages: AssistantChatMessage[]) {
  const { data } = await api.post<{ data: AssistantChatResponse }>('/ai/chat', { messages });
  return data.data;
}
