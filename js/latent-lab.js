/**
 * Interactive Latent Space Explorer & Activation Visualizer
 * Real-time 2D Manifold Projection, Vector Arithmetic, and Mathematical Activation Curves
 */

(function () {
  // =========================================================================
  // 1. 2D LATENT SPACE MANIFOLD PROJECTION
  // =========================================================================
  const canvas = document.getElementById('latent-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let showDelaunay = true;
  let isAnimatingPCA = false;
  let pcaTime = 0;

  // Initial Cluster Nodes
  const defaultNodes = [
    // Vision (Blue)
    { id: 1, label: 'ViT-H/14', type: 'cv', x: 140, y: 130, color: '#3b82f6', ox: 140, oy: 130 },
    { id: 2, label: 'DiT Spatial', type: 'cv', x: 190, y: 100, color: '#3b82f6', ox: 190, oy: 100 },
    { id: 3, label: 'CLIP-Vision', type: 'cv', x: 170, y: 170, color: '#3b82f6', ox: 170, oy: 170 },

    // Language / Reasoning (Purple)
    { id: 4, label: 'Llama-3 Head 7', type: 'nlp', x: 420, y: 140, color: '#8b5cf6', ox: 420, oy: 140 },
    { id: 5, label: 'PRM Reasoning', type: 'nlp', x: 470, y: 110, color: '#8b5cf6', ox: 470, oy: 110 },
    { id: 6, label: 'DPO Latent', type: 'nlp', x: 440, y: 190, color: '#8b5cf6', ox: 440, oy: 190 },

    // Audio (Mint)
    { id: 7, label: 'WavLM Enc', type: 'audio', x: 160, y: 310, color: '#10b981', ox: 160, oy: 310 },
    { id: 8, label: 'Whisper Mel', type: 'audio', x: 220, y: 340, color: '#10b981', ox: 220, oy: 340 },

    // Code & Kernels (Gold)
    { id: 9, label: 'Triton FP8', type: 'code', x: 430, y: 300, color: '#f59e0b', ox: 430, oy: 300 },
    { id: 10, label: 'vLLM Cache', type: 'code', x: 380, y: 340, color: '#f59e0b', ox: 380, oy: 340 }
  ];

  let nodes = JSON.parse(JSON.stringify(defaultNodes));
  let draggedNode = null;
  let hoveredNode = null;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    renderLatent();
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function updateMetrics() {
    // Calculate Cosine Similarity & Distance between centroid of Vision & NLP
    const cvNodes = nodes.filter(n => n.type === 'cv');
    const nlpNodes = nodes.filter(n => n.type === 'nlp');

    const cvCentroid = {
      x: cvNodes.reduce((acc, n) => acc + n.x, 0) / cvNodes.length,
      y: cvNodes.reduce((acc, n) => acc + n.y, 0) / cvNodes.length
    };
    const nlpCentroid = {
      x: nlpNodes.reduce((acc, n) => acc + n.x, 0) / nlpNodes.length,
      y: nlpNodes.reduce((acc, n) => acc + n.y, 0) / nlpNodes.length
    };

    const dx = nlpCentroid.x - cvCentroid.x;
    const dy = nlpCentroid.y - cvCentroid.y;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize to latent space units
    const latentDist = (distPx / 200).toFixed(3);
    const cosineSim = Math.max(0.01, (1 - distPx / (width * 0.85))).toFixed(3);

    const hud = document.getElementById('hud-coords');
    const simDisplay = document.getElementById('sim-score');
    const simMeter = document.getElementById('sim-meter-fill');
    const distDisplay = document.getElementById('dist-score');
    const distMeter = document.getElementById('dist-meter-fill');

    if (hud && draggedNode) {
      hud.innerHTML = `$z_{${draggedNode.label}} = (x: ${(draggedNode.x / width).toFixed(3)}, y: ${(draggedNode.y / height).toFixed(3)})$ • Dist: ${latentDist}`;
    }

    if (simDisplay) simDisplay.textContent = cosineSim;
    if (simMeter) simMeter.style.width = `${Math.min(100, cosineSim * 100)}%`;
    if (distDisplay) distDisplay.textContent = latentDist;
    if (distMeter) distMeter.style.width = `${Math.min(100, (latentDist / 3) * 100)}%`;
  }

  function renderLatent() {
    ctx.clearRect(0, 0, width, height);

    // Subtle classical coordinate grid
    ctx.strokeStyle = 'rgba(18, 24, 38, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Delaunay-style connecting mesh lines
    if (showDelaunay) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.25;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = (n1.type === n2.type) 
              ? `${n1.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
              : `rgba(55, 48, 163, ${alpha * 0.6})`;
            ctx.lineWidth = (n1.type === n2.type) ? 1.2 : 0.8;
            ctx.stroke();
          }
        }
      }
    }

    // Draw Nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode === node;
      const isDragged = draggedNode === node;

      // Outer glow ring
      if (isHovered || isDragged) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}22`;
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Core Node
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#121826';
      ctx.fillText(node.label, node.x + 12, node.y + 4);
    });

    updateMetrics();
  }

  // Mouse Listeners for Dragging
  canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(e);
    nodes.forEach(node => {
      const dx = pos.x - node.x;
      const dy = pos.y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < 14) {
        draggedNode = node;
        if (window.classicalAudio) window.classicalAudio.playTick(900);
      }
    });
  });

  window.addEventListener('mousemove', (e) => {
    const pos = getMousePos(e);

    // Hover check
    hoveredNode = null;
    nodes.forEach(node => {
      const dx = pos.x - node.x;
      const dy = pos.y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < 14) {
        hoveredNode = node;
      }
    });

    if (draggedNode) {
      draggedNode.x = Math.max(20, Math.min(width - 20, pos.x));
      draggedNode.y = Math.max(20, Math.min(height - 20, pos.y));
      renderLatent();
    } else if (hoveredNode) {
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.cursor = 'crosshair';
    }
  });

  window.addEventListener('mouseup', () => {
    if (draggedNode) {
      draggedNode = null;
      if (window.classicalAudio) window.classicalAudio.playTick(600);
    }
  });

  // Controls
  const resetBtn = document.getElementById('btn-reset-latent');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      nodes = JSON.parse(JSON.stringify(defaultNodes));
      isAnimatingPCA = false;
      renderLatent();
      if (window.classicalAudio) window.classicalAudio.playChime(659.25);
    });
  }

  const toggleMeshBtn = document.getElementById('btn-toggle-voronoi');
  if (toggleMeshBtn) {
    toggleMeshBtn.addEventListener('click', () => {
      showDelaunay = !showDelaunay;
      toggleMeshBtn.classList.toggle('active', showDelaunay);
      renderLatent();
      if (window.classicalAudio) window.classicalAudio.playTick(800);
    });
  }

  const pcaAnimBtn = document.getElementById('btn-cluster-anim');
  if (pcaAnimBtn) {
    pcaAnimBtn.addEventListener('click', () => {
      isAnimatingPCA = !isAnimatingPCA;
      pcaAnimBtn.classList.toggle('active', isAnimatingPCA);
      if (isAnimatingPCA) {
        animatePCA();
        if (window.classicalAudio) window.classicalAudio.playChime(523.25);
      }
    });
  }

  function animatePCA() {
    if (!isAnimatingPCA) return;
    pcaTime += 0.025;

    nodes.forEach((node, i) => {
      const freq = 1 + (i % 3) * 0.3;
      node.x = node.ox + Math.sin(pcaTime * freq + i) * 35;
      node.y = node.oy + Math.cos(pcaTime * freq + i) * 25;
    });

    renderLatent();
    requestAnimationFrame(animatePCA);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // =========================================================================
  // 2. ACTIVATION FUNCTIONS VISUALIZER
  // =========================================================================
  const actCanvas = document.getElementById('activation-canvas');
  if (!actCanvas) return;

  const aCtx = actCanvas.getContext('2d');
  let currentActivation = 'gelu';

  const activationDefs = {
    gelu: {
      name: 'GELU (Gaussian Error Linear Unit)',
      formula: '$$\\text{GELU}(x) = x \\cdot \\frac{1}{2}\\left[1 + \\text{erf}\\left(\\frac{x}{\\sqrt{2}}\\right)\\right]$$',
      desc: 'Standard activation function for modern Transformers (GPT, BERT, ViT). Smoothly introduces stochasticity and solves dead-neuron issues present in classical piecewise functions.',
      monotonic: 'No (smooth local minimum near x ≈ -0.75)',
      range: '[-0.170, ∞)',
      models: 'GPT-4, Claude 3, LLaMA-2/3',
      fn: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
      dfn: (x) => {
        const h = 0.001;
        const f1 = 0.5 * (x + h) * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * ((x + h) + 0.044715 * Math.pow(x + h, 3))));
        const f0 = 0.5 * (x - h) * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * ((x - h) + 0.044715 * Math.pow(x - h, 3))));
        return (f1 - f0) / (2 * h);
      }
    },
    swiglu: {
      name: 'SwiGLU (Swish-Gated Linear Unit)',
      formula: '$$\\text{SwiGLU}(x, W, V) = \\text{Swish}_{1}(xW) \\otimes xV$$',
      desc: 'Gated non-linear architecture widely recognized as the gold standard in LLaMA-3, Mistral, and DeepSeek. Features dual projection pathways with multiplicative gating.',
      monotonic: 'No (gated product)',
      range: '(-∞, ∞)',
      models: 'LLaMA-3-70B, Mistral Large, DeepSeek-V2',
      fn: (x) => (x / (1 + Math.exp(-x))) * (0.8 * x + 0.2),
      dfn: (x) => {
        const h = 0.001;
        const f = (val) => (val / (1 + Math.exp(-val))) * (0.8 * val + 0.2);
        return (f(x + h) - f(x - h)) / (2 * h);
      }
    },
    silu: {
      name: 'SiLU / Swish Function',
      formula: '$$\\text{SiLU}(x) = x \\cdot \\sigma(x) = \\frac{x}{1 + e^{-x}}$$',
      desc: 'Discovered through reinforcement learning architectural search. Smooth, non-monotonic, and self-gated. Extensively adopted in Stable Diffusion and EfficientNet.',
      monotonic: 'No',
      range: '[-0.278, ∞)',
      models: 'Stable Diffusion 3, Flux.1, YOLOv8',
      fn: (x) => x / (1 + Math.exp(-x)),
      dfn: (x) => {
        const sig = 1 / (1 + Math.exp(-x));
        return sig + x * sig * (1 - sig);
      }
    },
    relu: {
      name: 'Classical ReLU (Rectified Linear Unit)',
      formula: '$$\\text{ReLU}(x) = \\max(0, x)$$',
      desc: 'The classical foundation of deep learning revolution. Highly efficient piecewise-linear activation, though prone to the "dying ReLU" pathology in deep transformer layers.',
      monotonic: 'Yes',
      range: '[0, ∞)',
      models: 'ResNet-50, Early CNNs, AlexNet',
      fn: (x) => Math.max(0, x),
      dfn: (x) => (x > 0 ? 1 : 0)
    }
  };

  function renderActivationPlot() {
    const rect = actCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    actCanvas.width = w * dpr;
    actCanvas.height = h * dpr;
    aCtx.scale(dpr, dpr);

    aCtx.clearRect(0, 0, w, h);

    const originX = w / 2;
    const originY = h * 0.65;
    const scaleX = 42;
    const scaleY = 42;

    // Grid lines
    aCtx.strokeStyle = 'rgba(18, 24, 38, 0.06)';
    aCtx.lineWidth = 1;
    for (let x = -6; x <= 6; x++) {
      const px = originX + x * scaleX;
      aCtx.beginPath();
      aCtx.moveTo(px, 0);
      aCtx.lineTo(px, h);
      aCtx.stroke();
    }
    for (let y = -4; y <= 6; y++) {
      const py = originY - y * scaleY;
      aCtx.beginPath();
      aCtx.moveTo(0, py);
      aCtx.lineTo(w, py);
      aCtx.stroke();
    }

    // Axes
    aCtx.strokeStyle = 'rgba(18, 24, 38, 0.25)';
    aCtx.lineWidth = 1.5;
    // X Axis
    aCtx.beginPath();
    aCtx.moveTo(0, originY);
    aCtx.lineTo(w, originY);
    aCtx.stroke();
    // Y Axis
    aCtx.beginPath();
    aCtx.moveTo(originX, 0);
    aCtx.lineTo(originX, h);
    aCtx.stroke();

    const def = activationDefs[currentActivation];
    if (!def) return;

    // Draw Derivative Curve f'(x)
    aCtx.beginPath();
    aCtx.strokeStyle = '#b45309'; // Classical Amber
    aCtx.lineWidth = 1.8;
    aCtx.setLineDash([4, 4]);

    for (let px = 0; px < w; px += 2) {
      const xVal = (px - originX) / scaleX;
      const yVal = def.dfn(xVal);
      const py = originY - yVal * scaleY;
      if (px === 0) aCtx.moveTo(px, py);
      else aCtx.lineTo(px, py);
    }
    aCtx.stroke();
    aCtx.setLineDash([]);

    // Draw Main Activation Curve f(x)
    aCtx.beginPath();
    aCtx.strokeStyle = '#3730a3'; // Imperial Indigo
    aCtx.lineWidth = 2.5;

    for (let px = 0; px < w; px += 2) {
      const xVal = (px - originX) / scaleX;
      const yVal = def.fn(xVal);
      const py = originY - yVal * scaleY;
      if (px === 0) aCtx.moveTo(px, py);
      else aCtx.lineTo(px, py);
    }
    aCtx.stroke();

    // Legend on Canvas
    aCtx.font = '600 11px "JetBrains Mono", monospace';
    aCtx.fillStyle = '#3730a3';
    aCtx.fillText('— f(x) Activation Curve', 20, 25);
    aCtx.fillStyle = '#b45309';
    aCtx.fillText('- - f\'(x) Gradient Flow', 20, 42);
  }

  // Hook up Activation Buttons
  const actButtons = document.querySelectorAll('.btn-act');
  actButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      actButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentActivation = btn.dataset.act;

      const def = activationDefs[currentActivation];
      if (def) {
        const nameEl = document.getElementById('act-name-display');
        const mathEl = document.getElementById('act-math-formula');
        const descEl = document.getElementById('act-description-display');
        const monoEl = document.getElementById('prop-monotonic');
        const rangeEl = document.getElementById('prop-range');
        const modelsEl = document.getElementById('prop-models');

        if (nameEl) nameEl.textContent = def.name;
        if (mathEl) mathEl.textContent = def.formula;
        if (descEl) descEl.textContent = def.desc;
        if (monoEl) monoEl.textContent = def.monotonic;
        if (rangeEl) rangeEl.textContent = def.range;
        if (modelsEl) modelsEl.textContent = def.models;
      }

      renderActivationPlot();
      if (window.classicalAudio) window.classicalAudio.playTick(1000);
    });
  });

  window.addEventListener('resize', renderActivationPlot);
  renderActivationPlot();
})();
