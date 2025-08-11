import express from 'express';
import { login, register, updateWallet } from '../controllers/organizationController.js';

const organizationRouter = express.Router();

organizationRouter.post('/register', register);
organizationRouter.post('/login',login);

// update wallet
organizationRouter.put('/updateWallet',updateWallet);

export default organizationRouter