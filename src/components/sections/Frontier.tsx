// src/components/sections/Frontier.tsx
// 「学术前沿」区块（首页）：自动从网络获取神经科学 / 心理学 / 脑科学的最新文献卡片。
// 无需手动更新——打开页面时自动拉取 PubMed（失败自动回退 OpenAlex），
// 结果缓存到 localStorage（每天更新一次）。
// 每张卡片带「推荐理由」（按你关注的 神经科学/心理学/脑科学 方向标注），
// 点击卡片弹出预览窗，查看完整标题、作者、来源与摘要；「查看原文」跳转 PubMed。
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { BookOpen, ExternalLink, RefreshCw, Sparkles, X } from 'lucide-react'
import Section from '@/components/ui/Section'
import SectionHeader from '@/components/ui/SectionHeader'

// ── 类型 ──
interface FrontierItem {
  id: string
  title: string
  authors: string[]
  source: string
  date: string
  url: string
  /** 推荐理由：命中的关注方向（神经科学/心理学/脑科学） */
  topic: string
  /** 摘要（OpenAlex 直接带；PubMed 点击预览时懒加载） */
  abstract?: string
  /** PubMed ID（用于懒加载摘要） */
  pmid?: string
}

/** 首页展示条数 */
const COUNT = 6
/** 每个方向预取条数（合并去重后截取 COUNT，保证三个方向都有覆盖） */
const PER_TOPIC = 4
/** 本地缓存键（v2：条目新增 topic/abstract 字段） */
const CACHE_KEY = 'frontier-v2'
/** 缓存有效期：每天更新一次 */
const TTL = 24 * 60 * 60 * 1000
/** 请求超时（毫秒）：网络不可用时快速进入错误态，而非一直显示骨架 */
const TIMEOUT_MS = 12000

/** 关注方向：每个方向一套检索式（PubMed / OpenAlex） */
const TOPICS = [
  { label: '神经科学', pubmed: 'neuroscience[Title/Abstract] OR neural[Title/Abstract]', openalex: 'title_and_abstract.search:(neuroscience OR neural)' },
  { label: '心理学', pubmed: 'psycholog*[Title/Abstract] OR "mental health"[Title/Abstract]', openalex: 'title_and_abstract.search:(psychology OR cognitive OR mental OR behavior)' },
  { label: '脑科学', pubmed: '"brain science"[Title/Abstract] OR brainwave[Title/Abstract] OR "brain computer"[Title/Abstract]', openalex: 'title_and_abstract.search:(brain OR brainwave)' },
]

