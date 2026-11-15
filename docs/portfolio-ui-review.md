# Shinobi Portfolio UI review

**First change I would ship:** make **View projects** the primary action on the 2D entry screen and **Explore the village** the primary action in 3D. The visitor has already chosen how to browse. The entry screen can honor that choice and take them directly to something worth seeing.

This review pairs the current React components with the portfolio screenshots supplied in this chat. The reference sites were reviewed on 15 November 2026. The recommendations below are design proposals. The viewport checks at the end are acceptance criteria for implementation.

## What to borrow from the references

| Reference | Pattern worth studying | Where it fits in this portfolio |
| --- | --- | --- |
| [Context.dev homepage](https://www.context.dev/) | A short statement of purpose leads into a working example. Switching the language tab changes the example in place. | Introduce Ashutosh’s work in one sentence. When a project or skill is selected, keep the selector in place and update one clearly identified detail area. |
| [Skiper UI · Projects Showcase](https://skiper-ui.com/v1/preview/skiper80) | A dedicated project presentation gives the work a visual focal point. | Make one screenshot the focal point of the right-hand book page. Let the paper, spine, and page turn provide the visual character. |
| [Skiper UI · Expandable Tabs Navigation](https://skiper-ui.com/v1/preview/skiper96) | The active destination can carry more information than its neighbors. | Give the selected nearby target a visible action. On a phone, a compact trigger can expand into a touch-friendly list when several targets are close together. |

## Three changes to prioritize

### 1. Entry gate — establish the next step

The current gate places **Explore My World** or **Enter 3D Village**, **View My Projects**, and **Contact Me** together, followed by six destinations. In 2D the most prominent button immediately takes the visitor out of the mode they chose.

Give **View projects** the filled vermilion button in 2D. Keep **Enter 3D village** beside it as an outlined action and present **Contact** as a text link. In 3D, keep exploration primary and make the label concrete: **Walk through the village**. On a 320px screen, let the primary button occupy its own row. Keep the destination directory immediately after the introduction. [Entry gate component](../naruto-room/src/features/entry/components/EntryGate.jsx)

**Success check:** a first-time visitor can reach a real project from the welcome screen in one action and can tell which button changes browsing mode.

### 2. Project book — give the reader a reason to open the website

The right page already has a clickable screenshot, a dish name, a description, a problem statement, technologies, features, and external links. The opportunity is their order. Put the project title and one sentence about the work above the screenshot. Place **Visit website ↗** immediately beneath it, with **Source code ↗** as a quieter secondary link. Move the longer technical explanation below those actions.

For **DS Photography & Films**, a lead could read *A photography portfolio for a Mumbai studio, with galleries for weddings, portraits, and events.* Verify that wording against the project record before publishing. Keep the ramen nickname in smaller italic type on the selection page so the reader sees the theme without reading the same subtitle twice. [Project spread component](../naruto-room/src/features/projects/components/ProjectSpread.jsx)

**Success check:** on a short laptop screen, the selected project’s name, purpose, and at least one route to the live site are visible before scrolling through its feature list. On mobile, **Back to projects** restores the previously selected item and list position.

### 3. Village HUD — give the player room to see the scene

The phone screenshot at the Mission Board shows why this matters: Sakura, Sasuke, and the board can all be in range, while the movement pad, sprint, jump, and music controls already occupy the lower screen. The dock now has centering and height limits. The next improvement is to reduce how much of the scene it covers at rest.

For one target, show **Talk to Sasuke** or **Open Mission Board**. For several targets on touchscreens, try a compact **Nearby · 3** trigger above the movement controls. Tapping it opens a list with names on the left and **Talk** or **Open** on the right. Close it when the player leaves range or activates a target. Reserve the **E** shortcut hint for keyboard users. [Interaction HUD component](../naruto-room/src/features/village/components/InteractionHUD.jsx)

**Success check:** with the list open on a 390px phone in either orientation, all three targets are reachable and the player can still move away. Walking to the next gate updates both the target count and selection.

## The rest of the portfolio

| Screen | Recommended change | How to judge it |
| --- | --- | --- |
| Skills | Lead each category with one example of where Ashutosh used it. For a category linked to a project, put that project directly below the short description, then show the tool chips. | A reader can connect a skill to an actual project without scanning every tool. Switching to a shorter category brings GitHub activity up naturally. |
| Mission scroll | Put role, contribution, and outcome at the top of each dossier using verified CMS content. Keep certificates and screenshots together below the summary. | A recruiter can explain Ashutosh’s part in the mission before opening a PDF. |
| About | Keep the official posters at their natural aspect ratios. Use the same image width across all three rows and align each title and caption to one text edge. | At phone width, “Vinland Saga” and its caption wrap comfortably and the full poster remains visible. |
| Contact | Keep the plain charcoal header. Give the form one prominent submit action and position its success or error message beside that action. Keep email and social links visible as alternatives. | At 200% zoom or with the phone keyboard open, the visitor can read validation feedback and reach Submit. |
| Navigation and motion | Use a single brief word reveal for each major heading. Keep page turning for projects and unrolling for missions. Use a short color or underline transition for ordinary links. | Visitors can act before an entrance finishes. Reduced-motion mode exposes the same content and actions immediately. |

## Implementation and review order

1. Ship the entry CTA hierarchy and project-page reading order together. Both improve the same journey from arrival to a live project.
2. Prototype the compact Nearby control at the Mission Board, where three targets compete for space. Test walking, fast travel, and opening dialogue before changing other HUD controls.
3. Apply the skills, dossier, and contact refinements. Reuse the existing warm-charcoal surfaces, ivory headings, vermilion actions, GSAP timelines, and Lenis integration.
4. Check the complete journey at **320 × 568**, **390 × 844**, **844 × 390**, **768 × 1024**, **1366 × 768**, and **1920 × 1080**. Repeat with keyboard navigation and reduced motion. On a physical phone, check the browser toolbar, safe-area insets, and open keyboard, especially around the book’s page controls and the contact form.

A practical release test is to ask someone unfamiliar with the village to **find a project, explain what Ashutosh built, open its live site, and find a way to contact him**. Observe where they hesitate. That tells you which visual change to make next.
