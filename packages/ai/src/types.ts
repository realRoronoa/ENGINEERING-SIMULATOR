export interface MentorRequestPayload {
  attemptId: string;
  learnerId: string;
  taskTitle: string;
  taskInstructions: string;
  taskMode: string;
  factSheet: string;
  message: string;
  conversationId?: string | null;
}

export interface MentorResponsePayload {
  reply: string;
  conversationId: string;
  groundedOn: string[];
}
