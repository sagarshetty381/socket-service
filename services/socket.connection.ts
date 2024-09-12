import { Server } from "socket.io";
import SocketEventListener from "./socket.events";
import RedisService from "./redis";

class SocketService {
  private _io: Server;
  public socketEvent : any;

  constructor() {
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
  }

  public initListeners() {
    const io = this.io;

    io.on("connect", (socket) => {
      const redis = new RedisService();

      this.socketEvent = new SocketEventListener(io, socket, redis);
      this.socketEvent.initRedisSubEvent();
      this.socketEvent.sendMessage();
      this.socketEvent.userLoggedIn();
      this.socketEvent.sessionJoined();
      this.socketEvent.sessionLeft();
      this.socketEvent.initiateCall();
      this.socketEvent.answerCall();

      socket.on("disconnect", () => { 
      })
    });

  }

  get io() {
    return this._io;
  }
}

export default SocketService;