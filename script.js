
/* =========================================================
   MEDHAVI PORTFOLIO — ANIMATED NEURAL NETWORK
   ========================================================= */

(() => {
  const canvas = document.getElementById("neural-bg");

  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const settings = {
    desktopNodes: 58,
    mobileNodes: 30,
    connectionDistance: 155,
    speed: 0.16,
    mouseRadius: 190,
    mouseForce: 0.012,
    nodeColor: "242, 245, 247",
    lineColor: "174, 185, 195"
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let nodes = [];
  let animationFrame = null;
  let lastTime = 0;

  const mouse = {
    x: -1000,
    y: -1000,
    active: false
  };

  function createNodes() {
    const count =
      width <= 768
        ? settings.mobileNodes
        : settings.desktopNodes;

    nodes = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed =
        settings.speed * (0.55 + Math.random() * 0.65);

      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 0.65 + Math.random() * 1.25,
        phase: Math.random() * Math.PI * 2,
        pulse: 0.6 + Math.random() * 0.4
      });
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createNodes();
    draw(performance.now());
  }

  function drawNode(node, time) {
    const pulse =
      0.85 +
      Math.sin(time * 0.00065 + node.phase) *
        0.15 *
        node.pulse;

    const radius = node.radius * pulse;

    // Soft glow around each node
    const glow = ctx.createRadialGradient(
      node.x, node.y, 0,
      node.x, node.y, radius * 6
    );

    glow.addColorStop(
      0,
      `rgba(${settings.nodeColor}, ${0.10 * pulse})`
    );

    glow.addColorStop(
      1,
      `rgba(${settings.nodeColor}, 0)`
    );

    ctx.beginPath();
    ctx.fillStyle = glow;
    ctx.arc(node.x, node.y, radius * 6, 0, Math.PI * 2);
    ctx.fill();

    // Main glowing particle
    ctx.beginPath();
    ctx.fillStyle =
      `rgba(${settings.nodeColor}, ${0.65 * pulse})`;
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawConnection(a, b, distance) {
    if (distance >= settings.connectionDistance) return;

    const strength =
      1 - distance / settings.connectionDistance;

    const opacity = 0.14 * strength * strength;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle =
      `rgba(${settings.lineColor}, ${opacity})`;
    ctx.lineWidth = 0.65;
    ctx.stroke();
  }

  function updateNode(node) {
    if (reducedMotion.matches) return;

    node.x += node.vx;
    node.y += node.vy;

    // Mouse interaction
    if (mouse.active) {
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const distance = Math.hypot(dx, dy);

      if (distance < settings.mouseRadius && distance > 1) {
        const force =
          (1 - distance / settings.mouseRadius) *
          settings.mouseForce;

        node.vx -= (dx / distance) * force;
        node.vy -= (dy / distance) * force;
      }
    }

    // Keep movement gentle
    const maxSpeed = settings.speed * 1.8;
    const currentSpeed = Math.hypot(node.vx, node.vy);

    if (currentSpeed > maxSpeed) {
      node.vx = (node.vx / currentSpeed) * maxSpeed;
      node.vy = (node.vy / currentSpeed) * maxSpeed;
    }

    // Wrap particles around screen edges
    const margin = 25;

    if (node.x < -margin) node.x = width + margin;
    if (node.x > width + margin) node.x = -margin;
    if (node.y < -margin) node.y = height + margin;
    if (node.y > height + margin) node.y = -margin;
  }

  function draw(time = 0) {
    ctx.clearRect(0, 0, width, height);

    // Draw connections between nearby particles
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];

        const distance = Math.hypot(
          a.x - b.x,
          a.y - b.y
        );

        drawConnection(a, b, distance);
      }
    }

    // Draw particles and update their positions
    for (const node of nodes) {
      drawNode(node, time);
      updateNode(node);
    }
  }

  function animate(time) {
    animationFrame = null;

    if (reducedMotion.matches) {
      draw(time);
      return;
    }

    // Limit rendering to approximately 30 FPS
    if (time - lastTime >= 33) {
      draw(time);
      lastTime = time;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    lastTime = 0;

    if (reducedMotion.matches) {
      draw(performance.now());
    } else {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  // Mouse movement
  window.addEventListener(
    "pointermove",
    (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    mouse.active = false;
  });

  // Resize the canvas when the window changes size
  window.addEventListener(
    "resize",
    () => {
      resize();
      startAnimation();
    },
    { passive: true }
  );

  // Stop or restart animation based on accessibility settings
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", startAnimation);
  }

  // Start once
  resize();
  startAnimation();
})();


/* ===============================
   NAVIGATION MENU
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const menuPanel = document.querySelector(".menu-panel");

  if (!menuToggle || !menuPanel) {
    console.error("Menu button or menu panel not found.");
    return;
  }

  function openMenu() {
    menuPanel.classList.add("is-open");
    menuPanel.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    menuPanel.classList.remove("is-open");
    menuPanel.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuPanel.classList.contains("is-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
});
