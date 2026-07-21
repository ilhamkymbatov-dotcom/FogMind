import {
  CircleCheck,
  CloudFog,
  Eye,
  FileText,
  Gauge,
  ListChecks,
  MessageCircleQuestion,
  SlidersHorizontal,
  TrendingUp,
  Waypoints,
} from 'lucide-react'
import { useTranslation } from '../../i18n'
import { CtaBand } from '../components/CtaBand'
import { FeatureSection } from '../components/FeatureSection'
import { PageHero } from '../components/PageHero'
import visuals from '../components/FeatureSection.module.css'

const ICON = 28

function GraphVisual() {
  return (
    <div className={visuals.panel}>
      <Waypoints className={visuals.panelAccent} size={44} aria-hidden="true" />
    </div>
  )
}

function QuestionsVisual() {
  return (
    <div className={visuals.panel}>
      <MessageCircleQuestion className={visuals.panelAccent} size={ICON} aria-hidden="true" />
      <ListChecks className={visuals.panelIcon} size={ICON} aria-hidden="true" />
    </div>
  )
}

function FogVisual() {
  return (
    <div className={visuals.panel}>
      <CloudFog className={visuals.panelIcon} size={ICON} aria-hidden="true" />
      <MessageCircleQuestion className={visuals.panelAccent} size={ICON} aria-hidden="true" />
      <CircleCheck className={visuals.panelIcon} size={ICON} aria-hidden="true" />
    </div>
  )
}

function AdaptiveVisual() {
  return (
    <div className={visuals.panel}>
      <SlidersHorizontal className={visuals.panelIcon} size={ICON} aria-hidden="true" />
      <Gauge className={visuals.panelAccent} size={ICON} aria-hidden="true" />
    </div>
  )
}

function ProgressVisual() {
  return (
    <div className={visuals.panel}>
      <Eye className={visuals.panelIcon} size={ICON} aria-hidden="true" />
      <TrendingUp className={visuals.panelAccent} size={ICON} aria-hidden="true" />
    </div>
  )
}

function FormatsVisual() {
  const { t } = useTranslation()
  const formats = ['PDF', 'DOCX', 'Markdown', t('product.formats.plain')]

  return (
    <div className={visuals.panel}>
      <div className={visuals.chipGrid}>
        {formats.map((label) => (
          <span key={label} className={visuals.chip}>
            <FileText size={14} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function ProductPage() {
  return (
    <>
      <PageHero titleKey="product.hero.title" subtitleKey="product.hero.subtitle" />

      <FeatureSection
        titleKey="product.graph.title"
        bodyKey="product.graph.body"
        visual={<GraphVisual />}
      />
      <FeatureSection
        titleKey="product.questions.title"
        bodyKey="product.questions.body"
        visual={<QuestionsVisual />}
        reverse
      />
      <FeatureSection
        titleKey="product.fog.title"
        bodyKey="product.fog.body"
        visual={<FogVisual />}
      />
      <FeatureSection
        titleKey="product.adaptive.title"
        bodyKey="product.adaptive.body"
        visual={<AdaptiveVisual />}
        reverse
      />
      <FeatureSection
        titleKey="product.progress.title"
        bodyKey="product.progress.body"
        visual={<ProgressVisual />}
      />
      <FeatureSection
        titleKey="product.formats.title"
        bodyKey="product.formats.body"
        visual={<FormatsVisual />}
        reverse
      />

      <CtaBand />
    </>
  )
}

export default ProductPage
