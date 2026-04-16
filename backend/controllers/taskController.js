import Task from '../models/Task.js';
import Project from '../models/Project.js';
import logger from '../config/logger.js';

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status;
        const assignee = req.query.assignee;

        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: 'not found' });
        }

        const query = { 
            project: req.params.projectId,
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        };

        // Strict Isolation: If NOT project owner, force assignee to be current user
        if (project.owner.toString() !== req.user.id) {
            query.assignee = req.user.id;
        } else if (assignee) {
            // If owner and assignee filter provided, use it
            query.assignee = assignee;
        }

        if (status) query.status = status;

        const total = await Task.countDocuments(query);
        const tasks = await Task.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            tasks,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        logger.error({ err: error, projectId: req.params.projectId }, 'Error in getTasks');
        res.status(500).json({ error: 'server error' });
    }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
    const { title, description, status, priority, project, assignee, dueDate } = req.body;

    if (!title || !project) {
        return res.status(400).json({ error: 'validation failed', fields: { title: 'required', project: 'required' } });
    }

    try {
        const projectDoc = await Project.findById(project);

        if (!projectDoc) {
            return res.status(404).json({ error: 'not found' });
        }

        // Only project owner can create tasks (or update to allow members if needed later)
        if (projectDoc.owner.toString() !== req.user.id) {
            return res.status(403).json({ error: 'unauthorized action' });
        }

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            project,
            assignee,
            creator: req.user.id,
            dueDate
        });

        logger.info({ taskId: task._id, projectId: project, creator: req.user.id }, 'Task created');
        res.status(201).json(task);
    } catch (error) {
        logger.error({ err: error, body: req.body }, 'Error in createTask');
        res.status(400).json({ error: 'validation failed', fields: { generic: error.message } });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('project');

        if (!task) {
            return res.status(404).json({ error: 'not found' });
        }

        // Authorization: owner OR assignee OR creator
        const isOwner = task.project.owner.toString() === req.user.id;
        const isAssignee = task.assignee && task.assignee.toString() === req.user.id;
        const isCreator = task.creator && task.creator.toString() === req.user.id;

        if (!isOwner && !isAssignee && !isCreator) {
            return res.status(403).json({ error: 'unauthorized action' });
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        logger.info({ taskId: updatedTask._id }, 'Task updated');
        res.status(200).json(updatedTask);
    } catch (error) {
        logger.error({ err: error, id: req.params.id }, 'Error in updateTask');
        res.status(400).json({ error: 'validation failed', fields: { generic: error.message } });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('project');

        if (!task) {
            return res.status(404).json({ error: 'not found' });
        }

        // Project owner or task creator only
        const isOwner = task.project.owner.toString() === req.user.id;
        const isCreator = task.creator && task.creator.toString() === req.user.id;

        if (!isOwner && !isCreator) {
            return res.status(403).json({ error: 'unauthorized action' });
        }

        await task.deleteOne();

        logger.info({ taskId: req.params.id }, 'Task deleted');
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        logger.error({ err: error, id: req.params.id }, 'Error in deleteTask');
        res.status(500).json({ error: 'server error' });
    }
};

// @desc    Get tasks assigned to current user
// @route   GET /api/tasks/my-tasks
// @access  Private
export const getMyTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status;

        const query = { 
            assignee: req.user.id,
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        };

        if (status) query.status = status;

        const total = await Task.countDocuments(query);
        const tasks = await Task.find(query)
            .populate('project', 'name owner')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            tasks,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        logger.error({ err: error, userId: req.user.id }, 'Error in getMyTasks');
        res.status(500).json({ error: 'server error' });
    }
};
