// src/app/papers/page.tsx
// 论文文库列表页（服务端）：读取 public/papers/*.md 的全部文献，
// 交给客户端 <PapersLibrary /> 完成检索 / 课题筛选 / 阅读状态筛选 / 排序 / 分页 / 详情面板；
// 页脚固定在页面最下方。
// 新增/导入文献 = 在 public/papers/ 目录下新建一个 .md 文件即可。
import { getAllPapers } from '@/lib/papers'
import PapersLibrary from '@/components/papers/PapersLibrary'

export default function PapersPage() {
  const items = getAllPapers()
  return (
    <main className="min-h-screen flex flex-col">
      <PapersLibrary items={items} />
    </main>
  )
}
