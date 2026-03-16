# BandIt User Guide

## Getting Started

### Installing as a PWA
**Android (Chrome):** Open the app URL → tap ⋮ menu → "Add to Home Screen"  
**iOS (Safari):** Open the app URL → tap Share → "Add to Home Screen"

---

## Camera Tab

1. Open the Camera tab — your rear camera will activate automatically
2. Adjust **Exposure** slider to optimize gel brightness
   - Slide left (negative) to darken an overexposed image
   - Slide right (positive) to brighten a dim image
3. Tap **Flip** to switch between front/rear camera if needed
4. Tap **Capture** to take the photo and proceed to analysis

> **Tip:** For best results with a blue light transilluminator, reduce exposure slightly to improve band contrast against background fluorescence.

---

## Analyze Tab

### Loading an Image
- Use the **Camera tab** to capture directly, OR
- Tap **Upload Image** to load from your photo gallery, OR
- Drag and drop an image file onto the gel area

### Image Enhancement
- **Brightness:** Lighten or darken the image
- **Contrast:** Increase to make bands stand out more
- **Invert:** ON = dark bands on light background (recommended for most gel stains)

> **Tip:** For SYBR/APEX Safe stained gels on blue light transilluminators, try: Brightness +10 to +30, Contrast +20 to +50, Invert ON.

### Gel Setup
1. Select your **Ladder** from the dropdown (NEB 100 bp is default)
2. For a **Custom** ladder, enter band sizes in bp separated by commas, largest first
3. Set **Lanes per comb** (8 for small format, 20 for large format)
4. Set **Combs** (1 or 2)

### Lane Detection
1. Tap **Auto-detect Lanes** — lanes will be divided automatically based on your lane count setting
2. Review the lane chips that appear — they show each detected lane
3. **Double-tap any lane chip** to mark/unmark it as the ladder lane (shows in amber)
4. Use **Add Lane** to manually place additional lanes by tapping on the gel image

### Band Detection
1. After lanes are set up, tap **Detect Bands**
2. Bands will be detected automatically within each lane
3. Molecular weights will be estimated for all sample lanes based on the ladder

---

## Results Tab

- Shows a table of all detected bands with lane, position, and estimated size in bp
- **Export Image:** saves the annotated gel image to your device
- **Export CSV:** saves the results table as a CSV file for use in spreadsheets

---

## Two-Comb Gels

BandIt supports gels run with two combs:
- Set **Combs = 2** in Gel Setup
- Each comb section is treated independently
- Assign a ladder lane for each comb section by double-tapping the appropriate lane chip

---

## Tips for Better Results

- Run gels for **45-60 minutes at 75-100V** rather than short runs — longer runs give better band separation and easier detection
- Photograph in **complete darkness** for best contrast
- Use **manual exposure** on your phone camera rather than auto-exposure
- For the NEB 100 bp ladder, the **1500 bp, 1000 bp, and 500 bp bands** are the brightest reference bands

---

## Supported Ladders

| Ladder | Range |
|--------|-------|
| NEB 100 bp (default) | 100–1517 bp |
| NEB 1 kb | 500–10,000 bp |
| NEB 1 kb Plus | 100–10,000 bp |
| Thermo GeneRuler 100 bp | 100–1,000 bp |
| Thermo GeneRuler 1 kb | 250–10,000 bp |
| Thermo HyperLadder 100 bp | 100–1,000 bp |
| Thermo HyperLadder 1 kb | 200–10,000 bp |
| Custom | User-defined |

---

## Reporting Issues

Please report bugs or feature requests at: https://github.com/bdentinger/BandIt/issues
