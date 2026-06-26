#!/bin/bash

cleanup() {
  echo "\nShutting down all services..."
  kill $ACCOUNT_PID $ORDER_PID $NEXT_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

echo "Starting Account Service (gRPC :50051)..."
npx tsx services/account-service/index.ts &
ACCOUNT_PID=$!

echo "Starting Order Service (gRPC :50052)..."
npx tsx services/order-service/index.ts &
ORDER_PID=$!

sleep 2

echo "Starting Next.js dev server..."
npm run dev &
NEXT_PID=$!

echo ""
echo "All services running. Press Ctrl+C to stop all."
echo ""

wait
