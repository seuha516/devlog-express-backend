import { Router } from 'express';
import multer from 'multer';
import * as imageCtrl from './image.ctrl.js';
import checkObjectId from '../../lib/checkObjectId.js';
import jwtMiddleware from '../../lib/jwtMiddleware.js';

const image = new Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

image.get('/:id', checkObjectId, imageCtrl.read);
image.post('/', jwtMiddleware, upload.single('image'), imageCtrl.write);

export default image;
