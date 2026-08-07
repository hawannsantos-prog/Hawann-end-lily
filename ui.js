/* ============================================================
   Dermovita — interações da interface (sem dependências).
   Roda sempre, mesmo que o WebGL/CDN do Three.js não carregue.
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Navegação com fundo ao rolar ───────────────────────── */
  var nav = document.getElementById("nav");
  function onScroll() {
    nav.classList.toggle("is-stuck", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Revelação ao entrar na viewport ────────────────────── */
  var revealables = document.querySelectorAll(
    ".section__head, .card, .hero__copy, .cta__inner, .footer__inner"
  );
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) return;
          var delay = Math.min(i, 4) * 70;
          setTimeout(function () {
            entry.target.classList.add("is-in");
          }, delay);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    revealables.forEach(function (el) {
      // Cartões com cena 3D não recebem fade: o canvas é desenhado por
      // cima e não acompanharia a opacidade do elemento.
      if (el.querySelector(".view")) return;
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* ── Inclinação 3D dos cartões ao passar o mouse ────────── */
  var MAX_TILT = 7; // graus
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var raf = 0;
      var target = { x: 0, y: 0, lift: 0 };
      var current = { x: 0, y: 0, lift: 0 };

      function loop() {
        var done = true;
        ["x", "y", "lift"].forEach(function (k) {
          current[k] += (target[k] - current[k]) * 0.14;
          if (Math.abs(target[k] - current[k]) > 0.01) done = false;
        });
        card.style.transform =
          "perspective(1000px) rotateX(" + current.x.toFixed(2) + "deg)" +
          " rotateY(" + current.y.toFixed(2) + "deg)" +
          " translateY(" + (-current.lift).toFixed(2) + "px)";
        raf = done ? 0 : requestAnimationFrame(loop);
      }
      function kick() { if (!raf) raf = requestAnimationFrame(loop); }

      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        target.x = -py * MAX_TILT * 2;
        target.y = px * MAX_TILT * 2;
        target.lift = 6;
        kick();
      });
      card.addEventListener("pointerleave", function () {
        target.x = target.y = target.lift = 0;
        kick();
      });
    });
  }

  /* ── Sacola + aviso ─────────────────────────────────────── */
  var cart = document.getElementById("cart");
  var count = document.getElementById("cart-count");
  var toast = document.getElementById("toast");
  var items = 0;
  var toastTimer = 0;

  function notify(msg) {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-on");
    }, 2600);
  }

  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      items += 1;
      count.textContent = String(items);
      cart.classList.remove("is-bumped");
      void cart.offsetWidth; // reinicia a animação
      cart.classList.add("is-bumped");

      btn.classList.add("is-added");
      btn.textContent = "✓";
      setTimeout(function () {
        btn.classList.remove("is-added");
        btn.textContent = "+";
      }, 1200);

      notify(btn.dataset.add + " adicionado à sacola");
    });
  });

  cart.addEventListener("click", function () {
    notify(
      items === 0
        ? "Sua sacola ainda está vazia"
        : items + (items === 1 ? " item na sacola" : " itens na sacola") +
            " — finalize pelo WhatsApp"
    );
  });

  /* ── Detecção de WebGL / falha no carregamento do 3D ────── */
  function hasWebGL() {
    try {
      var c = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (c.getContext("webgl2") || c.getContext("webgl"))
      );
    } catch (e) {
      return false;
    }
  }

  if (!hasWebGL()) {
    document.body.classList.add("no-webgl");
  } else {
    // Se o módulo 3D não sinalizar em alguns segundos (CDN bloqueada,
    // rede offline), cai para o layout sem WebGL.
    setTimeout(function () {
      if (!window.__dermovita3d) document.body.classList.add("no-webgl");
    }, 8000);
  }
})();
