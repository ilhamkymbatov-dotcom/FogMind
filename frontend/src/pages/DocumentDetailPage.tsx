import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import type { Node } from '@fogmind/backend'
import { KnowledgeGraph } from '../components/graph/KnowledgeGraph'
import { QuestionPanel } from '../components/graph/QuestionPanel'
import { useGraphGame } from '../lib/useGraphGame'
import styles from './DocumentDetailPage.module.css'

function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const game = useGraphGame(id)
  const [openNode, setOpenNode] = useState<Node | null>(null)

  const { loading, error, document, nodes, edges, statusOf, summary } = game

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headMain}>
          <Link to="/app" className={styles.back}>
            <ChevronLeft size={16} aria-hidden="true" />
            All maps
          </Link>
          <h1 className={styles.title}>{document?.title ?? 'Map'}</h1>
        </div>
        {!loading && !error ? (
          <div className={styles.progress}>
            <span className={styles.progressText}>
              {summary.mastered} of {summary.total} mastered · {summary.percent}%
            </span>
            <div className={styles.bar} aria-hidden="true">
              <div className={styles.barFill} style={{ width: `${summary.percent}%` }} />
            </div>
          </div>
        ) : null}
      </div>

      {loading ? (
        <p className={styles.state}>Loading your map</p>
      ) : error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : nodes.length === 0 ? (
        <p className={styles.state}>This document has no map yet.</p>
      ) : (
        <div className={styles.canvas}>
          <KnowledgeGraph nodes={nodes} edges={edges} statusOf={statusOf} onOpen={setOpenNode} />
        </div>
      )}

      {openNode ? (
        <QuestionPanel
          node={openNode}
          questions={game.questionsByNode.get(openNode.id) ?? []}
          onAnswer={(correct, nextState) => game.recordAnswer(openNode.id, correct, nextState)}
          onClose={() => setOpenNode(null)}
        />
      ) : null}
    </div>
  )
}

export default DocumentDetailPage
