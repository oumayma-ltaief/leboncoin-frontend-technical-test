import { Message } from '../message/message.interface';

export interface DailyMessages {
  date: Date;
  messageList: Message[];
}
