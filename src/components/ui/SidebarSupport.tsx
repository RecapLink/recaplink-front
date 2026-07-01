import type { CSSProperties } from 'react'

const bubbleStyle: CSSProperties = {
  position: 'absolute',
  right: 10,
  top: 24,
  width: 140,
  backgroundColor: '#4d9538',
  borderRadius: 9999,
  padding: '11px 15px 13px',
  boxShadow: '0 8px 28px rgba(77, 149, 56, 0.42)',
  animation: 'sidebar-float 3.5s ease-in-out infinite',
}

export function SidebarSupport() {
  return (
    <div
      className="relative w-full flex-shrink-0 select-none"
      style={{ height: 276 }}
    >
      {/* Woman illustration — anchored to bottom-left */}
      <img
        src="/images/sidebar-support.png"
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
          Assistance disponible de
          <br />
          9h à 17h au
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
          52.056.778
        </p>
      </div>
    </div>
  )
}
