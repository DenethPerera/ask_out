// Giphy sticker assets used across the site. Direct CDN links (not the
// iframe embed) so they render as plain <img> tags — no third-party script,
// no iframe chrome, just the animated image.
//
// width/height are hints (Giphy's natural render size for each) so the
// browser can reserve layout space and avoid a pop-in shift while the GIF
// loads; actual on-screen size is still controlled by CSS classes.

// Cartoon Network Latam sticker — the main centered "hero" visual.
export const HERO_STICKER = {
  src: 'https://media.giphy.com/media/Ri98Ht4Q9hczOeHC1E/giphy.gif',
  width: 480,
  height: 480,
}

// "Achtung" transparent approval sticker — shown inside the Yes button.
export const YES_STICKER = {
  src: 'https://media.giphy.com/media/opvdnsIBv1AciolLjk/giphy.gif',
  width: 480,
  height: 302,
}

// Cat shaking its head "no" — shown inside the No button.
export const NO_STICKER = {
  src: 'https://media.giphy.com/media/nR4L10XlJcSeQ/giphy.gif',
  width: 480,
  height: 413,
}

// "Yes! Oh yeah! Hurray!" reaction — launched flying up from the Yes button
// whenever the cursor lands on it, Facebook-story-reaction style.
export const YES_REACTION_STICKER = {
  src: 'https://media.giphy.com/media/iP3klSm6JADGzQFofN/giphy.gif',
  width: 400,
  height: 332,
}

// Crying reaction — launched flying up from the No button whenever the
// cursor lands on it (right before it dodges away).
export const NO_REACTION_STICKER = {
  src: 'https://media.giphy.com/media/Xr9TlAqw3S7VPOrftK/giphy.gif',
  width: 400,
  height: 600,
}

// "I said yes!" engagement ring sticker — celebrates on the success screen.
export const SUCCESS_STICKER = {
  src: 'https://media.giphy.com/media/fvN5KrNcKKUyX7hNIA/giphy.gif',
  width: 480,
  height: 270,
}
