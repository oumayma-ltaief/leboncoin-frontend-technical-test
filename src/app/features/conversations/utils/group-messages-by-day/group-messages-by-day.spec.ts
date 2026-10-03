import { Message } from '../../models/message/message.interface';

import { groupMessagesByDay } from './group-messages-by-day';

const MILLISECONDS_PER_SECOND = 1000;

describe('groupMessagesByDay', () => {
  function createMessageSentOn(date: Date, id: number): Message {
    return { authorId: 1, body: 'Hello', conversationId: 1, id, timestamp: date.getTime() / MILLISECONDS_PER_SECOND };
  }

  it('should group the messages sent the same day together, keeping the order of the days and of the messages', () => {
    const firstDayMorningMessage = createMessageSentOn(new Date(2021, 6, 7, 9), 1);
    const firstDayEveningMessage = createMessageSentOn(new Date(2021, 6, 7, 21), 2);
    const nextDayMessage = createMessageSentOn(new Date(2021, 6, 8, 9), 3);
    const dailyMessageList = groupMessagesByDay([firstDayMorningMessage, firstDayEveningMessage, nextDayMessage]);
    expect(dailyMessageList.map((dailyMessages) => dailyMessages.messageList)).toEqual([
      [firstDayMorningMessage, firstDayEveningMessage],
      [nextDayMessage]
    ]);
    expect(dailyMessageList.map((dailyMessages) => dailyMessages.date.getDate())).toEqual([7, 8]);
  });
});
