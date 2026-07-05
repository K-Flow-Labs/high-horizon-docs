# High Horizon Docs Design System

## Purpose

Public documentation site for High Horizon operating decisions. The surface should feel clear, restrained, and trustworthy, closer to a policy brief than a marketing page.

## Tokens

- Background: `#fbfbf8`
- Surface: `#ffffff`
- Text: `#202124`
- Muted text: `#5f6368`
- Line: `#dedbd2`
- Marketplace green: `#2e7d5b`
- IELTS blue: `#315f9f`
- Caution amber: `#b56a15`
- Radius: `8px`
- Base spacing: `4px`
- Content width: `1120px`
- Reading width: `780px`

## Typography

- Font stack: system UI with Korean fallbacks.
- Display: 40px desktop, 32px tablet, 28px mobile.
- Section heading: 28px desktop, 24px mobile.
- Body: 16px, line-height 1.75.
- Small: 14px, line-height 1.6.

## Components

- Header: sticky, white surface, subtle bottom border.
- Document nav: compact links with current page state.
- Language switcher: compact segmented links in the header.
- Hero: unframed content band with two concise action links.
- Document cards: flat white cards, 1px border, 8px radius.
- Article: readable single column, headings anchored by clear spacing.
- Code blocks: preformatted dark text on warm neutral surface.
- Tables: responsive horizontal scroll when needed.

## Responsive Rules

- Header wraps navigation on narrow screens.
- Article content must not overflow at 375px.
- CJK text uses `word-break: keep-all` with `overflow-wrap: break-word`.
- Tables can scroll horizontally inside the article.

## Accepted Debt

- Mermaid blocks are shown as source code for now. Add Mermaid rendering only when diagrams become a primary public feature.
