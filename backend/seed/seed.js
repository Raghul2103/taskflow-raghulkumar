import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany();
        await Project.deleteMany();
        await Task.deleteMany();

        // Create User
        // Note: The model's pre-save hook will hash it
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123' 
        });

        console.log('User Created');

        // Create Project
        const project = await Project.create({
            name: 'TaskFlow Development',
            description: 'Main project for developing the TaskFlow application.',
            owner: user._id,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });

        console.log('Project Created');

        // Create Tasks
        const tasks = [
            {
                title: 'Design UI Mockups',
                description: 'Create initial design for the task board.',
                status: 'done',
                priority: 'high',
                project: project._id,
                assignee: user._id,
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Setup Backend API',
                description: 'Implement auth and task routes.',
                status: 'in_progress',
                priority: 'medium',
                project: project._id,
                assignee: user._id,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Integrate Frontend',
                description: 'Connect React app with backend.',
                status: 'todo',
                priority: 'low',
                project: project._id,
                assignee: user._id,
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            }
        ];

        await Task.insertMany(tasks);
        console.log('Tasks Created');

        console.log('Seeding Complete!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seed();
