// BandIt - Detection Module
// Lane and band detection algorithms

const Detection = (() => {

  // Convert image to grayscale pixel array
  function getGrayscale(ctx, width, height) {
    const data = ctx.getImageData(0, 0, width, height).data;
    const gray = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    return gray;
  }

  // Invert grayscale (for dark-on-light display)
  function invertGrayscale(gray) {
    return gray.map(v => 255 - v);
  }

  // Get column intensity profile (average brightness per column)
  function columnProfile(gray, width, height) {
    const profile = new Float32Array(width);
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let y = 0; y < height; y++) {
        sum += gray[y * width + x];
      }
      profile[x] = sum / height;
    }
    return profile;
  }

  // Get row intensity profile (average brightness per row) within a lane
  function rowProfile(gray, width, height, laneX1, laneX2) {
    const profile = new Float32Array(height);
    const laneWidth = laneX2 - laneX1;
    for (let y = 0; y < height; y++) {
      let sum = 0;
      for (let x = laneX1; x < laneX2; x++) {
        sum += gray[y * width + x];
      }
      profile[y] = sum / laneWidth;
    }
    return profile;
  }

  // Find peaks in a 1D profile (simple local maxima)
  function findPeaks(profile, minHeight = 20, minDistance = 5) {
    const peaks = [];
    for (let i = minDistance; i < profile.length - minDistance; i++) {
      if (profile[i] < minHeight) continue;
      let isPeak = true;
      for (let j = i - minDistance; j <= i + minDistance; j++) {
        if (j !== i && profile[j] >= profile[i]) { isPeak = false; break; }
      }
      if (isPeak) peaks.push({ pos: i, intensity: profile[i] });
    }
    return peaks;
  }

  // Auto-detect lanes from column intensity profile
  function autoDetectLanes(gray, width, height, expectedLanes = 8) {
    const profile = columnProfile(gray, width, height);

    // Smooth the profile
    const smoothed = smooth(profile, 5);

    // Find valleys (low intensity = lane boundaries in stained gel)
    // Or find peaks depending on gel type
    // For DNA gels, lanes appear as columns of higher intensity

    // Simple approach: divide image into expectedLanes equal sections
    // then refine based on actual intensity
    const laneWidth = width / expectedLanes;
    const lanes = [];

    for (let i = 0; i < expectedLanes; i++) {
      lanes.push({
        id: i + 1,
        x1: Math.round(i * laneWidth),
        x2: Math.round((i + 1) * laneWidth),
        ladder: false,
        bands: []
      });
    }

    return lanes;
  }

  // Detect bands within a lane's row profile
  function detectBandsInLane(gray, width, height, lane, inverted = true) {
    let profile = rowProfile(gray, width, height, lane.x1, lane.x2);
    if (inverted) profile = profile.map(v => 255 - v);

    // Smooth
    const smoothed = smooth(profile, 3);

    // Find peaks
    const peaks = findPeaks(smoothed, 15, 8);

    return peaks.map((p, idx) => ({
      id: idx + 1,
      y: p.pos,
      intensity: p.intensity,
      sizeBp: null // filled in after ladder calibration
    }));
  }

  // Simple moving average smoothing
  function smooth(arr, window = 3) {
    const result = new Float32Array(arr.length);
    const half = Math.floor(window / 2);
    for (let i = 0; i < arr.length; i++) {
      let sum = 0, count = 0;
      for (let j = Math.max(0, i - half); j <= Math.min(arr.length - 1, i + half); j++) {
        sum += arr[j]; count++;
      }
      result[i] = sum / count;
    }
    return result;
  }

  // Apply image enhancement to canvas
  function applyEnhancements(ctx, width, height, settings) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const { brightness = 0, contrast = 0, invert = false } = settings;
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];

      // Brightness
      r += brightness; g += brightness; b += brightness;

      // Contrast
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;

      // Invert
      if (invert) { r = 255 - r; g = 255 - g; b = 255 - b; }

      data[i]   = Math.min(255, Math.max(0, r));
      data[i+1] = Math.min(255, Math.max(0, g));
      data[i+2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Calibrate MW from ladder bands
  function calibrateLadder(ladderBands, ladderSizes) {
    // ladderBands: array of {y} positions
    // ladderSizes: array of bp sizes (same order, largest first)
    if (ladderBands.length < 2) return null;

    const positions = ladderBands.map(b => b.y);
    return { positions, sizes: ladderSizes };
  }

  return {
    getGrayscale,
    invertGrayscale,
    columnProfile,
    rowProfile,
    findPeaks,
    autoDetectLanes,
    detectBandsInLane,
    applyEnhancements,
    calibrateLadder,
    smooth
  };
})();
