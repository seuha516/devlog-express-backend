import { Router } from 'express';
import * as authCtrl from './auth.ctrl.js';
import jwtMiddleware from '../../lib/jwtMiddleware.js';

const auth = new Router();

auth.post('/register', authCtrl.register);
auth.post('/login', authCtrl.login);
auth.get('/check', jwtMiddleware, authCtrl.check);
auth.get('/logout', authCtrl.logout);
auth.post('/checkid', authCtrl.checkid);

export default auth;
