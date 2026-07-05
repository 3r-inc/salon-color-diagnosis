/**
 * Claude 中継サーバー（Cloudflare Worker）
 * ------------------------------------------------------------
 * 役割：アプリからのリクエストを受け取り、サーバー側に保管したAPIキーを
 *       付けてAnthropic(Claude)へ転送する。キーは各端末に置かない。
 *
 * 事前設定（Cloudflareダッシュボード）:
 *   Settings → Variables and Secrets で
 *   「Secret」タイプの変数  ANTHROPIC_API_KEY  にAPIキーを登録すること。
 *
 * 許可元(ALLOW_ORIGIN)は自分のアプリのURLに固定してある。
 */
const ALLOW_ORIGIN = "https://3r-inc.github.io";

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOW_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    // プリフライト
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST")
      return new Response("Method Not Allowed", { status: 405, headers: cors });

    // 自分のアプリ以外からの利用を弾く（簡易的な保護）
    const origin = request.headers.get("Origin") || "";
    if (origin && origin !== ALLOW_ORIGIN)
      return new Response("Forbidden", { status: 403, headers: cors });

    if (!env.ANTHROPIC_API_KEY)
      return new Response(JSON.stringify({ error: "APIキー未設定(サーバー)" }), {
        status: 500, headers: { ...cors, "content-type": "application/json" },
      });

    let body;
    try { body = await request.json(); }
    catch { return new Response("Bad Request", { status: 400, headers: cors }); }

    // Anthropicへ転送（モデル・トークン上限はサーバー側で軽く制限）
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: body.model || "claude-haiku-4-5-20251001",
        max_tokens: Math.min(body.max_tokens || 200, 300),
        messages: body.messages,
      }),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...cors, "content-type": "application/json" },
    });
  },
};
