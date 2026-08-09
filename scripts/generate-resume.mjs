// scripts/generate-resume.mjs
// 生成占位简历 PDF（纯脚本手写 PDF 结构，无需额外依赖）
// 运行：node scripts/generate-resume.mjs
// 输出：public/resume/resume.pdf —— 之后你可以直接用自己真实的 PDF 覆盖它

import { mkdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---- 占位简历内容（后续可在此修改后重新运行，或直接替换生成的 PDF）----
const title = 'CURRICULUM VITAE'
const lines = [
  { text: 'Name: Your Name', size: 14, bold: false },
  { text: 'Role: Neuro-tech Product Manager', size: 12, bold: false },
  { text: '', size: 0, bold: false },
  { text: 'EDUCATION', size: 12, bold: true },
  { text: 'PhD in Neuroscience - Example University (2016 - 2020)', size: 11, bold: false },
  { text: '', size: 0, bold: false },
  { text: 'EXPERIENCE', size: 12, bold: true },
  { text: 'Product Lead - NeuroTech Labs (2023 - Present)', size: 11, bold: false },
  { text: 'Research Scientist - Cognitive Center (2020 - 2023)', size: 11, bold: false },
  { text: '', size: 0, bold: false },
  { text: 'SKILLS', size: 12, bold: true },
  { text: 'Neuroscience, Product Strategy, AI/ML, BCI, Data Analysis', size: 11, bold: false },
]

// PDF 字符串转义（括号、反斜杠）
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

// ---- 构建内容流（文本定位使用绝对文本矩阵 Tm）----
let content = 'BT\n'
content += '/F2 26 Tf\n'
content += `1 0 0 1 150 780 Tm\n(${esc(title)}) Tj\nET\n`

let y = 736
for (const l of lines) {
  if (!l.text) {
    y -= 16
    continue
  }
  content += 'BT\n'
  content += `/${l.bold ? 'F2' : 'F1'} ${l.size} Tf\n`
  content += `1 0 0 1 72 ${y} Tm\n`
  content += `(${esc(l.text)}) Tj\nET\n`
  y -= l.size + 10
}

// ---- 组装 PDF 对象 ----
const objects = [
  null,
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}endstream`,
]

let pdf = '%PDF-1.4\n'
const offsets = [0]
for (let i = 1; i < objects.length; i++) {
  offsets[i] = Buffer.byteLength(pdf, 'latin1')
  pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`
}

const xrefStart = Buffer.byteLength(pdf, 'latin1')
pdf += 'xref\n'
pdf += `0 ${objects.length}\n`
pdf += '0000000000 65535 f \n'
for (let i = 1; i < objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
}
pdf += 'trailer\n'
pdf += `<< /Size ${objects.length} /Root 1 0 R >>\n`
pdf += 'startxref\n'
pdf += `${xrefStart}\n`
pdf += '%%EOF'

// ---- 写出到 public/resume/resume.pdf ----
const outDir = join(__dirname, '..', 'public', 'resume')
mkdirSync(outDir, { recursive: true })
const outFile = join(outDir, 'resume.pdf')
writeFileSync(outFile, pdf, 'latin1')

console.log(`✅ 已生成占位简历：${outFile}（${Buffer.byteLength(pdf, 'latin1')} 字节）`)
console.log('提示：之后把你自己真实的 PDF 复制到这个路径覆盖即可，无需改代码。')
