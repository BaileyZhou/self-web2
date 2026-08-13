---
title: 神经反馈产品业务流
summary: 面向用户的神经反馈训练应用，打通「测评 → 训练 → 复盘」的产品闭环，把脑电指标转化为可感知的训练体验。
tags: [产品, 前端, 后端, 数据可视化]
github: https://github.com/BaileyZhou/neuro-feedback-app
links:
  - label: 前端训练端
    url: https://github.com/BaileyZhou/neuro-app-frontend
  - label: 后端数据服务
    url: https://github.com/BaileyZhou/neuro-app-backend
  - label: 实时波形 SDK
    url: https://github.com/BaileyZhou/eeg-stream-sdk
updated: 2024-05
---

## 业务流概览

- **测评**：进入训练前先完成基线测评，确定训练起点
- **训练**：实时采集 EEG 波形，以游戏化界面反馈专注度/放松度
- **复盘**：训练结束后生成本次指标曲线与趋势报告

## 设计要点

> 以「评估-训练-再评估」的闭环为核心，让训练效果可被看见、可被度量。
