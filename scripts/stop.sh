#!/bin/bash

echo "Stopping application..."

# Kill processes by port
lsof -ti:3000 | xargs kill -9 2>/dev/null || true  # Frontend
lsof -ti:9001 | xargs kill -9 2>/dev/null || true  # Backend

# Kill processes by name
pkill -f "next dev" || true
pkill -f "node.*server" || true

# Read and kill saved PIDs
if [ -f .running.pid ]; then
    while read pid; do
        kill $pid 2>/dev/null || true
    done < .running.pid
    rm .running.pid
fi

echo "Application stopped" 