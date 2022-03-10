import Dotenv from 'dotenv';
Dotenv.config();
import https from 'https';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import api from './src/api/index.js';

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('MongoDB connected!'))
  .catch((error) => console.log(error));

const option = {
  ca: fs.readFileSync(`${process.env.SSL_KEY_PATH}fullchain.pem`),
  key: fs.readFileSync(`${process.env.SSL_KEY_PATH}privkey.pem`),
  cert: fs.readFileSync(`${process.env.SSL_KEY_PATH}cert.pem`),
};

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', api);

const port = process.env.PORT || 4000;
// app.listen(port, '0.0.0.0', () => console.log(`[TEST] Server (port: ${port})`));
https.createServer(option, app).listen(port, () => console.log(`[HTTPS] Server (port: ${port})`));

export default app;
