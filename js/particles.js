(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  const sections = document.querySelectorAll('[data-particles="on"]');
  if (!sections.length) {
    return;
  }

  sections.forEach((section) => {
    if (section.querySelector(".particle-canvas")) {
      return;
    }

    const computedStyle = window.getComputedStyle(section);
    if (computedStyle.position === "static") {
      section.style.position = "relative";
    }

    const canvas = document.createElement("canvas");
    canvas.className = "particle-canvas";
    canvas.setAttribute("aria-hidden", "true");
    section.prepend(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let width = 0;
    let height = 0;
    let particles = [];
    let frameId = 0;

    function createParticle() {
      const speed = Math.random() * 0.25 + 0.08;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.5 + 0.25
      };
    }

    function resize() {
      const rect = section.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const targetCount = Math.max(20, Math.min(55, Math.floor((width * height) / 18000)));
      if (particles.length < targetCount) {
        const remaining = targetCount - particles.length;
        for (let i = 0; i < remaining; i += 1) {
          particles.push(createParticle());
        }
      } else if (particles.length > targetCount) {
        particles.length = targetCount;
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(137, 180, 225, ${p.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 115) {
            continue;
          }

          const linkAlpha = (1 - distance / 115) * 0.24;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255, 163, 82, ${linkAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      frameId = window.requestAnimationFrame(step);
    }

    function onVisibilityChange() {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
        return;
      }
      frameId = window.requestAnimationFrame(step);
    }

    resize();
    frameId = window.requestAnimationFrame(step);

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(section);
    }
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
  });
})();
