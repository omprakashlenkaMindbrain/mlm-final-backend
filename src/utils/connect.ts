import mongoose from "mongoose";
import config from "config";
import logger from './logger';
 async function connectDB(){
    const dbURL = config.get<string>("dbURL");
    return mongoose.connect(dbURL).then(()=>{
        console.log(dbURL)
        console.log("connected");
        logger.info("Connected to DB");
    }).catch((e:any)=>{
    logger.error("could not connect "+e.message);
    console.log(e)
    process.exit(1);
    })
}

export default connectDB;