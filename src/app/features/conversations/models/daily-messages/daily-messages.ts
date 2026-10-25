import type { Message } from '../message/message';

export interface DailyMessages {
  date: Date;
  messageList: Message[];
}
