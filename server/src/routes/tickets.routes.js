import { Router } from 'express';
import {
    getTickets, getTicketById,
    createTicket, updateTicket,
    addComment, getComments
} from '../controllers/tickets.controller.js';

const router = Router();

router.get('/',               getTickets);
router.get('/:id',            getTicketById);
router.post('/',              createTicket);
router.put('/:id',            updateTicket);
router.get('/:id/comments',   getComments);
router.post('/:id/comments',  addComment);

export default router;