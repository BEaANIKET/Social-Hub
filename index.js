import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express';
import { connectDb } from './Db/index.js';
import { router } from './routes/auth.js';
import { postRouter } from './routes/post.js';
import cookieParser from 'cookie-parser';
import { userRoute } from './routes/user.routes.js';

const port = process.env.PORT || 3000

const app = express();
app.use(cors())
app.use(express.json())
app.use(cookieParser())
dotenv.config()

if(process.env.NODE_ENV === 'production'){
  app.use(express.static('frontend/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  })
}

connectDb();
app.get('/', (req, res) =>{
   res.send("hello I am Working ")
})

app.use('/api', router)
app.use('/api', postRouter)
app.use('/api', userRoute)
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})