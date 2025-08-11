import express from 'express'
import { connectToDB } from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv'
import userRouter from './routes/userRouter.js';
import organizationRouter from './routes/organizationRouter.js';
import activityRouter from './routes/activityRouter.js';

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config()
const PORT = process.env.PORT || 3000;

await connectToDB();
app.get('/',(req,res)=>{
    res.send("Welcome express")
})

// /api/user/...
app.use('/api/users',userRouter)

// /api/organizations/...
app.use('/api/organizations',organizationRouter)

// /api/activities/...
app.use('/api/activities',activityRouter)

app.listen(PORT, ()=>{
    console.log(`Server is listening on http://localhost:${process.env.PORT}`)
})