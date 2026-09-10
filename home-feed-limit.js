(() => {
  const HOME_LIMIT = 30;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const requestUrl = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "";
    if (!/deals\.json(?:\?|$)/i.test(requestUrl)) return nativeFetch(...args);
    const response = await nativeFetch(...args);
    if (!response.ok) return response;
    try {
      const data = await response.clone().json();
      if (Array.isArray(data.deals)) data.deals = data.deals.slice(0, HOME_LIMIT);
      return new Response(JSON.stringify(data), {status: response.status, statusText: response.statusText, headers: {"Content-Type":"application/json"}});
    } catch (_) {
      return response;
    }
  };
})();
