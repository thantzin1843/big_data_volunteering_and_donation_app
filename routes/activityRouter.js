import express from 'express';
import { createActivity, getActivityDetail, getAllActivities } from '../controllers/activityController.js';

const activityRouter = express.Router();

activityRouter.post('/', createActivity);
activityRouter.get('/', getAllActivities);// get all activities
activityRouter.get('/:id', getActivityDetail);// get all activities

export default activityRouter