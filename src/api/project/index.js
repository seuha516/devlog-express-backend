import { Router } from 'express';
import * as projectCtrl from './project.ctrl.js';

const project = new Router();

project.get('/list', projectCtrl.list);
project.post('/write', projectCtrl.write);
project.get('/read/:id', projectCtrl.checkObjectId, projectCtrl.read);
project.delete('/remove/:id', projectCtrl.checkObjectId, projectCtrl.remove);
project.patch('/update/:id', projectCtrl.checkObjectId, projectCtrl.update);
project.get('/getlist', projectCtrl.getlist);
project.get('/backup', projectCtrl.backup);

export default project;
