import { Router } from 'express';
import {
    getResponsivas,
    getResponsivaById,
    createResponsiva,
    updateResponsiva,
    downloadPDF
} from '../controllers/responsivas.controller.js';

const router = Router();

router.get('/',            getResponsivas);
router.get('/:id',         getResponsivaById);
router.get('/:id/pdf',     downloadPDF);
router.post('/',           createResponsiva);
router.put('/:id',         updateResponsiva);

export default router;