// Medidor de la regla 9 (CLAUDE.md): recorre las diapositivas clic por clic y mide, sobre el lienzo de 1920 × 1080,
// el tamaño de todo texto visible, lo que se sale del cuerpo y los renglones encimados.
//
// Uso: con `npm run dev` corriendo, abrir en el navegador una página del mismo servidor que no sea la exposición
// (por ejemplo http://localhost:5180/README.md, para que el HMR no la recargue) y pegar este archivo en la consola.
// Cambiar DESDE y HASTA para medir solo unas diapositivas. Al terminar deja el resultado en `window.legibilidad`
// (un renglón por diapositiva y clic) y lo imprime con console.table; `window.legibilidadDetalle` trae cada texto.
//
// Por qué un iframe: si el panel del navegador está oculto, el navegador no pinta cuadros y motion deja todo a
// medio animar (opacidad 0). En el iframe se sustituye requestAnimationFrame por temporizadores, se quita
// Element.prototype.animate (motion cae a sus animaciones en JS) y se activa skipAnimations.
//
// Clasificación de cada texto:
// - "lectura": texto HTML que no es monoespaciado, ni `.label`, ni fórmula, ni del encabezado, ni está dentro de un
//   elemento con `data-rotulo` (así se marcan los datos de una tabla o una ficha). Debe medir ≥ 26 px.
// - "rótulo": todo texto en SVG o monoespaciado (ejes, leyendas, etiquetas). Debe medir ≥ 20 px.
// - nada debe medir menos de 18 px (la pista de las escenas 3D, solo para quien expone, mide 18).
// - Las fórmulas (KaTeX) se reportan aparte: su tamaño base debe medir ≥ 28 px (los subíndices, exponentes y
//   fracciones chicas de KaTeX son menores por diseño y solo cuentan para el mínimo de 18).
// - Los umbrales llevan media unidad de tolerancia: la medición en el iframe escalado da 19.9 para un texto de 20.

