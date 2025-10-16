export default { 
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    // verify the target param exists
    if (!target) {
      return new Response("Missing 'url' parameter", { status: 400 });
    }

    // only allow i.imgur.com
    const targetUrl = new URL(target);
    if (targetUrl.hostname !== "i.imgur.com") {
      return new Response("Only i.imgur.com URLs are allowed", { status: 403 });
    }

    try {
      const response = await fetch(targetUrl.toString(), {
        method: "GET",
        headers: {
          "User-Agent": "Cloudflare-Worker-Proxy",
        },
      });

      // clone headers
      const headers = new Headers(response.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
      headers.set("Cache-Control", "public, max-age=86400"); 

      return new Response(response.body, {
        status: response.status,
        headers,
      });
    } catch (err) {
      return new Response(`Proxy error: ${err.message}`, { status: 500 });
    }
  },
};
