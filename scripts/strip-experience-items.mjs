// scripts/strip-experience-items.mjs
// 一次性迁移脚本：从 src/lib/data.ts 中移除 experience.items 数组。
// 知识卡片已迁移到 public/knowledge/*.md（每张卡片一个文件），由 src/lib/knowledge.ts 读取。
import fs from 'fs'
import path from 'path'

const file = path.join(process.cwd(), 'src', 'lib', 'data.ts')
let src = fs.readFileSync(file, 'utf-8')

// 锚定 experience 区块，只在其内部查找 items 数组
const expMarker = 'export const experience = {'
const expStart = src.indexOf(expMarker)
if (expStart === -1) {
  console.error('未找到 export const experience，已中止')
  process.exit(1)
}
const expSection = src.slice(expStart)

const startMarker = '  items: ['
const endMarker = '  ],\n}'
const itemsStartRel = expSection.indexOf(startMarker)
const itemsEndRel = expSection.indexOf(endMarker, itemsStartRel)

if (itemsStartRel === -1 || itemsEndRel === -1) {
  console.error('未找到 experience 的 items 数组边界，已中止（未做任何修改）')
  process.exit(1)
}

const absItemsStart = expStart + itemsStartRel
const absItemsEnd = expStart + itemsEndRel + endMarker.length // 包含 '  ],' 与 closing '}'
const replacement =
  '  /** 知识卡片已迁移到 public/knowledge/ 下的独立 .md 文件（每张卡片一个文件），\n' +
  '   *  由 src/lib/knowledge.ts 在构建时读取；此处无需再维护卡片数据。\n' +
  '   *  新增卡片：在 public/knowledge/ 目录下新建 .md 文件即可。 */\n' +
  '  items: [],\n}'

src = src.slice(0, absItemsStart) + replacement + src.slice(absItemsEnd)
fs.writeFileSync(file, src)
console.log('迁移完成：已移除 experience.items 数组')
