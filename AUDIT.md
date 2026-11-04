# Penombre — color audit

Penombre keeps the GitHub (Primer) color range and reassigns it. Contrast peaks go only where the
reader must look; everything else stays readable and quiet.

## Importance scale

| Level | Name     | The reader…                       | Color rule                                    |
| ----- | -------- | --------------------------------- | --------------------------------------------- |
| 5     | Alarm    | must act: error, conflict, cursor | full chroma, red / yellow only                |
| 4     | Landmark | scans for it to navigate          | strong chroma or bold, few roles              |
| 3     | Kind     | tells kinds apart when looking    | calm hue, luminance close to body text        |
| 2     | Body     | reads it                          | neutral gray                                  |
| 1     | Recede   | ignores it                        | neutral gray, lower contrast, ≥ 4.5:1 on text |

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

## Findings

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

## Added color

`added.cyan` — dark `#99dbe1`, light `#07494f`. The keyword hue, matched to body-text luminance.

## Blueprints

- Syntax roles: `blueprint/syntax.json`
- Workbench roles: `blueprint/ui.json`
- `bun run build` prints every syntax role's contrast against the editor.

## Nature pass

Eight landscape photos (Wikimedia Commons featured pictures), measured in OKLCH:

| Observation                                                      | Applied as                                               |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| Neutrals cover most of the frame, chroma 0.003–0.03              | body text, punctuation and surfaces are neutral          |
| Neutrals are tinted: warm ground (H 55–90), cool sky (H 230–270) | warm stone for code and surfaces, cool gray for comments |
| Chroma peaks in mid-tones; bright and dark areas are near-gray   | dark mode tokens stay under C 0.10                       |
| Colors are analogous earths with one cool counterpoint           | sand, terracotta, ochre against slate, river, moss       |
| The most vivid colors cover the smallest areas                   | frequent tokens are quiet, rare ones carry chroma        |

The added color is `stone` (H ≈ 90): paper in light mode, concrete in dark mode.

| Role     | Image           | Hue family |
| -------- | --------------- | ---------- |
| variable | limestone / ink | stone      |
| comment  | haze, graphite  | gray       |
| keyword  | distant slate   | blue       |
| string   | sand, dry grass | yellow     |
| constant | terracotta      | coral      |
| function | glacial river   | cyan       |
| type     | sage, moss      | green      |
| property | alpenglow       | pink       |
| heading  | sunset ochre    | orange     |

## GitHub in OKLCH, softened

Each GitHub Default color keeps its hue and chroma. Its lightness moves until its contrast on the
Penombre background equals GitHub's ratio, softened (`src/soften.js`):

```
target = github ratio ** soften      dark 0.85, light 0.92
fg on bg    16:1  ->  10.6:1
keyword    7.5:1  ->   5.5:1
```

Ratios at or above 4.5 never drop below it. Backgrounds: light slate `#21272f` in dark mode,
paper `#ece6d8` in light mode.
