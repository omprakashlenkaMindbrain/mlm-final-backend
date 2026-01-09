import { incomehistory } from "./incomehistory.controller";
import express from 'express'

export const incomerouter = express.Router()

incomerouter.get("/incomehistory/:userId",incomehistory)