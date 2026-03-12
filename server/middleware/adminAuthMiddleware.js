import authMiddleware from './authMiddleware.js';

const adminAuthMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Admins only.' });
    }
  });
};

export default adminAuthMiddleware;
