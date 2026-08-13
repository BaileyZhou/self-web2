// 代码案例列表页（服务端）：读取 public/code-examples/*.md 的全部业务流并做时间倒序，
// 交给客户端 <CodeExamplesLibrary /> 完成检索与分页；页脚固定在页面最下方。
// 新增/管理业务流 = 在 public/code-examples/ 目录下新建/编辑一个 .md 文件即可。
import { getAllCodeFlows, sortCodeFlowsByUpdatedDesc } from '@/lib/code-examples'
import CodeExamplesLibrary from '@/components/code-examples/CodeExamplesLibrary'

export default function CodeExamplesPage() {
  const items = sortCodeFlowsByUpdatedDesc(getAllCodeFlows())
  return (
    <main className="min-h-screen flex flex-col">
      <CodeExamplesLibrary items={items} />
    </main>
  )
}
