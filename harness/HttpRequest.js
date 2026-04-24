var childProcess = require("child_process");

function HttpRequest() {
  this._headers = [];
  this._status = 0;
  this._proxy = "";
  this._auth = null;
  this._timeoutMs = 30000;
}

HttpRequest.prototype.addHeader = function (header) {
  if (typeof header !== "string" || !header.length) {
    throw new Error("Header must be a non-empty string");
  }
  this._headers.push(header);
};

HttpRequest.prototype.clearHeader = function () {
  this._headers = [];
};

HttpRequest.prototype.getHeaders = function () {
  var map = {};
  var i;
  var splitIndex;
  var key;
  var value;

  for (i = 0; i < this._headers.length; i += 1) {
    splitIndex = this._headers[i].indexOf(":");
    if (splitIndex > 0) {
      key = this._headers[i].slice(0, splitIndex).trim();
      value = this._headers[i].slice(splitIndex + 1).trim();
      map[key] = value;
    }
  }

  return map;
};

HttpRequest.prototype.getStatus = function () {
  return this._status;
};

HttpRequest.prototype.setProxy = function (proxy) {
  this._proxy = proxy || "";
};

HttpRequest.prototype.setHttpAuth = function (bitmask, username, password) {
  this._auth = {
    bitmask: bitmask,
    username: username || "",
    password: password || ""
  };
};

HttpRequest.prototype._request = function (method, url, data) {
  var args = ["-sS", "-L", "-X", method, "--max-time", String(Math.floor(this._timeoutMs / 1000)), "-w", "\n%{http_code}"];
  var i;
  var result;
  var output;
  var lastLineIndex;
  var statusLine;
  var body;

  if (this._proxy) {
    args.push("--proxy", this._proxy);
  }

  if (this._auth && this._auth.username) {
    args.push("-u", this._auth.username + ":" + this._auth.password);
  }

  for (i = 0; i < this._headers.length; i += 1) {
    args.push("-H", this._headers[i]);
  }

  if (typeof data === "string" && data.length) {
    args.push("--data", data);
  }

  args.push(url);

  result = childProcess.spawnSync("curl", args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });

  if (result.error) {
    throw new Error("curl execution failed: " + result.error.message);
  }

  output = result.stdout || "";
  lastLineIndex = output.lastIndexOf("\n");

  if (lastLineIndex === -1) {
    this._status = 0;
    body = output;
  } else {
    statusLine = output.slice(lastLineIndex + 1).trim();
    body = output.slice(0, lastLineIndex);
    this._status = parseInt(statusLine, 10) || 0;
  }

  if (result.status !== 0) {
    throw new Error((result.stderr || "curl request failed").trim());
  }

  return body;
};

HttpRequest.prototype.get = function (url) {
  return this._request("GET", url, "");
};

HttpRequest.prototype.post = function (url, data) {
  return this._request("POST", url, data || "");
};

HttpRequest.prototype.put = function (url, data) {
  return this._request("PUT", url, data || "");
};

HttpRequest.prototype.patch = function (url, data) {
  return this._request("PATCH", url, data || "");
};

HttpRequest.prototype.delete = function (url, data) {
  return this._request("DELETE", url, data || "");
};

HttpRequest.prototype.head = function (url) {
  return this._request("HEAD", url, "");
};

HttpRequest.prototype.options = function (url) {
  return this._request("OPTIONS", url, "");
};

HttpRequest.prototype.connect = function (url) {
  return this._request("CONNECT", url, "");
};

HttpRequest.prototype.trace = function (url, data) {
  return this._request("TRACE", url, data || "");
};

HttpRequest.prototype.customRequest = function (method, url, data) {
  if (!method) {
    throw new Error("customRequest requires method");
  }
  return this._request(String(method).toUpperCase(), url, data || "");
};

module.exports = HttpRequest;
