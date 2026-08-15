// src/components/sections/Frontier.tsx
// 「学术前沿」区块（首页）：自动从网络获取神经科学 / 心理学 / 脑科学的最新文献卡片。
// 无需手动更新——打开页面时自动拉取 PubMed（失败自动回退 OpenAlex），
// 结果缓存到 localStorage（每天更新一次）。
// 每张卡片带「推荐理由」（按你关注的 神经科学/心理学/脑科学 方向标注），
// 点击卡片弹出预览窗，查看完整标题、作者、来源与摘要；「查看原文」跳转 PubMed。
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { BookOpen, Brain, BrainCircuit, ExternalLink, Heart, Languages, RefreshCw, Sparkles, X } from 'lucide-react'
import Section from '@/components/ui/Section'
import SectionHeader from '@/components/ui/SectionHeader'
import FloatingChips from '@/components/ui/FloatingChips'

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
/** 每个方向预取条数：加大候选池，供「按天确定性挑选」选出当日文献（不同终端同一天结果一致） */
const PER_TOPIC = 25
/** 本地缓存键前缀（实际键为 frontier-v3-YYYY-MM-DD，按自然日换新） */
const CACHE_KEY = 'frontier-v3'
/** 请求超时（毫秒）：网络不可用时快速进入错误态，而非一直显示骨架 */
const TIMEOUT_MS = 12000

/** 关注方向：每个方向一套检索式（PubMed / OpenAlex） */
const TOPICS = [
  { label: '神经科学', pubmed: 'neuroscience[Title/Abstract] OR neural[Title/Abstract]', openalex: 'title_and_abstract.search:(neuroscience OR neural)' },
  { label: '心理学', pubmed: 'psycholog*[Title/Abstract] OR "mental health"[Title/Abstract]', openalex: 'title_and_abstract.search:(psychology OR cognitive OR mental OR behavior)' },
  { label: '脑科学', pubmed: '"brain science"[Title/Abstract] OR brainwave[Title/Abstract] OR "brain computer"[Title/Abstract]', openalex: 'title_and_abstract.search:(brain OR brainwave)' },
]

/** 顶刊名单（同时覆盖 PubMed 缩写与 OpenAlex/全称；仅推荐顶级期刊文献） */
const TOP_JOURNALS = [
  // 综合
  'nature', 'science', 'cell',
  // 神经科学
  'nat neurosci', 'nature neuroscience', 'nat rev neurosci', 'nature reviews neuroscience',
  'nat rev neurol', 'nature reviews neurology', 'neuron', 'j neurosci', 'journal of neuroscience',
  'nat ment health', 'nature mental health', 'nat hum behav', 'nature human behaviour', 'nature human behavior',
  'the lancet neurology', 'lancet neurology', 'brain', 'neuroimage', 'cerebral cortex', 'elife',
  // 心理学 / 认知
  'psychol sci', 'psychological science', 'trends cogn sci', 'trends in cognitive sciences',
  'nature reviews psychology', 'nat rev psych', 'american psychologist',
  // 综合高影响
  'nature medicine', 'nat med', 'nature communications', 'nat commun', 'science advances', 'sci adv',
]

/** PubMed 期刊限定检索段（[TA] 期刊缩写标签，OR 连接） */
const JOURNAL_TA =
  'Nature[TA] OR Science[TA] OR Cell[TA] OR Neuron[TA] OR "Nat Neurosci"[TA] OR "Nat Rev Neurosci"[TA] OR "Nat Hum Behav"[TA] OR "J Neurosci"[TA] OR "Curr Biol"[TA] OR "Psychol Sci"[TA] OR "Trends Cogn Sci"[TA] OR "Nat Ment Health"[TA] OR "Lancet Neurol"[TA] OR "Brain"[TA] OR "Neuroimage"[TA] OR "Cereb Cortex"[TA] OR "eLife"[TA] OR "Nat Commun"[TA] OR "Sci Adv"[TA] OR "Nat Rev Psychol"[TA] OR "Am Psychol"[TA] OR "Nat Med"[TA]'

/** OpenAlex 顶级期刊 source ID（| 表示 OR） */
const OPENALEX_SOURCE_IDS =
  'S137773608|S3880285|S110447773|S45757444|S2298632|S26843219|S2764866340|S5555990|S128425624|S58854535|S192051125|S4387286578|S70053155|S96638545|S103225281|S1336409049|S64187185|S2737427234'

