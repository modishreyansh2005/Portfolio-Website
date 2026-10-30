/**
 * Interactive Tokenizer & Multi-Head Attention Matrix Visualizer
 * Simulates Byte-Pair Encoding (BPE) and Softmax(QK^T / sqrt(d)) Attention Weights
 */

(function () {
  const inputEl = document.getElementById('tokenizer-input');
  const btnTokenize = document.getElementById('btn-tokenize');
  const pillsContainer = document.getElementById('tokens-pill-container');
  const tokenCountLabel = document.getElementById('token-count-label');
  const headSelect = document.getElementById('head-select');
  const attnCanvas = document.getElementById('attention-canvas');
  const tooltip = document.getElementById('attention-cell-tooltip');

  if (!inputEl || !attnCanvas) return;

  const aCtx = attnCanvas.getContext('2d');
  let currentTokens = [];
  let attentionMatrix = [];
  let activeHead = 0;
  let selectedTokenIndex = -1;

  // Simple deterministic hash for subword token ID simulation
  function hashToken(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash % 32000) + 100;
  }

  // Tokenize string into realistic BPE subwords
  function simulateBPE(text) {
    const rawWords = text.trim().split(/\s+/).filter(Boolean);
    const tokens = [];

    rawWords.forEach((word) => {
      // Common subword splits
      if (word.length > 7) {
        const mid = Math.floor(word.length / 2);
        const sub1 = word.slice(0, mid);
        const sub2 = word.slice(mid);
        tokens.push({ str: sub1 + '@@', id: hashToken(sub1) });
        tokens.push({ str: sub2, id: hashToken(sub2) });
      } else {
        tokens.push({ str: word, id: hashToken(word) });
      }
    });

    // Limit to max 12 tokens for optimal matrix legibility
    return tokens.slice(0, 12);
  }

  // Generate Attention Weights for selected Head
  function computeAttention(tokens, head) {
    const N = tokens.length;
    const matrix = [];

    for (let i = 0; i < N; i++) {
      const row = [];
      let rowSum = 0;

      for (let j = 0; j < N; j++) {
        let rawWeight;

        if (head === 0) {
          // Head 1: Strong diagonal + syntactical link
          const isDiag = i === j ? 3.0 : 0.4;
          const isNext = Math.abs(i - j) === 1 ? 1.8 : 0.2;
          rawWeight = Math.exp((isDiag + isNext) / 1.4);
        } else if (head === 1) {
          // Head 2: Semantic clustering
          const lenDiff = Math.abs(tokens[i].str.length - tokens[j].str.length);
          rawWeight = Math.exp((4.0 - lenDiff * 0.6) / 1.5);
        } else if (head === 2) {
          // Head 3: Positional decay (causal lookback)
          const dist = i >= j ? (i - j) : 10;
          rawWeight = Math.exp(-dist * 0.4);
        } else {
          // Head 4: Long-range inverse
          const dist = Math.abs(i - j);
          rawWeight = Math.exp((dist * 0.6) / 2.0);
        }

        row.push(rawWeight);
        rowSum += rawWeight;
      }

      // Softmax normalization: sum(row) == 1.0
      const normalizedRow = row.map(val => val / rowSum);
      matrix.push(normalizedRow);
    }

    return matrix;
  }

  function renderTokensUI() {
    pillsContainer.innerHTML = '';
    currentTokens.forEach((tok, idx) => {
      const bubble = document.createElement('div');
      bubble.className = `token-bubble ${selectedTokenIndex === idx ? 'selected' : ''}`;
      bubble.innerHTML = `
        <span class="token-str">${tok.str}</span>
        <span class="token-id">#${tok.id}</span>
      `;

      bubble.addEventListener('click', () => {
        selectedTokenIndex = selectedTokenIndex === idx ? -1 : idx;
        renderTokensUI();
        renderAttentionMatrix();
        if (window.classicalAudio) window.classicalAudio.playTick(750);
      });

      pillsContainer.appendChild(bubble);
    });

    if (tokenCountLabel) {
      tokenCountLabel.textContent = `${currentTokens.length} Tokens Formulated`;
    }
  }

  function renderAttentionMatrix() {
    const rect = attnCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    attnCanvas.width = w * dpr;
    attnCanvas.height = h * dpr;
    aCtx.scale(dpr, dpr);

    aCtx.clearRect(0, 0, w, h);

    const N = currentTokens.length;
    if (N === 0) return;

    const labelOffset = 90;
    const cellWidth = (w - labelOffset - 20) / N;
    const cellHeight = (h - 40) / N;

    // Draw Column Headers (Keys)
    aCtx.font = '500 10px "JetBrains Mono", monospace';
    aCtx.textAlign = 'center';

    for (let j = 0; j < N; j++) {
      const x = labelOffset + j * cellWidth + cellWidth / 2;
      aCtx.fillStyle = '#6b7280';
      aCtx.fillText(currentTokens[j].str.slice(0, 6), x, 22);
    }

    // Draw Rows (Queries) & Cells
    for (let i = 0; i < N; i++) {
      const y = 35 + i * cellHeight;

      // Row Header
      aCtx.textAlign = 'right';
      aCtx.fillStyle = selectedTokenIndex === i ? '#3730a3' : '#121826';
      aCtx.font = selectedTokenIndex === i ? '700 10px "JetBrains Mono", monospace' : '500 10px "JetBrains Mono", monospace';
      aCtx.fillText(currentTokens[i].str.slice(0, 8), labelOffset - 8, y + cellHeight / 2 + 3);

      // Matrix Cells
      for (let j = 0; j < N; j++) {
        const x = labelOffset + j * cellWidth;
        const weight = attentionMatrix[i][j];

        // Light mode classical colormap: white to imperial indigo (#3730a3)
        aCtx.fillStyle = `rgba(55, 48, 163, ${Math.max(0.04, weight * 0.95)})`;
        aCtx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);

        // Highlight selected row
        if (selectedTokenIndex === i) {
          aCtx.strokeStyle = '#b45309';
          aCtx.lineWidth = 1.2;
          aCtx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
        }

        // Draw numerical weight text inside cell if legible
        if (cellWidth > 32 && cellHeight > 20) {
          aCtx.textAlign = 'center';
          aCtx.fillStyle = weight > 0.45 ? '#ffffff' : '#121826';
          aCtx.font = '500 9px "JetBrains Mono", monospace';
          aCtx.fillText(weight.toFixed(2), x + cellWidth / 2, y + cellHeight / 2 + 3);
        }
      }
    }
  }

  // Hover Tooltip on Matrix
  attnCanvas.addEventListener('mousemove', (e) => {
    const rect = attnCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const N = currentTokens.length;
    if (N === 0) return;

    const labelOffset = 90;
    const cellWidth = (rect.width - labelOffset - 20) / N;
    const cellHeight = (rect.height - 40) / N;

    if (mx > labelOffset && mx < rect.width - 20 && my > 35 && my < 35 + N * cellHeight) {
      const col = Math.floor((mx - labelOffset) / cellWidth);
      const row = Math.floor((my - 35) / cellHeight);

      if (row >= 0 && row < N && col >= 0 && col < N) {
        const qTok = currentTokens[row].str;
        const kTok = currentTokens[col].str;
        const weight = attentionMatrix[row][col];

        tooltip.style.display = 'block';
        tooltip.style.left = `${e.clientX - rect.left + 15}px`;
        tooltip.style.top = `${e.clientY - rect.top - 30}px`;
        tooltip.innerHTML = `
          <strong>Attn(Q, K)</strong>: ${weight.toFixed(4)}<br>
          Q: "${qTok}" &bull; K: "${kTok}"
        `;
        return;
      }
    }
    tooltip.style.display = 'none';
  });

  attnCanvas.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  function executeTokenization() {
    const text = inputEl.value || 'Attention is all you need for diffusion models.';
    currentTokens = simulateBPE(text);
    attentionMatrix = computeAttention(currentTokens, activeHead);
    selectedTokenIndex = -1;
    renderTokensUI();
    renderAttentionMatrix();
    if (window.classicalAudio) window.classicalAudio.playChime(587.33);
  }

  btnTokenize.addEventListener('click', executeTokenization);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeTokenization();
  });

  if (headSelect) {
    headSelect.addEventListener('change', (e) => {
      activeHead = parseInt(e.target.value, 10);
      attentionMatrix = computeAttention(currentTokens, activeHead);
      renderAttentionMatrix();
      if (window.classicalAudio) window.classicalAudio.playTick(950);
    });
  }

  window.addEventListener('resize', renderAttentionMatrix);

  // Initialize
  executeTokenization();
})();
