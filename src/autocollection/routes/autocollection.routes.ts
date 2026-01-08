import express,{Router} from 'express';
import { autocollectioncreate, autocollectiondelete, autocollectionget, autocollectionupdate } from "../controllers/autocollection.controller";

const autocollectionRoute = Router();

autocollectionRoute.post('/create',autocollectioncreate)
autocollectionRoute.get('/getautocollection',autocollectionget)
autocollectionRoute.put('/update',autocollectionupdate)
autocollectionRoute.delete('/delete',autocollectiondelete)


export default autocollectionRoute