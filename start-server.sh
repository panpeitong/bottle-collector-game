#!/bin/bash
# 饮料瓶收集游戏 - 开发服务器
# 通过 launchd 管理，开机自启，崩溃自动恢复

if lsof -i :8080 2>/dev/null | grep -q LISTEN; then
    echo "服务器已在运行: http://localhost:8080"
    open http://localhost:8080
    exit 0
fi

launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.bottle.server.plist 2>/dev/null
sleep 2

if lsof -i :8080 2>/dev/null | grep -q LISTEN; then
    echo "服务器已启动: http://localhost:8080"
    open http://localhost:8080
else
    echo "启动失败，查看日志: /tmp/bottle-server-error.log"
fi
