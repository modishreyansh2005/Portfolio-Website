/**
 * Live LLM Inference & Streaming Token Engine Simulator
 * Features interactive prompt generation, real-time token streaming,
 * Time-To-First-Token (TTFT) counters, tokens/sec calculation, and speculative decoding metrics.
 */

class LLMStreamer {
  constructor() {
    this.promptSelect = document.getElementById('llm-prompt-preset');
    this.streamBtn = document.getElementById('btn-stream-llm');
    this.stopBtn = document.getElementById('btn-stop-llm');
    this.outputContainer = document.getElementById('llm-stream-output');

    // Metrics displays
    this.ttftDisplay = document.getElementById('metric-ttft');
    this.tpsDisplay = document.getElementById('metric-tps');
    this.tokensCountDisplay = document.getElementById('metric-tokens');
    this.cacheDisplay = document.getElementById('metric-cache');

    this.tempSlider = document.getElementById('slider-temperature');
    this.tempVal = document.getElementById('val-temperature');
    this.specToggle = document.getElementById('toggle-speculative');

    this.isStreaming = false;
    this.streamInterval = null;

    // Presets with rich, realistic technical content
    this.presets = {
      triton: {
        prompt: "Write a high-performance fused FP8 matrix multiplication kernel in OpenAI Triton with row-wise scaling factors for Hopper H100 tensor cores.",
        tokens: [
          "@triton.jit\n", "def", " _fused_fp8_gemm_kernel", "(\n",
          "    A_ptr", ",", " B_ptr", ",", " C_ptr", ",\n",
          "    M", ",", " N", ",", " K", ",\n",
          "    stride_am", ",", " stride_ak", ",", " stride_bk", ",", " stride_bn", ",\n",
          "    BLOCK_SIZE_M", ": tl.constexpr", ",", " BLOCK_SIZE_N", ": tl.constexpr", ",", " BLOCK_SIZE_K", ": tl.constexpr\n",
          "):\n",
          "    # Program ID & block grid coordinates\n",
          "    pid_m", " = tl.program_id", "(0)\n",
          "    pid_n", " = tl.program_id", "(1)\n",
          "    offs_m", " = (pid_m * BLOCK_SIZE_M", " + tl.arange(0, BLOCK_SIZE_M)) % M\n",
          "    offs_n", " = (pid_n * BLOCK_SIZE_N", " + tl.arange(0, BLOCK_SIZE_N)) % N\n",
          "    offs_k", " = tl.arange(0, BLOCK_SIZE_K)\n",
          "    # Accumulator in float32 for numerical stability\n",
          "    accumulator", " = tl.zeros((BLOCK_SIZE_M, BLOCK_SIZE_N), dtype=tl.float32)\n",
          "    for", " k in range(0, tl.cdiv(K, BLOCK_SIZE_K)):\n",
          "        a = tl.load(A_ptr + offs_m[:, None] * stride_am + offs_k[None, :] * stride_ak)\n",
          "        b = tl.load(B_ptr + offs_k[:, None] * stride_bk + offs_n[None, :] * stride_bn)\n",
          "        # Tensor Core FP8 Fused Multiply-Accumulate\n",
          "        accumulator += tl.dot(a, b)\n",
          "        offs_k += BLOCK_SIZE_K\n",
          "    # Store quantized output\n",
          "    c = accumulator.to(tl.float16)\n",
          "    tl.store(C_ptr + offs_m[:, None] * N + offs_n[None, :], c)\n"
        ]
      },
      reasoning: {
        prompt: "Solve the test-time search step for optimizing KV-cache eviction across 128k context windows without degradation on long-tail retrieval.",
        tokens: [
          "<thought>\n",
          "1. Analyzing attention sparsity distribution: across 128k tokens, <9% of tokens account for 92% of attention mass.\n",
          "2. Standard sliding window drops essential initial 'attention sink' tokens (first 4 tokens).\n",
          "3. Formulation: Combine H2O (Heavy Hitter Oracle) with dynamic eviction threshold theta:\n",
          "   Score(t_i) = \\sum_{h} \\text{Softmax}(Q_t K_i^T / \\sqrt{d})\n",
          "4. Retain:\n",
          "   - Sink tokens: [0, 4]\n",
          "   - Local recent window: [t - 2048, t]\n",
          "   - Top-K historical Heavy Hitters: K = 4096\n",
          "5. Cache footprint reduction: 128k -> 6k tokens (21.3x memory compression).\n",
          "</thought>\n",
          "Verified: Memory footprint drops from 28.4 GB to 1.33 GB per batch with zero degradation on Needle-In-A-Haystack benchmark."
        ]
      },
      flow: {
        prompt: "Derive the Continuous-Time Flow Matching objective for latent diffusion video synthesis.",
        tokens: [
          "Continuous Flow Matching replaces discrete noise schedules with deterministic probability trajectories.\n\n",
          "Given data distribution p_1(x) and prior p_0(x) ~ N(0, I):\n",
          "Define straight-line trajectory: x_t = (1 - t)x_0 + t x_1,  t in [0, 1]\n",
          "Target velocity field: u_t(x_t | x_0, x_1) = x_1 - x_0\n\n",
          "Objective:\n",
          "L_CFM(theta) = E_{t, x_0, x_1} [ || v_theta(x_t, t) - (x_1 - x_0) ||^2 ]\n\n",
          "Inference via Euler ODE solver:\n",
          "x_{t+dt} = x_t + v_theta(x_t, t) * dt\n",
          "Converges to high-fidelity sample in only 8-12 evaluations!"
        ]
      }
    };

    this.bindEvents();
  }

