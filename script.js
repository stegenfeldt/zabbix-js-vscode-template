function zabbixScript(value) {
  var payload;
  var request;
  var method;
  var url;
  var body;

  Zabbix.log(4, "script.js invoked");

  try {
    payload = JSON.parse(value);
  } catch (error) {
    throw "Input value must be a valid JSON string";
  }

  method = (payload.method || "GET").toUpperCase();
  url = payload.url;
  body = payload.body || "";

  if (!url) {
    throw "Payload must contain url";
  }

  request = new HttpRequest();
  request.addHeader("Content-Type: application/json");

  if (method === "GET") {
    body = request.get(url);
  } else if (method === "POST") {
    body = request.post(url, JSON.stringify(payload.body || {}));
  } else {
    body = request.customRequest(method, url, JSON.stringify(payload.body || {}));
  }

  return JSON.stringify({
    status: request.getStatus(),
    body: body
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = zabbixScript;
}
