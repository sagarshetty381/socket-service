import { RedisChannels, SocketEvents } from "../enums/socketEvents";
import RedisService from "./redis";
import * as config from '../../config.json';
import { produceMessage } from "./kafka";

class SocketEventListener {
  public users = {};
  public activeUserIds = new Set([]);
  public numberOfQuestions = 5;

  constructor(public io, public socket, public redis: RedisService) {
  }

  public sendMessage = () => {
    this.socket.on(SocketEvents.SendingMessage, async ({ message, userId }: { message: string, userId: string }) => {

      // publish this message to redis
      this.socket.emit(SocketEvents.MessageToUser, { message, by: 'sender' });
      await this.redis.pub.publish(RedisChannels.Messages, JSON.stringify({ message, socketIds: [this.users[userId]] }));
    });
  }

  public userLoggedIn = () => {
    this.socket.on(SocketEvents.UserLoggedIn, async ({ userId }: { userId: string }) => {
      await this.redis.pub.publish(RedisChannels.Register, JSON.stringify({ userId, socketId: this.socket.id }));
    });
  }

  public sessionJoined = () => {
    this.socket.on(SocketEvents.SessionJoined, async (userId) => {
      this.activeUserIds.add(userId);
      this.io.emit(SocketEvents.LiveUsersList, [...this.activeUserIds]);
    });
  }

  public sessionLeft = () => {
    this.socket.on(SocketEvents.SessionLeft, async (userId) => {
      this.activeUserIds.delete(userId);
      this.io.emit(SocketEvents.LiveUsersList, [...this.activeUserIds]);
    });
  }

  public initiateCall = () => {
    this.socket.on(SocketEvents.InitiateCall, (data) => {
      this.io.to(this.users[data.userToCall]).emit(SocketEvents.InitiateCall, { signal: data.signalData, from: data.from, name: data.name })
    })
  }

  public answerCall = () => {
    this.socket.on(SocketEvents.ReceiveCall, (data) => {
      const matchQues = this.getQuestionSet();
      this.io.to(data.to).emit(SocketEvents.CallAccepted, data.signal)
      this.io.to(data.to).emit(SocketEvents.SessionQuestions, matchQues);
      this.socket.emit(SocketEvents.SessionQuestions, matchQues);
    })
  }

  public initRedisSubEvent() {
    this.redis.sub.on('message', async (channel, data: any) => {
      if (channel === RedisChannels.Messages) {
        data = JSON.parse(data);
        this.io.to(data.socketIds).emit(SocketEvents.MessageToUser, { message: data.message, by: 'receiver' });

        await produceMessage(JSON.stringify(data));
      } else if (channel === RedisChannels.Register) {
        data = JSON.parse(data);
        this.users[data?.userId] = data.socketId;
      }
    });
  }

  public getQuestionSet() {
    const questions = [...config.sessionQuestions];
    const question = [];
    for (let i = 0; i < this.numberOfQuestions; i++) {
      question.push(questions[Math.floor(Math.random() * questions.length)])
    }
    return question;
  }
}

export default SocketEventListener;