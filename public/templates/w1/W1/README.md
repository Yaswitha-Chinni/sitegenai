# COCO POUR — Official Brand Website

A premium, highly animated, responsive product website for **COCO POUR**, a pure coconut milk brand.

## Media Assets (Root Directory `W1`)
All media assets reside in the project root without separate media subfolders:
- `coco-pour-logo.png` (and `coco-pour-logo.jpeg`) — Brand logo
- `vid1.mp4` — Product hero animation (1280x720 HD)
- `vid2.mp4` — Coconut harvesting animation ("From palm to pour") (1280x720 HD)
- `vid3.mp4` — Coconut milk pouring animation ("Pour something good") (1280x720 HD)
- `vid4.mp4` — Bottle and coconut showcase animation ("Made for every pour") (1280x720 HD)

## Running the Website

### Option 1: Python Dev Server with HTTP 206 Byte-Range Streaming (Recommended)
```bash
python server.py
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Direct Python HTTP Server
```bash
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 3: Direct File Opening
Double-click `index.html` in your file explorer to open it in any modern browser.

## Features & Motion Design
- **Smart Video Performance**: Uses `IntersectionObserver` to only play videos visible in the active viewport (threshold > 25%), auto-pausing offscreen videos to guarantee 60 FPS performance and conserve battery/CPU.
- **Audio & Mute Controls**: Custom interactive sound toggle overlays on each video.
- **GSAP & ScrollTrigger Animations**: Staggered hero entrance, smooth scroll-triggered section reveals, and subtle parallax effects.
- **Responsive Layout**: Designed for mobile, tablet, laptop, and ultra-wide desktop viewports.
- **Accessibility**: ARIA labels, semantic HTML, and `prefers-reduced-motion` compliance.
