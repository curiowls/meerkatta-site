# MeerKatta field-note template

Working editorial template, refined with the owner November 14, 2026. Use alongside `editorial-queue.md` and chian-writing. This is a flexible reading structure, not a fixed formula or a list of product/mascot attributes.

## Three guiding decisions

1. Write a founder reflection on a real choice, observation, or practical tension, not an inventory of features or attributes.
2. Keep the strongest connections. Drop stretched metaphors even when they sound appealing.
3. Separate current product behavior from the larger direction. Evidence, interpretation, and aspiration must not borrow credibility from each other.

Add scannability without losing the thread: a reader who reads only the title, headings, and bold lead phrases should understand the argument. A reader who reads everything should find a coherent short essay, not disconnected points.

## Position and voice

MeerKatta lives between productivity and ordinary life. Practical enough to explain what a design choice changes; warm enough to make space for unfinished thinking. Prefer quiet curiosity over dramatic lifestyle copy, and concrete reasoning over efficiency promises. The Ohlalarm reference demonstrates useful reading variety, not a voice or layout to copy.

## Draft scaffold

```markdown
Category / review status / date
# [A concrete question or decision, not a keyword list]
[One-sentence premise: why this matters to the reader.]

[Short opening: a real tension or choice. No invented personal history.]

[Optional image with an informative caption. Place where it adds meaning.]

## [First takeaway, not a generic category]
**[Short lead phrase].** [One observation with a concrete example.]
**[Short lead phrase].** [What that suggests for the product or practice.]

## [Second takeaway that develops the first]
**[Short lead phrase].** [Observation or question.]

[Optional research callout, comparison, or annotated visual.]

**[Short lead phrase].** [Our interpretation and the decision it informs.]
[Optional one-sentence design principle or attributed quote.]

## [What this means in a day]
**[Short lead phrase].** [Practical consequence, including limits.]
[Quiet ending: something to try, consider, or return to.]

[Sources and further reading, when used.]

## [A practical invitation tied to the article]
[One sentence suggesting a first thing to try, not a generic sales pitch.]
[Primary: Download for Mac] [Secondary: Get for iPhone & iPad]
[Platform-specific trial/pricing note, verified from current homepage.]
[Optional related note below: descriptive link + why it follows.]
```

## Modules: choose, don't accumulate

- **Image:** usually one, sometimes two if each explains something different. Product screenshot for behavior, mascot for personality, diagram for a relationship. Stable dimensions, meaningful alt text, brief caption. No tall decorative interruption; do not obscure content with text over artwork.
- **Research lens:** finding in plain language, direct primary-source link, relevant sample/context, then a concise boundary. Follow with the founder's interpretation. A study about animal communication is not evidence for transcription performance or habit formation.
- **Design principle:** one original sentence visually emphasized. Do not put quotation marks around it as if an outside expert said it.
- **External quote:** optional, exact, short, and attributed with a source. Never invent a quote or turn a paraphrase into one. Respect source quotation limits.
- **Product connection:** one or two relevant features, explained in the context of the argument. Use approved illustrations from `/Users/chelchel/meerkatta/brand/home-guidance` when appropriate; inspect their README and usage constraints first. Pair each with concrete benefit copy; artwork is not a real UI screenshot or evidence of functionality. Preserve full compositions and avoid unsupported platform parity, automatic learning, camera access, or success implications. Do not turn the article into a feature catalogue.
- **Try the product (default closing action):** after sources, invite the reader to try one concrete activity from the note. Use the homepage's current direct Mac DMG and App Store links and button hierarchy. Current destinations: `https://github.com/curiowls/meerkattasparkle/releases/latest/download/MeerKatta-latest.dmg` and `https://apps.apple.com/app/meerkatta/id6766122029`. Verify these before publication. Label buttons Download for Mac and Get for iPhone & iPad. The seven-day no-card trial applies to Mac; do not extend it to iOS. Match current App Store eligibility wording. No automatic downloads, checkout, or urgency.
- **Related reading (secondary):** one useful internal next step below the product invitation, with a reason to follow it. It supports readers who want to understand more, but must not replace or visually outrank the download/App Store actions.
- **Sources:** claim-adjacent links plus a short reference list. Two press reports about one study are one evidence base, not three confirmations. Include reading dates/context when relevant. Never pad the count.

## Visual rhythm

Use the existing site typography and reading column. Defaults: 300-500 words excluding references, 2-3 substantive sections, short paragraphs, selective bold leads (usually 2-5 words). These are guides, not quotas. Avoid bolding whole sentences or adding a label to every transition.

The draft CSS in `field-note.css` provides a compact figure, quiet green research aside, unboxed design-principle callout, related-reading divider, and small sources. Use it with `/style.css`; no global design change. The revised `drafts/why-a-meerkat.html` is the worked example. Optional modules should be omitted when they add no meaning. Do not use every module on every note.

Maintain semantic h1/h2/h3 order, `figure`/`figcaption`, labeled `aside`, descriptive links, visible keyboard focus, and readable contrast. No animation required. Check desktop and mobile for overflow, image load and reading rhythm. Use paragraphs for a narrative; reserve bullets for actual choices, steps, or references.

## Credible references in future notes

Look for a credible reference when the topic or a specific passage would benefit from one: primary research, or an original essay by a respected writer or practitioner with relevant expertise. Read the source, link near the supported point, and explain the connection in plain language. Distinguish research findings from opinion and our interpretation; a well-known name is not proof of a claim. Use exact attribution for short quotes, and label paraphrases as such. Do not force references into personal reflections or imply that a source validates MeerKatta performance. If no suitable source is found, omit it rather than adding a weak citation.

## Evidence and review checks

- Can the title, headings and lead phrases communicate the main point in a quick scan?
- Does the full reading still have one governing idea and a reason to continue?
- Is the founder's reasoning visible, not merely a conclusion with citations attached?
- Do sources support the nearby claim? Are limitations proportionate, without a legalistic disclaimer after every paragraph?
- Did we avoid claiming research caused an earlier design decision unless the founder confirmed that history?
- Is every output illustration labeled, and every feature claim verified?
- Is the larger direction clearly distinct from shipping behavior?
- Are quotes truly quotes, and are media rights/attribution respected?
- Does this add a new angle compared with existing notes?
- Keep draft status and noindex until approved; publishing requires canonical metadata, journal/sitemap integration, build checks and explicit approval.
