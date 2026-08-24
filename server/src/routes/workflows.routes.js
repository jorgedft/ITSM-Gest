import { Router } from 'express';
import { 
  getWorkflows, 
  createWorkflow, 
  deleteWorkflow 
} from '../controllers/workflows.controller.js';

const router = Router();

router.get('/', getWorkflows);
router.post('/', createWorkflow);
router.delete('/:id', deleteWorkflow);

export default router;