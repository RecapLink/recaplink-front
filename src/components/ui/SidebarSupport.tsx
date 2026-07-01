import type { CSSProperties } from 'react'
import { useSupportSettings } from '@/hooks/useSupportSettings'

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}

export function SidebarSupport() {
  const { settings } = useSupportSettings()

  if (!settings.enabled) return null

  const bubbleStyle: CSSProperties = {
    position: 'absolute',
    right: 10,
    top: 24,
    width: 140,
    backgroundColor: settings.bubbleColor || '#4d9538',
    borderRadius: 9999,
    padding: '11px 15px 13px',
    boxShadow: '0 8px 28px rgba(77, 149, 56, 0.42)',
    animation: 'sidebar-float 3.5s ease-in-out infinite',
  }

  const titleText = interpolate(settings.title, {
    startHour: settings.startHour,
    endHour: settings.endHour,
  })

  const illustrationSrc = settings.illustration || '/images/sidebar-support.png'

  return (
    <div
      className="relative w-full flex-shrink-0 select-none"
      style={{ height: 276 }}
    >
      {/* Woman illustration — anchored to bottom-left */}
      <img
        src={illustrationSrc}
        alt=""
        draggable={false}
        className="absolute bottom-0 pointer-events-none"
        style={{ left: 14, width: 162 }}
      />

      {/* Floating assistance bubble — top-right, animated */}
      <div style={bubbleStyle}>
        <p
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 8.5,
            lineHeight: 1.55,
            margin: 0,
            fontWeight: 400,
          }}
        >
          {titleText}
        </p>
        <p
          style={{
            color: '#ffffff',
            fontSize: 19,
            fontWeight: 700,
            margin: '4px 0 0',
            lineHeight: 1.2,
            letterSpacing: '0.3px',
          }}
        >
          {settings.phone}
        </p>
      </div>
    </div>
  )
}
