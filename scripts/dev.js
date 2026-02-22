
import { spawn } from 'child_process';
import path from 'path';

// Helper to run a command
function runCommand(command, args, name, color) {
    const child = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' }
    });

    child.stdout.on('data', (data) => {
        process.stdout.write(`[${name}] ${data}`);
    });

    child.stderr.on('data', (data) => {
        process.stderr.write(`[${name}] ${data}`);
    });

    child.on('close', (code) => {
        console.log(`[${name}] process exited with code ${code}`);
        cleanup();
    });

    return child;
}

// Start Node server
const nodeServer = runCommand('npm', ['run', 'dev:node'], 'NODE', '\x1b[34m');

// Start Python server
const pythonServer = runCommand('npm', ['run', 'dev:python'], 'PYTHON', '\x1b[33m');

let cleaningUp = false;

function cleanup() {
    if (cleaningUp) return;
    cleaningUp = true;
    console.log('Stopping servers...');

    const killProcess = (pid) => {
        if (!pid) return;
        try {
            // Use taskkill on Windows to kill process tree (/T) force (/F)
            if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', pid.toString(), '/f', '/t']);
            } else {
                process.kill(-pid, 'SIGKILL'); // negative pid kills process group on unix
            }
        } catch (e) {
            // ignore
        }
    };

    killProcess(nodeServer.pid);
    killProcess(pythonServer.pid);

    setTimeout(() => process.exit(0), 1000);
}

// Kill anything on ports 5000 (Node) and 8000 (Python) before starting
import { execSync } from 'child_process';
function killPort(port) {
    try {
        if (process.platform === 'win32') {
            const output = execSync(`netstat -ano | findstr :${port}`).toString();
            const lines = output.split('\n');
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && /^\d+$/.test(pid) && pid !== '0') {
                    try {
                        execSync(`taskkill /F /PID ${pid}`);
                        console.log(`[SETUP] Killed process ${pid} on port ${port}`);
                    } catch (e) {
                        // ignore
                    }
                }
            }
        } else {
            // Unix/Linux/Mac
            try {
                const pid = execSync(`lsof -t -i:${port}`).toString().trim();
                if (pid) {
                    process.kill(parseInt(pid), 'SIGKILL');
                    console.log(`[SETUP] Killed process ${pid} on port ${port}`);
                }
            } catch (e) {
                // ignore
            }
        }
    } catch (e) {
        // ignore if no process found
    }
}

console.log('[SETUP] Cleaning ports...');
killPort(5000);
killPort(8000); // main.py uses 8000


// Handle termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
