#!/bin/sh
# Cross-platform entry point for Linux and macOS (Windows keeps start.cmd).
set -e
cd "$(dirname "$0")"
exec node tools/launch.cjs "$@"
