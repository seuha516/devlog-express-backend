import { Router } from 'express';
import * as projectCtrl from './project.ctrl.js';
import checkObjectId from '../../lib/checkObjectId.js';
import jwtMiddleware from '../../lib/jwtMiddleware.js';

const project = new Router();

project.get('/catalog', projectCtrl.catalog);
project.get('/', projectCtrl.list);
project.post('/', jwtMiddleware, projectCtrl.write);
project.get('/:id', projectCtrl.read);
project.delete('/:id', jwtMiddleware, checkObjectId, projectCtrl.remove);
project.patch('/:id', jwtMiddleware, checkObjectId, projectCtrl.update);
project.post('/:id/like', checkObjectId, projectCtrl.like);
project.post('/:id/comment/write', checkObjectId, projectCtrl.writeComment);
project.post('/:id/comment/remove', checkObjectId, projectCtrl.removeComment);

export default project;
