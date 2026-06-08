import './LoadingOverlay.css'

interface LoadingOverlayProps {
  title: string
  hint?: string
}

export function LoadingOverlay({ title, hint }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-overlay__spinner">
        <span className="loading-overlay__ring" />
        <span className="loading-overlay__ring loading-overlay__ring--delay" />
      </div>
      <p className="loading-overlay__title">{title}</p>
      {hint && <p className="loading-overlay__hint">{hint}</p>}
    </div>
  )
}