/** 带超时的 fetch */
async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** 从 PubMed E-utilities 拉取（每个方向 esearch → 汇总 esummary，带推荐理由标注） */
async function fetchPubmed(): Promise<{ items: FrontierItem[]; source: string }> {
  const settled = await Promise.allSettled(
    TOPICS.map(async (t) => {
      const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
        t.pubmed
      )}&retmax=${PER_TOPIC}&sort=pub_date&retmode=json`
      const res = await fetchWithTimeout(url, TIMEOUT_MS)
      if (!res.ok) throw new Error('PubMed esearch failed')
      const json = await res.json()
      return { topic: t.label, ids: (json.esearchresult?.idlist ?? []) as string[] }
    })
  )
  const topicResults = settled
    .filter(
      (s): s is PromiseFulfilledResult<{ topic: string; ids: string[] }> => s.status === 'fulfilled'
    )
    .map((s) => s.value)

  // 合并去重（按方向顺序优先），截取前 COUNT 条
  const topicOf: Record<string, string> = {}
  const order: string[] = []
  for (const r of topicResults)
    for (const id of r.ids)
      if (!(id in topicOf)) {
        topicOf[id] = r.topic
        order.push(id)
      }
  const ids = order.slice(0, COUNT)
  if (!ids.length) throw new Error('PubMed returned no results')

  const esummary = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(
    ','
  )}&retmode=json`
  const res2 = await fetchWithTimeout(esummary, TIMEOUT_MS)
  if (!res2.ok) throw new Error('PubMed esummary failed')
  const json2 = await res2.json()

  const items: FrontierItem[] = ids
    .map((id) => {
      const d = json2.result?.[id]
      if (!d) return null
      return {
        id,
        title: d.title || '(无标题)',
        authors: (d.authors ?? [])
          .slice(0, 4)
          .map((a: { name?: string }) => a.name ?? '')
          .filter(Boolean),
        source: d.source || 'PubMed',
        date: d.pubdate || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        topic: topicOf[id] || TOPICS[0].label,
        pmid: id,
      }
    })
    .filter(Boolean) as FrontierItem[]
  if (!items.length) throw new Error('no PubMed items parsed')
  return { items, source: 'PubMed' }
}

/** 从 OpenAlex 拉取（PubMed 不可用时的自动兜底，CORS 友好、无需 key；含摘要） */
async function fetchOpenAlex(): Promise<{ items: FrontierItem[]; source: string }> {
  const settled = await Promise.allSettled(
    TOPICS.map(async (t) => {
      const url = `https://api.openalex.org/works?filter=${encodeURIComponent(
        t.openalex
      )}&sort=publication_date:desc&per-page=${PER_TOPIC}`
      const res = await fetchWithTimeout(url, TIMEOUT_MS)
      if (!res.ok) throw new Error('OpenAlex failed')
      const json = await res.json()
      return { topic: t.label, works: (json.results ?? []) as Record<string, any>[] }
    })
  )
  const topicResults = settled
    .filter(
      (s): s is PromiseFulfilledResult<{ topic: string; works: Record<string, any>[] }> =>
        s.status === 'fulfilled'
    )
    .map((s) => s.value)

  const items: FrontierItem[] = []
  const seen = new Set<string>()
  for (const r of topicResults) {
    for (const w of r.works) {
      const id = w.id ?? `oa-${items.length}-${Math.random()}`
      if (seen.has(id)) continue
      seen.add(id)
      items.push({
        id,
        title: w.display_name || '(无标题)',
        authors: (w.authorships ?? [])
          .slice(0, 4)
          .map((a: Record<string, any>) => a.author?.display_name ?? '')
          .filter(Boolean),
        source: w.primary_location?.source?.display_name || 'OpenAlex',
        date: w.publication_date || '',
        url: w.doi || w.primary_location?.landing_page_url || w.id,
        topic: r.topic,
        abstract: reconstructAbstract(w.abstract_inverted_index),
      })
      if (items.length >= COUNT) break
    }
    if (items.length >= COUNT) break
  }
  if (!items.length) throw new Error('no OpenAlex items')
  return { items, source: 'OpenAlex' }
}

/** 重建 OpenAlex 摘要（abstract_inverted_index 是词→位置倒排索引） */
function reconstructAbstract(inverted?: Record<string, number[]> | null): string {
  if (!inverted) return ''
  const pos: Record<number, string> = {}
  let max = -1
  for (const [word, idxs] of Object.entries(inverted)) {
    for (const i of idxs) {
      pos[i] = word
      if (i > max) max = i
    }
  }
  const words: string[] = []
  for (let i = 0; i <= max; i++) words.push(pos[i] ?? '')
  return words.join(' ').trim()
}

/** 懒加载 PubMed 摘要（efetch XML → 提取 AbstractText） */
async function fetchPubmedAbstract(pmid: string): Promise<string> {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`
  const res = await fetchWithTimeout(url, TIMEOUT_MS)
  if (!res.ok) throw new Error('abstract fetch failed')
  const xml = await res.text()
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const parts = Array.from(doc.querySelectorAll('AbstractText'))
    .map((n) => n.textContent ?? '')
    .filter(Boolean)
  return parts.join(' ').trim()
}

/** 拉取（PubMed 优先，失败自动回退 OpenAlex） */
async function loadFromNetwork(): Promise<{ items: FrontierItem[]; source: string }> {
  try {
    return await fetchPubmed()
  } catch {
    return await fetchOpenAlex()
  }
}

export default function Frontier() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [data, setData] = useState<{ items: FrontierItem[]; source: string } | null>(null)
  // 预览弹窗：当前预览的文献 + 摘要状态
  const [preview, setPreview] = useState<FrontierItem | null>(null)
  const [abstractText, setAbstractText] = useState<string | null>(null)
  const [abstractLoading, setAbstractLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')

    // 优先使用本地缓存（每天更新一次，避免每次打开都请求）
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const c = JSON.parse(cached)
        if (
          c.fetchedAt &&
          Date.now() - c.fetchedAt < TTL &&
          Array.isArray(c.items) &&
          c.items.length
        ) {
          setData({ items: c.items, source: c.source || 'PubMed' })
          setStatus('ready')
          return
        }
      }
    } catch {
      /* 缓存解析失败则忽略，走网络拉取 */
    }

    const ac = new AbortController()
    abortRef.current?.abort()
    abortRef.current = ac
    try {
      const result = await loadFromNetwork()
      if (ac.signal.aborted) return
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), ...result }))
      } catch {
        /* 存储失败不影响展示 */
      }
      setData(result)
      setStatus('ready')
    } catch {
      if (!ac.signal.aborted) setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
    return () => abortRef.current?.abort()
  }, [load])

  // 打开预览：OpenAlex 直接带摘要；PubMed 懒加载 efetch 摘要
  const openPreview = useCallback(async (item: FrontierItem) => {
    setPreview(item)
    setAbstractText(null)
    if (item.abstract) {
      setAbstractText(item.abstract)
      return
    }
    if (!item.pmid) return
    setAbstractLoading(true)
    try {
      const text = await fetchPubmedAbstract(item.pmid)
      if (text) setAbstractText(text)
    } catch {
      /* 摘要获取失败则显示"暂无摘要" */
    } finally {
      setAbstractLoading(false)
    }
  }, [])

  const closePreview = useCallback(() => setPreview(null), [])

  // Esc 关闭预览
  useEffect(() => {
    if (!preview) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePreview()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [preview, closePreview])

  return (
    <Section id="frontier" variant="teal" className="section-padding">
      <div className="container-custom">
        <SectionHeader
          title="学术前沿"
          subtitle="神经科学 / 心理学 / 脑科学的最新文献与前沿资讯，每日自动更新"
          badge="前沿文献 · 自动更新"
          index="04"
        />

        {/* 加载中：骨架卡片 */}
        {status === 'loading' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: COUNT }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 h-44 animate-pulse">
                <div className="h-4 w-24 bg-slate-200/70 rounded-full mb-4" />
                <div className="h-5 bg-slate-200/70 rounded mb-2" />
                <div className="h-5 bg-slate-200/70 rounded mb-5" />
                <div className="h-3 w-3/4 bg-slate-200/60 rounded mb-1.5" />
                <div className="h-3 w-1/2 bg-slate-200/60 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* 加载失败：友好提示 + 重试 */}
        {status === 'error' && (
          <div className="glass-card rounded-2xl py-16 text-center">
            <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600 font-medium">暂时无法连接文献服务，请稍后重试。</p>
            <button
              type="button"
              onClick={load}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-medium shadow-md shadow-teal-500/25 hover:-translate-y-0.5 transition-all"
            >
              <RefreshCw size={15} /> 重新加载
            </button>
          </div>
        )}

        {/* 加载成功：文献卡片网格 */}
        {status === 'ready' && data && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => openPreview(it)}
                  className="group card-hover-smooth relative glass-card rounded-2xl p-5 flex flex-col text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-300/70 overflow-hidden"
                >
                  {/* 悬停渐变填充层（毛玻璃 → 青绿渐变，保证白字清晰可读，与其它库一致） */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-medium text-teal-600 bg-teal-50/80 rounded-full px-2.5 py-1 border border-teal-200/50 truncate max-w-[65%] group-hover:text-white group-hover:bg-white/25 group-hover:border-white/40 transition-colors duration-300">
                        {it.source}
                      </span>
                      {it.date && (
                        <span className="shrink-0 text-xs text-slate-400 group-hover:text-teal-100">
                          {it.date}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 text-lift leading-snug line-clamp-3 group-hover:text-white transition-colors duration-300">
                      {it.title}
                    </h3>
                    {/* 推荐理由：与哪个关注方向相关 */}
                    <span className="inline-flex items-center gap-1 mt-3 self-start text-xs font-medium text-teal-700 bg-teal-50/80 rounded-full px-2.5 py-1 border border-teal-200/50 group-hover:text-white group-hover:bg-white/25 group-hover:border-white/40 transition-colors duration-300">
                      <Sparkles size={12} /> 推荐 · {it.topic}
                    </span>
                    {it.authors.length > 0 && (
                      <p className="text-xs text-slate-500 text-lift mt-2 line-clamp-1 group-hover:text-teal-50 transition-colors duration-300">
                        {it.authors.join('、')}
                      </p>
                    )}
                    <div className="mt-auto pt-4 text-sm text-teal-600 font-medium inline-flex items-center gap-1.5 group-hover:text-white group-hover:gap-2.5 transition-all">
                      查看摘要
                      <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-8">
              数据来源：{data.source} · 每日自动更新 · 点击卡片查看摘要
            </p>
          </>
        )}
      </div>

      {/* 预览弹窗：完整标题 / 作者 / 来源 / 摘要 */}
      {preview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closePreview}
          />
          <div className="relative glass-card bg-white/95 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 md:p-8">
            {/* 顶部：来源 + 日期 + 关闭 */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-medium text-teal-600 bg-teal-50/80 rounded-full px-2.5 py-1 border border-teal-200/50">
                {preview.source}
              </span>
              <div className="flex items-center gap-3">
                {preview.date && <span className="text-xs text-slate-400">{preview.date}</span>}
                <button
                  type="button"
                  onClick={closePreview}
                  aria-label="关闭预览"
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 推荐理由 */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50/80 rounded-full px-3 py-1.5 border border-teal-200/50 mb-4">
              <Sparkles size={13} />
              推荐理由：与你关注的「{preview.topic}」方向相关的最新文献
            </span>

            {/* 完整标题 */}
            <h3 className="text-xl font-semibold text-slate-800 leading-snug">{preview.title}</h3>

            {/* 作者 */}
            {preview.authors.length > 0 && (
              <p className="mt-2 text-sm text-slate-500">{preview.authors.join('、')}</p>
            )}

            {/* 摘要 */}
            <div className="mt-5 pt-5 border-t border-slate-100">
              <h4 className="text-sm font-medium text-slate-700 mb-2">摘要</h4>
              {abstractLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-slate-200/70 rounded w-full" />
                  <div className="h-3 bg-slate-200/70 rounded w-11/12" />
                  <div className="h-3 bg-slate-200/70 rounded w-4/5" />
                </div>
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {abstractText ?? '本文暂无摘要。'}
                </p>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closePreview}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-sm text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-all"
              >
                关闭
              </button>
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-medium shadow-md shadow-teal-500/25 hover:-translate-y-0.5 transition-all"
              >
                查看原文 <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}

