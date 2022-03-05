import { Router } from 'express';
import auth from './auth/index.js';
import image from './image/index.js';
import post from './post/index.js';
import project from './project/index.js';

const api = new Router();

api.use('/auth', auth);
api.use('/post', post);
api.use('/project', project);
api.use('/image', image);

export default api;
