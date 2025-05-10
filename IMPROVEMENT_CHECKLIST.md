# UI/UX Improvement Checklist

## Visual Hierarchy & Spacing
- [x] Increase whitespace between sections and cards for better readability
- [x] Add section dividers or subtle background color changes to separate main stream from creator grid
- [x] Use consistent card heights for creator cards, even when offline

## Typography & Readability
- [x] Increase font size for headings and important labels
- [x] Use a more readable font for body text and ensure consistent font weights
- [x] Improve contrast for text, especially for status indicators (e.g., "Offline" in red, "Live" in green)

## Responsiveness & Mobile UX
- [ ] Test on mobile devices for proper stacking and tap targets
- [ ] Reduce padding/margins on mobile to maximize content area
- [ ] Make the theme toggle more accessible on mobile

## Creator Cards
- [x] Add avatars (Twitch profile images) for each creator
- [x] Show more info (game/category, short bio/description if available)
- [x] Add hover effects (shadow or scale) for interactivity
- [x] Make the whole card clickable, not just the "Visit Channel" button

## Stream Embed
- [x] Maintain aspect ratio (e.g., 16:9) for the video embed
- [ ] Add a loading spinner while the embed loads
- [ ] Show stream title and category more prominently, possibly as an overlay

## Theme Toggle
- [ ] Remember user's selected theme in localStorage and restore on reload
- [ ] Add an icon (sun/moon) for quick recognition

## Accessibility
- [ ] Ensure all interactive elements are keyboard accessible
- [ ] Add more descriptive ARIA labels where needed
- [ ] Check all text and button colors for sufficient contrast (WCAG guidelines)

## Feedback & Error Handling
- [ ] Show feedback when searching (e.g., "No creators found")
- [ ] Handle API errors with a user-friendly message and retry option

## Performance
- [ ] Lazy load Twitch embeds when in viewport (Intersection Observer)
- [ ] Optimize images using Next.js <Image /> for avatars and thumbnails

## Polish & Branding
- [ ] Add a favicon and logo for branding
- [ ] Use a custom color palette that matches branding (purple,black,gold,green)
- [ ] Add subtle animations for card hover, button clicks, and theme changes 