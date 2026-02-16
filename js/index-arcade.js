(function () {
  var gameRoot = document.getElementById("mini-game");
  if (!gameRoot) return;

  var canvasHost = document.getElementById("game-canvas");
  var scoreEl = document.getElementById("game-score");
  var bestEl = document.getElementById("game-best");
  var resetBtn = document.getElementById("reset-game");
  var statusEl = document.getElementById("game-status");

  function setStatus(text, tone) {
    if (!statusEl) return;
    statusEl.textContent = text;
    if (tone === "error") {
      statusEl.style.color = "#ffadad";
      statusEl.style.borderColor = "rgba(255, 173, 173, 0.4)";
    } else {
      statusEl.style.color = "#9ddabf";
      statusEl.style.borderColor = "rgba(157, 218, 191, 0.3)";
    }
  }

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  if (!ctx) {
    setStatus("Unavailable", "error");
    return;
  }
  canvasHost.innerHTML = "";
  canvasHost.style.touchAction = "manipulation";
  canvasHost.appendChild(canvas);

  var score = 0;
  var best = 0;
  try {
    best = Number(localStorage.getItem("gm_flappy_best_score") || 0);
  } catch (err) {
    best = 0;
  }
  bestEl.textContent = String(best);

  var state = {
    width: 0,
    height: 0,
    started: false,
    over: false,
    score: 0,
    gravity: 1220,
    flapPower: -360,
    scrollSpeed: 170,
    gapSize: 128,
    pipeWidth: 58,
    spawnEvery: 1.35,
    spawnTimer: 0,
    bird: { x: 78, y: 100, r: 12, vy: 0 },
    pipes: []
  };

  function updateScore(next) {
    score = next;
    state.score = next;
    scoreEl.textContent = String(next);
    if (next > best) {
      best = next;
      bestEl.textContent = String(best);
      try {
        localStorage.setItem("gm_flappy_best_score", String(best));
      } catch (err) {
        // Ignore storage failures.
      }
    }
  }

  function resize() {
    var width = Math.max(120, canvasHost.clientWidth);
    var height = Math.max(120, canvasHost.clientHeight);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.width = width;
    state.height = height;
    if (!state.started) {
      state.bird.y = Math.round(height * 0.48);
    } else {
      state.bird.y = Math.max(state.bird.r, Math.min(height - state.bird.r, state.bird.y));
    }
  }

  function resetGame() {
    state.started = false;
    state.over = false;
    state.spawnTimer = 0;
    state.pipes = [];
    state.bird.vy = 0;
    state.bird.y = Math.round(state.height * 0.48);
    updateScore(0);
    setStatus("Ready");
  }

  function spawnPipe() {
    var margin = 22;
    var minTop = margin;
    var maxTop = Math.max(minTop, state.height - state.gapSize - margin);
    var topHeight = minTop + Math.random() * (maxTop - minTop);
    state.pipes.push({
      x: state.width + 24,
      topHeight: topHeight,
      scored: false
    });
  }

  function flap() {
    if (state.over) {
      resetGame();
      state.started = true;
    } else if (!state.started) {
      state.started = true;
    }
    state.bird.vy = state.flapPower;
    setStatus("Live");
  }

  function pipeCollides(pipe, bird) {
    var pipeLeft = pipe.x;
    var pipeRight = pipe.x + state.pipeWidth;
    var birdLeft = bird.x - bird.r;
    var birdRight = bird.x + bird.r;
    if (birdRight < pipeLeft || birdLeft > pipeRight) return false;
    var gapTop = pipe.topHeight;
    var gapBottom = pipe.topHeight + state.gapSize;
    var birdTop = bird.y - bird.r;
    var birdBottom = bird.y + bird.r;
    return birdTop < gapTop || birdBottom > gapBottom;
  }

  function gameOver() {
    if (state.over) return;
    state.over = true;
    state.started = false;
    setStatus("Crashed", "error");
  }

  function update(dt) {
    if (!state.started || state.over) {
      return;
    }

    state.spawnTimer += dt;
    if (state.spawnTimer >= state.spawnEvery) {
      state.spawnTimer = 0;
      spawnPipe();
    }

    state.bird.vy += state.gravity * dt;
    state.bird.y += state.bird.vy * dt;

    if (state.bird.y - state.bird.r <= 0 || state.bird.y + state.bird.r >= state.height) {
      gameOver();
    }

    for (var i = state.pipes.length - 1; i >= 0; i -= 1) {
      var pipe = state.pipes[i];
      pipe.x -= state.scrollSpeed * dt;

      if (!pipe.scored && pipe.x + state.pipeWidth < state.bird.x) {
        pipe.scored = true;
        updateScore(state.score + 1);
      }

      if (pipe.x + state.pipeWidth < -10) {
        state.pipes.splice(i, 1);
        continue;
      }

      if (pipeCollides(pipe, state.bird)) {
        gameOver();
      }
    }
  }

  function drawBird() {
    var bird = state.bird;
    var tilt = Math.max(-0.65, Math.min(0.9, bird.vy / 430));
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(tilt);
    ctx.fillStyle = "#ffd16f";
    ctx.beginPath();
    ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff9f3f";
    ctx.beginPath();
    ctx.moveTo(bird.r - 2, 0);
    ctx.lineTo(bird.r + 8, -3);
    ctx.lineTo(bird.r + 8, 3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(3, -4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPipes() {
    for (var i = 0; i < state.pipes.length; i += 1) {
      var pipe = state.pipes[i];
      var gapTop = pipe.topHeight;
      var gapBottom = pipe.topHeight + state.gapSize;

      ctx.fillStyle = "#64d498";
      ctx.fillRect(pipe.x, 0, state.pipeWidth, gapTop);
      ctx.fillRect(pipe.x, gapBottom, state.pipeWidth, state.height - gapBottom);

      ctx.fillStyle = "#8bf6be";
      ctx.fillRect(pipe.x - 2, gapTop - 10, state.pipeWidth + 4, 10);
      ctx.fillRect(pipe.x - 2, gapBottom, state.pipeWidth + 4, 10);
    }
  }

  function drawBackdrop() {
    var sky = ctx.createLinearGradient(0, 0, 0, state.height);
    sky.addColorStop(0, "#1d2a38");
    sky.addColorStop(1, "#0f131b");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (var x = 0; x < state.width; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, state.height);
      ctx.stroke();
    }
  }

  function drawOverlay(message, subMessage) {
    ctx.fillStyle = "rgba(6, 8, 12, 0.48)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#fff5df";
    ctx.font = "600 14px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(message, state.width / 2, state.height / 2 - 4);
    ctx.fillStyle = "#d5d5d5";
    ctx.font = "400 12px Outfit, sans-serif";
    ctx.fillText(subMessage, state.width / 2, state.height / 2 + 16);
  }

  function draw() {
    drawBackdrop();
    drawPipes();
    drawBird();

    if (!state.started && !state.over) {
      drawOverlay("Tap To Start", "Click/tap/space to flap");
    } else if (state.over) {
      drawOverlay("Game Over", "Press reset or tap to restart");
    }
  }

  function handlePress(event) {
    if (event) event.preventDefault();
    flap();
  }

  canvas.addEventListener("pointerdown", handlePress);
  window.addEventListener("keydown", function (event) {
    if (event.code === "Space" || event.code === "ArrowUp") {
      handlePress(event);
    }
  });
  resetBtn.addEventListener("click", function () {
    resetGame();
  });
  window.addEventListener("resize", resize);

  resize();
  resetGame();

  var lastTime = performance.now();
  function loop(now) {
    var dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
