const API = process.env.API_URL ?? "http://localhost:9014";
let fails = 0;
function check(name: string, ok: boolean, extra = "") { console.log(`${ok ? "OK  " : "FAIL"} ${name} ${extra}`); if (!ok) fails++; }
const H = { "Content-Type": "application/json", "X-App-Version": "0.1.0" };

async function main() {
  const h = await fetch(`${API}/api/v1/health`); const hj = await h.json();
  check("health", h.status === 200 && hj.ok === true && hj.apiVersion === 1, JSON.stringify(hj));

  const email = `smoke-${Date.now()}@delsur.test`;
  const l = await fetch(`${API}/api/v1/auth/dev-login`, { method: "POST", headers: H, body: JSON.stringify({ email, name: "Smoke" }) });
  const lj = await l.json(); const token = lj.token as string;
  check("dev-login", l.status === 200 && !!token && lj.user?.email === email);
  const A = { ...H, Authorization: `Bearer ${token}` };

  const r1 = await fetch(`${API}/api/v1/registros`, { method: "POST", headers: A, body: JSON.stringify({ tipo: "jugador", cargaPara: "yo", nombre: "Juan", apellido: "Pérez", dni: "30123456", fechaNacimiento: "1990-03-02", deporte: "rugby", division: "Plantel superior", colegio: "Colegio X", contento: 5, conoceQuienDejo: true, quienDejoDetalle: "Pedro, por laburo" }) });
  const r1j = await r1.json();
  check("POST registro jugador", r1.status === 201 && !!r1j.registro?.id && r1j.registro.appVersion === "0.1.0", String(r1.status));
  const r2 = await fetch(`${API}/api/v1/registros`, { method: "POST", headers: A, body: JSON.stringify({ tipo: "comunidad", cargaPara: "yo", nombre: "Ana", apellido: "Gómez", vinculo: "familiar", vinculoDetalle: "mamá de Juan, M10" }) });
  check("POST registro comunidad", r2.status === 201, String(r2.status));

  const me = await fetch(`${API}/api/v1/me`, { headers: A }); const mj = await me.json();
  check("GET /me muestra 2 registros", me.status === 200 && mj.registros?.length === 2 && mj.user.email === email, `n=${mj.registros?.length}`);

  const u = await fetch(`${API}/api/v1/me`, { headers: H });
  check("401 sin token", u.status === 401, String(u.status));

  const bad = await fetch(`${API}/api/v1/registros`, { method: "POST", headers: A, body: JSON.stringify({ tipo: "jugador", cargaPara: "yo", apellido: "X" }) });
  const bj = await bad.json();
  check("400 sin nombre", bad.status === 400 && bj.error === "validacion" && bj.campos?.nombre === "requerido", JSON.stringify(bj));

  const old = await fetch(`${API}/api/v1/me`, { headers: { ...A, "X-App-Version": "0.0.1" } });
  check("426 version vieja", old.status === 426, String(old.status));

  const opt = await fetch(`${API}/api/v1/registros`, { method: "OPTIONS", headers: { Origin: "http://localhost:8081", "Access-Control-Request-Method": "POST" } });
  check("CORS preflight", opt.status === 204 && (opt.headers.get("access-control-allow-headers") ?? "").includes("X-App-Version"));

  const evil = await fetch(`${API}/mobile/callback?redirect=${encodeURIComponent("https://evil.com/x")}`, { redirect: "manual" });
  check("callback rechaza redirect malo", evil.status === 400, String(evil.status));
  const ok = await fetch(`${API}/mobile/callback?redirect=${encodeURIComponent("appdelsur://auth")}`, { redirect: "manual" });
  check("callback sin sesion -> login", ok.status >= 300 && ok.status < 400 && (ok.headers.get("location") ?? "").includes("/mobile/login"), ok.headers.get("location") ?? "");
  const lp = await fetch(`${API}/mobile/login?redirect=${encodeURIComponent("appdelsur://auth")}`);
  check("pagina login", lp.status === 200 && (await lp.text()).includes("Entrar"));

  console.log(fails ? `\n${fails} FALLOS` : "\nSMOKE OK");
  process.exit(fails ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
