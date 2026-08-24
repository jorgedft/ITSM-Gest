import { Router } from 'express';
import {
    getPhones,
    getPhoneById,
    createPhone,
    updatePhone,
    deletePhone
} from '../controllers/phones.controller.js';

const router = Router();

router.get('/',       getPhones);
router.get('/:id',    getPhoneById);
router.post('/',      createPhone);
router.put('/:id',    updatePhone);
router.delete('/:id', deletePhone);

export default router;