#!/bin/bash
set -e

rm -f /usr/src/backend/tmp/pids/server.pid

exec "$@"