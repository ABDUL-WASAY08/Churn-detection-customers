import express from "express";
import getHeath from "../controller/getHeath.js";
import { trainModelController, getStatusController, getTreeController } from "../controller/train.js";

const router= express.Router();

router.get('/health', getHeath.GetHeath);
router.post('/train', trainModelController);
router.get('/status', getStatusController);
router.get('/tree', getTreeController);

export default router;