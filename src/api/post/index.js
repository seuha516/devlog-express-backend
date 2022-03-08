import { Router } from 'express';
import * as postCtrl from './post.ctrl.js';
import checkObjectId from '../../lib/checkObjectId.js';
import jwtMiddleware from '../../lib/jwtMiddleware.js';

const post = new Router();

post.get('/catalog', postCtrl.catalog);
post.get('/', postCtrl.list);
post.post('/', jwtMiddleware, postCtrl.write);
post.get('/:id', checkObjectId, postCtrl.read);
post.delete('/:id', jwtMiddleware, checkObjectId, postCtrl.remove);
post.patch('/:id', jwtMiddleware, checkObjectId, postCtrl.update);
post.post('/:id/like', checkObjectId, postCtrl.like);
post.post('/:id/comment/write', checkObjectId, postCtrl.writeComment);
post.post('/:id/comment/remove', checkObjectId, postCtrl.removeComment);

export default post;
