#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 Starting application..."

# Kill existing processes
echo "Stopping existing processes..."
pkill -f "next dev" || true
pkill -f "node.*server" || true
lsof -ti:9001 | xargs kill -9 2>/dev/null || true # Force kill anything on port 9001

# Wait a moment for processes to fully stop
sleep 2

# Test database connection and backend availability
echo "Testing backend availability..."
if ! curl -s "http://localhost:9001/health" > /dev/null; then
    echo "Starting backend server..."
    NODE_ENV=development npm run db:server &
    BACKEND_PID=$!

    # Wait for backend to be ready
    MAX_RETRIES=30
    RETRY_COUNT=0
    while ! curl -s "http://localhost:9001/health" > /dev/null && [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        sleep 1
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "Waiting for backend server... ($RETRY_COUNT/$MAX_RETRIES)"
    done

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}Backend server failed to start${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
else 
    echo -e "${GREEN}Backend server already running${NC}"
    BACKEND_PID=$(lsof -ti:9001)
fi

echo -e "${GREEN}Backend server is running${NC}"

# Start frontend only
echo "Starting frontend..."
next dev &
FRONTEND_PID=$!

# Save PIDs to file for later cleanup
echo $BACKEND_PID > .running.pid
echo $FRONTEND_PID >> .running.pid

echo -e "${GREEN}🎉 Application started successfully!${NC}"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Logs will appear below..."

# Wait for either process to exit
wait 