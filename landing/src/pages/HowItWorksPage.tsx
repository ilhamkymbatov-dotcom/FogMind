import {
  ArrowRight,
  CircleCheck,
  CloudFog,
  FileText,
  History,
  MessageCircleQuestion,
  Sparkles,
  TrendingUp,
  Upload,
  Waypoints,
  Workflow,
} from 'lucide-react'
import { useTranslation } from '../i18n'
import { CtaBand } from '../components/CtaBand'
import { FeatureSection } from '../components/FeatureSection'
import { PageHero } from '../components/PageHero'
import visuals from '../components/FeatureSection.module.css'

const ICON = 28

/**
 * Icon only, no format chips. The supported formats live on the Product page
 * so they are not stated identically on two pages.
 */
function UploadVisual() {
  return (
    <div className={visuals.panel}>
      <Upload className={visuals.panelAccent} size={44} aria-hidden="true" />
    </div>
  )
}

function ReadsVisual() {
  return (
    <div className={visuals.panel}>
      <FileText className={visuals.panelIcon} size={ICON} aria-hidden="true" />
      <ArrowRight className={visuals.arrow} size={20} aria-hidden="true" />
      <Sparkles className={visuals.panelAccent} size={ICON} aria-hidden="true" />
      <ArrowRight className={visuals.arrow} size={20} aria-hidden="true" />
      <Workflow className={visuals.panelIcon} size={ICON} aria-hidden="true" />
    </div>
  )
}

function MapVisual() {
  return (
    <div className={visuals.panel}>
      <Waypoints className={visuals.panelAccent} size={44} aria-hidden="true" />
    </div>
  )
}

function FogVisual() {
  const { t } = useTranslation()
  const stages = [
    { icon: CloudFog, label: t('hiw.fog.stage1'), accent: false },
    { icon: MessageCircleQuestion, label: t('hiw.fog.stage2'), accent: false },
    { icon: CircleCheck, label: t('hiw.fog.stage3'), accent: true },
  ]

  return (
    <div className={visuals.panel}>
      <div className={visuals.stages}>
        {stages.map(({ icon: Icon, label, accent }) => (
          <div key={label} className={visuals.stage}>
            <Icon
              className={accent ? visuals.panelAccent : visuals.panelIcon}
              size={24}
              aria-hidden="true"
            />
            <span className={visuals.stageLabel}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressVisual() {
  return (
    <div className={visuals.panel}>
      <History className={visuals.panelIcon} size={ICON} aria-hidden="true" />
      <TrendingUp className={visuals.panelAccent} size={ICON} aria-hidden="true" />
    </div>
  )
}

function HowItWorksPage() {
  return (
    <>
      <PageHero titleKey="hiw.hero.title" subtitleKey="hiw.hero.subtitle" />

      <FeatureSection
        titleKey="hiw.upload.title"
        bodyKey="hiw.upload.body"
        visual={<UploadVisual />}
      />
      <FeatureSection
        titleKey="hiw.reads.title"
        bodyKey="hiw.reads.body"
        visual={<ReadsVisual />}
        reverse
      />
      <FeatureSection titleKey="hiw.map.title" bodyKey="hiw.map.body" visual={<MapVisual />} />
      <FeatureSection
        titleKey="hiw.fog.title"
        bodyKey="hiw.fog.body"
        visual={<FogVisual />}
        reverse
      />
      <FeatureSection
        titleKey="hiw.adaptive.title"
        bodyKey="hiw.adaptive.body"
        visual={<ProgressVisual />}
      />

      <CtaBand />
    </>
  )
}

export default HowItWorksPage
