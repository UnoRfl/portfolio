# Uno — portfolio

Static portfolio site, live at https://unorfl.github.io/portfolio/

- Pages are generated: edit `build.py` (content and layout), then run `python build.py`.
  It pulls the GitHub contribution heatmap with `gh`; `python build.py --offline` reuses `build-cache/github.json`.
- Styles: `assets/css/site.css`. Behaviour (skeleton images, reveals, filters, lightbox, mobile menu): `assets/js/site.js`.
- No build tooling and no dependencies; GitHub Pages serves the repo root.