/** 期刊名归一化后判断是否顶刊 */
function isTopJournal(name: string): boolean {
  const n = name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  if (!n) return false
  if (TOP_JOURNALS.includes(n)) return true
  // 放宽：Nature 系 / 高影响期刊前缀
  return ['nature neuroscience', 'nature reviews', 'nature human', 'trends in cognitive'].some((k) =>
    n.includes(k)
  )
}

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
        `(${t.pubmed}) AND (${JOURNAL_TA})`
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

  // 按方向交错合并去重（保证三个方向都有覆盖）
  const topicOf: Record<string, string> = {}
  const groups: string[][] = []
  const seen = new Set<string>()
  for (const r of topicResults) {
    const g: string[] = []
    for (const id of r.ids)
      if (!seen.has(id)) {
        seen.add(id)
        topicOf[id] = r.topic
        g.push(id)
      }
    if (g.length) groups.push(g)
  }
  const ids = interleave(groups, PER_TOPIC * TOPICS.length)
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
  // 顶刊限定：只保留顶级期刊的文献，再按「日期确定性挑选」选出当日 6 篇（同一天不同终端结果一致）
  const topItems = items.filter((it) => isTopJournal(it.source))
  if (!topItems.length) throw new Error('EMPTY_TOP')
  return { items: selectDaily(topItems, TOPICS.map((t) => t.label)), source: 'PubMed' }
}

