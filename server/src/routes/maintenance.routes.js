import { Router } from 'express';
import {
    getLogs,
    getLogById,
    createLog,
    updateLog,
    deleteLog
} from '../controllers/maintenance.controller.js';

const router = Router();

router.get('/',       getLogs);
router.get('/:id',    getLogById);
router.post('/',      createLog);
router.put('/:id',    updateLog);
router.delete('/:id', deleteLog);

export default router;