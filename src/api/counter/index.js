import { Router } from 'express';
import * as counterCtrl from './counter.ctrl.js';

const counter = new Router();

counter.get('/add', counterCtrl.add);
counter.get('/list', counterCtrl.list);
counter.get('/backup', counterCtrl.backup);

export default counter;
