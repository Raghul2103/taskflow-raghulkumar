import Project from '../models/Project.js';
import Task from '../models/Task.js';
import logger from '../config/logger.js';

// @desc    Get all projects for current user with task counts
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const query = {
            owner: req.user.id,
            name: { $regex: search, $options: 'i' }
        };

        const total = await Project.countDocuments(query);
        const projects = await Project.find(query)
            .populate('owner', 'name email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);
        
        const enrichedProjects = await Promise.all(projects.map(async (project) => {
            const taskQuery = { project: project._id };
            const taskCount = await Task.countDocuments(taskQuery);
            return {
                ...project.toJSON(),
                taskCount
            };
        }));

        res.status(200).json({
            projects: enrichedProjects,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        logger.error({ err: error }, 'Error in getProjects');
        res.status(500).json({ error: 'server error' });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'not found' });
        }

        // Check for owner OR assignee
        const isOwner = project.owner.toString() === req.user.id;
        const tasksWithAssignee = await Task.findOne({ project: project._id, assignee: req.user.id });
        
        if (!isOwner && !tasksWithAssignee) {
            return res.status(403).json({ error: 'unauthorized action' });
        }

        res.status(200).json(project);
    } catch (error) {
        logger.error({ err: error, id: req.params.id }, 'Error in getProject');
        res.status(500).json({ error: 'server error' });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
    const { name, description, deadline } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'validation failed', fields: { name: 'is required' } });
    }

    try {
        const project = await Project.create({
            name,
            description,
            deadline,
            owner: req.user.id
        });

        logger.info({ projectId: project._id, owner: req.user.id }, 'Project created');
        res.status(201).json(project);
    } catch (error) {
        logger.error({ err: error, body: req.body }, 'Error in createProject');
        res.status(400).json({ error: 'validation failed', fields: { generic: error.message } });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'not found' });
        }

        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ error: 'unauthorized action' });
        }

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        logger.info({ projectId: updatedProject._id }, 'Project updated');
        res.status(200).json(updatedProject);
    } catch (error) {
        logger.error({ err: error, id: req.params.id }, 'Error in updateProject');
        res.status(400).json({ error: 'validation failed', fields: { generic: error.message } });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'not found' });
        }

        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ error: 'unauthorized action' });
        }

        await project.deleteOne();

        logger.info({ projectId: req.params.id }, 'Project deleted');
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        logger.error({ err: error, id: req.params.id }, 'Error in deleteProject');
        res.status(500).json({ error: 'server error' });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/projects/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const myProjectIds = await Project.find({ owner: req.user.id }).select('_id');
        const projectIds = myProjectIds.map(p => p._id);

        const totalTasks = await Task.countDocuments({
            project: { $in: projectIds }
        });

        const completedTasks = await Task.countDocuments({
            project: { $in: projectIds },
            status: 'done'
        });

        res.status(200).json({
            totalProjects: myProjectIds.length,
            totalTasks,
            completedTasks,
            pendingTasks: totalTasks - completedTasks
        });
    } catch (error) {
        res.status(500).json({ error: 'server error' });
    }
};

// @desc    Get project specific stats
// @route   GET /api/projects/:id/stats
// @access  Private
export const getProjectStats = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'not found' });
        }

        // Only project owner can see stats
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ error: 'unauthorized action' });
        }

        const stats = await Task.aggregate([
            { $match: { project: project._id } },
            { $group: {
                _id: '$status',
                count: { $sum: 1 }
            }}
        ]);

        const assigneeStats = await Task.aggregate([
            { $match: { project: project._id } },
            { $group: {
                _id: '$assignee',
                count: { $sum: 1 }
            }},
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }},
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $project: {
                userName: { $ifNull: ['$user.name', 'Unassigned'] },
                count: 1
            }}
        ]);

        res.status(200).json({
            statusStats: stats,
            assigneeStats
        });
    } catch (error) {
        logger.error({ err: error, id: req.params.id }, 'Error in getProjectStats');
        res.status(500).json({ error: 'server error' });
    }
};
