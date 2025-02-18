import mongoose from "mongoose";
import 'dotenv/config';

export const dbConnect = async() => {
    await mongoose.connect(process.env.DB_URL).then(() => {
        console.log("DB CONNECTED");
    }).catch((e) => {
        console.log("Error in DB CONNECTION: ", e);
        process.exit(1);
    });
};
