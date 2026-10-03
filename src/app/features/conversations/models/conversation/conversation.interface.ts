export interface Conversation {
  id: number;
  lastMessageTimestamp: number;
  recipientId: number;
  recipientNickname: string;
  senderId: number;
  senderNickname: string;
}
