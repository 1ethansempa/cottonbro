#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3001}"                 # override with: PORT=4001 pnpm smoke
LOG_FILE=".smoke-api.log"

# Ensure nothing is already listening on the port
lsof -ti :"$PORT" | xargs kill -9 2>/dev/null || true
rm -f "$LOG_FILE"

# Build API (so we know it compiles)
pnpm --filter api build >/dev/null

# Start the compiled API in the background and capture logs
PORT="$PORT" pnpm --filter api start >"$LOG_FILE" 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT

# Wait until health endpoint responds (max ~10s)
echo "⏳ Waiting for API on :$PORT ..."
ready=0
for i in {1..20}; do
  if curl -sf "http://localhost:$PORT/health" >/dev/null; then
    ready=1; break
  fi
  sleep 0.5
done

if [ "$ready" -ne 1 ]; then
  echo "❌ API did not start in time. Last 40 log lines:"
  tail -n 40 "$LOG_FILE" || true
  exit 1
fi

# Fetch health body
body="$(curl -sf "http://localhost:$PORT/health")"

echo "🔍 Checking /health"
ok=0
if command -v jq >/dev/null 2>&1; then
  # Try JSON first: { "ok": true }
  if echo "$body" | jq -e '.ok == true' >/dev/null 2>&1; then
    ok=1
  fi
fi

# Fallback: accept literal "OK"
if [ "$ok" -ne 1 ]; then
  if [ "$body" = "OK" ]; then
    ok=1
  fi
fi

if [ "$ok" -ne 1 ]; then
  echo "❌ /health not OK. Got:"
  echo "$body"
  echo "Last 40 log lines:"
  tail -n 40 "$LOG_FILE" || true
  exit 1
fi

echo "🔍 Checking /docs"
if ! curl -sfI "http://localhost:$PORT/docs" | grep -q "200 OK"; then
  echo "❌ /docs not reachable"
  echo "Last 40 log lines:"
  tail -n 40 "$LOG_FILE" || true
  exit 1
fi

echo "✅ Smoke tests passed"
