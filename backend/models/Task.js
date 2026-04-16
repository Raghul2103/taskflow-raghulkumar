import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a task title'],
        trim: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'done'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    assignee: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
