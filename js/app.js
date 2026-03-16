// BandIt - Main App Logic

const App = (() => {
  // ── State ──────────────────────────────────────────
  const state = {
    image: null,          // original ImageData URL
    canvas: null,         // working canvas
    ctx: null,
    lanes: [],            // detected/manual lanes
    ladderLane: 0,        // index of ladder lane
    ladder: null,         // selected ladder definition
    comb: 1,              // 1 or 2 combs
    laneCount: 8,         // lanes per comb
    inverted: true,       // display mode
    enhancements: { brightness: 0, contrast: 0, invert: true },
    calibration: null,    // { positions, sizes }
    mode: 'view',         // view | addLane | addBand | moveLane
    selectedLane: null,
    imageOriginal: null   // unmodified pixel data
  };

  // ── Init ───────────────────────────────────────────
  function init() {
    bindTabs();
    bindCamera();
    bindAnalyze();
    bindExport();
    registerSW();
  }

  // ── Service Worker ─────────────────────────────────
  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  }

  // ── Tabs ───────────────────────────────────────────
  function bindTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.panel).classList.add('active');
      });
    });
  }

  // ── Camera ─────────────────────────────────────────
  function bindCamera() {
    const video = document.getElementById('video-preview');
    const captureBtn = document.getElementById('btn-capture');
    const flipBtn = document.getElementById('btn-flip');
    const expSlider = document.getElementById('exposure-slider');
    const expVal = document.getElementById('exposure-val');

    // Start camera when tab is activated
    document.querySelector('[data-panel="camera-panel"]').addEventListener('click', async () => {
      if (!Camera) return;
      await Camera.start(video);
    });

    expSlider.addEventListener('input', () => {
      expVal.textContent = expSlider.value;
      Camera.setExposure(parseFloat(expSlider.value));
    });

    flipBtn.addEventListener('click', () => Camera.flipCamera());

    captureBtn.addEventListener('click', () => {
      const tempCanvas = document.createElement('canvas');
      const dataURL = Camera.capture(tempCanvas);
      if (dataURL) {
        loadImage(dataURL);
        switchToAnalyze();
        toast('Image captured', 'success');
      }
    });
  }

  // ── Analyze ────────────────────────────────────────
  function bindAnalyze() {
    const canvas = document.getElementById('gel-canvas');
    state.canvas = canvas;
    state.ctx = canvas.getContext('2d');

    // Upload
    const uploadBtn = document.getElementById('btn-upload');
    const fileInput = document.getElementById('file-input');
    const dropzone = document.getElementById('dropzone');

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) readFile(file);
    });

    // Drag & drop
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    });
    dropzone.addEventListener('click', () => fileInput.click());

    // Enhancement sliders
    document.getElementById('brightness').addEventListener('input', applyEnhancements);
    document.getElementById('contrast').addEventListener('input', applyEnhancements);
    document.getElementById('invert-toggle').addEventListener('change', applyEnhancements);

    // Ladder select
    const ladderSelect = document.getElementById('ladder-select');
    getLadderNames().forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = LADDERS[name].name;
      if (LADDERS[name].default) opt.selected = true;
      ladderSelect.appendChild(opt);
    });

    ladderSelect.addEventListener('change', () => {
      state.ladder = LADDERS[ladderSelect.value];
      if (state.ladder.custom) {
        document.getElementById('custom-ladder-row').classList.remove('hidden');
      } else {
        document.getElementById('custom-ladder-row').classList.add('hidden');
      }
    });
    state.ladder = LADDERS['NEB 100bp'];

    // Lane count
    document.getElementById('lane-count').addEventListener('change', e => {
      state.laneCount = parseInt(e.target.value);
    });

    // Comb count
    document.getElementById('comb-count').addEventListener('change', e => {
      state.comb = parseInt(e.target.value);
    });

    // Auto-detect lanes
    document.getElementById('btn-auto-lanes').addEventListener('click', runAutoDetect);

    // Manual lane add
    document.getElementById('btn-add-lane').addEventListener('click', () => {
      state.mode = 'addLane';
      toast('Click gel image to place lane boundary');
    });

    // Canvas click for manual actions
    canvas.addEventListener('click', handleCanvasClick);

    // Detect bands
    document.getElementById('btn-detect-bands').addEventListener('click', runBandDetection);

    // Clear
    document.getElementById('btn-clear').addEventListener('click', clearAll);

    // Rotate
    document.getElementById('btn-rotate').addEventListener('click', rotateImage);
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      loadImage(e.target.result);
      document.getElementById('dropzone').classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  function loadImage(dataURL) {
    state.image = dataURL;
    const img = new Image();
    img.onload = () => {
      state.canvas.width = img.naturalWidth;
      state.canvas.height = img.naturalHeight;
      state.ctx.drawImage(img, 0, 0);
      state.imageOriginal = state.ctx.getImageData(0, 0, state.canvas.width, state.canvas.height);
      document.getElementById('dropzone').classList.add('hidden');
      document.getElementById('gel-canvas').classList.remove('hidden');
      applyEnhancements();
    };
    img.src = dataURL;
  }

  function applyEnhancements() {
    if (!state.imageOriginal) return;
    state.ctx.putImageData(state.imageOriginal, 0, 0);

    const brightness = parseInt(document.getElementById('brightness').value);
    const contrast = parseInt(document.getElementById('contrast').value);
    const invert = document.getElementById('invert-toggle').checked;

    state.enhancements = { brightness, contrast, invert };
    Detection.applyEnhancements(state.ctx, state.canvas.width, state.canvas.height, state.enhancements);

    document.getElementById('brightness-val').textContent = brightness;
    document.getElementById('contrast-val').textContent = contrast;

    // Redraw lane annotations on top
    if (state.lanes.length > 0) {
      Export.drawAnnotations(state.ctx, state.lanes, state.canvas.height);
    }
  }

  function runAutoDetect() {
    if (!state.imageOriginal) { toast('Load an image first', 'error'); return; }
    const gray = Detection.getGrayscale(state.ctx, state.canvas.width, state.canvas.height);
    state.lanes = Detection.autoDetectLanes(gray, state.canvas.width, state.canvas.height, state.laneCount);

    // Mark first lane as ladder by default
    if (state.lanes.length > 0) state.lanes[0].ladder = true;

    applyEnhancements();
    updateLaneStrip();
    toast(`Detected ${state.lanes.length} lanes`, 'success');
  }

  function runBandDetection() {
    if (state.lanes.length === 0) { toast('Detect or add lanes first', 'error'); return; }
    if (!state.imageOriginal) { toast('Load an image first', 'error'); return; }

    const gray = Detection.getGrayscale(state.ctx, state.canvas.width, state.canvas.height);

    state.lanes.forEach(lane => {
      lane.bands = Detection.detectBandsInLane(gray, state.canvas.width, state.canvas.height, lane, true);
    });

    // Calibrate MW if ladder lane has bands
    const ladderLane = state.lanes.find(l => l.ladder);
    if (ladderLane && ladderLane.bands.length > 0 && state.ladder && !state.ladder.custom) {
      const ladderBandCount = Math.min(ladderLane.bands.length, state.ladder.bands.length);
      const positions = ladderLane.bands.slice(0, ladderBandCount).map(b => b.y);
      const sizes = state.ladder.bands.slice(0, ladderBandCount);

      // Assign MW to ladder bands
      ladderLane.bands.forEach((b, i) => {
        if (i < state.ladder.bands.length) b.sizeBp = state.ladder.bands[i];
      });

      // Estimate MW for all other lanes
      state.lanes.filter(l => !l.ladder).forEach(lane => {
        lane.bands.forEach(band => {
          band.sizeBp = estimateMW(band.y, positions, sizes);
        });
      });
    }

    applyEnhancements();
    updateResultsTable();
    toast(`Bands detected`, 'success');
  }

  function handleCanvasClick(e) {
    if (state.mode !== 'addLane') return;
    const rect = state.canvas.getBoundingClientRect();
    const scaleX = state.canvas.width / rect.width;
    const x = Math.round((e.clientX - rect.left) * scaleX);

    // Simple: add a lane at this x position (width = 50px default)
    const laneWidth = Math.round(state.canvas.width / state.laneCount);
    const newLane = {
      id: state.lanes.length + 1,
      x1: Math.max(0, x - laneWidth / 2),
      x2: Math.min(state.canvas.width, x + laneWidth / 2),
      ladder: false,
      bands: []
    };
    state.lanes.push(newLane);
    applyEnhancements();
    updateLaneStrip();
    state.mode = 'view';
    toast(`Lane ${newLane.id} added`);
  }

  function updateLaneStrip() {
    const strip = document.getElementById('lane-strip');
    strip.innerHTML = '';
    state.lanes.forEach((lane, idx) => {
      const chip = document.createElement('div');
      chip.className = `lane-chip${lane.ladder ? ' ladder' : ''}${state.selectedLane === idx ? ' active' : ''}`;
      chip.textContent = lane.ladder ? `L (${idx + 1})` : `${lane.id}`;
      chip.title = lane.ladder ? 'Ladder lane' : `Lane ${lane.id}`;
      chip.addEventListener('click', () => {
        state.selectedLane = idx;
        updateLaneStrip();
      });
      chip.addEventListener('dblclick', () => {
        lane.ladder = !lane.ladder;
        updateLaneStrip();
        toast(lane.ladder ? 'Marked as ladder' : 'Unmarked as ladder');
      });
      strip.appendChild(chip);
    });
  }

  function updateResultsTable() {
    const tbody = document.getElementById('results-tbody');
    tbody.innerHTML = '';

    state.lanes.forEach(lane => {
      if (!lane.bands || lane.bands.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${lane.ladder ? '🟡 L' : lane.id}</td>
          <td>—</td><td>—</td><td class="text-dim">No bands</td>`;
        tbody.appendChild(tr);
        return;
      }
      lane.bands.forEach(band => {
        const tr = document.createElement('tr');
        if (lane.ladder) tr.classList.add('ladder-row');
        tr.innerHTML = `
          <td>${lane.ladder ? '🟡 L' : lane.id}</td>
          <td>${band.id}</td>
          <td>${band.y}px</td>
          <td>${band.sizeBp ? band.sizeBp + ' bp' : '—'}</td>`;
        tbody.appendChild(tr);
      });
    });

    // Switch to results tab
    document.querySelector('[data-panel="results-panel"]').click();
  }

  function clearAll() {
    state.lanes = [];
    state.calibration = null;
    if (state.imageOriginal) applyEnhancements();
    updateLaneStrip();
    document.getElementById('results-tbody').innerHTML = '';
    toast('Cleared');
  }

  function rotateImage() {
    if (!state.imageOriginal) return;
    const w = state.canvas.width, h = state.canvas.height;
    const temp = document.createElement('canvas');
    temp.width = h; temp.height = w;
    const tCtx = temp.getContext('2d');
    tCtx.translate(h / 2, w / 2);
    tCtx.rotate(Math.PI / 2);
    tCtx.drawImage(state.canvas, -w / 2, -h / 2);
    state.canvas.width = h;
    state.canvas.height = w;
    state.ctx.drawImage(temp, 0, 0);
    state.imageOriginal = state.ctx.getImageData(0, 0, state.canvas.width, state.canvas.height);
    applyEnhancements();
    toast('Rotated 90°');
  }

  // ── Export ─────────────────────────────────────────
  function bindExport() {
    document.getElementById('btn-export-img').addEventListener('click', () => {
      Export.exportImage(state.canvas);
      toast('Image exported', 'success');
    });

    document.getElementById('btn-export-csv').addEventListener('click', () => {
      if (state.lanes.length === 0) { toast('No data to export', 'error'); return; }
      Export.exportCSV(state.lanes);
      toast('CSV exported', 'success');
    });
  }

  // ── Helpers ────────────────────────────────────────
  function switchToAnalyze() {
    document.querySelector('[data-panel="analyze-panel"]').click();
  }

  let toastTimer = null;
  function toast(msg, type = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
