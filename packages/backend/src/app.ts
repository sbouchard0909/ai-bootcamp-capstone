import express, { Application } from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use(routes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
