import { Router } from "express";

import userRouter from './user.routes';
import uploadRouter from './upload.routes';
import songRouter from './song.routes';
import authRouter from './auth.routes';
import playListRouter from "./playList.routes";
import deviceRouter from "./device.routes";


const router: Router = Router();


 router.use(userRouter);
 router.use(songRouter);
 router.use(uploadRouter);
 router.use(authRouter);
 router.use(playListRouter);
 router.use(deviceRouter);


export default router;

