#!/bin/bash

# Server management script for Valux Backend

case "$1" in
  start)
    echo "🚀 Starting Valux Backend Server..."
    # Kill any existing processes on port 8080
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    # Kill any existing nest processes
    pkill -f "nest start" 2>/dev/null || true
    sleep 2
    echo "✅ Port 8080 cleared"
    
    # Start the development server in background
    nohup npm run start:dev > /dev/null 2>&1 &
    sleep 3
    
    # Check if server started successfully
    if lsof -i:8080 >/dev/null 2>&1; then
      echo "✅ Server started successfully on port 8080"
      echo "🔗 Health Check: http://localhost:8080/health"
      echo "📚 API Docs: http://localhost:8080/api/docs"
    else
      echo "❌ Failed to start server"
      exit 1
    fi
    ;;
    
  stop)
    echo "🛑 Stopping Valux Backend Server..."
    # Kill processes using port 8080
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    # Kill nest processes
    pkill -f "nest start" 2>/dev/null || true
    # Remove lock file
    rm -f server.lock 2>/dev/null || true
    echo "✅ Server stopped"
    ;;
    
  restart)
    $0 stop
    sleep 3
    $0 start
    ;;
    
  status)
    echo "📊 Server Status:"
    if lsof -i:8080 >/dev/null 2>&1; then
      echo "✅ Server is running on port 8080"
      echo "🔗 Health Check: http://localhost:8080/health"
      echo "📚 API Docs: http://localhost:8080/api/docs"
    else
      echo "❌ Server is not running"
    fi
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the development server (clears port conflicts)"
    echo "  stop    - Stop the server"
    echo "  restart - Restart the server"
    echo "  status  - Check server status"
    exit 1
    ;;
esac