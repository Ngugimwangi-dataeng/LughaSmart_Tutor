import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_HOST = '127.0.0.1';
const PYTHON_PORT = Number(process.env.PYTHON_PORT) || 8765;

let pythonProcess: ChildProcess | null = null;
let shuttingDown = false;

function startPythonBackend() {
  const scriptPath = path.resolve(__dirname, 'backend', 'app.py');
  const child = spawn('python3', [scriptPath], {
    cwd: __dirname,
    env: {
      ...process.env,
      PYTHON_HOST,
      PYTHON_PORT: String(PYTHON_PORT),
      PYTHONUNBUFFERED: '1',
    },
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    if (!shuttingDown) {
      console.error(`Python backend exited with code ${code}; restarting in 1s...`);
      setTimeout(() => {
        pythonProcess = startPythonBackend();
      }, 1000);
    }
  });

  return child;
}

function waitForPythonBackend(timeoutMs = 8000): Promise<void> {
  const startedAt = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      const req = http.get(
        { hostname: PYTHON_HOST, port: PYTHON_PORT, path: '/api/health', timeout: 500 },
        (res) => {
          res.resume();
          if (res.statusCode && res.statusCode < 500) {
            resolve();
          } else if (Date.now() - startedAt < timeoutMs) {
            setTimeout(check, 150);
          } else {
            resolve();
          }
        }
      );
      req.on('error', () => {
        if (Date.now() - startedAt < timeoutMs) {
          setTimeout(check, 150);
        } else {
          resolve();
        }
      });
    };
    check();
  });
}

function proxyToPython(req: Request, res: Response) {
  const proxyReq = http.request(
    {
      hostname: PYTHON_HOST,
      port: PYTHON_PORT,
      path: req.originalUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${PYTHON_HOST}:${PYTHON_PORT}`,
      },
    },
    (proxyRes) => {
      res.status(proxyRes.statusCode || 502);
      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          res.setHeader(key, value);
        }
      });
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Python backend unavailable',
        detail: err.message,
      });
    }
  });

  req.pipe(proxyReq);
}

async function startServer() {
  pythonProcess = startPythonBackend();
  await waitForPythonBackend();

  const cleanup = () => {
    shuttingDown = true;
    if (pythonProcess && !pythonProcess.killed) {
      pythonProcess.kill('SIGTERM');
    }
  };
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });

  const app = express();
  const PORT = 3000;

  // Serve attached proposal PDF & static public files
  app.use('/public', express.static(path.resolve(__dirname, 'public')));

  // Forward all /api/* traffic to the pure-Python backend server
  app.use('/api', proxyToPython);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend gateway listening on http://0.0.0.0:${PORT} -> Python backend on ${PYTHON_HOST}:${PYTHON_PORT}`);
  });
}

startServer();
