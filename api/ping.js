// Chamado todo dia pelo Vercel Cron (vercel.json) para o banco gratuito do Supabase não pausar.
// Configure na Vercel (Settings → Environment Variables): SUPABASE_URL e SUPABASE_ANON_KEY (chave pública).
const URL_SB = process.env.SUPABASE_URL || "";
const ANON = process.env.SUPABASE_ANON_KEY || "";

export default async function handler(req, res) {
  if (!URL_SB || !ANON) return res.status(500).json({ banco: "não configurado", detalhe: "Defina SUPABASE_URL e SUPABASE_ANON_KEY na Vercel." });
  let ultimo = "";
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(`${URL_SB}/rest/v1/rpc/ping`, { method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" }, body: "{}" });
      ultimo = await r.text();
      if (r.ok && ultimo.includes("ok")) return res.status(200).json({ banco: "ativo", em: new Date().toISOString() });
    } catch (e) { ultimo = String(e); }
    await new Promise(ok => setTimeout(ok, 5000));
  }
  return res.status(502).json({ banco: "sem resposta", detalhe: ultimo.slice(0, 200) });
}