(async () => {
  const DESDE = 0;
  const HASTA = 999;

  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  document.getElementById("medidor")?.remove();
  let html = await (await fetch(location.origin + "/")).text();
  const parche =
    `<base href="${location.origin}/"><script>window.requestAnimationFrame=(cb)=>setTimeout(()=>cb(performance.now()),16);` +
    `window.cancelAnimationFrame=(id)=>clearTimeout(id);history.replaceState=()=>{};delete Element.prototype.animate;<\/script>`;
  html = html.replace("<head>", "<head>" + parche);
  const f = document.createElement("iframe");
  f.id = "medidor";
  f.style.cssText = "position:fixed;left:0;top:0;width:1920px;height:1080px;border:0;transform-origin:0 0;transform:scale(0.3);z-index:9999";
  document.body.appendChild(f);
  f.srcdoc = html;
  await espera(7000);
  // El iframe puede recargarse solo (HMR completo de Vite al tocar index.ts): por eso se lee cada vez y se vuelve a
  // pedir que las animaciones sean instantáneas.
  const w = () => f.contentWindow;
  const d = () => f.contentDocument;
  const instantaneo = async () => {
    if (w().__instantaneo) return;
    const url = w().performance.getEntriesByType("resource").map((e) => e.name).find((n) => n.includes("motion_react"));
    if (!url) return;
    const motion = await w().eval(`import(${JSON.stringify(url)})`);
    motion.MotionGlobalConfig.skipAnimations = true;
    w().__instantaneo = true;
  };
  await instantaneo();

  function medir() {
    const W = w();
    const D = d();
    const stage = D.querySelector(".stage");
    const sr = stage.getBoundingClientRect();
    const s = sr.width / 1920;
    const body = D.querySelector(".slide-body");
    const br = body ? body.getBoundingClientRect() : null;
    const textos = [];
    const tw = D.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      const t = n.textContent.replace(/\s+/g, " ").trim();
      if (!t) continue;
      const el = n.parentElement;
      if (!el || el.closest(".katex-mathml, .help, .steps, style, script")) continue;
      let op = 1;
      let oculto = false;
      for (let a = el; a && a !== stage; a = a.parentElement) {
        const cs = W.getComputedStyle(a);
        if (cs.display === "none" || cs.visibility === "hidden") {
          oculto = true;
          break;
        }
        op *= parseFloat(cs.opacity);
      }
      if (oculto || op < 0.15) continue;
      const rg = D.createRange();
      rg.selectNodeContents(n);
      const r = rg.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.right < sr.left || r.left > sr.right || r.bottom < sr.top || r.top > sr.bottom) continue;
      const cs = W.getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const svg = el instanceof W.SVGElement;
      let px;
      if (svg && el.getScreenCTM) {
        const m = el.getScreenCTM();
        px = (fs * Math.hypot(m.a, m.b)) / s;
      } else {
        let k = s;
        if (el.offsetWidth) {
          const bw = el.getBoundingClientRect().width;
          if (bw > 0) k = bw / el.offsetWidth;
        }
        px = (fs * k) / s;
      }
      const formula = !!el.closest(".katex");
      const indice = formula && !!el.closest(".msupsub, .mfrac, .sizing, .mtight");
      const cab = !el.closest(".slide-body");
      const mono = /Mono/.test(cs.fontFamily) || !!el.closest(".label, [data-rotulo]");
      const tipo = formula ? "fórmula" : svg || mono || cab ? "rótulo" : "lectura";
      const fuera = !!br && !cab && (r.bottom > br.bottom + 3 || r.right > br.right + 3 || r.left < br.left - 3);
      textos.push({ t: t.slice(0, 60), px: Math.round(px * 10) / 10, tipo, indice, fuera, rs: [...rg.getClientRects()].filter((q) => q.width > 1) });
    }
    // Encimados: renglones de textos distintos que se cruzan más del 20 % del menor.
    const enc = [];
    const nk = textos.filter((x) => x.tipo !== "fórmula");
    for (let i = 0; i < nk.length; i++)
      for (let j = i + 1; j < nk.length; j++) {
        let cruce = false;
        for (const a of nk[i].rs) {
          for (const b of nk[j].rs) {
            const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
            const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
            if (ix > 2 && iy > 2 && (ix * iy) / Math.min(a.width * a.height, b.width * b.height) > 0.2) cruce = true;
          }
        }
        if (cruce) enc.push(`${nk[i].t.slice(0, 25)} ⟂ ${nk[j].t.slice(0, 25)}`);
      }
    const graficaFuera = br
      ? [...body.querySelectorAll("svg, canvas, table")].some((e) => {
          const r = e.getBoundingClientRect();
          let op = 1;
          for (let a = e; a && a !== stage; a = a.parentElement) op *= parseFloat(W.getComputedStyle(a).opacity);
          return op >= 0.15 && r.width > 30 && (r.bottom > br.bottom + 3 || r.right > br.right + 3);
        })
      : false;
    return { textos, enc, graficaFuera };
  }

  const tecla = (k) => w().dispatchEvent(new (w().KeyboardEvent)("keydown", { key: k }));
  const pos = () => {
    const num = d().querySelector(".slide-head .num em")?.textContent ?? "1";
    const on = d().querySelectorAll(".steps span.on").length;
    return `${Number(num)}/${Math.max(0, on - 1)}`;
  };
  const palabras = (xs) => xs.reduce((a, x) => a + x.t.split(" ").filter(Boolean).length, 0);

  // Para mirar una posición en captura: `await irA("3/4")` agranda el iframe a la ventana y avanza hasta ahí.
  // Con DESDE > HASTA no se mide nada y solo queda el iframe listo para `irA`.
  window.irA = async (destino) => {
    await instantaneo();
    f.style.transform = `scale(${Math.min(innerWidth / 1920, innerHeight / 1080)})`;
    const [n, k] = destino.split("/").map(Number);
    const [an, ak] = pos().split("/").map(Number);
    if (an > n || (an === n && ak > k)) {
      tecla("Home");
      await espera(400);
    }
    for (let i = 0; i < 1000 && pos() !== destino; i++) {
      tecla("ArrowRight");
      await espera(60);
    }
    await espera(900);
    return pos();
  };

  // Para medir otra vez sin recargar el iframe: `await medirOtraVez(5, 19)`.
  window.medirOtraVez = async (desde, hasta) => {
    await instantaneo();
    return recorrer(desde, hasta);
  };
  if (DESDE <= HASTA) return recorrer(DESDE, HASTA);

  async function recorrer(DESDE, HASTA) {
  window.legibilidad = undefined;
  tecla("Home");
  await espera(900);
  const resumen = [];
  const detalle = [];
  let previo = "";
  for (let i = 0; i < 1000; i++) {
    const p = pos();
    if (p === previo) break;
    previo = p;
    const num = Number(p.split("/")[0]);
    if (num > HASTA) break;
    if (num >= DESDE) {
      // Las que entrenan modelos al montarse necesitan más tiempo.
      await espera(num === 11 || num === 50 ? 3000 : 700);
      const { textos, enc, graficaFuera } = medir();
      const lectura = textos.filter((x) => x.tipo === "lectura");
      resumen.push({
        pos: p,
        "< 18": textos.filter((x) => x.px < 17.5).length,
        "rótulo < 20": textos.filter((x) => x.tipo === "rótulo" && x.px < 19.5).length,
        "lectura < 26": lectura.filter((x) => x.px < 25.5).length,
        "fórmula < 28": textos.filter((x) => x.tipo === "fórmula" && !x.indice && x.px < 27.5).length,
        "palabras de lectura": palabras(lectura),
        "se sale": textos.some((x) => x.fuera) || graficaFuera ? "sí" : "",
        encimados: enc.length,
        mínimo: Math.min(...textos.map((x) => x.px)),
      });
      detalle.push({ pos: p, textos: textos.map(({ rs, ...x }) => x), enc });
    }
    tecla("ArrowRight");
    await espera(150);
  }
  window.legibilidad = resumen;
  window.legibilidadDetalle = detalle;
  console.table(resumen);
  return resumen;
  }
})();
