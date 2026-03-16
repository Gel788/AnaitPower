document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ── Progress bar ── */
  const prog = document.getElementById("progress");
  const nav  = document.querySelector(".nav");
  const backTop = document.getElementById("back-top");
  const mobBar  = document.getElementById("mob-bar");

  window.addEventListener("scroll", () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    prog.style.width = pct + "%";
    nav.classList.toggle("scrolled", window.scrollY > 40);
    backTop.classList.toggle("show", window.scrollY > 400);
    mobBar.classList.toggle("show", window.scrollY > 300);
  }, { passive: true });

  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ── Burger ── */
  const burger = document.getElementById("burger");
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    nav.classList.toggle("menu-open");
  });
  document.querySelectorAll(".nav-links a").forEach(a =>
    a.addEventListener("click", () => { burger.classList.remove("open"); nav.classList.remove("menu-open"); })
  );

  /* ── Active nav ── */
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-links a");
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting)
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { threshold: 0.35 }).observe && sections.forEach(s => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting)
          links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
      });
    }, { threshold: 0.4 }).observe(s);
  });

  /* ── Toast ── */
  const toastEl  = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-msg");
  function toast(msg) {
    toastMsg.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 4500);
  }

  /* ── Modals ── */
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add("open"); document.body.style.overflow = "hidden"; }
  }
  function closeModals() {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("open"));
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => openModal(b.dataset.open)));
  document.querySelectorAll("[data-close]").forEach(e => e.addEventListener("click", closeModals));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModals(); });

  /* ── Phone mask ── */
  document.querySelectorAll("input[type=tel]").forEach(inp => {
    inp.addEventListener("input", e => {
      let v = e.target.value.replace(/\D/g, "");
      if (v[0] === "8") v = "7" + v.slice(1);
      if (v[0] === "7") {
        let r = "+7";
        if (v.length > 1) r += " (" + v.slice(1, 4);
        if (v.length >= 4) r += ") " + v.slice(4, 7);
        if (v.length >= 7) r += "-" + v.slice(7, 9);
        if (v.length >= 9) r += "-" + v.slice(9, 11);
        e.target.value = r;
      }
    });
  });

  /* ── Forms ── */
  ["quick-form", "contact-form", "modal-form"].forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;
    const btn = form.querySelector("[type=submit]");
    const origText = btn?.textContent;
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (btn) { btn.textContent = "Отправляем..."; btn.disabled = true; btn.style.opacity = ".7"; }
      setTimeout(() => {
        if (btn) { btn.textContent = origText; btn.disabled = false; btn.style.opacity = ""; }
        form.reset();
        closeModals();
        toast("✓ Заявка отправлена! Свяжемся с вами в ближайшее время.");
      }, 1300);
    });
  });

  /* ── FAQ ── */
  document.querySelectorAll(".faq-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-btn").forEach(b => {
        b.setAttribute("aria-expanded", "false");
        b.closest(".faq-item").querySelector(".faq-body").classList.remove("open");
      });
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        btn.closest(".faq-item").querySelector(".faq-body").classList.add("open");
      }
    });
  });

  /* ── Animated counters ── */
  document.querySelectorAll("[data-count]").forEach(el => {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const target = +el.dataset.count;
      const start = performance.now();
      const dur = 1800;
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(ease * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 }).observe(el);
  });

  /* ── Reveal ── */
  const revEls = document.querySelectorAll(".reveal");
  new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("is-visible"), i * 80);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }).observe
  && revEls.forEach(el => {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("is-visible"); }
    }, { threshold: 0.12 }).observe(el);
  });

  /* ── Chat ── */
  const chatFab  = document.getElementById("chat-fab");
  const chatWin  = document.getElementById("chat-win");
  const chatBody = document.getElementById("chat-body");
  const chatIn   = document.getElementById("chat-in");
  const chatSend = document.getElementById("chat-send");
  const chatQuick = document.getElementById("chat-quick");
  const iconChat  = chatFab.querySelector(".icon-chat");
  const iconClose = chatFab.querySelector(".icon-close");

  const REPLIES = {
    "сколько стоит шенген?": "Наши услуги от 3 500 ₽ + консульский сбор. Оставьте заявку — рассчитаем точно! 📋",
    "как быстро оформите?":  "3–10 рабочих дней в стандартном режиме. Есть и срочные варианты ✈️",
    "какие нужны документы?": "Загранпаспорт, анкета, фото, брони, страховка. Полный список — на консультации 📂",
  };

  function addMsg(text, who) {
    const d = document.createElement("div");
    d.className = "chat-msg " + who;
    const now = new Date().toLocaleTimeString("ru", { hour:"2-digit", minute:"2-digit" });
    d.innerHTML = `<div class="chat-bubble-msg">${text}</div><span class="chat-time">${now}</span>`;
    chatBody.appendChild(d);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function botReply(key) {
    const t = document.createElement("div");
    t.className = "chat-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    chatBody.appendChild(t);
    chatBody.scrollTop = chatBody.scrollHeight;
    const reply = REPLIES[key.toLowerCase().trim()] || "Спасибо! Специалист свяжется с вами. Или звоните: <strong>+7 (999) 000-00-00</strong> 📞";
    setTimeout(() => {
      t.remove();
      addMsg(reply, "bot");
      if (chatQuick) chatQuick.style.display = "none";
    }, 1100);
  }

  chatFab.addEventListener("click", () => {
    const open = chatWin.classList.toggle("open");
    iconChat.style.display  = open ? "none" : "";
    iconClose.style.display = open ? "" : "none";
    if (open) setTimeout(() => chatIn.focus(), 300);
  });

  function send() {
    const txt = chatIn.value.trim();
    if (!txt) return;
    addMsg(txt, "user");
    chatIn.value = "";
    botReply(txt);
  }
  chatSend.addEventListener("click", send);
  chatIn.addEventListener("keydown", e => { if (e.key === "Enter") send(); });
  chatQuick?.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => { addMsg(b.textContent, "user"); botReply(b.textContent); });
  });
});
