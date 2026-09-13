import { Router } from 'express';
import multer from 'multer';
import * as imageCtrl from './image.ctrl.js';
import checkObjectId from '../../lib/checkObjectId.js';
import jwtMiddleware from '../../lib/jwtMiddleware.js';

const image = new Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
    }
    return cb(null, true);
  },
});

image.get('/:id', checkObjectId, imageCtrl.read);
image.post('/', jwtMiddleware, upload.single('image'), imageCtrl.write);

export default image;
