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
NODE_ENV=production node dist/index.js &
NODE_PID=$!

# Trap SIGTERM/SIGINT to kill both processes
trap "kill $PYTHON_PID $NODE_PID; exit" SIGTERM SIGINT

# Wait for both processes
wait $NODE_PID $PYTHON_PID
