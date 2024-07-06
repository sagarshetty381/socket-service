import express from 'express';
import * as fs from 'fs';
import SocketService from "./src/services/socket.connection";
import http from "http";
import * as config from './config.json';
import { startMessageConsumer } from './src/services/kafka';
import path from 'path';

const cors = require('cors');
const router = express.Router();

const app = express();
app.use(express.json());
app.use(cors());

const modulesPath = path.join(__dirname, './src')
const apiBase = '/master/api';

app.use(router);

function initService() {
    // startMessageConsumer();
    initRoutes(modulesPath);
    const PORT = process.env.PORT ? process.env.PORT : config.port;
    const socketService = new SocketService();
    const httpServer = http.createServer(app);
    socketService.io.attach(httpServer);
    
    app.listen(PORT, () =>
        console.log(`HTTP Server started at PORT:${PORT}`)
    );

    socketService.initListeners();
}  

function initRoutes(filePath: string) {
    const folders = fs.readdirSync(filePath);
    folders.forEach(file => {
        const fullName = `${filePath}/${file}`;
        const stat = fs.lstatSync(fullName);
        const routeFilePath = fs.existsSync(process.env.NODE_ENV == 'prod' ? `${fullName}/${file}.route.js` : `${fullName}/${file}.route.ts`);
        if (stat.isDirectory() && routeFilePath) {
            const router = require(process.env.NODE_ENV == 'prod' ? `${fullName}/${file}.route.js` : `${fullName}/${file}.route.ts`).default;
            app.use(apiBase, router);
        } else if (stat.isDirectory()) {
            initRoutes(fullName);
        }
    });
}

initService();