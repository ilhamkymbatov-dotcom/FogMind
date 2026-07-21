import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Sparkles } from 'lucide-react'
import type { Node, Question } from '@fogmind/backend'
import { useTranslation } from '../i18n'
import { KnowledgeGraph } from '../components/graph/KnowledgeGraph'
import { QuestionPanel } from '../components/graph/QuestionPanel'
import { treeLayout } from '../lib/graphModel'
import { useGraphGame } from '../lib/useGraphGame'
import styles from './DocumentDetailPage.module.css'

type PanelState =
  | { kind: 'node'; node: Node; questions: Question[] }
  | { kind: 'review'; questions: Question[] }
  | null

function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const game = useGraphGame(id)
  const [panel, setPanel] = useState<PanelState>(null)

  const { loading, error, document, nodes, edges, statusOf, statsOf, summary } = game
  const positions = useMemo(() => treeLayout(nodes, edges), [nodes, edges])

  const reviewAvailable = game.allCompleted && game.reviewQuestions.length > 0

  function openNode(node: Node) {
    const questions = game.pendingQuestions(node.id)
    if (questions.length > 0) setPanel({ kind: 'node', node, questions })
  }

  function openReview() {
    if (game.reviewQuestions.length > 0) setPanel({ kind: 'review', questions: game.reviewQuestions })
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headMain}>
          <Link to="/app" className={styles.back}>
            <ChevronLeft size={16} aria-hidden="true" />
            {t('detail.allMaps')}
          </Link>
          <h1 className={styles.title}>{document?.title ?? t('detail.mapFallback')}</h1>
        </div>
        {!loading && !error ? (
          <div className={styles.headRight}>
            {reviewAvailable ? (
              <button type="button" className={styles.reviewButton} onClick={openReview}>
                <Sparkles size={16} aria-hidden="true" />
                {t('detail.review', { count: game.reviewQuestions.length })}
              </button>
            ) : null}
            <div className={styles.progress}>
              <span className={styles.progressText}>
                {t('detail.summary', {
                  mastered: summary.mastered,
                  total: summary.total,
                  percent: summary.percent,
                })}
              </span>
              <div className={styles.bar} aria-hidden="true">
                <div className={styles.barFill} style={{ width: `${summary.percent}%` }} />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {loading ? (
        <p className={styles.state}>{t('detail.loading')}</p>
      ) : error ? (
        <div className={styles.error} role="alert">
          {t(error)}
        </div>
      ) : nodes.length === 0 ? (
        <p className={styles.state}>{t('detail.noMap')}</p>
      ) : (
        <div className={styles.canvas}>
          <KnowledgeGraph
            nodes={nodes}
            edges={edges}
            positions={positions}
            statusOf={statusOf}
            hintOf={(nodeId) => {
              const s = statsOf(nodeId)
              return { answered: s.answered, total: s.total }
            }}
            onOpen={openNode}
          />
        </div>
      )}

      {panel?.kind === 'node' ? (
        <QuestionPanel
          title={panel.node.title}
          questions={panel.questions}
          onAnswer={game.recordAnswer}
          onClose={() => setPanel(null)}
          doneTitle={t('detail.doneNodeTitle')}
          doneBody={t('detail.doneNodeBody')}
        />
      ) : panel?.kind === 'review' ? (
        <QuestionPanel
          title={t('detail.reviewTitle')}
          questions={panel.questions}
          onAnswer={game.recordAnswer}
          onClose={() => setPanel(null)}
          doneTitle={t('detail.doneReviewTitle')}
          doneBody={t('detail.doneReviewBody')}
        />
      ) : null}
    </div>
  )
}

export default DocumentDetailPage
