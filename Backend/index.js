import express from 'express';
import 'dotenv/config';
import { dbConnect } from './config/database.js';
import authRoutes from './routes/auth.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path'

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth",authRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"/Frontend/dist")));
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"Frontend","dist","index.html"));
    })
}
app.listen(PORT, () => {
    dbConnect();
    console.log("Server started at", PORT);
});

app.get('/', (req, res) => {
    res.status(200).send(`YO YO on PORT ${PORT}`);
});
