import { Router } from 'express';
//install express to stop error: 
//npm i --save-dev @types/express
const router = Router();
import weatherRoutes from './weatherRoutes.js';
router.use('/weather', weatherRoutes);
export default router;
