import express from 'express';
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getMyTasks
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-tasks', protect, getMyTasks);

router.route('/')
    .post(protect, createTask);

router.route('/:id')
    .put(protect, updateTask)
    .patch(protect, updateTask)
    .delete(protect, deleteTask);

router.get('/project/:projectId', protect, getTasks);

export default router;
