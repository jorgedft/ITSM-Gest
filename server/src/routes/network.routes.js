import { Router } from 'express';
import {
    getIPs,
    getIPById,
    createIP,
    updateIP,
    deleteIP
} from '../controllers/network.controller.js';

const router = Router();

router.get('/',       getIPs);
router.get('/:id',    getIPById);
router.post('/',      createIP);
router.put('/:id',    updateIP);
router.delete('/:id', deleteIP);

export default router;