import type { CSSProperties } from 'react'
import { useSupportSettings } from '@/hooks/useSupportSettings'

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`)
}

export function SidebarSupport() {
  const { settings } = useSupportSettings()

  if (!settings.enabled) return null

  // Figma node 573:2760 — group 225×219px at x=55 in the 301px sidebar
  // Bubble sits in the upper-right of the group (right=21 from sidebar edge)
  const bubbleStyle: CSSProperties = {
    position: 'absolute',
    right: 15,
    top: 10,
    width: 118,
    backgroundColor: settings.bubbleColor || '#4d9538',
    borderRadius: 9999,
    padding: '10px 13px 12px',
    boxShadow: '0 8px 28px rgba(77, 149, 56, 0.42)',
    animation: 'sidebar-float 3.5s ease-in-out infinite',
  }

  const titleText = interpolate(settings.title, {
    startHour: settings.startHour,
    endHour: settings.endHour,
  })

  const illustrationSrc = settings.illustration || '/images/sidebar-support.png'

  return (
    // Figma group height = 219px
    <div
      className="relative w-full flex-shrink-0 select-none overflow-visible"
      style={{ height: 219 }}
    >
      {/* Illustration — left=50 matches Figma group x=55, width=130 */}
      <img
        src={illustrationSrc}
        alt=""
        draggable={false}
        className="absolute bottom-0 pointer-events-none"
        style={{ left: 50, width: 130 }}
      />

      {/* Floating speech bubble */}
      <div style={bubbleStyle}>
        <p
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 8,
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
            fontSize: 17,
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
