# Prankraft Portfolio — The Trickster Site 🎭

> A premium developer portfolio that **looks** flawless but **behaves** mischievously.

## 📝 Submission Description (150 words)

**Prankraft** is a deceptive developer portfolio that weaponizes professional UI/UX expectations against the user. At first glance, it presents a flawless, dark-themed portfolio with smooth animations, interactive particle backgrounds, and glassmorphism — indistinguishable from any premium developer site. But every interaction hides a playful surprise.

Nav links scramble into gibberish. The "Hire Me" button begs desperately. Downloading a CV triggers a 404. Submitting the contact form crashes the browser with a fake Blue Screen of Death. Skill cards flee from your cursor. A theme toggle plunges the site into neon chaos. Even the Konami Code unlocks a secret rainbow mode.

A floating prank counter gamifies discovery, and after uncovering enough secrets, a reveal modal celebrates the user's journey. All 15 pranks use subtle sound effects generated via Web Audio API — zero external dependencies, pure HTML/CSS/JS chaos disguised as professionalism.

## 🎭 Prank Elements (Spoilers!)

| # | Interaction | What Happens | Trigger |
|---|---|---|---|
| 1 | **Hover nav links** 3+ times | Text scrambles into funny alternatives ("Skills" → "🎭 Magic") | Quick |
| 2 | **Click "Hire Me"** 5 times | Begs progressively, then celebrates with confetti | Medium |
| 3 | **Click "View My Work"** twice | Page flips upside down briefly | Quick |
| 4 | **Click "View My Work"** 3+ times | Page shakes violently | Quick |
| 5 | **Click "Download CV"** | Fake download → 404 → CV button runs away | Quick |
| 6 | **Hover skill cards** 3+ times | Cards flee from your mouse cursor | Quick |
| 7 | **Click testimonials** twice | Reviews swap to absurd quotes (from "A Bug", "Roomba") | Quick |
| 8 | **Focus name input** | Auto-types "I already know who you are..." | Quick |
| 9 | **Submit contact form** 1st time | Triggers a fake Windows BSOD with error sound | Quick |
| 10 | **Submit form** 4th time | Gravity mode — everything falls down | Medium |
| 11 | **Click social media links** | Random excuses ("My social life is also 404") | Quick |
| 12 | **Konami Code** (↑↑↓↓←→←→BA) | Rainbow mode + everything floats | Easter Egg |
| 13 | **Click theme toggle** 🌙 | Cycles: Neon → Inverted → Grayscale → Normal | Quick |
| 14 | **Click the logo** multiple times | Colors invert, grayscale, then party mode | Medium |
| 15 | **Click scroll indicator** | Scrolls the WRONG direction | Quick |
| 16 | **Cookie banner** "Reject" 3+ times | Banner moves, begs, dismisses, comes back! | Quick |
| 17 | **Right-click anywhere** | Custom context menu with pranky options | Quick |
| 18 | **Copy any text** | Clipboard is hijacked with pranked content | Quick |
| 19 | **Switch browser tabs** | Tab title cycles sad messages ("Come back!") | Passive |
| 20 | **Open DevTools console** | ASCII art + styled Prankraft banner | Easter Egg |
| 21 | **Scroll down the page** | Progress bar starts lying, goes backwards | Passive |

### Bonus Features
- **🎯 Prank Counter** — Floating badge (bottom-right) tracks discovered pranks
- **🏆 Prank Reveal** — After 8 pranks, a modal celebrates with a full checklist
- **✨ Cursor Trail** — Glowing colored trail follows the mouse
- **🔊 Sound Effects** — Web Audio API generates prank sounds (boop, error, success)
- **🌌 Animated Background** — Interactive particle network reacts to mouse movement
- **⏫ Scroll Progress Bar** — Gradient bar at top that eventually starts lying

## 🛠️ Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, gradients, glassmorphism, 280+ animation keyframes
- **Vanilla JavaScript** — No frameworks, Web Audio API for sounds
- **Google Fonts** — Outfit, Inter, JetBrains Mono

## 🚀 Deployment

### Deploy to Vercel
1. Push to GitHub
2. Import in Vercel
3. Framework Preset: **Other**
4. Output directory: `.` (root)
5. Build command: leave empty or `echo done`

### Deploy to GitHub Pages
1. Push to GitHub
2. Settings → Pages → Deploy from main branch

## 📁 Project Structure

```
├── index.html      # Main HTML structure
├── style.css       # Complete design system & styles (~1900 lines)
├── script.js       # All prank logic & interactions (~1450 lines)
├── package.json    # Project metadata
├── vercel.json     # Vercel deployment config
└── readme.md       # You are here
```

## 💡 Design Philosophy

- **First impression**: Premium, dark theme, particle animations — a "serious" portfolio
- **Second impression**: Chaos. Controlled, delightful chaos.
- **All pranks are**: Non-harmful, user-safe, and delightful
- **Responsive**: Works on both mobile and desktop
- **No external dependencies**: Pure HTML/CSS/JS, zero npm packages
- **Gamified**: Prank counter + reveal system makes it an exploration game

---

*Built with ❤️ and a bit of mischief for the IEEE Computer Society Prankraft competition.*
