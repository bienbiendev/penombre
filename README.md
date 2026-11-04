# Penombre

Half-light color themes for VS Code: **Ardoise**, a slate dark theme, and **Papier**, a paper light
theme.

Penombre keeps the GitHub (Primer) color range and reassigns it. Contrast is softened, and the
strongest color goes only where the reader must look: errors, diffs, landmarks. Everything else stays
readable and quiet.

| Theme            | Type  | Editor    | Body text | Contrast |
| ---------------- | ----- | --------- | --------- | -------- |
| Penombre Ardoise | dark  | `#21272f` | `#d3d9de` | 10.6:1   |
| Penombre Papier  | light | `#ece6d8` | `#332e29` | 10.8:1   |

GitHub Default runs body text at 16:1. Penombre brings it to about 10.7:1.

## Install

Penombre is not on the Marketplace yet. Build and install it from source; you need
[Bun](https://bun.sh) and the `code` command on your `PATH`.

```sh
git clone <this repository>
cd penombre
bun install
bun run install-local
```

Then run **Preferences: Color Theme** and pick **Penombre Ardoise** or **Penombre Papier**.

## Design

### Importance sets contrast

Every role has an importance from 1 to 5. Only levels 4 and 5 are allowed to pull the eye.

| Level | Name     | The reader…                       | Color                            |
| ----- | -------- | --------------------------------- | -------------------------------- |
| 5     | Alarm    | must act: error, conflict, cursor | full chroma, red or yellow only  |
| 4     | Landmark | scans for it to navigate          | strong chroma or bold, few roles |
| 3     | Kind     | tells kinds apart when looking    | calm hue, close to body text     |
| 2     | Body     | reads it                          | neutral gray                     |
| 1     | Recede   | ignores it                        | neutral gray, lower contrast     |

### One meaning per hue

| Hue    | Means, everywhere         |
| ------ | ------------------------- |
| red    | error, deletion, conflict |
| yellow | warning, find match       |
| green  | added, success            |
| blue   | focus, selection, active  |

GitHub Default spends these hues elsewhere: its keywords are error red, and its tags and JSON keys
are "added" green. Penombre gives keywords pink in dark mode and brick red on paper, and keeps green
for diffs.

### GitHub, softened

Each GitHub color keeps its hue. Its chroma is scaled down, and its lightness moves until its
contrast on the Penombre background equals GitHub's ratio, softened:

```
target = github ratio ** soften        dark 0.85, light 0.86
body text   16:1  ->  10.6:1
keyword    7.5:1  ->   5.6:1
```

Ratios at or above 4.5:1 never drop below it. The one added color is `stone`, a warm neutral that
tints the paper theme.

The full audit of GitHub Default and the reasoning behind each choice are in
[docs/AUDIT.md](docs/AUDIT.md).

## Syntax palette

Hex value and contrast on the editor background, as printed by `bun run build`.

| Role                   | Level | Ardoise                       | Papier                        |
| ---------------------- | ----- | ----------------------------- | ----------------------------- |
| variable               | 2     | `#d3d9de` 10.6                | `#332e29` 10.8                |
| operator               | 2     | `#a9b0b8` 6.9                 | `#534e48` 6.6                 |
| punctuation            | 1     | `#899199` 4.7                 | `#66615a` 4.9                 |
| comment                | 2     | `#899199` 4.7                 | `#7a736a` 3.8                 |
| keyword, modifier      | 3     | `#e47da5` 5.6                 | `#c03136` 4.5                 |
| string                 | 3     | `#9ec7e9` 8.5                 | `#203b66` 9.0                 |
| constant               | 3     | `#7bb6ea` 7.0                 | `#29579c` 5.7                 |
| function               | 3–4   | `#c4a2ea` 7.0                 | `#7454bb` 4.5                 |
| type                   | 3     | `#eaa060` 6.9                 | `#835003` 5.4                 |
| type declaration       | 4     | `#feb26c` 8.5                 | `#835003` 5.4                 |
| tag                    | 3     | `#4ebac2` 6.5                 | `#337075` 4.5                 |
| property               | 2     | `#bcc3c9` 8.4                 | `#433f39` 8.4                 |
| heading H1 / H2 / H3–6 | 4     | `#9ec7e9` `#7bb6ea` `#60a1eb` | `#203b66` `#29579c` `#2c67b9` |
| link                   | 3     | `#60a1eb` 5.6                 | `#2c67b9` 4.5                 |
| inline code            | 3     | `#9ec7e9` 8.5                 | `#214680` 7.5                 |
| invalid                | 5     | `#ec7d74` 5.6                 | `#7c2a2f` 7.6                 |
| inserted               | 4     | `#7fd686` 8.5                 | `#31643a` 5.6                 |
| deleted, deprecated    | 4–5   | `#eb9c94` 7.0                 | `#7c2a2f` 7.6                 |
| changed                | 4     | `#eaa060` 6.9                 | `#835003` 5.4                 |

Declarations of functions, types and classes are bold. Comments and quotes are italic.

## Development

The theme files in `themes/` are generated. Edit the blueprints, then rebuild.

```
blueprint/
  syntax.json    syntax roles, TextMate scopes, semantic tokens
  ui.json        workbench roles and the 300+ color keys they fill
src/
  palette.js     GitHub Primer scales, and the color reference resolver
  soften.js      backgrounds and softening settings per mode
  oklch.js       hex <-> OKLCH
  contrast.js    WCAG contrast
  build.js       writes themes/ and prints the contrast report
preview/         sample files to check the themes on
themes/          generated, do not edit
```

| Command                 | Does                                                        |
| ----------------------- | ----------------------------------------------------------- |
| `bun run build`         | writes both themes and prints each syntax role's contrast   |
| `bun run watch`         | rebuilds on every change in `src/` or `blueprint/`          |
| `bun run preview`       | opens `preview/` in an Extension Development Host           |
| `bun run install-local` | builds, packages `penombre.vsix` and installs it in VS Code |
| `bun run format`        | formats the repository with Prettier                        |

### Roles

A role has an importance, a color per mode and a reason:

```json
"keyword": {
  "importance": 3,
  "dark": "soft(pink.3 0.135 356)",
  "light": "soft(red.5 0.18 24)",
  "why": "Pink in dark, brick red on paper; error red stays alone."
}
```

A color is one of:

| Reference                | Resolves to                                                 |
| ------------------------ | ----------------------------------------------------------- |
| `blue.2`                 | step 2 of the GitHub blue scale for that mode               |
| `blue.2/40`              | the same color at 40% alpha                                 |
| `soft(red.3)`            | GitHub's red.3 at its softened contrast on the background   |
| `soft(pink.3 0.135 356)` | the same, with chroma 0.135 and hue 356                     |
| `oklch(0.52 0.1 blue)`   | OKLCH lightness and chroma, with the hue of the blue family |
| `background`             | the editor background                                       |
| `#21272f`                | the hex value, unchanged                                    |

UI keys and scopes point at a role by name, with an optional alpha: `"accent.selection/40"`.

## License

[MIT](LICENSE.txt). The color scales come from [GitHub Primer](https://primer.style), also MIT.
