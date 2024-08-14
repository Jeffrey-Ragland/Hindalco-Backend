import express from 'express';
import { signup, login } from '../controller/sensor.js';

const router = express.Router();

router.get("/hindalcoSignup",signup);
router.post('/login', login);

export default router;