import { DailyMessages } from '../../models/daily-messages/daily-messages.interface';
import { Message } from '../../models/message/message.interface';
import { timestampToDate } from '../../../../shared/utils/timestamp-to-date/timestamp-to-date';

export function groupMessagesByDay(messages: Message[]): DailyMessages[] {
  const dailyMessagesByDay = new Map<string, DailyMessages>();
  for (const message of messages) {
    const date = timestampToDate(message.timestamp);
    const day = date.toDateString();
    const dailyMessages = dailyMessagesByDay.get(day) ?? { date, messageList: [] };
    dailyMessages.messageList.push(message);
    dailyMessagesByDay.set(day, dailyMessages);
  }
  return [...dailyMessagesByDay.values()];
}
