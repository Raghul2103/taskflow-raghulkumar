import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a project name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    deadline: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
