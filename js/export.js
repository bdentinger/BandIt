// BandIt - Export Module

const Export = (() => {

  // Export annotated gel image as PNG
  function exportImage(canvasEl, filename = 'bandit-gel.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvasEl.toDataURL('image/png');
    link.click();
  }

  // Export results as CSV
  function exportCSV(lanes, filename = 'bandit-results.csv') {
    const rows = [['Lane', 'Band', 'Position (px)', 'Size (bp)', 'Intensity']];

    lanes.forEach(lane => {
      if (!lane.bands || lane.bands.length === 0) {
        rows.push([lane.id, '-', '-', '-', '-']);
      } else {
        lane.bands.forEach(band => {
          rows.push([
            lane.ladder ? `${lane.id} (Ladder)` : lane.id,
            band.id,
            band.y,
            band.sizeBp !== null ? band.sizeBp : 'N/A',
            band.intensity ? band.intensity.toFixed(1) : 'N/A'
          ]);
        });
      }
    });

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  // Draw lane and band annotations onto canvas
  function drawAnnotations(ctx, lanes, imageHeight, showLabels = true) {
    lanes.forEach(lane => {
      // Draw lane boundary
      ctx.strokeStyle = lane.ladder ? 'rgba(255, 200, 0, 0.6)' : 'rgba(0, 229, 160, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(lane.x1, 0, lane.x2 - lane.x1, imageHeight);
      ctx.setLineDash([]);

      // Draw lane label
      if (showLabels) {
        ctx.fillStyle = lane.ladder ? '#ffc800' : '#00e5a0';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(lane.ladder ? 'L' : `${lane.id}`, lane.x1 + 4, 16);
      }

      // Draw bands
      lane.bands.forEach(band => {
        const centerX = (lane.x1 + lane.x2) / 2;
        const laneW = lane.x2 - lane.x1;

        // Band line
        ctx.strokeStyle = lane.ladder ? 'rgba(255, 200, 0, 0.9)' : 'rgba(0, 229, 160, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lane.x1 + 2, band.y);
        ctx.lineTo(lane.x2 - 2, band.y);
        ctx.stroke();

        // Size label
        if (showLabels && band.sizeBp) {
          ctx.fillStyle = lane.ladder ? '#ffc800' : '#00e5a0';
          ctx.font = '10px monospace';
          ctx.fillText(`${band.sizeBp}bp`, lane.x2 + 2, band.y + 4);
        }
      });
    });
  }

  return { exportImage, exportCSV, drawAnnotations };
})();
