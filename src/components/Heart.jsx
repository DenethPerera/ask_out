// Simple inline SVG heart — no external image/icon dependency, easy to
// recolor and resize, and animates cheaply since it's just a path fill.
export default function Heart({ size = 20, color = '#fb7185', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21s-6.716-4.35-9.428-8.485C.99 9.75 1.31 6.5 3.879 4.879 6.06 3.5 8.7 4.06 10.2 6.03L12 8.4l1.8-2.37c1.5-1.97 4.14-2.53 6.32-1.15 2.57 1.62 2.89 4.87 1.31 7.636C18.716 16.65 12 21 12 21z" />
    </svg>
  )
}
