#!/bin/bash
launchctl bootout gui/$(id -u)/com.bottle.server 2>/dev/null
sleep 1
if lsof -i :8080 2>/dev/null | grep -q LISTEN; then
    kill $(lsof -ti :8080) 2>/dev/null
fi
echo "服务器已停止"
