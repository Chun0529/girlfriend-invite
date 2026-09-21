(() => {
  const state = {
    step: 1,
    dodgeCount: 0,
    yesScale: 1,
    lastDodge: 0,
    notifiedComplete: false,
  };

  const els = {
    card: document.getElementById("card"),
    progress: [...document.querySelectorAll("#progress li")],
    steps: [...document.querySelectorAll(".step")],
    yes: document.getElementById("btn-yes"),
    no: document.getElementById("btn-no"),
    letter: document.getElementById("letter"),
    replay: document.getElementById("btn-replay"),
    whatsapp: document.getElementById("btn-whatsapp"),
    confetti: document.getElementById("confetti"),
  };

  function config() {
    return (
      window.INVITE_CONFIG || {
        you: "你",
        me: "我",
        notifyEmail: "",
        web3formsKey: "",
        whatsapp: "85264891242",
      }
    );
  }

  function notify(payload) {
    const { web3formsKey, notifyEmail } = config();
    if (!web3formsKey) return Promise.resolve();
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: web3formsKey,
        from_name: "表白網站回覆",
        email: notifyEmail || "noreply@web3forms.com",
        ...payload,
      }),
    }).catch(() => {});
  }

  function viewport() {
    const vv = window.visualViewport;
    const width = Math.min(
      window.innerWidth,
      vv ? vv.width : window.innerWidth,
      document.documentElement.clientWidth
    );
    const height = Math.min(
      window.innerHeight,
      vv ? vv.height : window.innerHeight,
      document.documentElement.clientHeight
    );
    return {
      left: vv ? vv.offsetLeft : 0,
      top: vv ? vv.offsetTop : 0,
      width,
      height,
    };
  }

  function setStep(step) {
    state.step = step;
    els.steps.forEach((section) => {
      const active = Number(section.dataset.step) === step;
      section.hidden = !active;
      section.classList.toggle("is-active", active);
    });
    els.progress.forEach((item, index) => {
      item.classList.toggle("is-active", index === step - 1);
      item.classList.toggle("is-done", index < step - 1);
    });
    if (step !== 1) resetNoButton(false);
  }

  function growYes() {
    state.yesScale = Math.min(1 + state.dodgeCount * 0.12, 2.15);
    const maxPx = Math.min(window.innerWidth * 0.92, 320);
    els.yes.style.setProperty("--yes-scale", String(state.yesScale));
    els.yes.style.transform = `scale(${state.yesScale})`;
    els.yes.style.maxWidth = `${maxPx}px`;
    els.yes.style.fontSize = `${Math.min(1.05 + state.dodgeCount * 0.06, 1.7)}rem`;
    els.yes.style.padding = `${14 + Math.min(state.dodgeCount, 8)}px ${22 + Math.min(state.dodgeCount * 2, 18)}px`;
  }

  function overlaps(ax, ay, aw, ah, b) {
    const pad = 12;
    return ax < b.right + pad && ax + aw > b.left - pad && ay < b.bottom + pad && ay + ah > b.top - pad;
  }

  function moveNo(event) {
    event.preventDefault();
    event.stopPropagation();
    const now = Date.now();
    if (now - state.lastDodge < 90) return;
    state.lastDodge = now;
    state.dodgeCount += 1;
    growYes();

    const no = els.no;
    const rect = no.getBoundingClientRect();
    const view = viewport();
    const pad = 16;
    const btnW = rect.width || 96;
    const btnH = rect.height || 48;
    const maxX = Math.max(0, view.width - btnW - pad * 2);
    const maxY = Math.max(0, view.height - btnH - pad * 2);
    const yesRect = els.yes.getBoundingClientRect();
    const pointer = {
      left: (event.clientX ?? -999) - 28,
      right: (event.clientX ?? -999) + 28,
      top: (event.clientY ?? -999) - 28,
      bottom: (event.clientY ?? -999) + 28,
    };

    let x = 0;
    let y = 0;
    let tries = 0;
    do {
      x = view.left + pad + Math.random() * maxX;
      y = view.top + pad + Math.random() * maxY;
      tries += 1;
    } while (
      tries < 24 &&
      (overlaps(x, y, rect.width, rect.height, yesRect) || overlaps(x, y, rect.width, rect.height, pointer))
    );

    no.classList.add("is-runaway");
    no.style.position = "fixed";
    no.style.left = `${Math.round(x)}px`;
    no.style.top = `${Math.round(y)}px`;
    no.style.right = "auto";
    no.style.bottom = "auto";
  }

  function resetNoButton(resetScale) {
    const no = els.no;
    no.classList.remove("is-runaway");
    no.style.position = "";
    no.style.left = "";
    no.style.top = "";
    no.style.right = "";
    no.style.bottom = "";
    if (resetScale) {
      state.dodgeCount = 0;
      state.yesScale = 1;
      els.yes.style.transform = "";
      els.yes.style.fontSize = "";
      els.yes.style.padding = "";
      els.yes.style.maxWidth = "";
      els.yes.style.removeProperty("--yes-scale");
    }
  }

  function burstConfetti() {
    const canvas = els.confetti;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ctx || reduce) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ["#db2777", "#f472b6", "#a78bfa", "#c4b5fd", "#f8e1a8", "#fb7185"];
    const origin = els.yes.getBoundingClientRect();
    const particles = Array.from({ length: 70 }, () => ({
      x: origin.left + origin.width / 2,
      y: origin.top + origin.height / 2,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -8 - 3,
      g: 0.18 + Math.random() * 0.08,
      size: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 70 + Math.random() * 20,
    }));

    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        ctx.globalAlpha = Math.max(p.life / 90, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.65, p.x / 40, 0, Math.PI * 2);
        ctx.fill();
      });
      frame += 1;
      if (frame < 90) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    requestAnimationFrame(tick);
  }

  function renderLetter() {
    const { you, me } = config();
    els.letter.innerHTML = `
      <p>親愛的${you}：</p>
      <p>其實這句話我在心裡排練了很久。點進這個小網站的時候，心跳大概比那個「No」逃跑的速度還快。</p>
      <p>謝謝${you}願意說「好哦」。從今天起，讓我有資格把${you}放在最靠近的位置——不是朋友旁邊的位子，是女朋友的位子。</p>
      <p>不一定要很華麗。只要${you}在，普通的夜晚也會發光。剩下的話，想當面慢慢說。</p>
      <p class="sign">—— 喜歡${you}的${me}</p>
    `;
    updateWhatsApp();
  }

  function updateWhatsApp() {
    const { whatsapp, you, me } = config();
    const number = String(whatsapp || "85264891242").replace(/\D/g, "");
    const text = `我答應做${me}的女朋友了 ♥\n—— ${you}`;
    els.whatsapp.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  function notifyComplete() {
    if (state.notifiedComplete) return;
    state.notifiedComplete = true;
    notify({
      subject: "她說好哦了 💕",
      name: "表白網站回覆",
      dodge_count: String(state.dodgeCount),
      whatsapp: "64891242",
      message: `對方答應做女朋友了。\nNo 逃跑次數：${state.dodgeCount}\n可用 WhatsApp 聯絡：+852 64891242`,
    });
  }

  function goLetterStep() {
    burstConfetti();
    resetNoButton(false);
    notifyComplete();
    renderLetter();
    setStep(2);
  }

  function resetAll() {
    resetNoButton(true);
    setStep(1);
  }

  function bindNo() {
    const no = els.no;
    ["pointerenter", "pointerdown", "click"].forEach((type) => {
      no.addEventListener(type, moveNo, { passive: false });
    });
    no.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        moveNo(event);
      }
    });
  }

  els.yes.addEventListener("click", goLetterStep);
  els.replay.addEventListener("click", resetAll);

  bindNo();
  setStep(1);
})();
