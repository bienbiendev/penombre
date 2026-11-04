# Penombre — color audit

Penombre keeps the GitHub (Primer) color range and reassigns it. Contrast peaks go only where the
reader must look; everything else stays readable and quiet.

## Importance scale

| Level | Name     | The reader…                       | Color rule                             |
| ----- | -------- | --------------------------------- | -------------------------------------- |
| 5     | Alarm    | must act: error, conflict, cursor | full chroma, red / yellow only         |
| 4     | Landmark | scans for it to navigate          | strong chroma or bold, few roles       |
| 3     | Kind     | tells kinds apart when looking    | calm hue, luminance close to body text |
| 2     | Body     | reads it                          | neutral gray                           |
| 1     | Recede   | ignores it                        | neutral gray, lower contrast           |

## Discern / concern line

The line sits between 3 and 4.

```
1 ─ 2 ─ 3  │  4 ─ 5
 discern   │  concern
 you can   │  it calls
 tell it   │  you
```

Below the line nothing pulls the eye: grays for 1–2, calm hues for 3. Above it, color is a signal.

## One meaning per hue

| Hue    | Meaning everywhere        |
| ------ | ------------------------- |
| red    | error, deletion, conflict |
| yellow | warning, find match       |
| green  | added, success            |
| blue   | focus, selection, active  |

## Findings in GitHub Default

What the audit found in the theme Penombre starts from.

### Syntax

- Keywords use error red, the most frequent colored token, so red stops meaning "wrong".
- Tags, JSON keys, quotes and regex escapes are green, which reads as "added".
- Body text is the brightest thing on the page (16:1 dark), so identifiers glare.
- Declarations and uses share one color; no landmarks.
- A `const` changes color between declaration (blue) and use (orange).
- Blue means strings, constants, properties, `this`, headings, inline code and diff headers.
- Punctuation, operators, numbers, types, attributes and parameters have no rule; no semantic colors.

### Workbench

- Title, activity and status bars match the editor while sidebar and panel go darker: nothing frames the editor.
- The primary button is green: an action, not "added".
- Active markers are coral, focus is blue: two hues, one meaning.
- One yellow means warning, modified, stack frame and debug source. Conflicts are orange, not red.
- Selection highlight, bracket match and focused frame are green.
- Badges are as loud as the focus ring.
- Bracket pairs use red, yellow and green.

## What Penombre does

### Syntax

| Color               | Level | Hue, dark / light    | Why                                                         |
| ------------------- | ----- | -------------------- | ----------------------------------------------------------- |
| variable            | 2     | gray / stone         | Body text.                                                  |
| operator            | 2     | gray / stone         | Part of the sentence, a step under the body.                |
| punctuation         | 1     | gray / stone         | Scaffolding: present, never read.                           |
| comment             | 2     | gray / stone         | Set apart by italic.                                        |
| keyword, modifier   | 3     | pink / brick red     | Error red stays alone. Declaring words are italic on paper. |
| string              | 3     | blue, calm           | Literal text.                                               |
| constant            | 3     | blue, stronger       | Literal values.                                             |
| function            | 3     | purple               | Declarations are bold landmarks (level 4).                  |
| type                | 3     | orange / ochre       | Declarations are brighter and bold (level 4).               |
| tag                 | 3     | cyan                 | Tags, components, JSON keys; no longer "added" green.       |
| property            | 2     | gray / stone         | Members: body text, one step quieter.                       |
| heading, H1 → H6    | 4     | blue, bright → quiet | Bold; the level sets the step.                              |
| link, inline code   | 3     | blue                 | The workbench link blue; code one step under body text.     |
| invalid, deprecated | 5     | red                  | The only red in code.                                       |
| inserted / deleted  | 4     | green / red          | Diffs.                                                      |
| changed             | 4     | orange / ochre       | Diffs.                                                      |

### Workbench

- Surfaces step away from the editor: chrome (sidebar, bars, panel, tabs) one step below, floating
  widgets one step above, inputs as wells.
- Blue alone means focus: focus ring, active markers, primary button, selection, progress.
- Badges are a calm blue fill, not a solid accent.
- Red is errors, conflicts and breakpoints; yellow is warnings and find; green is added files only;
  orange is modified files only.
- Bracket pairs are blue, purple and cyan at punctuation contrast.

## Nature pass

Eight landscape photos (Wikimedia Commons featured pictures), measured in OKLCH:

| Observation                                                      | Applied as                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| Neutrals cover most of the frame, chroma 0.003–0.03              | body text, punctuation and surfaces are neutral               |
| Neutrals are tinted: warm ground (H 55–90), cool sky (H 230–270) | cool slate gray in dark mode, warm stone on paper             |
| Chroma peaks in mid-tones; bright and dark areas are near-gray   | GitHub chroma is scaled down: ×0.85 dark, ×0.75 light         |
| The most vivid colors cover the smallest areas                   | frequent tokens are quiet, rare ones (alarms, diffs) carry it |

The one added color is `stone` (`#a19c90`, H ≈ 88): paper in light mode.

## How the colors were derived

The colors were computed once from GitHub Default, then written out as plain values in
`colors/ardoise.css` and `colors/papier.css`. Edit those files now; the derivation below no longer
runs. Its code is in the history: `git show 3b18228:src/soften.js` and `src/palette.js`.

Each GitHub Default color kept its hue. Its chroma was scaled down, and its lightness moved until
its contrast on the Penombre background equalled GitHub's ratio, softened:

```
target = github ratio ** soften      dark 0.85, light 0.86
chroma = github chroma * scale       dark 0.85, light 0.75
fg on bg    16:1  ->  10.6:1
keyword    7.5:1  ->   5.6:1
```

Ratios at or above 4.5 never dropped below it. A few colors got their own chroma and hue, like the
dark keyword pink. Backgrounds: slate `#21272f` in dark mode, paper `#ece6d8` in light mode.

## Known gaps

- Light comments sit at 3.8:1 on paper (`#7a736a`), under the 4.5:1 floor the other code colors
  keep.

## Files

- Colors: `colors/ardoise.css`, `colors/papier.css`
- Where code colors go: `blueprint/syntax.json`
- Where workbench colors go: `blueprint/ui.json`
- `bun run build` prints every code color's contrast against the editor.
