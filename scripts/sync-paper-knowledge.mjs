#!/usr/bin/env node
// scripts/sync-paper-knowledge.mjs
// 论文 → 知识库 自动同步：在论文 md 正文中用下面的「知识卡片函数」框选内容，
// 运行本脚本（npm run sync:cards，dev / build 前会自动执行）后：
//   1) 在 public/knowledge/ 自动创建/更新对应的知识卡片（文件名即卡片 id）；
//   2) 把论文里这段「函数 + 内容」替换成一个指向该卡片的链接（网页只看到链接，
//      点击后进入知识库中创建的卡片；函数形式不出现在网页上）。
//
// 语法（写在论文正文任意位置）：
//   <!-- knowledge-card:start id="brain-plasticity" title="神经可塑性" category="论文精读" tags="突触,学习记忆" summary="一句话简介" -->
//   这里放你框选的、要沉淀为知识卡片的内容（支持 Markdown），会成为卡片正文……
//   <!-- knowledge-card:end -->
//
// 属性均可选（除内容外）：
//   id       卡片 id（知识库文件名；缺省由 title 生成）
//   title    卡片标题（缺省用论文 frontmatter 的 title）
//   category 分类（缺省「论文精读」）
//   tags     逗号分隔的标签
//   summary  卡片摘要（缺省取内容第一行）
//   updated  更新日期（缺省今天 YYYY-MM-DD）
//
// ⚠️ 注意：脚本会把论文中的函数块替换为链接，因此内容只保留在知识卡片里。
//    若想再次修改卡片内容，在论文中重新框选并加回函数标记即可。
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const PAPERS_DIR = path.join(ROOT, 'public', 'papers')
const KNOWLEDGE_DIR = path.join(ROOT, 'public', 'knowledge')

// 匹配 <!-- knowledge-card:start 属性 --> 内容 <!-- knowledge-card:end -->
const BLOCK_RE =
  /<!--\s*knowledge-card:start\s*([^>]*?)--\s*>([\s\S]*?)<!--\s*knowledge-card:end\s*--\s*>/g
// 匹配 属性名="值"
const ATTR_RE = /([\w-]+)\s*=\s*"([^"]*)"/g

function parseAttrs(str) {
  const attrs = {}
  for (const m of str.matchAll(ATTR_RE)) attrs[m[1]] = m[2].trim()
  return attrs
}

/** 生成 id：保留中文/字母/数字，其余转连字符 */
function slugify(str) {
  return String(str)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function main() {
  if (!fs.existsSync(PAPERS_DIR)) {
    console.log('⚠️  public/papers 不存在，跳过。')
    return
  }
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true })

  // 已存在的知识卡片 id，以及「由哪篇论文自动生成」的映射（frontmatter 的 source 字段）
  const existingIds = new Set()
  const sourceMap = new Map()
  for (const f of fs.readdirSync(KNOWLEDGE_DIR).filter((x) => x.endsWith('.md'))) {
    const id = f.replace(/\.md$/, '')
    existingIds.add(id)
    try {
      const { data } = matter(fs.readFileSync(path.join(KNOWLEDGE_DIR, f), 'utf-8'))
      if (data.source) sourceMap.set(id, String(data.source))
    } catch {
      /* 解析失败忽略 */
    }
  }

  let created = 0
  let updated = 0
  let linked = 0

  for (const file of fs.readdirSync(PAPERS_DIR).filter((x) => x.endsWith('.md'))) {
    const paperId = file.replace(/\.md$/, '')
    const abs = path.join(PAPERS_DIR, file)
    let raw = fs.readFileSync(abs, 'utf-8')
    const paperTitle = matter(raw).data.title || paperId
    let replaced = 0

    raw = raw.replace(BLOCK_RE, (whole, attrStr, content) => {
      const attrs = parseAttrs(attrStr)
      const title = attrs.title || paperTitle
      const body = content.trim()
      if (!body) return whole // 空内容则保留原样，不生成卡片

      // 选 id：缺省用 title；若被占用且不属于本论文，则加序号后缀
      const base = slugify(attrs.id || title) || 'knowledge'
      let id = base
      let n = 2
      while (existingIds.has(id) && sourceMap.get(id) !== paperId) id = `${base}-${n++}`
      existingIds.add(id)
      sourceMap.set(id, paperId)

      // 摘要：优先用显式 summary，缺省取内容第一行并去除 Markdown 标记
      const firstLine = body.split(/\r?\n/).find((l) => l.trim()) || ''
      const summary =
        attrs.summary || firstLine.replace(/^[#>*\-\s]+/, '').replace(/[*_`]/g, '').trim() || ''
      const tags = (attrs.tags || '')
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean)

      const front = matter.stringify(body, {
        title,
        category: attrs.category || '论文精读',
        summary,
        tags,
        updated: attrs.updated || today(),
        source: paperId, // 标记：由哪篇论文自动生成（脚本据此识别，避免覆盖他人卡片）
      })
      const cardPath = path.join(KNOWLEDGE_DIR, `${id}.md`)
      const existed = fs.existsSync(cardPath)
      fs.writeFileSync(cardPath, front)
      if (existed) updated++
      else created++
      replaced++
      return `\n\n[📚 知识卡片：「${title}」](/knowledge/${id})\n\n`
    })

    if (replaced) {
      fs.writeFileSync(abs, raw)
      console.log(`  · ${file}：${replaced} 处 → 已生成知识卡片并替换为链接`)
      linked += replaced
    }
  }

  console.log(
    `✅ 论文→知识库 同步完成：新建 ${created} 张、更新 ${updated} 张、替换链接 ${linked} 处。`
  )
}

main()
