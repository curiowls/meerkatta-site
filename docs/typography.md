# MeerKatta website typography

The website uses six font sizes. Choose a role first, then use its CSS token.

| Role | Token | Size | Use |
| --- | --- | ---: | --- |
| Caption | `--type-caption` | 12px | Eyebrows, metadata, captions, secondary labels |
| Body | `--type-body` | 16px | Navigation, controls, standard copy |
| Body large | `--type-body-large` | 18px | Lead copy and long-form reading |
| Title small | `--type-title-small` | 24px | Card titles and headings inside articles |
| Title section | `--type-title-section` | 40px | Section and secondary page headings |
| Title display | `--type-title-display` | 60px | Primary page and hero headings |

On screens up to 680px, display headings step down to 40px and section headings step down to 24px. Text inside phone frames and animated product demonstrations may use smaller proportional sizes because it represents a reduced interface, not website copy.

The checkout page uses the same role names in its isolated stylesheet, with 12px, 16px, 24px, and 40px from the shared scale.

Code-rendered Remotion stories import `TYPE` from `typography.js`. The map points to the same CSS role tokens; demos must not define their own numeric sizes.

## Rule for future updates

Use the existing token that matches the text's role. Do not add a new font size to fix wrapping or spacing. Adjust the container width, spacing, weight, or line-height instead. A new size should be introduced only when a recurring content role cannot be represented by this scale across multiple sections.

`npm run check:typography` enforces this rule for new CSS and component changes, and the production build runs the check automatically. Define numeric values only once in the `--type-*` tokens; component rules must reference the semantic token name.
