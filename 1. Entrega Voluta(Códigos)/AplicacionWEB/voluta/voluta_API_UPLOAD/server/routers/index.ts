import { Router } from "express";

import uploadRouter from './upload.routes';


const router: Router = Router();

    router.use(uploadRouter);

export default router; 

