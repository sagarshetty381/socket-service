import { Router } from 'express';
import AuthService from './auth.service';
import { JWTAuth } from '../../helper/jwtAuth';
import * as config from '../../../config.json';

const router = Router();

const loginMiddleware = [
    new JWTAuth().verify(config.jwt.secret)
];

router.get('/auth/v1/ping', AuthService.ping);
router.post('/auth/v1/login', AuthService.loginUser);
router.post('/auth/v1/register', AuthService.registerUser);
router.post('/auth/v1/logout', loginMiddleware, AuthService.logoutUser);

export default router;