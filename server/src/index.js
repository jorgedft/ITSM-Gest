import express    from 'express';
import cors       from 'cors';
import helmet     from 'helmet';
import morgan     from 'morgan';
import dotenv     from 'dotenv';

import assetsRoutes      from './routes/assets.routes.js';
import ticketsRoutes     from './routes/tickets.routes.js';
import responsivasRoutes from './routes/responsivas.routes.js';
import licensesRoutes    from './routes/licenses.routes.js';
import maintenanceRoutes from './routes/maintenance.routes.js';
import usersRoutes       from './routes/users.routes.js';
import phonesRoutes      from './routes/phones.routes.js';
import networkRoutes     from './routes/network.routes.js';
import workflowsRoutes   from './routes/workflows.routes.js'; // <-- 1. IMPORT NUEVO

import { errorHandler }   from './middlewares/errorHandler.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check público
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas protegidas
app.use('/api/users',       authMiddleware, usersRoutes);
app.use('/api/assets',      authMiddleware, assetsRoutes);
app.use('/api/phones',      authMiddleware, phonesRoutes);
app.use('/api/tickets',     authMiddleware, ticketsRoutes);
app.use('/api/responsivas', authMiddleware, responsivasRoutes);
app.use('/api/licenses',    authMiddleware, licensesRoutes);
app.use('/api/network',     authMiddleware, networkRoutes);
app.use('/api/maintenance', authMiddleware, maintenanceRoutes);
app.use('/api/workflows',   authMiddleware, workflowsRoutes); // <-- 2. RUTA REGISTRADA

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀  ITSM Server → http://localhost:${PORT}`);
});