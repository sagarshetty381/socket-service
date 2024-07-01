import { Kafka, Producer } from 'kafkajs';
import fs from 'fs';
import path from 'path';
import prismaClient from './prisma';
import { KafkaTopics } from '../enums/socketEvents';
import * as config from '../../config.json';

const kafka = new Kafka({
    brokers: config.kafka.brokers,
    ssl: {
        ca: [fs.readFileSync(path.join(__dirname, "./ca.pem"), "utf-8")]
    },
    sasl: {
        username: config.kafka.username,
        password: config.kafka.password,
        mechanism: "plain"
    },
});

let producer: null | Producer = null;

export async function createProducer() {
    if (producer) return producer;

    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

export async function produceMessage(message: string) {
    const producer = await createProducer();
    await producer.send({
        topic: KafkaTopics.MESSAGES,
        messages: [{ key: `message-${Date.now()}`, value: message }]
    });
    return true;
}

export async function startMessageConsumer() {
    const consumer = kafka.consumer({ groupId: "default" });
    await consumer.connect();
    await consumer.subscribe({ topic: KafkaTopics.MESSAGES , fromBeginning: true});

    await consumer.run({
        autoCommit: true,
        eachMessage: async ({ message, pause }) => {
            if (!message.value) return;
            try {
                await prismaClient.message.create({
                    data: {
                        text: message?.value?.toString()
                    }
                })
            } catch (err) {
                console.log(err);
                pause();
                setTimeout(() => { consumer.resume([{ topic: KafkaTopics.MESSAGES }]) }, 60 * 1000);
            }
        }
    });
}

export default kafka;