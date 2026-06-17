#!/bin/bash
# 超声教学资源管理系统 — 启动脚本
# 清除 ELECTRON_RUN_AS_NODE 环境变量（解决了困扰已久的问题！）
unset ELECTRON_RUN_AS_NODE
npx electron .
