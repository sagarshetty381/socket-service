import Redis from "ioredis";
import * as config from '../../config.json';
import { RedisChannels } from "../enums/socketEvents";

class RedisService {
    public pub;
    public sub;

    constructor() {
        this.pub = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password
        });
        this.sub = new Redis({
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password
        });
        this.sub.subscribe(RedisChannels.Messages);
        this.sub.subscribe(RedisChannels.Register);
    }
}

export default RedisService;