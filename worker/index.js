// Cloudflare Worker — Visitor Counter
// Deploy with: wrangler deploy index.js --name careerforge-counter
// Add KV namespace COUNTER_KV in wrangler.toml:
//   [[kv_namespaces]]
//   binding = "COUNTER_KV"
//   id = "your-namespace-id"

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === "/count") {
    const origin = request.headers.get("Origin") ?? "*";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Increment and return count
    const current = (parseInt((await COUNTER_KV.get("visitors")) ?? "0", 10)) + 1;
    await COUNTER_KV.put("visitors", String(current));

    return new Response(JSON.stringify({ count: current }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    });
  }

  // Badge endpoint — returns SVG badge
  if (url.pathname === "/badge") {
    const count = (parseInt((await COUNTER_KV.get("visitors")) ?? "0", 10));
    const label = "visitors";
    const value = count.toLocaleString();
    const color = "#4caf50";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20">
      <rect width="120" height="20" rx="3" fill="#555"/>
      <rect x="60" width="60" height="20" rx="3" fill="${color}"/>
      <rect x="60" width="60" height="20" fill="${color}" clip-path="url(#r)"/>
      <text x="30" y="14" fill="#fff" font-size="11" text-anchor="middle">${label}</text>
      <text x="90" y="14" fill="#fff" font-size="11" text-anchor="middle">${value}</text>
    </svg>`;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response("Not found", { status: 404 });
}
