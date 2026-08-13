---
title: TMS 科研业务流
summary: 围绕经颅磁刺激从「刺激方案设计 → 协议生成 → 数据回收 → 参数迭代」的完整科研闭环，沉淀 TMS 实验的标准化工具链。
tags: [TMS, Python, 协议, 科研]
github: https://github.com/BaileyZhou/tms-research-toolkit
links:
  - label: 刺激协议生成器
    url: https://github.com/BaileyZhou/tms-protocol-generator
  - label: 强度-频率关系表
    url: https://github.com/BaileyZhou/tms-intensity-table
updated: 2024-07
---

## 业务流概览

- **方案设计**：根据研究假设选择线圈、靶点与刺激范式
- **协议生成**：由上位机强度/频率参数自动生成设备协议文件并校验
- **数据回收**：统一回收行为学与生理数据，建立实验数据库
- **参数迭代**：基于数据回流持续优化刺激参数

## 设计要点

> 强调「余量控制」与「参数可追溯」：每个协议都记录设计依据，
> 避免盲目叠加强度导致的安全与边际递减问题。
