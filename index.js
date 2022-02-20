import Dotenv from 'dotenv';
Dotenv.config();
import https from 'https';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import fs from 'fs';
import api from './src/api/index.js';
import Image from './src/models/Image.js';
import jwtMiddleware from './src/lib/jwtMiddleware.js';

//MONGO DB 연결
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected!');
  })
  .catch((error) => console.log(error));

const app = express();

const option = {
  ca: fs.readFileSync('fullchain.pem'),
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('cert.pem'),
};

//cors, bodyParser, cookieParser, jwtMiddleware;
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(jwtMiddleware);

//multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
app.get('/get/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const imageData = await Image.findById(id).exec();
    if (!imageData) return res.status(404).json();
    const imageURL = imageData.img;
    fs.writeFileSync(`./images/${id}.png`, imageURL);
    fs.readFile(`./images/${id}.png`, function (err, data) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.write(data);
      res.end();
    });
  } catch (e) {
    return res.status(500).json();
  }
});
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const img = req.file.buffer;
    if (img.truncated) return res.status(413);
    const image = new Image({ img });
    await image.save();
    return res.json(`${image._id}`);
  } catch (e) {
    return res.status(500);
  }
});
app.get('/backupimage', async (req, res) => {
  try {
    const data = await Image.find().exec();
    let result = data.map((x) => {
      let id = x._id;
      let value = x.img;
      return { id, value };
    });
    return res.json(result);
  } catch (e) {
    return res.status(500).json();
  }
});

//라우팅
app.get('/', (req, res) => res.send('Hello!')); //for Test
app.use('/api', api);

//서버 켜기
const port = process.env.PORT || 4000;
https.createServer(option, app).listen(port, () => {
  console.log(`[HTTPS] Server is started on port ${port}`);
});

export default app;
