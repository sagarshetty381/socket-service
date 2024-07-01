import { Router } from 'express';
import userService from './user.service';
import multer from 'multer';
import { JWTAuth } from '../../helper/jwtAuth';
import * as config from '../../../config.json';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const loginMiddleware = [
    new JWTAuth().verify(config.jwt.secret)
];

const router = Router();

router.post('/user/v1/save-user-details', loginMiddleware, userService.registerUser);
router.post('/user/v1/uploadImage', [...loginMiddleware, upload.any()], userService.uploadImage);
router.post('/user/v1/update-profile-details', loginMiddleware, userService.updateProfileDetails);
router.post('/get-user-details',);

export default router;