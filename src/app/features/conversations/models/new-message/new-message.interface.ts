import { Message } from '../message/message.interface';

export type NewMessage = Omit<Message, 'id'>;
