# Sign Language Translation Platform - Development Plan

## Design Guidelines

### Design References
- **Modern dark theme** with vibrant accent colors
- **Youth for Challenge** Moroccan organization branding
- **ASL (American Sign Language)** educational/tech aesthetic

### Color Palette
- Primary Background: #0F0F1A (Deep Navy/Black)
- Secondary Background: #1A1A2E (Dark Blue)
- Card Background: #16213E (Midnight Blue)
- Accent Primary: #E94560 (Vibrant Red/Pink - Youth for Challenge)
- Accent Secondary: #0F3460 (Deep Blue)
- Accent Tertiary: #533483 (Purple)
- Gradient: linear-gradient(135deg, #E94560, #533483) (Red to Purple)
- Text Primary: #FFFFFF
- Text Secondary: #A0AEC0 (Light Gray)
- Success: #48BB78 (Green - for confirmed letters)

### Typography
- Headings: Inter, font-weight 700-800
- Body: Inter, font-weight 400
- Monospace (translation output): JetBrains Mono / monospace

### Key Component Styles
- **Navbar**: Glassmorphism effect, backdrop-blur, sticky top
- **Buttons**: Gradient background (red-purple), rounded-xl, hover scale
- **Cards**: Dark blue bg, border glow on hover, rounded-2xl
- **Webcam Box**: Rounded border with animated gradient border
- **Translation Box**: Dark card with green accent for confirmed letters
- **Sections**: Full-width with subtle gradient backgrounds

### Layout
- Hero: Full viewport, centered content, animated particles/shapes
- Translator: Side-by-side (webcam | translation), responsive stack on mobile
- How it works: 4-step horizontal cards
- About: Grid layout with ASL alphabet display
- Footer: Multi-column with social links

### Images to Generate
1. **hero-sign-language-hands.jpg** - Artistic shot of hands making sign language gestures with colorful lighting, dark background (Style: photorealistic, dramatic lighting)
2. **asl-alphabet-chart.jpg** - Clean visual chart showing ASL alphabet hand signs A-Z on dark background (Style: minimalist, educational)
3. **youth-challenge-teamwork.jpg** - Diverse young people collaborating on technology project, modern setting (Style: photorealistic, warm tones)
4. **sign-language-communication.jpg** - Two people communicating through sign language, modern environment with tech elements (Style: photorealistic, vibrant)

---

## Development Tasks

### Files to Create/Modify (8 files max)

1. **index.html** - Update title to "Sign Language - Youth for Challenge"
2. **src/pages/Index.tsx** - Main page with all sections (Hero, Translator, How it works, About, Footer)
3. **src/components/Navbar.tsx** - Animated navbar with glassmorphism
4. **src/components/HeroSection.tsx** - Hero with title, slogan, CTA
5. **src/components/TranslatorSection.tsx** - Webcam + translation box + timing controls
6. **src/components/HowItWorks.tsx** - Step-by-step explanation cards
7. **src/components/AboutSection.tsx** - Info about project + ASL alphabet grid
8. **src/components/Footer.tsx** - Footer with links and branding