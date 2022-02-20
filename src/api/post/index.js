import { Router } from 'express';
import * as postCtrl from './post.ctrl.js';

const post = new Router();

post.get('/list', postCtrl.list);
post.post('/write', postCtrl.write);
post.get('/read/:id', postCtrl.checkObjectId, postCtrl.read);
post.delete('/remove/:id', postCtrl.checkObjectId, postCtrl.remove);
post.patch('/update/:id', postCtrl.checkObjectId, postCtrl.update);
post.get('/series/:series', postCtrl.series);
post.get('/getlist', postCtrl.getlist);
post.get('/backup', postCtrl.backup);

export default post;
