/**
 * Real In-Browser Neural Network Classifier (Decision Boundary Visualizer)
 * Implements a real 2-layer Multi-Layer Perceptron (MLP) trained via Backpropagation
 * with real-time decision boundary contour rendering and live loss curve plotting.
 */

class NeuralNetworkTrainer {
  constructor() {
    this.canvas = document.getElementById('decision-canvas');
    this.lossCanvas = document.getElementById('loss-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.lCtx = this.lossCanvas ? this.lossCanvas.getContext('2d') : null;

    // Architecture: 2 inputs -> 8 hidden neurons (tanh) -> 1 output (sigmoid)
    this.inputSize = 2;
    this.hiddenSize = 8;
    this.learningRate = 0.15;

    // Weights & Biases
    this.W1 = [];
    this.b1 = [];
    this.W2 = [];
    this.b2 = 0;

    // Data points [{x, y, label}] where label is 0 or 1
    this.points = [];
    this.lossHistory = [];
    this.epoch = 0;
    this.isTraining = false;
    this.animFrameId = null;

    this.currentDataset = 'circles';
    this.initModel();
    this.generateDataset(this.currentDataset);
    this.bindEvents();
    this.render();
  }

  initModel() {
    // Xavier / He initialization
    this.W1 = [];
    for (let i = 0; i < this.inputSize; i++) {
      this.W1[i] = [];
      for (let j = 0; j < this.hiddenSize; j++) {
        this.W1[i][j] = (Math.random() - 0.5) * Math.sqrt(2 / this.inputSize);
      }
    }
    this.b1 = new Array(this.hiddenSize).fill(0);

    this.W2 = [];
    for (let j = 0; j < this.hiddenSize; j++) {
      this.W2[j] = (Math.random() - 0.5) * Math.sqrt(2 / this.hiddenSize);
    }
    this.b2 = 0;

    this.epoch = 0;
    this.lossHistory = [];
  }

  // Activation functions
  tanh(x) { return Math.tanh(x); }
  dtanh(y) { return 1 - y * y; } // derivative given tanh(x) output

  sigmoid(x) { return 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, x)))); }

  // Forward Pass
  predict(x1, x2) {
    const hidden = new Array(this.hiddenSize);
    for (let j = 0; j < this.hiddenSize; j++) {
      let sum = x1 * this.W1[0][j] + x2 * this.W1[1][j] + this.b1[j];
      hidden[j] = this.tanh(sum);
    }

    let outSum = this.b2;
    for (let j = 0; j < this.hiddenSize; j++) {
      outSum += hidden[j] * this.W2[j];
    }
    return {
      output: this.sigmoid(outSum),
      hidden: hidden
    };
  }

  // One SGD / Batch Training Step (Backpropagation)
  trainEpoch() {
    if (this.points.length === 0) return;

    let totalLoss = 0;
    let correct = 0;

    // Gradient accumulators
    const dW1 = Array.from({ length: this.inputSize }, () => new Array(this.hiddenSize).fill(0));
    const db1 = new Array(this.hiddenSize).fill(0);
    const dW2 = new Array(this.hiddenSize).fill(0);
    let db2 = 0;

    const N = this.points.length;

    for (let i = 0; i < N; i++) {
      const p = this.points[i];
      const { output, hidden } = this.predict(p.x, p.y);
      const target = p.label;

      // Binary Cross Entropy Loss
      const eps = 1e-7;
      const loss = -(target * Math.log(output + eps) + (1 - target) * Math.log(1 - output + eps));
      totalLoss += loss;

      if ((output >= 0.5 && target === 1) || (output < 0.5 && target === 0)) {
        correct++;
      }

      // Output error: dL/d(outSum) = output - target for BCE with sigmoid
      const deltaOut = output - target;

      // Gradients for layer 2
      for (let j = 0; j < this.hiddenSize; j++) {
        dW2[j] += deltaOut * hidden[j];
      }
      db2 += deltaOut;

      // Backpropagate to layer 1
      for (let j = 0; j < this.hiddenSize; j++) {
        const deltaHidden = deltaOut * this.W2[j] * this.dtanh(hidden[j]);
        dW1[0][j] += deltaHidden * p.x;
        dW1[1][j] += deltaHidden * p.y;
        db1[j] += deltaHidden;
      }
    }

    // Apply weight updates
    for (let j = 0; j < this.hiddenSize; j++) {
      this.W2[j] -= (this.learningRate * dW2[j]) / N;
      this.b1[j] -= (this.learningRate * db1[j]) / N;
      this.W1[0][j] -= (this.learningRate * dW1[0][j]) / N;
      this.W1[1][j] -= (this.learningRate * dW1[1][j]) / N;
    }
    this.b2 -= (this.learningRate * db2) / N;

    this.epoch++;
    const avgLoss = totalLoss / N;
    this.lossHistory.push(avgLoss);
    if (this.lossHistory.length > 50) this.lossHistory.shift();

    // Update UI Stats
    const lossEl = document.getElementById('nn-loss-val');
    const accEl = document.getElementById('nn-acc-val');
    const epochEl = document.getElementById('nn-epoch-val');

    if (lossEl) lossEl.textContent = avgLoss.toFixed(4);
    if (accEl) accEl.textContent = `${Math.round((correct / N) * 100)}%`;
    if (epochEl) epochEl.textContent = this.epoch;
  }

  // Pre-configured Datasets
  generateDataset(type) {
    this.points = [];
    const count = 48;

    if (type === 'circles') {
      // Inner circle (class 0)
      for (let i = 0; i < count / 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.45;
        this.points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle), label: 0 });
      }
      // Outer ring (class 1)
      for (let i = 0; i < count / 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 0.65 + Math.random() * 0.35;
        this.points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle), label: 1 });
      }
    } else if (type === 'moons') {
      // Two interleaving half-moons
      for (let i = 0; i < count / 2; i++) {
        const theta = (Math.PI * i) / (count / 2);
        this.points.push({
          x: Math.cos(theta) * 0.7 + (Math.random() - 0.5) * 0.15,
          y: Math.sin(theta) * 0.7 + (Math.random() - 0.5) * 0.15,
          label: 0
        });
      }
      for (let i = 0; i < count / 2; i++) {
        const theta = (Math.PI * i) / (count / 2);
        this.points.push({
          x: 1 - Math.cos(theta) * 0.7 + (Math.random() - 0.5) * 0.15 - 0.4,
          y: 0.5 - Math.sin(theta) * 0.7 + (Math.random() - 0.5) * 0.15 - 0.2,
          label: 1
        });
      }
    } else if (type === 'xor') {
      // 4 Quadrants
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 1.8;
        const y = (Math.random() - 0.5) * 1.8;
        const label = (x * y > 0) ? 1 : 0;
        this.points.push({ x, y, label });
      }
    }

    this.initModel();
    this.render();
  }

  // Draw Decision Boundary Surface & Data Points
  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Render coarse decision boundary grid for high performance
    const step = 8;
    for (let px = 0; px < w; px += step) {
      for (let py = 0; py < h; py += step) {
        // Map pixel coordinates to [-1.2, 1.2]
        const nx = (px / w) * 2.4 - 1.2;
        const ny = (py / h) * 2.4 - 1.2;

        const pred = this.predict(nx, ny).output;

        // Classical light aesthetic colormap:
        // Blue (Class 0: rgba(59, 130, 246, alpha)) vs Amber (Class 1: rgba(180, 83, 9, alpha))
        if (pred < 0.5) {
          const confidence = (0.5 - pred) * 2; // 0 to 1
          this.ctx.fillStyle = `rgba(59, 130, 246, ${confidence * 0.28})`;
        } else {
          const confidence = (pred - 0.5) * 2; // 0 to 1
          this.ctx.fillStyle = `rgba(180, 83, 9, ${confidence * 0.28})`;
        }
        this.ctx.fillRect(px, py, step, step);
      }
    }

    // Draw Axes
    this.ctx.strokeStyle = 'rgba(18, 24, 38, 0.1)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(w / 2, 0);
    this.ctx.lineTo(w / 2, h);
    this.ctx.moveTo(0, h / 2);
    this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();

    // Draw Data Points
    this.points.forEach(p => {
      const cx = ((p.x + 1.2) / 2.4) * w;
      const cy = ((p.y + 1.2) / 2.4) * h;

      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = p.label === 0 ? '#2563eb' : '#b45309';
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });

    this.renderLossChart();
  }

  // Draw real-time Loss Graph
  renderLossChart() {
    if (!this.lCtx || this.lossHistory.length < 2) return;
    const lw = this.lossCanvas.width;
    const lh = this.lossCanvas.height;
    this.lCtx.clearRect(0, 0, lw, lh);

    this.lCtx.strokeStyle = '#3730a3';
    this.lCtx.lineWidth = 2;
    this.lCtx.beginPath();

    const maxLoss = 1.2;
    this.lossHistory.forEach((loss, i) => {
      const x = (i / (this.lossHistory.length - 1)) * lw;
      const y = lh - Math.min(lh - 4, (loss / maxLoss) * lh);
      if (i === 0) this.lCtx.moveTo(x, y);
      else this.lCtx.lineTo(x, y);
    });
    this.lCtx.stroke();
  }

  startTrainingLoop() {
    if (!this.isTraining) return;
    for (let i = 0; i < 4; i++) {
      this.trainEpoch();
    }
    this.render();
    this.animFrameId = requestAnimationFrame(() => this.startTrainingLoop());
  }

  bindEvents() {
    // Canvas click to add points
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const nx = (px / this.canvas.width) * 2.4 - 1.2;
      const ny = (py / this.canvas.height) * 2.4 - 1.2;

      // Toggle label based on shift key or active radio
      const label = e.shiftKey ? 1 : 0;
      this.points.push({ x: nx, y: ny, label });
      this.render();

      if (window.classicalAudio) window.classicalAudio.playTick(1100);
    });

    // Buttons
    const trainBtn = document.getElementById('btn-train-nn');
    if (trainBtn) {
      trainBtn.addEventListener('click', () => {
        this.isTraining = !this.isTraining;
        trainBtn.innerHTML = this.isTraining
          ? '<i class="fa-solid fa-pause"></i> Pause Training'
          : '<i class="fa-solid fa-play"></i> Train Network';
        trainBtn.classList.toggle('active', this.isTraining);

        if (this.isTraining) {
          this.startTrainingLoop();
          if (window.classicalAudio) window.classicalAudio.playChime(523.25);
        } else {
          cancelAnimationFrame(this.animFrameId);
          if (window.classicalAudio) window.classicalAudio.playTick(700);
        }
      });
    }

    const resetBtn = document.getElementById('btn-reset-nn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.isTraining = false;
        if (trainBtn) {
          trainBtn.innerHTML = '<i class="fa-solid fa-play"></i> Train Network';
          trainBtn.classList.remove('active');
        }
        cancelAnimationFrame(this.animFrameId);
        this.initModel();
        this.render();
        if (window.classicalAudio) window.classicalAudio.playTick(600);
      });
    }

    // Dataset Selectors
    const datasetBtns = document.querySelectorAll('.btn-dataset');
    datasetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        datasetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentDataset = btn.dataset.ds;
        this.generateDataset(this.currentDataset);
        if (window.classicalAudio) window.classicalAudio.playTick(900);
      });
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.neuralTrainer = new NeuralNetworkTrainer();
});
