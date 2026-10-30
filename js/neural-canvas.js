/**
 * Neural Canvas & Mathematical Manifold Visualizers
 * 1. Background Synaptic Constellation (Light Theme)
 * 2. Hero Interactive Tensor Manifold Orb
 */

(function () {
  // =========================================================================
  // 1. BACKGROUND SYNAPTIC CONSTELLATION
  // =========================================================================
  const bgCanvas = document.getElementById('synapse-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let width, height, dpr;
    let particles = [];
    const particleCount = 48; // Optimal performance & classical elegance
    const maxDistance = 140;

    let mouse = { x: -1000, y: -1000, radius: 160 };

    function resizeBg() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      bgCanvas.width = width * dpr;
      bgCanvas.height = height * dpr;
      bgCanvas.style.width = width + 'px';
      bgCanvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      initParticles();
    }

    class SynapseParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.8 + 1.2;
        this.baseColor = Math.random() > 0.3 ? 'rgba(55, 48, 163,' : 'rgba(180, 83, 9,'; // Indigo or Gold
        this.alpha = Math.random() * 0.35 + 0.15;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls gently
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction physics
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 2;
          this.y -= Math.sin(angle) * force * 2;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.baseColor} ${this.alpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new SynapseParticle());
      }
    }

    function renderBg() {
      ctx.clearRect(0, 0, width, height);

      // Connect filaments
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const opacity = (1 - dist / maxDistance) * 0.16;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(55, 48, 163, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      requestAnimationFrame(renderBg);
    }

    window.addEventListener('resize', resizeBg);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    resizeBg();
    renderBg();
  }

  // =========================================================================
  // 2. HERO INTERACTIVE TENSOR MANIFOLD ORB (3D Harmonic Lattice)
  // =========================================================================
  const orbCanvas = document.getElementById('hero-orb-canvas');
  if (orbCanvas) {
    const oCtx = orbCanvas.getContext('2d');
    let orbWidth, orbHeight;
    let angleX = 0.2;
    let angleY = 0.4;
    let angleZ = 0;
    let perturbation = 0;
    let targetPerturbation = 0;

    function resizeOrb() {
      const rect = orbCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      orbWidth = rect.width;
      orbHeight = rect.height;
      orbCanvas.width = orbWidth * dpr;
      orbCanvas.height = orbHeight * dpr;
      oCtx.scale(dpr, dpr);
    }

    // Mathematical 3D Point Generation (Spherical Harmonic / Tensor Lattice)
    const points = [];
    const numLat = 16;
    const numLon = 24;
    const baseRadius = 88;

    for (let i = 0; i <= numLat; i++) {
      const theta = (i * Math.PI) / numLat;
      for (let j = 0; j < numLon; j++) {
        const phi = (j * 2 * Math.PI) / numLon;
        points.push({ theta, phi });
      }
    }

    function project(x, y, z) {
      const fov = 300;
      const scale = fov / (fov + z + 120);
      return {
        x: x * scale + orbWidth / 2,
        y: y * scale + orbHeight / 2,
        scale: scale,
        depth: z
      };
    }

    let lastFrameTime = performance.now();
    let frameCount = 0;
    const fpsDisplay = document.getElementById('fps-counter');

    function renderOrb(now) {
      // FPS measurement
      frameCount++;
      if (now - lastFrameTime >= 500) {
        if (fpsDisplay) {
          fpsDisplay.textContent = `${Math.min(60, Math.round((frameCount * 1000) / (now - lastFrameTime)))}.0 FPS`;
        }
        frameCount = 0;
        lastFrameTime = now;
      }

      oCtx.clearRect(0, 0, orbWidth, orbHeight);

      // Dampen perturbation smoothly
      perturbation += (targetPerturbation - perturbation) * 0.08;
      targetPerturbation *= 0.95;

      // Rotation dynamics
      angleX += 0.004;
      angleY += 0.006;
      angleZ += 0.002;

      const time = now * 0.0015;

      const projectedPoints = points.map(p => {
        // Spherical Harmonic distortion
        const rMod = baseRadius + 
          Math.sin(p.theta * 3 + time) * (14 + perturbation * 30) * Math.cos(p.phi * 2 + time);

        let x = rMod * Math.sin(p.theta) * Math.cos(p.phi);
        let y = rMod * Math.cos(p.theta);
        let z = rMod * Math.sin(p.theta) * Math.sin(p.phi);

        // Rotate Y
        let cosY = Math.cos(angleY), sinY = Math.sin(angleY);
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;

        // Rotate X
        let cosX = Math.cos(angleX), sinX = Math.sin(angleX);
        let y2 = y * cosX - z1 * sinX;
        let z2 = y * sinX + z1 * cosX;

        // Rotate Z
        let cosZ = Math.cos(angleZ), sinZ = Math.sin(angleZ);
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;

        return project(x3, y3, z2);
      });

      // Render wireframe lines
      for (let i = 0; i < points.length; i++) {
        const pt = projectedPoints[i];
        
        // Connect to longitude neighbor
        const nextLonIdx = (i % numLon === numLon - 1) ? i - (numLon - 1) : i + 1;
        const ptLon = projectedPoints[nextLonIdx];

        if (pt && ptLon) {
          const depthAlpha = Math.max(0.08, Math.min(0.65, (pt.depth + 100) / 200));
          oCtx.beginPath();
          oCtx.moveTo(pt.x, pt.y);
          oCtx.lineTo(ptLon.x, ptLon.y);
          oCtx.strokeStyle = `rgba(55, 48, 163, ${depthAlpha * 0.4})`;
          oCtx.lineWidth = 0.9;
          oCtx.stroke();
        }

        // Draw node vertices
        if (i % 3 === 0) {
          oCtx.beginPath();
          oCtx.arc(pt.x, pt.y, 2 * pt.scale, 0, Math.PI * 2);
          oCtx.fillStyle = (i % 6 === 0) 
            ? `rgba(180, 83, 9, ${pt.scale * 0.9})` // Gold highlight
            : `rgba(55, 48, 163, ${pt.scale * 0.85})`; // Indigo
          oCtx.fill();
        }
      }

      requestAnimationFrame(renderOrb);
    }

    // Perturb Button
    const scrambleBtn = document.getElementById('scramble-orb-btn');
    if (scrambleBtn) {
      scrambleBtn.addEventListener('click', () => {
        targetPerturbation = 1.8;
        if (window.classicalAudio) window.classicalAudio.playTick(1200);
      });
    }

    window.addEventListener('resize', resizeOrb);
    resizeOrb();
    requestAnimationFrame(renderOrb);
  }
})();