/** 从 OpenAlex 拉取（PubMed 不可用时的自动兜底，CORS 友好、无需 key；含摘要） */
async function fetchOpenAlex(): Promise<{ items: FrontierItem[]; source: string }> {
  const settled = await Promise.allSettled(
    TOPICS.map(async (t) => {
      const url = `https://api.openalex.org/works?filter=${encodeURIComponent(
        `${t.openalex},locations.source.id:${OPENALEX_SOURCE_IDS}`
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

  const groups: FrontierItem[][] = []
  const seen = new Set<string>()
  for (const r of topicResults) {
    const g: FrontierItem[] = []
    for (const w of r.works) {
      const id = w.id ?? `oa-${g.length}-${Math.random()}`
      if (seen.has(id)) continue
      seen.add(id)
      g.push({
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
    }
    if (g.length) groups.push(g)
  }
  const items = interleave(groups, PER_TOPIC * TOPICS.length)
  // 顶刊限定：只保留顶级期刊的文献，再按「日期确定性挑选」选出当日 6 篇
  const topItems = items.filter((it) => isTopJournal(it.source))
  if (!topItems.length) throw new Error('EMPTY_TOP')
  return { items: selectDaily(topItems, TOPICS.map((t) => t.label)), source: 'OpenAlex' }
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

/** 交错合并多个分组（轮流取各方向条目，保证三个方向都有覆盖） */
function interleave<T>(groups: T[][], max: number): T[] {
  const out: T[] = []
  let i = 0
  while (out.length < max) {
    let added = false
    for (const g of groups) {
      if (i < g.length) {
        out.push(g[i])
        added = true
        if (out.length >= max) break
      }
    }
    if (!added) break
    i++
  }
  return out
}

/** 确定性挑选：每篇按「当天 UTC 日期 + 种子键 + id」计算确定性哈希分，按分排序取前 count。
 *  相比「种子洗牌」，哈希分排序对候选池变化更稳定——不同终端/不同抓取时间即使池子差几篇，
 *  其余条目的相对顺序不变，当日结果仍一致。 */
function pickDaily<T extends { id: string }>(items: T[], count: number, seedKey: string): T[] {
  if (items.length <= count) return items
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD（UTC，全终端一致）
  const scored = items.map((it) => {
    let seed = 0
    const key = `${today}|${seedKey}|${it.id ?? ''}`
    for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
    return { it, score: seed }
  })
  scored.sort((a, b) => a.score - b.score || String(a.it.id).localeCompare(String(b.it.id)))
  return scored.slice(0, count).map((s) => s.it)
}

/** 按日期从顶刊候选池中确定性挑选每日 6 篇（每个方向 2 篇，不足则从剩余补齐）。
 *  修复：此前各终端各自 slice 前 N 条，导致不同终端/不同抓取时间显示内容不一致。 */
function selectDaily(items: FrontierItem[], topics: string[], count: number = COUNT): FrontierItem[] {
  const byTopic = new Map<string, FrontierItem[]>()
  for (const it of items) {
    const key = topics.includes(it.topic) ? it.topic : (topics[0] ?? '神经科学')
    const arr = byTopic.get(key) ?? []
    arr.push(it)
    byTopic.set(key, arr)
  }
  const picked = new Set<string>()
  const out: FrontierItem[] = []
  const perTopic = Math.max(1, Math.floor(count / topics.length))
  for (const topic of topics) {
    const group = (byTopic.get(topic) ?? []).sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    for (const it of pickDaily(group, perTopic, topic)) {
      if (!picked.has(it.id)) {
        picked.add(it.id)
        out.push(it)
      }
    }
  }
  if (out.length < count) {
    const rest = items
      .filter((it) => !picked.has(it.id))
      .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    for (const it of pickDaily(rest, count - out.length, 'fill')) {
      picked.add(it.id)
      out.push(it)
    }
  }
  return out.slice(0, count)
}

/** 免费 Google Translate 接口：把文本翻译成中文（返回译文） */
async function translateText(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(
    text
  )}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('translate failed')
  const data = (await res.json()) as unknown[][][]
  return (data?.[0] ?? [])
    .map((seg) => (seg?.[0] ?? '') as string)
    .join('')
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

// ── 卡片封面主题（按方向生成论文封面式横幅） ──
const TOPIC_THEME: Record<string, { gradient: string; icon: React.ReactNode }> = {
  神经科学: { gradient: 'from-indigo-500 to-purple-600', icon: <Brain size={22} /> },
  心理学: { gradient: 'from-rose-400 to-pink-600', icon: <Heart size={22} /> },
  脑科学: { gradient: 'from-teal-500 to-cyan-600', icon: <BrainCircuit size={22} /> },
}

/** 卡片顶部图片：按方向生成的论文封面式横幅（期刊名 + 主题图标）。
 *  bleed 控制外边距：卡片用负边距铺满卡片顶部，弹窗用自包含圆角。 */
function PaperBanner({
  topic,
  source,
  bleed = '-mt-5 -mx-5 mb-4 rounded-b-2xl',
  bannerClass = 'h-28',
}: {
  topic: string
  source: string
  bleed?: string
  /** 横幅高度类，如 'h-28'（常规）/ 'h-36'（首卡加高，营造层次感） */
  bannerClass?: string
}) {
  const theme = TOPIC_THEME[topic] || TOPIC_THEME['神经科学']
  return (
    <div className={`relative ${bleed} ${bannerClass} overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
      {/* 装饰圆 */}
      <div aria-hidden className="absolute -top-8 -right-6 w-28 h-28 rounded-full bg-white/10" />
      <div aria-hidden className="absolute top-1 right-14 w-14 h-14 rounded-full bg-white/10" />
      <div aria-hidden className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-black/10" />
      {/* 主题图标 + 方向 */}
      <span className="absolute top-3 left-4 flex items-center gap-2 text-white/95">
        {theme.icon}
        <span className="text-xs font-semibold tracking-wide">{topic}</span>
      </span>
      {/* 期刊名（论文封面风格） */}
      <span className="absolute bottom-3 right-4 left-4 text-xs font-medium text-white/90 truncate">
        {source}
      </span>
    </div>
  )
}

export default function Frontier() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'empty'>('loading')
  const [data, setData] = useState<{ items: FrontierItem[]; source: string } | null>(null)
  // 预览弹窗：当前预览的文献 + 摘要状态
  const [preview, setPreview] = useState<FrontierItem | null>(null)
  const [abstractText, setAbstractText] = useState<string | null>(null)
  const [abstractLoading, setAbstractLoading] = useState(false)
  // 中文翻译：默认英文，开启后显示中文译文
  const [showZh, setShowZh] = useState(false)
  const [zhAbstract, setZhAbstract] = useState<string | null>(null)
  const [zhLoading, setZhLoading] = useState(false)
  const zhCache = useRef<Map<string, string>>(new Map())
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')

    // 优先使用本地缓存：缓存键带当天日期（frontier-v3-YYYY-MM-DD），
    // 同一天内复用当天结果（不同终端同一天一致），自然日切换自动换新
    const cacheKey = `${CACHE_KEY}-${new Date().toISOString().slice(0, 10)}`
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const c = JSON.parse(cached)
        if (Array.isArray(c.items) && c.items.length) {
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
        localStorage.setItem(cacheKey, JSON.stringify({ fetchedAt: Date.now(), ...result }))
      } catch {
        /* 存储失败不影响展示 */
      }
      setData(result)
      setStatus('ready')
    } catch (e) {
      if (!ac.signal.aborted)
        setStatus(e instanceof Error && e.message === 'EMPTY_TOP' ? 'empty' : 'error')
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
    setShowZh(false)
    setZhAbstract(null)
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

  // 通过导航栏/其他方式切走当前卡片时，自动关闭预览弹窗（避免隐藏弹窗残留、锁定新页面滚轮翻页）
  useEffect(() => {
    const onNavigate = (e: Event) => {
      const id = (e as CustomEvent).detail?.id
      if (id && id !== 'frontier') closePreview()
    }
    window.addEventListener('pager:navigate', onNavigate)
    return () => window.removeEventListener('pager:navigate', onNavigate)
  }, [closePreview])

  // 切换中文翻译：开启时懒加载译文（缓存到 ref，避免重复请求）
  const toggleZh = useCallback(async () => {
    if (!preview) return
    if (showZh) {
      setShowZh(false)
      return
    }
    setShowZh(true)
    if (zhCache.current.has(preview.id)) {
      setZhAbstract(zhCache.current.get(preview.id) ?? null)
      return
    }
    const source = abstractText ?? preview.abstract ?? ''
    if (!source) {
      setZhAbstract(null)
      return
    }
    setZhLoading(true)
    try {
      const zh = await translateText(source)
      zhCache.current.set(preview.id, zh)
      setZhAbstract(zh)
    } catch {
      setZhAbstract(null)
    } finally {
      setZhLoading(false)
    }
  }, [preview, showZh, abstractText])

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

        {/* 加载中：骨架卡片（与 Bento 砖墙排布一致，避免加载后跳动） */}
        {status === 'loading' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:auto-rows-[15rem]">
            {Array.from({ length: COUNT }).map((_, i) => (
              <div
                key={i}
                className={`glass-card rounded-2xl p-4 animate-pulse ${
                  i === 0 ? 'sm:col-span-2 lg:row-span-2' : i >= 3 ? 'sm:col-span-2' : ''
                }`}
              >
                <div className="h-6 w-24 bg-slate-200/70 rounded-full mb-4" />
                <div className="h-6 bg-slate-200/70 rounded mb-2 w-3/4" />
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

        {/* 今日无匹配顶刊：友好提示 + 重试 */}
        {status === 'empty' && (
          <div className="glass-card rounded-2xl py-16 text-center">
            <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600 font-medium">今日暂无匹配的顶刊文献，请稍后再试。</p>
            <button
              type="button"
              onClick={load}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-medium shadow-md shadow-teal-500/25 hover:-translate-y-0.5 transition-all"
            >
              <RefreshCw size={15} /> 重新加载
            </button>
          </div>
        )}

        {/* 加载成功：文献卡片网格（Bento 砖墙排布：首卡 2×2 特色大卡 + 两张小方卡 + 三张宽卡） */}
        {status === 'ready' && data && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:auto-rows-[15rem]">
              {data.items.map((it, i) => {
                // 排布规则：0=特色大卡（横跨2列2行，大图+精选角标+作者正文），3/4/5=宽卡（横跨2列），1/2=小方卡
                const featured = i === 0
                const span = featured
                  ? 'sm:col-span-2 lg:row-span-2'
                  : i >= 3
                    ? 'sm:col-span-2'
                    : ''
                const bannerH = featured ? 'h-48' : i >= 3 ? 'h-20' : 'h-16'
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => openPreview(it)}
                    className={`group card-hover-smooth relative glass-card rounded-2xl ${
                      featured ? 'p-5' : 'p-4'
                    } flex flex-col text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-300/70 overflow-hidden ${span}`}
                  >
                    {/* 悬停渐变填充层（毛玻璃 → 青绿渐变，保证白字清晰可读，与其它库一致） */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    {/* 毛玻璃质感装饰（与其它页面共享 Card 对齐）：顶部高光 + 内层柔光 */}
                    <div aria-hidden className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                    <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 via-white/5 to-transparent" />
                    {/* 特色大卡：封面右上角「今日精选」角标，凸显主卡（同参考图大卡的强调效果） */}
                    {featured && (
                      <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-slate-900/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <Sparkles size={11} /> 今日精选
                      </span>
                    )}
                    <div className="relative flex flex-col flex-1">
                      {/* 卡片封面图片：特色大卡高横幅，小/宽卡细横幅（同参考图不同尺寸砖块） */}
                      <PaperBanner topic={it.topic} source={it.source} bannerClass={bannerH} />
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {it.date && (
                          <span className="text-xs text-slate-400 group-hover:text-teal-100">
                            {it.date}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50/80 rounded-full px-2.5 py-1 border border-teal-200/50 group-hover:text-white group-hover:bg-white/25 group-hover:border-white/40 transition-colors duration-300">
                          <Sparkles size={11} /> 推荐 · {it.topic}
                        </span>
                      </div>
                      <h3
                        className={`font-semibold text-slate-800 text-lift leading-snug group-hover:text-white transition-colors duration-300 ${
                          featured ? 'text-lg line-clamp-4' : 'text-sm line-clamp-2'
                        }`}
                      >
                        {it.title}
                      </h3>
                      {featured && it.authors.length > 0 && (
                        <p className="text-xs text-slate-500 text-lift mt-2 line-clamp-2 group-hover:text-teal-50 transition-colors duration-300">
                          {it.authors.join('、')}
                        </p>
                      )}
                      <div className="mt-auto pt-3 lg:pt-4 text-sm text-teal-600 font-medium inline-flex items-center gap-1.5 group-hover:text-white group-hover:gap-2.5 transition-all">
                        查看摘要
                        <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-center text-xs text-slate-400 mt-8">
              数据来源：{data.source} · 顶刊文献 · 每日自动更新 · 点击卡片查看摘要
            </p>
          </>
        )}
      </div>

      {/* 漂浮文字卡片：同其它页面卡通插画上的玻璃徽章风格，分列左右两侧的背景留白区（文案贴合学术前沿内容） */}
      {/* 左侧：「前沿探索」 */}
      <div className="absolute top-0 left-20 bottom-0 hidden lg:block pointer-events-none">
        <FloatingChips
          side="left"
          sparkleColor="text-teal-500"
          showSparkle={false}
          chips={[
            { icon: <Brain size={12} />, label: '前沿探索', position: 'top-[30%]', animation: 'animate-float', textColor: 'text-teal-700', gradientFrom: 'from-teal-500', gradientTo: 'to-cyan-600' },
          ]}
        />
      </div>
      {/* 右侧：「每日更新」 + 星星 */}
      <div className="absolute top-0 right-20 bottom-0 hidden lg:block pointer-events-none">
        <FloatingChips
          side="right"
          sparkleColor="text-teal-500"
          chips={[
            { icon: <RefreshCw size={12} />, label: '每日更新', position: 'bottom-[28%]', animation: 'animate-float-delayed', textColor: 'text-indigo-600', gradientFrom: 'from-indigo-500', gradientTo: 'to-purple-500' },
          ]}
        />
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
            {/* 封面横幅 */}
            <PaperBanner topic={preview.topic} source={preview.source} bleed="rounded-2xl mb-5" />
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
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-slate-700">摘要</h4>
                <button
                  type="button"
                  onClick={toggleZh}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 bg-teal-50/80 rounded-full px-2.5 py-1 border border-teal-200/50 hover:text-teal-700 hover:border-teal-300 transition-colors"
                >
                  <Languages size={13} />
                  {showZh ? '隐藏中文' : '中文翻译'}
                </button>
              </div>
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

              {/* 中文翻译（默认英文，开启后显示在英文下方） */}
              {showZh && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
                  {zhLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 bg-slate-200/70 rounded w-full" />
                      <div className="h-3 bg-slate-200/70 rounded w-11/12" />
                      <div className="h-3 bg-slate-200/70 rounded w-4/5" />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {zhAbstract ?? '翻译暂不可用，请稍后重试。'}
                    </p>
                  )}
                </div>
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

