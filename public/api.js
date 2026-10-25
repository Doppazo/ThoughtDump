// Talks to the server. Adds the signed-in user's token to every request.
(function () {
  async function request(method, url, { json, body, headers = {} } = {}) {
    const h = { ...headers, Authorization: `Bearer ${await Auth.token()}` };
    let b = body;
    if (json !== undefined) { h["Content-Type"] = "application/json"; b = JSON.stringify(json); }
    let res;
    try { res = await fetch(url, { method, headers: h, body: b }); }
    catch { const e = new Error("Can't reach the server. Check your connection."); e.code = "offline"; throw e; }
    if (!res.ok) {
      let msg = "";
      try { msg = (await res.json()).error; } catch {}
      const e = new Error(msg || `Something went wrong (${res.status}).`);
      e.code = res.status === 401 ? "auth" : "server";
      e.status = res.status;
      throw e;
    }
    return res;
  }
  window.Api = {
    request,
    async json(method, url, opts) { return (await request(method, url, opts)).json(); },
  };
})();
