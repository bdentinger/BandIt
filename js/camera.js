// BandIt - Camera Module
// Handles camera access and manual exposure controls

const Camera = (() => {
  let stream = null;
  let videoEl = null;
  let currentFacingMode = 'environment'; // rear camera default

  // Check for advanced camera constraints support
  function supportsManualControls() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints);
  }

  async function start(videoElement, options = {}) {
    videoEl = videoElement;
    const constraints = {
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 4096 },
        height: { ideal: 3072 },
        ...options
      }
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoEl.srcObject = stream;
      await videoEl.play();
      return true;
    } catch (err) {
      console.error('Camera error:', err);
      return false;
    }
  }

  function stop() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  function capture(canvasEl) {
    if (!videoEl) return null;
    const ctx = canvasEl.getContext('2d');
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0);
    return canvasEl.toDataURL('image/png');
  }

  async function setExposure(value) {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    if (capabilities.exposureMode && capabilities.exposureCompensation) {
      try {
        await track.applyConstraints({
          advanced: [{
            exposureMode: 'manual',
            exposureCompensation: value
          }]
        });
      } catch (e) {
        console.warn('Manual exposure not supported on this device');
      }
    }
  }

  async function setWhiteBalance(mode = 'manual') {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ whiteBalanceMode: mode }]
      });
    } catch (e) {
      console.warn('White balance control not supported');
    }
  }

  async function flipCamera() {
    stop();
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    await start(videoEl);
  }

  function getCapabilities() {
    if (!stream) return null;
    const track = stream.getVideoTracks()[0];
    return track.getCapabilities ? track.getCapabilities() : null;
  }

  return { start, stop, capture, setExposure, setWhiteBalance, flipCamera, getCapabilities, supportsManualControls };
})();
