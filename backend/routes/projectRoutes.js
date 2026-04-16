import express from 'express';
import { 
    getProjects, 
    getProject, 
    createProject, 
    updateProject, 
    deleteProject, 
    getDashboardStats, 
    getProjectStats 
} from '../controllers/projectController.js';
import { getTasks, createTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/:id/stats', protect, getProjectStats);

router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .get(protect, getProject)
    .put(protect, updateProject)
    .patch(protect, updateProject)
    .delete(protect, deleteProject);

router.route('/:id/tasks')
    .get(protect, (req, res, next) => {
        req.params.projectId = req.params.id;
        next();
    }, getTasks)
    .post(protect, (req, res, next) => {
        req.body.project = req.params.id;
        next();
    }, createTask);

export default router;
