import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../config/logger.js';

export const protect = async (req, res, next) => {
    let token;

    // Check header for Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback: Read token from cookies
    else if (req.cookies.token) {
        token = req.cookies.token;
        logger.info('Token found in cookies');
    }

    logger.info({ cookies: req.cookies }, 'Incoming cookies check');

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                logger.warn('Token verified but user not found');
                return res.status(401).json({ error: 'authentication failed', fields: { token: 'invalid user' } });
            }

            next();
        } catch (error) {
            logger.error({ err: error }, 'Token verification failed');
            res.status(401).json({ error: 'authentication failed', fields: { token: 'invalid or expired' } });
        }
    } else {
        logger.debug('No token provided in request');
        res.status(401).json({ error: 'authentication failed', fields: { authorization: 'token required' } });
    }
};
