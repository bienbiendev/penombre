<img src="icon.png" width="96" alt="">

# Penombre

Low-glare VS Code themes: **Ardoise** (dark) and **Papier** (light).

```sh
bun run install-local
```

## Customize

- Colors: `colors/ardoise.css`, `colors/papier.css`
- Where they go: `blueprint/syntax.json` (code), `blueprint/ui.json` (VS Code UI)

Try changes with `bun run watch` and `bun run preview`, install them with `bun run install-local`.
Don't edit `themes/`: it's generated.

Design notes: [docs/AUDIT.md](docs/AUDIT.md).

## Release

Describe each change with `bunx changeset`. `.auto/@release.sh` then writes `CHANGELOG.md`, tags
the version and creates the GitHub release, which publishes to the VS Code Marketplace.

## License

[MIT](LICENSE.txt). Based on [GitHub Primer](https://primer.style) colors.
