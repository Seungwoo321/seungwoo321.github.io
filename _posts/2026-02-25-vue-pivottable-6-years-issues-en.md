---
title: "6 Months of Vibe Coding: 6-Year-Old Issues Resolved in a Week"
date: "2026-02-25"
tags: ["AI", "Claude Code", "Vue", "React", "vue-pivottable", "tailwind-grid-layout", "Open Source"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-02-25"
lang: en
locale: en
ref: vibe-coding-vue-pivottable-issues
---

"I'll do it someday."

There were issues I had been putting off for 6 years. I resolved all 12 of them in a week.

<!--more-->

## Things I Postponed

vue-pivottable is a project I created in 2019. It's a Vue port of PivotTable.js, and GitHub issue responses have been constantly delayed since then.

In February 2020, someone asked: "Can I apply different aggregation functions to multiple values in a single pivot table?" It was a feature that didn't even exist in the original PivotTable.js. Implementation difficulty seemed high. Postponed.

In April 2020, an issue came up about SSR errors in Nuxt.js. My understanding of SSR was low at the time. I couldn't think of a quick solution. Postponed.

In June 2021, a request came in for Subtotal plugin integration. It required reimplementing jQuery-based subtotal.js in Vue. It looked like a big task. Postponed.

---

## One Week

From February 17 to 22, 2026, I resolved all 12 issues.

The oldest issue was registered in February 2020. That's 6 years.

What changed? I got used to a way of working while building [automation tools](/blog/2026/02/24/automation-tools-after-vibe-coding/). Even problems that look complex, you just start. AI drafts the initial version, helps with debugging, and writes test code.

Things I thought were "probably hard" for 6 years turned out not to be that hard when I actually tried.

---

## 3 New Packages

### Multi-Value Aggregation (Issue #16)

Revenue as sum, quantity as average, profit margin as weighted average. It was a request to aggregate different metrics differently in a single cell.

I created @vue-pivottable/multi-value-renderer. The aggregatorMap prop specifies aggregation functions per field. It also supports 2-Input Aggregators like "Sum over Sum".

Initially I made a dropdown-based UI, but managing multiple values was inconvenient. I switched to a tag-based UI with modal editing.

### Subtotals and Expand/Collapse (Issue #47)

The original PivotTable.js had a subtotal.js plugin made by nagarajanchinnasamy. It provided subtotal calculation and expand/collapse for hierarchical data, but being jQuery-based, it couldn't be used in Vue.

I reimplemented it as @vue-pivottable/subtotal-renderer. The trickiest part was header colspan handling. The initial version didn't handle colspan at all, causing headers to duplicate. I completely rewrote it referencing the existing vue-pivottable spanSize function.

### Nuxt SSR Support (Issue #20)

vue-pivottable was developed assuming a browser environment, causing window/document access errors during SSR.

I created @vue-pivottable/nuxt. Add one line to nuxt.config and client-side-only loading is automatically handled. It supports both Nuxt 2 and Nuxt 3.

---

## Things That Already Existed But Nobody Knew

5 of the 12 issues were features that already existed. Users didn't know the solution because documentation was lacking.

Want to add hyperlinks to cells? clickCallback already existed. Want to make Plotly charts responsive? plotlyOptions prop was there. Want to hide the control UI? Just use the VuePivottable component.

I was reminded again that documentation is as important as building features.

---

## There Were Bugs Too

There was a bug where binding v-model to the config prop didn't reflect in the initial state. The feature to save and restore pivot table settings wasn't working.

The cause was simple. The init method wasn't referencing the config prop value. I fixed it and added 18 tests.

There was also a CSS import error. The CSS path was missing from the package.json exports field. Fixed with one line addition.

---

## I Also Worked on tailwind-grid-layout

It wasn't just vue-pivottable. I also cleaned up tailwind-grid-layout.

tailwind-grid-layout is a project I made as an alternative to react-grid-layout. It's Tailwind CSS-based with a small bundle size. I implemented almost identical features, but there were remaining drag-related bugs.

When dragging an item from outside into the grid, the preview didn't follow the mouse. This was because handleDragOver only set a flag without calculating position. Position was only calculated at drop time, so users couldn't predict where the item would land.

I added real-time mouse tracking logic to DroppableGridContainer. Optimized performance with 60fps throttle, and collision detection also runs in real-time. Valid positions show green preview, collisions show red.

I also improved 8-direction resize handles. There was a problem where resize was just ignored when colliding with static items. Now it checks collision for each direction and provides visual feedback with a red border on collision.

I also deployed [live demo](https://tailwind-grid-layout.pages.dev/) and [Storybook](https://tailwind-grid-layout-storybook.pages.dev/). 339 tests pass.

---

## Wrap Up

I resolved issues I had postponed for 6 years in a week. Things I thought "would be hard" turned out not to be when I actually tried. The psychological burden accumulated while postponing seems to have been greater than the actual difficulty.

All 3 new packages (multi-value-renderer, subtotal-renderer, nuxt-module) support both Vue 2 and Vue 3. They're published on npm with demo sites available.
