#!/bin/bash
# ══════════════════════════════════════════════════════
# DREAM WAVE AI — Start Both Servers
# Run: bash start.sh
# ══════════════════════════════════════════════════════

# Use local Node v20 if system node is broken
NODE_DIR="$HOME/node-v20.11.0-darwin-x64/bin"
if [ -f "$NODE_DIR/node" ]; then
  export PATH="$NODE_DIR:$PATH"
fi

echo ""
echo "🌊 Dream Wave AI — Starting servers..."
echo "   Backend  → http://localhost:5001"
echo "   Frontend → http://localhost:5173"
echo ""

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start backend
cd "$ROOT_DIR/server"
node server.js &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
sleep 3

# Start frontend
cd "$ROOT_DIR/client"
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "══════════════════════════════════════════"
echo "  Backend  : http://localhost:5001"
echo "  Frontend : http://localhost:5173"
echo "  Press Ctrl+C to stop both servers"
echo "══════════════════════════════════════════"
echo ""

# Wait and clean up on Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
