/* ── SPLASH ── runs after DOM ready ── */
window.addEventListener("load", function () {
  const splash = document.getElementById("splash");
  const line   = document.getElementById("splash-line");
  if (!splash) return;

  // animate progress line via CSS width
  let pct = 0;
  const interval = setInterval(function () {
    pct += 2.5;
    if (pct >= 100) pct = 100;
    if (line) line.style.width = pct + "%";
    if (pct >= 100) {
      clearInterval(interval);
      setTimeout(function () {
        splash.classList.add("out");
        setTimeout(function () {
          splash.style.display = "none";
          document.body.style.overflow = "";
        }, 700);
      }, 300);
    }
  }, 55); // 55ms × 40 steps ≈ 2.2s

  // lock scroll while splash is showing
  document.body.style.overflow = "hidden";
});

document.addEventListener("DOMContentLoaded", () => {
  /* ── YEAR ── */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ── PROGRESS BAR ── */
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

  /* ── ANNOUNCE CLOSE ── */
  document.getElementById("announce-close")?.addEventListener("click", () => {
    document.getElementById("announce").style.display = "none";
  });

  /* ── BURGER ── */
  const burger = document.getElementById("burger");
  burger?.addEventListener("click", () => {
    burger.classList.toggle("open");
    nav.classList.toggle("menu-open");
  });
  document.querySelectorAll(".nav-links a").forEach(a =>
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      nav.classList.remove("menu-open");
    })
  );

  /* ── ACTIVE NAV ── */
  document.querySelectorAll("section[id]").forEach(s => {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting)
        document.querySelectorAll(".nav-links a").forEach(l =>
          l.classList.toggle("active", l.getAttribute("href") === "#" + s.id)
        );
    }, { threshold: 0.4 }).observe(s);
  });

  /* ── TOAST ── */
  const toastEl = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-msg");
  function toast(msg) {
    toastMsg.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 4500);
  }

  /* ── MODALS ── */
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

  /* ── PHONE MASK ── */
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

  /* ── TELEGRAM BOT ── */
  const TG_TOKEN   = "8766470726:AAGbARAr1FV6MYt8c_cBqbidHR3-TkmjRfQ";
  const TG_CHAT_ID = "5191164852";

  function sendToTelegram(data) {
    const lines = ["🛂 <b>Новая заявка — Anait Visa</b>\n"];
    for (const [key, val] of Object.entries(data)) {
      if (val) lines.push(`<b>${key}:</b> ${val}`);
    }
    const text = lines.join("\n");
    return fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: "HTML" })
    });
  }

  function collectForm(form) {
    const fd = new FormData(form);
    const data = {};
    // labels
    const labels = {
      name: "Имя",
      phone: "Телефон",
      country: "Страна",
      purpose: "Цель",
      type: "Тип визы",
      date: "Дата вылета",
      persons: "Человек",
      msg: "Сообщение",
      message: "Сообщение",
    };
    for (const [k, v] of fd.entries()) {
      if (v && v.toString().trim()) {
        data[labels[k] || k] = v.toString().trim();
      }
    }
    // добавляем источник
    data["Источник"] = form.id;
    return data;
  }

  /* ── FORMS ── */
  ["quick-form", "contact-form", "modal-form"].forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;
    const btn = form.querySelector("[type=submit]");
    const orig = btn?.textContent;

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (btn) { btn.textContent = "Отправляем..."; btn.disabled = true; btn.style.opacity = ".7"; }

      try {
        await sendToTelegram(collectForm(form));
      } catch (err) {
        console.warn("Telegram send error:", err);
      }

      if (btn) { btn.textContent = orig; btn.disabled = false; btn.style.opacity = ""; }
      form.reset();
      closeModals();
      toast("✓ Заявка отправлена! Свяжемся в ближайшее время.");
    });
  });

  /* ── CHECKER TABS ── */
  document.querySelectorAll(".ctab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".ctab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".ctab-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("tab-" + tab.dataset.tab)?.classList.add("active");
    });
  });

  /* ── VISA CHECKER ── */
  const visaData = {
    russia: {
      "schengen-italy":   { need: true,  type: "Шенгенская виза (C)", fee: "80 €", days: "15–45 дней", info: "Туристическая или деловая виза. Необходимы финансовые гарантии." },
      "schengen-france":  { need: true,  type: "Шенгенская виза (C)", fee: "80 €", days: "15–45 дней", info: "Оформляется через визовый центр VFS/TLS." },
      "schengen-germany": { need: true,  type: "Шенгенская виза (C)", fee: "80 €", days: "15–45 дней", info: "Записаться через официальный сайт консульства." },
      "schengen-spain":   { need: true,  type: "Шенгенская виза (C)", fee: "80 €", days: "15–45 дней", info: "Документы подаются через визовый центр BLS." },
      "schengen-greece":  { need: true,  type: "Шенгенская виза (C)", fee: "80 €", days: "10–30 дней", info: "Греция — одна из наиболее лояльных стран Шенгена." },
      "usa":              { need: true,  type: "Неиммиграционная виза B1/B2", fee: "185 $", days: "30–90 дней", info: "Требуется собеседование в посольстве. Наш специалист подготовит вас." },
      "uk":               { need: true,  type: "Standard Visitor Visa", fee: "115 £", days: "15–30 дней", info: "Подаётся онлайн через GOV.UK, биометрия в визовом центре." },
      "uae":              { need: false, type: "Виза не нужна / электронная", fee: "0 – 30 $", days: "3–5 дней", info: "Граждане РФ получают визу по прилёту или через авиакомпанию." },
      "japan":            { need: true,  type: "Краткосрочная виза", fee: "0 ₽",   days: "10–15 дней", info: "Консульский сбор отсутствует, только услуги визового центра." },
      "thailand":         { need: false, type: "Безвизовый въезд 30 дней",        fee: "0", days: "Сразу",        info: "До 30 дней — без визы. Можно продлить ещё на 30 дней на месте." },
      "turkey":           { need: false, type: "Безвизовый въезд 90 дней",        fee: "0", days: "Сразу",        info: "Граждане России въезжают без визы до 90 дней в течение 180." },
      "singapore":        { need: true,  type: "Электронная виза",                fee: "30 $", days: "3–7 дней",   info: "Подаётся онлайн через ICA Singapore или агентство." },
    }
  };
  visaData.belarus  = visaData.russia;
  visaData.kazakhstan = visaData.russia;
  visaData.ukraine  = visaData.russia;
  visaData.armenia  = visaData.russia;
  visaData.georgia  = visaData.russia;
  visaData.uzbekistan = visaData.russia;

  document.getElementById("btn-check")?.addEventListener("click", () => {
    const passport = document.getElementById("passport-select").value;
    const dest     = document.getElementById("dest-select").value;
    const res      = document.getElementById("check-result");
    if (!passport || !dest) { alert("Выберите гражданство и страну назначения"); return; }
    const data = visaData[passport]?.[dest];
    res.hidden = false;
    if (!data) {
      res.className = "check-result cr-unknown";
      res.innerHTML = `<h4>⚠️ Уточните у специалиста</h4><p>Для этого сочетания нет точных данных. Свяжитесь с нами — ответим за 10 минут.</p>`;
      return;
    }
    if (data.need) {
      res.className = "check-result cr-need";
      res.innerHTML = `<h4>🛂 Виза необходима</h4><p><strong>Тип:</strong> ${data.type}</p><p><strong>Консульский сбор:</strong> ${data.fee}</p><p><strong>Срок рассмотрения:</strong> ${data.days}</p><p style="margin-top:8px">${data.info}</p><button class="btn-check" data-open="modal" style="margin-top:12px;font-size:13px;padding:10px">Оформить с нами →</button>`;
      res.querySelector("[data-open]")?.addEventListener("click", () => openModal("modal"));
    } else {
      res.className = "check-result cr-free";
      res.innerHTML = `<h4>✅ ${data.type}</h4><p>${data.info}</p><p style="margin-top:4px"><strong>Сбор:</strong> ${data.fee}</p>`;
    }
  });

  /* ── TRACKER (hero) ── */
  const trackStatuses = {
    "AV-2024-001": { status: "✅ Виза одобрена!", color: "#166534", bg: "#f0fdf4", border: "#bbf7d0", step: 4, text: "Паспорт готов к получению. Документы переданы клиенту." },
    "AV-2024-002": { status: "⏳ На рассмотрении", color: "#92400e", bg: "#fffbeb", border: "#fde68a", step: 3, text: "Документы переданы в консульство. Ожидаем решения 3–5 дней." },
    "AV-2024-003": { status: "📋 Подготовка документов", color: "#1e3a8a", bg: "#eff6ff", border: "#bfdbfe", step: 2, text: "Специалист готовит пакет документов для подачи." },
  };
  document.getElementById("btn-track")?.addEventListener("click", () => {
    const val = document.getElementById("track-input").value.toUpperCase().trim();
    const res = document.getElementById("track-result");
    const d = trackStatuses[val];
    res.hidden = false;
    if (!d) {
      res.style.background = "#fef2f2"; res.style.border = "1px solid #fecaca"; res.style.color = "#991b1b";
      res.innerHTML = "<strong>Заявка не найдена.</strong> Проверьте номер или обратитесь к специалисту.";
      return;
    }
    res.style.background = d.bg; res.style.border = `1px solid ${d.border}`; res.style.color = d.color;
    res.innerHTML = `<strong>${d.status}</strong><p style="margin-top:5px;font-size:13px">${d.text}</p>`;
  });

  /* ── CALCULATOR ── */
  const PRICES = { tourist: 3500, business: 5500, student: 4500 };
  const URGENCY = { standard: 1, express: 1.5, urgent: 2 };

  function updateCalc() {
    const type    = document.querySelector("[name=vtype]:checked")?.value || "tourist";
    const urgency = document.querySelector("[name=vurgency]:checked")?.value || "standard";
    const persons = parseInt(document.getElementById("persons-range")?.value || 1);
    const price   = Math.round(PRICES[type] * URGENCY[urgency] * persons);
    document.getElementById("persons-val").textContent = persons;
    document.getElementById("calc-price").textContent  = price.toLocaleString("ru") + " ₽";
  }
  document.querySelectorAll("[name=vtype],[name=vurgency]").forEach(r => r.addEventListener("change", updateCalc));
  document.getElementById("persons-range")?.addEventListener("input", updateCalc);
  updateCalc();

  /* ── CHECKLIST ── */
  const DOCS = {
    schengen: {
      tourism:  ["Загранпаспорт (срок действия +3 мес.)", "Анкета Шенген (2 экз.)", "Цветное фото 3.5×4.5 (2 шт.)", "Бронь отеля", "Авиабилеты туда-обратно", "Страховка (от 30 000 €)", "Выписка со счёта (от 1 000 €)", "Копия трудовой / справка с работы"],
      business: ["Загранпаспорт", "Анкета Шенген", "Фото 3.5×4.5 (2 шт.)", "Приглашение от компании", "Страховка", "Выписка со счёта", "Командировочное удостоверение", "Регистрация компании-работодателя"],
      study:    ["Загранпаспорт", "Анкета Шенген", "Фото", "Письмо из учебного заведения", "Страховка", "Финансовые гарантии / стипендия", "Диплом или аттестат", "Мотивационное письмо"],
      family:   ["Загранпаспорт", "Анкета Шенген", "Фото", "Приглашение от родственника", "Документы о родстве", "Страховка", "Выписка со счёта"],
    },
    usa: {
      tourism:  ["Загранпаспорт (срок +6 мес.)", "Заполненная DS-160", "Фото 5×5 см", "Подтверждение оплаты сбора", "Запись на собеседование", "Финансовые документы", "Доказательство привязанности к стране (жильё, работа)", "Авиабилеты / маршрут"],
      business: ["Загранпаспорт", "DS-160", "Приглашение от американской компании", "Фото", "Оплата сбора", "Финансовые документы", "Деловая переписка"],
      study:    ["Загранпаспорт", "DS-160", "Форма I-20 от учебного заведения", "SEVIS I-901", "Финансовые гарантии", "TOEFL/IELTS", "Диплом"],
      family:   ["Загранпаспорт", "DS-160", "Приглашение (форма I-130 или письмо)", "Документы о родстве", "Финансовые документы"],
    },
    uk: {
      tourism:  ["Загранпаспорт", "Форма VAF1A", "Фото 45×35 мм", "Выписка со счёта (3 мес.)", "Бронь жилья", "Авиабилеты", "Подтверждение занятости", "Страховка (рекомендуется)"],
      business: ["Загранпаспорт", "Форма VAF1A", "Приглашение от UK-компании", "Финансовые документы", "Регистрация компании", "Маршрут поездки"],
      study:    ["Загранпаспорт", "CAS (Confirmation of Acceptance)", "Финансовые гарантии", "Сертификат английского языка", "Оплата NHS surcharge"],
      family:   ["Загранпаспорт", "Приглашение от резидента Великобритании", "Документы о родстве", "Финансовые документы принимающей стороны"],
    },
    uae: {
      tourism:  ["Загранпаспорт (срок +6 мес.)", "Фото 4×6 см белый фон", "Бронь отеля или приглашение", "Авиабилеты", "Заявка онлайн или через авиакомпанию"],
      business: ["Загранпаспорт", "Фото", "Приглашение от UAE-компании", "Справка с места работы", "Выписка со счёта"],
      study:    ["Загранпаспорт", "Фото", "Письмо из учебного заведения", "Финансовые документы"],
      family:   ["Загранпаспорт", "Фото", "Приглашение от резидента ОАЭ", "Документы о родстве"],
    },
    japan: {
      tourism:  ["Загранпаспорт (срок +6 мес.)", "Анкета на визу", "Фото 4.5×4.5 см белый фон", "Маршрут поездки", "Бронь отеля", "Авиабилеты", "Выписка со счёта (от 300 000 ₽)", "Справка с работы"],
      business: ["Загранпаспорт", "Анкета", "Фото", "Приглашение от японской компании", "Маршрут поездки", "Выписка со счёта", "Документы компании"],
      study:    ["Загранпаспорт", "Анкета", "Фото", "Письмо из японского учебного заведения", "Финансовые гарантии"],
      family:   ["Загранпаспорт", "Анкета", "Фото", "Приглашение", "Документы о родстве"],
    },
  };

  document.getElementById("btn-checklist")?.addEventListener("click", () => {
    const country = document.getElementById("cl-country").value;
    const purpose = document.getElementById("cl-purpose").value;
    const res = document.getElementById("checklist-result");
    if (!country || !purpose) { alert("Выберите страну и цель поездки"); return; }
    const docs = DOCS[country]?.[purpose];
    res.hidden = false;
    if (!docs) { res.innerHTML = "<p>Данные для этой комбинации уточните у специалиста.</p>"; return; }
    res.innerHTML = docs.map((d, i) =>
      `<div class="cl-item"><span class="${i < 2 ? "cl-req" : "cl-check"}">${i < 2 ? "⚠" : "✓"}</span><span>${d}</span></div>`
    ).join("");
  });

  /* ── TOOLS TRACKER ── */
  document.getElementById("btn-tracker")?.addEventListener("click", () => {
    const val = document.getElementById("tracker-input").value.toUpperCase().trim();
    const res = document.getElementById("tracker-result");
    const d = trackStatuses[val];
    res.hidden = false;
    if (!d) {
      res.style.background = "#fef2f2"; res.style.border = "1px solid #fecaca"; res.style.color = "#991b1b";
      res.innerHTML = "<strong>Заявка не найдена.</strong> Проверьте номер.";
      return;
    }
    const steps = ["Заявка принята", "Подготовка документов", "Подача в консульство", "Виза готова"];
    res.style.background = d.bg; res.style.border = `1px solid ${d.border}`; res.style.color = d.color;
    res.innerHTML = `<strong style="font-size:15px">${d.status}</strong><p style="margin:6px 0 12px;font-size:13px">${d.text}</p>` +
      `<div class="tr-steps">` +
      steps.map((s, i) => {
        const cls = i < d.step ? "tr-dot-done" : i === d.step - 1 ? "tr-dot-active" : "tr-dot-wait";
        const icon = i < d.step ? "✓" : i + 1;
        return `<div class="tr-step"><div class="tr-dot ${cls}">${icon}</div><span style="${i < d.step ? "color:var(--tx)" : "color:var(--sft)"}">${s}</span></div>`;
      }).join("") + `</div>`;
  });

  /* ── COUNTRIES ── */
  const countryInfo = {
    italy:      { name: "🇮🇹 Италия",       type: "Шенгенская виза (C)", fee: "80 €", days: "15–45 дней", tips: "Подаётся через VFS Global. Рекомендуем подавать за 45+ дней до поездки." },
    france:     { name: "🇫🇷 Франция",      type: "Шенгенская виза (C)", fee: "80 €", days: "15–45 дней", tips: "Оформляется через TLS Contact. Запись через официальный сайт." },
    germany:    { name: "🇩🇪 Германия",     type: "Шенгенская виза (C)", fee: "80 €", days: "15–45 дней", tips: "Подача через консульство или визовый центр VFS." },
    spain:      { name: "🇪🇸 Испания",      type: "Шенгенская виза (C)", fee: "80 €", days: "15–45 дней", tips: "Испания активно выдаёт мультивизы при наличии истории поездок." },
    greece:     { name: "🇬🇷 Греция",       type: "Шенгенская виза (C)", fee: "80 €", days: "10–30 дней", tips: "Одна из самых лояльных стран Шенгена. Высокий процент одобрений." },
    usa:        { name: "🇺🇸 США",          type: "Виза B1/B2",           fee: "185 $", days: "30–90 дней", tips: "Необходимо собеседование в посольстве. Мы подготовим вас к интервью." },
    uk:         { name: "🇬🇧 Великобритания", type: "Standard Visitor", fee: "115 £", days: "15–30 дней", tips: "Оформляется онлайн через GOV.UK. Биометрия в визовом центре." },
    uae:        { name: "🇦🇪 ОАЭ",          type: "Виза по прилёту / эл.", fee: "0–30 $", days: "3–5 дней", tips: "Граждане РФ получают визу по прилёту или через авиакомпанию бесплатно." },
    japan:      { name: "🇯🇵 Япония",       type: "Краткосрочная виза", fee: "Бесплатно", days: "10–15 дней", tips: "Консульский сбор отсутствует. Требуется развёрнутый маршрут поездки." },
    singapore:  { name: "🇸🇬 Сингапур",    type: "Электронная виза",   fee: "30 $",    days: "3–7 дней",  tips: "Подаётся онлайн через ICA или агентство." },
    canada:     { name: "🇨🇦 Канада",       type: "Виза TRV",           fee: "100 $",   days: "30–60 дней", tips: "Оформляется через канадское консульство или онлайн на IRCC." },
  };

  document.querySelectorAll(".ctry[data-country]").forEach(el => {
    el.addEventListener("click", () => {
      const key = el.dataset.country;
      const info = countryInfo[key];
      if (!info) return;
      const popup = document.getElementById("ctry-popup");
      document.getElementById("cp-content").innerHTML =
        `<h3 style="font-size:20px;margin-bottom:12px">${info.name}</h3>
         <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
           <div style="background:#f4f7fc;border-radius:10px;padding:12px"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#8aa0bb;margin-bottom:3px">Тип визы</div><strong style="font-size:14px">${info.type}</strong></div>
           <div style="background:#f4f7fc;border-radius:10px;padding:12px"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#8aa0bb;margin-bottom:3px">Консульский сбор</div><strong style="font-size:14px">${info.fee}</strong></div>
           <div style="background:#f4f7fc;border-radius:10px;padding:12px"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#8aa0bb;margin-bottom:3px">Срок рассмотрения</div><strong style="font-size:14px">${info.days}</strong></div>
           <div style="background:#eef2ff;border-radius:10px;padding:12px;border:1px solid rgba(37,99,255,.15)"><div style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#8aa0bb;margin-bottom:3px">Наши услуги</div><strong style="font-size:14px;color:#1d4ed8">от 3 500 ₽</strong></div>
         </div>
         <p style="font-size:13px;color:#4b6280;line-height:1.65;margin-bottom:14px">${info.tips}</p>
         <button class="btn-cta btn-full" data-open="modal" style="font-size:14px;padding:12px">Оформить визу в ${info.name.replace(/^.{2} /, "")} →</button>`;
      popup.hidden = false;
      popup.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => openModal(b.dataset.open)));
    });
  });
  document.getElementById("cp-close")?.addEventListener("click", () => {
    document.getElementById("ctry-popup").hidden = true;
  });

  /* ── FAQ ── */
  document.querySelectorAll(".faq-q").forEach(btn => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-q").forEach(b => {
        b.setAttribute("aria-expanded", "false");
        b.closest(".faq-item").querySelector(".faq-a").classList.remove("open");
      });
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        btn.closest(".faq-item").querySelector(".faq-a").classList.add("open");
      }
    });
  });

  /* ── COUNTERS ── */
  document.querySelectorAll("[data-count]").forEach(el => {
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const target = +el.dataset.count;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / 1800, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(ease * target);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 }).observe(el);
  });

  /* ── REVEAL ── */
  const revEls = document.querySelectorAll(".reveal");
  revEls.forEach(el => {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.classList.add("is-visible");
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }).observe(el);
  });

  /* ── CHAT ── */
  const fab   = document.getElementById("chat-fab");
  const win   = document.getElementById("chat-win");
  const body  = document.getElementById("cw-body");
  const inp   = document.getElementById("cw-in");
  const send  = document.getElementById("cw-send");
  const quick = document.getElementById("cw-quick");
  const icChat  = fab?.querySelector(".ic-chat");
  const icClose = fab?.querySelector(".ic-close");

  const REPLIES = {
    "сколько стоит шенген?": "Наши услуги от 3 500 ₽ + консульский сбор (~80 €). Для точной цены воспользуйтесь <a href='#tools'>калькулятором</a> или оставьте заявку 📋",
    "как быстро оформите?":  "3–10 рабочих дней в стандартном режиме. Экспресс — 5–7 дней, срочно — 2–3 дня ✈️",
    "какие документы нужны?": "Воспользуйтесь нашим <a href='#tools'>генератором чеклиста</a> — за 10 секунд получите персональный список по вашей стране и цели 📂",
  };

  function addMsg(text, who) {
    const d = document.createElement("div");
    d.className = "cw-msg " + who;
    const now = new Date().toLocaleTimeString("ru", { hour:"2-digit", minute:"2-digit" });
    d.innerHTML = `<div class="cw-bubble">${text}</div><span class="cw-time">${now}</span>`;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function botReply(key) {
    const t = document.createElement("div");
    t.className = "cw-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(t); body.scrollTop = body.scrollHeight;
    const reply = REPLIES[key.toLowerCase().trim()] || "Отличный вопрос! Специалист ответит вам в течение 10 минут. Или позвоните: <strong>+7 (999) 000-00-00</strong> 📞";
    setTimeout(() => { t.remove(); addMsg(reply, "bot"); if (quick) quick.style.display = "none"; }, 1100);
  }
  fab?.addEventListener("click", () => {
    const open = win.classList.toggle("open");
    icChat.style.display  = open ? "none" : "";
    icClose.style.display = open ? "" : "none";
    if (open) setTimeout(() => inp.focus(), 300);
  });
  function sendChat() {
    const txt = inp.value.trim(); if (!txt) return;
    addMsg(txt, "user"); inp.value = ""; botReply(txt);
  }
  send?.addEventListener("click", sendChat);
  inp?.addEventListener("keydown", e => { if (e.key === "Enter") sendChat(); });
  quick?.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { addMsg(b.textContent, "user"); botReply(b.textContent); }));
});
