// ---------- مساعدة: تحويلات وحدات ----------
  const deg2rad = d => d * Math.PI / 180;
  const rad2deg = r => r * 180 / Math.PI;

  // ---------- تحويل تاريخ إلى Julian Date ----------
  function dateToJD(dateObj) {
    // dateObj is a JS Date (UTC)
    // formula using Unix epoch
    return dateObj.getTime()/86400000 + 2440587.5;
  }

  // ---------- حل معادلة كبلر (Newton-Raphson) ----------
  // M, e in radians. Returns E in radians.
  function solveKepler(M, e, tol = 1e-8, maxIter = 50) {
    // ensure M in -pi..pi for better convergence
    let Mwrap = ((M + Math.PI) % (2*Math.PI)) - Math.PI;
    let E = (e < 0.8) ? Mwrap : Math.PI; // initial guess
    for (let iter = 0; iter < maxIter; iter++) {
      let f = E - e * Math.sin(E) - Mwrap;
      let fprime = 1 - e * Math.cos(E);
      let dE = f / fprime;
      E = E - dE;
      if (Math.abs(dE) < tol) {
        return E;
      }
    }
    // if not converged, return last E
    return E;
  }

  // ---------- من E نحسب x', y' في مستوى المدار ----------
  // a in AU, e, E in radians
  function orbitalPlaneCoords(a, e, E) {
    // r (distance from focus)
    const cosE = Math.cos(E);
    const sinE = Math.sin(E);
    const r = a * (1 - e * cosE);
    const xprime = a * (cosE - e); // along perihelion direction
    const yprime = a * Math.sqrt(Math.max(0, 1 - e*e)) * sinE;
    return { r, xprime, yprime };
  }

  // ---------- تحويل من (x',y',0) إلى (xecl, yecl, zecl) حسب ω, Ω, i ----------
  // all angles in radians
  function toEcliptic(xp, yp, omega, Omega, i) {
    // Using rotation: r_ecl = Rz(-Omega) Rx(-i) Rz(-omega) r'
    // combine to formulas (from book)
    const cosw = Math.cos(omega), sinw = Math.sin(omega);
    const cosO = Math.cos(Omega), sinO = Math.sin(Omega);
    const cosI = Math.cos(i), sinI = Math.sin(i);

    const xecl = (cosw * cosO - sinw * sinO * cosI) * xp +
                 (-sinw * cosO - cosw * sinO * cosI) * yp;

    const yecl = (cosw * sinO + sinw * cosO * cosI) * xp +
                 (-sinw * sinO + cosw * cosO * cosI) * yp;

    const zecl = (sinw * sinI) * xp + (cosw * sinI) * yp;

    return { xecl, yecl, zecl };
  }

  // ---------- حساب M = L - varpi (بدرجات) ثم تحويل إلى radians ----------
  function computeMeanAnomaly(L_deg, varpi_deg) {
    let Mdeg = L_deg - varpi_deg;
    // normalize to 0..360
    Mdeg = ((Mdeg % 360) + 360) % 360;
    // convert to radians and map to -pi..pi for solver
    return deg2rad(Mdeg);
  }

  // ---------- الحدث الرئيسي: حساب E -> (x,y) -> (X,Y,Z) ----------
  document.getElementById('nowBtn').addEventListener('click', () => {
    const today = new Date();
    const iso = today.toISOString().slice(0,10);
    document.getElementById('date').value = iso;
  });

  document.getElementById('compute').addEventListener('click', () => {
    // اقرأ المُدخلات
    const a = parseFloat(document.getElementById('a').value); // AU
    const e = parseFloat(document.getElementById('e').value);
    const i_deg = parseFloat(document.getElementById('i').value);
    const Omega_deg = parseFloat(document.getElementById('Omega').value);
    const varpi_deg = parseFloat(document.getElementById('varpi').value);
    const L_deg = parseFloat(document.getElementById('L').value);

    // اختر التاريخ
    let dateInput = document.getElementById('date').value;
    let dateObj = dateInput ? new Date(dateInput + 'T00:00:00Z') : new Date(); // UTC midnight or now
    const JD = dateToJD(dateObj);
    const T = (JD - 2451545.0) / 36525.0; // centuries since J2000

    // compute M (rad)
    const M = computeMeanAnomaly(L_deg, varpi_deg); // radians

    // solve Kepler
    const E = solveKepler(M, e);

    // orbital plane coords
    const { r, xprime, yprime } = orbitalPlaneCoords(a, e, E);

    // compute omega = varpi - Omega (deg->rad)
    const omega_deg = varpi_deg - Omega_deg;
    const omega = deg2rad(omega_deg);
    const Omega = deg2rad(Omega_deg);
    const i = deg2rad(i_deg);

    const { xecl, yecl, zecl } = toEcliptic(xprime, yprime, omega, Omega, i);

    // output
    const out = {
      dateUTC: dateObj.toISOString(),
      JD,
      T_centuries: T,
      elements: { a, e, i_deg, Omega_deg, varpi_deg, L_deg },
      computed: {
        M_rad: M, M_deg: rad2deg(M),
        E_rad: E, E_deg: rad2deg(E),
        r_AU: r,
        xprime_AU: xprime,
        yprime_AU: yprime,
        xecl_AU: xecl,
        yecl_AU: yecl,
        zecl_AU: zecl
      }
    };

    document.getElementById('result').textContent = JSON.stringify(out, null, 2);
  });