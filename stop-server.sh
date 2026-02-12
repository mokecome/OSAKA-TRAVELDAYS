#!/bin/bash
pkill -f "node server.js" && echo "Server stopped" || echo "Server was not running"
