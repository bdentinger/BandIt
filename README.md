# BandIt 🧬

**BandIt** is a free, open-source Progressive Web App (PWA) for gel electrophoresis image analysis. It runs in any modern mobile or desktop browser, can be installed on Android and iOS home screens like a native app, and requires no app store download.

## Features

### Phase 1 (current)
- 📷 Camera capture with manual exposure controls
- 🖼️ Image upload from gallery
- 🔆 Image enhancement (brightness, contrast, invert, rotate, crop)
- 🧪 Flexible ladder selection (common ladders pre-loaded, custom entry supported)
- 📏 Lane detection (automatic and manual)
- 🎯 Band detection (automatic and manual)
- ⚖️ Molecular weight estimation from ladder
- 📤 Export results (annotated image + data table)
- 🔬 Two-comb gel support
- 📱 Works on Android and iOS

### Phase 2 (planned)
- Sample naming and metadata
- Gel run history and database
- CSV/PDF export
- Protocol notes

### Phase 3 (planned)
- Community ladder presets
- AI-assisted band calling
- Shared results

## Supported Ladders (pre-loaded)
- NEB 100 bp ladder (default)
- NEB 1 kb ladder
- NEB 1 kb Plus ladder
- Thermo GeneRuler 100 bp
- Thermo GeneRuler 1 kb
- Thermo HyperLadder 100 bp
- Thermo HyperLadder 1 kb
- Custom (user-defined)

## Installation

### Use in browser
Simply navigate to the hosted URL in any modern mobile or desktop browser.

### Install as PWA (recommended)
**Android:** Open in Chrome → tap the three-dot menu → "Add to Home Screen"  
**iOS:** Open in Safari → tap the Share button → "Add to Home Screen"

## Development

BandIt is a vanilla HTML/CSS/JavaScript PWA with no build step required. To run locally:

```bash
git clone https://github.com/bdentinger/BandIt.git
cd BandIt
# Serve with any static file server, e.g.:
python3 -m http.server 8080
# Then open http://localhost:8080 in your browser
```

## Contributing

Contributions are welcome! Please open an issue or pull request on GitHub.

## Citation

If you use BandIt in your research, please cite:
> BandIt: Mobile gel electrophoresis analyzer. https://github.com/bdentinger/BandIt

## License

MIT License — free to use, modify, and distribute.

## Acknowledgements

Developed with the help of Claude (Anthropic). Inspired by the need for a free, modern, maintained alternative to legacy gel analysis tools.
