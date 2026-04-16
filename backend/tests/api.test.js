import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

describe('TaskFlow API Integration Tests', () => {
    let token;
    let userId;
    let projectId;

    beforeAll(async () => {
        // Connect to DB if not connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
    });

    afterAll(async () => {
        // Cleanup test data
        await User.deleteMany({ email: 'test@integration.com' });
        if (projectId) {
            await Project.deleteOne({ _id: projectId });
            await Task.deleteMany({ project: projectId });
        }
        await mongoose.connection.close();
    });

    describe('Auth Endpoints', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test Integration',
                    email: 'test@integration.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            userId = res.body._id;
        });

        it('should login and return a token', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@integration.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            token = res.body.token;
        });
    });

    describe('Project Endpoints', () => {
        it('should create a new project', async () => {
            const res = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Integration Project',
                    description: 'Testing integration flow',
                    deadline: new Date()
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.name).toBe('Integration Project');
            projectId = res.body._id;
        });

        it('should fetch project details', async () => {
            const res = await request(app)
                .get(`/api/projects/${projectId}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body._id).toBe(projectId);
        });
    });

    describe('Task Endpoints & Permissions', () => {
        let taskId;

        it('should create a task in the project', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Integration Task',
                    project: projectId,
                    priority: 'high'
                });
            
            expect(res.statusCode).toBe(201);
            taskId = res.body._id;
        });

        it('should block deletion of task without proper auth', async () => {
            // No token
            const res = await request(app)
                .delete(`/api/tasks/${taskId}`);
            
            expect(res.statusCode).toBe(401);
        });

        it('should return 404 for non-existent routes', async () => {
            const res = await request(app).get('/api/invalid-route');
            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ error: 'not found' });
        });
    });
});
