import { Router } from 'express';
import {
    getLicenses,
    getLicenseById,
    createLicense,
    updateLicense,
    deleteLicense
} from '../controllers/licenses.controller.js';

const router = Router();

router.get('/',       getLicenses);
router.get('/:id',    getLicenseById);
router.post('/',      createLicense);
router.put('/:id',    updateLicense);
router.delete('/:id', deleteLicense);

export default router;