// BandIt - Ladder Definitions
// Each ladder defines band sizes in bp from largest to smallest

const LADDERS = {
  'NEB 100bp': {
    name: 'NEB 100 bp Ladder',
    bands: [1517, 1200, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100],
    prominent: [1517, 1000, 500, 100], // brighter reference bands
    default: true
  },
  'NEB 1kb': {
    name: 'NEB 1 kb Ladder',
    bands: [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 500],
    prominent: [10000, 3000, 1000, 500]
  },
  'NEB 1kb Plus': {
    name: 'NEB 1 kb Plus Ladder',
    bands: [10000, 7000, 5000, 4000, 3000, 2000, 1500, 1000, 700, 500, 400, 300, 200, 100],
    prominent: [10000, 3000, 1000, 500, 100]
  },
  'Thermo GeneRuler 100bp': {
    name: 'Thermo GeneRuler 100 bp',
    bands: [1000, 900, 800, 700, 600, 500, 400, 300, 200, 100],
    prominent: [1000, 500, 100]
  },
  'Thermo GeneRuler 1kb': {
    name: 'Thermo GeneRuler 1 kb',
    bands: [10000, 8000, 6000, 5000, 4000, 3000, 2500, 2000, 1500, 1000, 750, 500, 250],
    prominent: [10000, 3000, 1000, 500]
  },
  'Thermo HyperLadder 100bp': {
    name: 'Thermo HyperLadder 100 bp',
    bands: [1000, 800, 600, 400, 200, 100],
    prominent: [1000, 600, 200, 100]
  },
  'Thermo HyperLadder 1kb': {
    name: 'Thermo HyperLadder 1 kb',
    bands: [10000, 8000, 6000, 4000, 2000, 1000, 800, 600, 400, 200],
    prominent: [10000, 4000, 1000, 200]
  },
  'Custom': {
    name: 'Custom Ladder',
    bands: [],
    prominent: [],
    custom: true
  }
};

// Get default ladder
function getDefaultLadder() {
  return Object.entries(LADDERS).find(([, v]) => v.default);
}

// Get all ladder names for UI
function getLadderNames() {
  return Object.keys(LADDERS);
}

// Estimate MW from migration distance using ladder bands
// Uses log-linear regression: log(MW) = m * distance + b
function estimateMW(migrationDistance, ladderBandPositions, ladderBandSizes) {
  if (ladderBandPositions.length < 2) return null;

  // log-linear fit
  const logSizes = ladderBandSizes.map(s => Math.log10(s));
  const n = ladderBandPositions.length;

  const sumX = ladderBandPositions.reduce((a, b) => a + b, 0);
  const sumY = logSizes.reduce((a, b) => a + b, 0);
  const sumXY = ladderBandPositions.reduce((s, x, i) => s + x * logSizes[i], 0);
  const sumX2 = ladderBandPositions.reduce((s, x) => s + x * x, 0);

  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - m * sumX) / n;

  const logMW = m * migrationDistance + b;
  return Math.round(Math.pow(10, logMW));
}
