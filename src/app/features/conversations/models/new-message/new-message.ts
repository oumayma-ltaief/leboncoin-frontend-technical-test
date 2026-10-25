import type { Message } from '../message/message';

export type NewMessage = Omit<Message, 'id'>;
