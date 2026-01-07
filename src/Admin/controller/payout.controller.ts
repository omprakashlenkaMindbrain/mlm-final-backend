import { payout } from "../services/payout.service";
import {Request,Response}  from 'express'


export const payoutcontroller = async(req:Request,res:Response)=>{
    try {
        const user =  await payout()
        if(!user){
            return res.status(404).json({msg:"data not found"})
        }
        return res.status(200).json({msg:"user get sucessfully",user})
    } catch (error) {
        return res.status(500).json(error)
    }
}