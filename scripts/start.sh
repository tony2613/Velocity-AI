#!/bin/bash

# Start Python OCR Service in background
echo "Starting Python OCR Service..."
python3 main.py &
PYTHON_PID=$!

# Wait for Python service to be ready (optional, but good practice)
echo "Waiting for Python service to start..."
sleep 5

# Start Node.js Server
echo "Starting Node.js Server on PORT ${PORT:-5000}..."
NODE_ENV=production node --max-old-space-size=256 dist/index.js 2>&1 | tee node.log &
NODE_PID=$!

# Wait briefly to see if Node crashes instantly
sleep 3
if ! kill -0 $NODE_PID 2>/dev/null; then
  echo "❌ Node.js Server crashed instantly! Printing logs and exiting..."
  cat node.log
  kill $PYTHON_PID
  exit 1
fi

# Trap SIGTERM/SIGINT to kill both processes
trap "kill $PYTHON_PID $NODE_PID; exit" SIGTERM SIGINT

# Wait for both processes
wait -n $NODE_PID $PYTHON_PID
EXIT_CODE=$?
echo "A process exited with code $EXIT_CODE. Shutting down..."
kill $PYTHON_PID $NODE_PID 2>/dev/null
exit $EXIT_CODE
