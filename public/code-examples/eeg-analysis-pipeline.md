---
title: EEG 数据分析业务流
summary: 覆盖「采集 → 预处理 → 时频/连通性分析 → 可视化报告」的整套可复用 EEG 分析管线，让从原始脑电到结论的过程标准化、可复现。
tags: [EEG, Python, 预处理, 时频分析]
github: https://github.com/BaileyZhou/eeg-pipeline
links:
  - label: 预处理模块
    url: https://github.com/BaileyZhou/eeg-preprocess
  - label: 时频分析模块
    url: https://github.com/BaileyZhou/eeg-time-frequency
  - label: 报告生成器
    url: https://github.com/BaileyZhou/eeg-report
updated: 2024-06
---

## 业务流概览

- **采集对接**：统一读取 Neuroscan / BrainVision / BDF 等常见格式
- **预处理**：带通滤波、坏导插值、ICA 去眼电、分段与基线校正
- **分析**：时频（STFT/Wavelet）、功率谱、功能连通性（PLV/PLI）
- **输出**：一键生成含图表与统计结论的可视化报告

## 设计要点

> 管线以「配置驱动 + 步骤可插拔」为核心，每个阶段都是一个独立的函数/类，
> 便于在研究项目间复用与组合。
