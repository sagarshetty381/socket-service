import express from 'express';
import * as fs from 'fs';
import SocketService from "./src/services/socket.connection";
import http from "http";
import * as config from './config.json';
import { startMessageConsumer } from './src/services/kafka';

const cors = require('cors');
const router = express.Router();

const app = express();
app.use(express.json());
app.use(cors());

const modulesPath = './src';
const apiBase = '/master/api';

initRoutes(modulesPath);
app.use(router);

app.listen(config.masterPort, () => console.log(`Socket Server is running on ${config.masterPort}`));

function initService() {
    // startMessageConsumer();
    const PORT = process.env.PORT ? process.env.PORT : config.socketPort;
    const httpServer = http.createServer();

    const socketService = new SocketService();
    socketService.io.attach(httpServer);
    httpServer.listen(PORT, () =>
        console.log(`HTTP Server started at PORT:${PORT}`)
    );

    socketService.initListeners();
}

function initRoutes(filePath: string) {
    const folders = fs.readdirSync(filePath);
    folders.forEach(file => {
        const fullName = `${filePath}/${file}`;
        const stat = fs.lstatSync(fullName);
        const routeFilePath = fs.existsSync(`${fullName}/${file}.route.ts`);

        if (stat.isDirectory() && routeFilePath) {
            const router = require(`${fullName}/${file}.route.ts`).default;
            app.use(apiBase, router);
        } else if (stat.isDirectory()) {
            initRoutes(fullName);
        }
    });
}

initService();