  bindEvents() {
    if (this.tempSlider && this.tempVal) {
      this.tempSlider.addEventListener('input', (e) => {
        this.tempVal.textContent = e.target.value;
      });
    }

    if (this.streamBtn) {
      this.streamBtn.addEventListener('click', () => this.startStreaming());
    }

    if (this.stopBtn) {
      this.stopBtn.addEventListener('click', () => this.stopStreaming());
    }
  }

  startStreaming() {
    if (this.isStreaming) return;
    this.isStreaming = true;

    this.streamBtn.disabled = true;
    this.stopBtn.disabled = false;
    this.outputContainer.innerHTML = '<span class="cursor-stream-blink">▋</span>';

    const presetKey = this.promptSelect ? this.promptSelect.value : 'triton';
    const data = this.presets[presetKey] || this.presets.triton;
    const tokens = data.tokens;

    const useSpeculative = this.specToggle ? this.specToggle.checked : true;
    const baseDelay = useSpeculative ? 35 : 85; // Faster if speculative decoding enabled

    const startTime = performance.now();
    let tokenIndex = 0;
    let ttftRecorded = false;

    if (window.classicalAudio) window.classicalAudio.playTick(1200);

    this.streamInterval = setInterval(() => {
      if (tokenIndex >= tokens.length || !this.isStreaming) {
        this.stopStreaming();
        return;
      }

      // Record TTFT on first token
      if (!ttftRecorded) {
        const ttft = Math.round(performance.now() - startTime + (useSpeculative ? 14 : 38));
        if (this.ttftDisplay) this.ttftDisplay.textContent = `${ttft}ms`;
        ttftRecorded = true;
      }

      const tok = tokens[tokenIndex];
      tokenIndex++;

      // Append token with subtle fade-in animation
      const span = document.createElement('span');
      span.className = 'streamed-token';
      span.textContent = tok;

      const cursor = this.outputContainer.querySelector('.cursor-stream-blink');
      if (cursor) {
        this.outputContainer.insertBefore(span, cursor);
      } else {
        this.outputContainer.appendChild(span);
      }

      // Update Live Metrics
      const elapsedSec = (performance.now() - startTime) / 1000;
      const tps = Math.round(tokenIndex / Math.max(0.05, elapsedSec));
      if (this.tpsDisplay) this.tpsDisplay.textContent = `${tps} tok/s`;
      if (this.tokensCountDisplay) this.tokensCountDisplay.textContent = `${tokenIndex}`;
      if (this.cacheDisplay) this.cacheDisplay.textContent = `${(tokenIndex * 0.12).toFixed(1)} MB`;

      // Soft audio feedback periodically
      if (tokenIndex % 6 === 0 && window.classicalAudio) {
        window.classicalAudio.playTick(600 + (tokenIndex % 4) * 80);
      }
    }, baseDelay);
  }

  stopStreaming() {
    this.isStreaming = false;
    clearInterval(this.streamInterval);
    if (this.streamBtn) this.streamBtn.disabled = false;
    if (this.stopBtn) this.stopBtn.disabled = true;

    // Remove cursor blinker
    const cursor = this.outputContainer.querySelector('.cursor-stream-blink');
    if (cursor) cursor.remove();

    if (window.classicalAudio) window.classicalAudio.playChime(659.25);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.llmStreamer = new LLMStreamer();
});
