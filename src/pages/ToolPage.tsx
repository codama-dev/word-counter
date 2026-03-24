import { Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShareModal, isShareDismissed } from '@/components/ShareModal'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/pages/PageHeader'

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'at', 'of', 'on', 'in', 'to', 'for', 'and', 'or',
  'but', 'not', 'with', 'as', 'by', 'from', 'it', 'its', 'this', 'that',
  'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
  'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall',
  'can', 'need', 'dare', 'ought', 'used', 'i', 'me', 'my', 'myself', 'we',
  'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'they',
  'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'because', 'if', 'then',
  'else', 'about', 'up', 'out', 'off', 'over', 'under', 'again', 'further',
  'once', 'here', 'there', 'any', 'also',
])

function formatTime(minutes: number, t: (key: string) => string): string {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60)
    return `${seconds} ${t('tool.seconds')}`
  }
  return `${Math.round(minutes)} ${t('tool.minutes')}`
}

interface KeywordEntry {
  word: string
  count: number
  density: number
}

function getKeywords(text: string): KeywordEntry[] {
  const words = text.toLowerCase().match(/[a-zA-Z\u00C0-\u024F\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF]+/g)
  if (!words || words.length === 0) return []

  const freq: Record<string, number> = {}
  for (const w of words) {
    if (w.length < 2 || STOP_WORDS.has(w)) continue
    freq[w] = (freq[w] || 0) + 1
  }

  const totalWords = words.length
  return Object.entries(freq)
    .map(([word, count]) => ({
      word,
      count,
      density: (count / totalWords) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

export function ToolPage() {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const shareTriggered = useRef(false)

  const stats = useMemo(() => {
    const trimmed = text.trim()
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : []
    const wordCount = words.length
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0
    const readingTime = wordCount / 200
    const speakingTime = wordCount / 150
    const keywords = getKeywords(text)

    return { wordCount, characters, charactersNoSpaces, sentences, paragraphs, readingTime, speakingTime, keywords }
  }, [text])

  const handleTextChange = (value: string) => {
    setText(value)
    if (!shareTriggered.current && !isShareDismissed()) {
      const wordCount = value.trim().split(/\s+/).filter(Boolean).length
      if (wordCount > 10) {
        shareTriggered.current = true
        setShareOpen(true)
      }
    }
  }

  const statItems = [
    { label: t('tool.words'), value: stats.wordCount },
    { label: t('tool.characters'), value: stats.characters },
    { label: t('tool.charactersNoSpaces'), value: stats.charactersNoSpaces },
    { label: t('tool.sentences'), value: stats.sentences },
    { label: t('tool.paragraphs'), value: stats.paragraphs },
    { label: t('tool.readingTime'), value: formatTime(stats.readingTime, t) },
    { label: t('tool.speakingTime'), value: formatTime(stats.speakingTime, t) },
  ]

  return (
    <div className="space-y-8">
      <PageHeader />

      <div className="mx-auto max-w-4xl px-4">
        {/* Stats bar */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {statItems.map(item => (
            <div
              key={item.label}
              className="rounded-lg border bg-card p-3 text-center shadow-sm"
            >
              <p className="font-bold text-2xl text-foreground">{item.value}</p>
              <p className="text-muted-foreground text-xs">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            dir="ltr"
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            placeholder={t('tool.placeholder')}
            className="min-h-[300px] w-full resize-y rounded-xl border bg-card p-4 font-mono text-foreground text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {text && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setText('')}
              className="absolute top-3 right-3"
            >
              <Trash2 className="mr-1 size-4" />
              {t('tool.clear')}
            </Button>
          )}
        </div>

        {/* Keyword density */}
        {stats.keywords.length > 0 && (
          <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground text-lg">{t('tool.topKeywords')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">{t('tool.keyword')}</th>
                    <th className="pb-2 text-right font-medium">{t('tool.count')}</th>
                    <th className="pb-2 text-right font-medium">{t('tool.density')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.keywords.map((kw, i) => (
                    <tr key={kw.word} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 font-medium text-foreground">{kw.word}</td>
                      <td className="py-2 text-right text-foreground">{kw.count}</td>
                      <td className="py-2 text-right text-muted-foreground">{kw.density.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No text hint */}
        {!text && (
          <p className="mt-4 text-center text-muted-foreground text-sm">{t('tool.noText')}</p>
        )}
      </div>

      <ShareModal open={shareOpen} onOpenChange={setShareOpen} showDismissOption />
    </div>
  )
}
