function zabbixScript(value) {
  // Example intent: script-item style logic that expects a JSON object payload.
  // In this template, script-item and webhook harness runs may pass an object directly,
  // while Zabbix runtime typically passes a string.
  var payload;
  // Zabbix-like synchronous HTTP client provided by the runtime/harness.
  var request;
  // Input values expected in payload.
  var url;
  var expectedStatusCode;
  var searchText;
  // Response data.
  var body;
  var statusCode;
  var searchStringFound;

  Zabbix.log(4, "script.js invoked");

  if (value && typeof value === "object" && !Array.isArray(value)) {
    payload = value;
  } else if (typeof value === "string") {
    // Parse JSON string input from Zabbix runtime or from harness string mode.
    try {
      payload = JSON.parse(value);
    } catch (error) {
      throw "Input value must be a JSON object or a JSON string object";
    }
  } else {
    throw "Input value must be a JSON object or a JSON string object";
  }

  url = payload.url;
  expectedStatusCode = parseInt(payload.expectedStatusCode, 10);
  searchText = String(payload.searchText || "");

  if (!url) {
    throw "Payload must contain url";
  }

  // Keep this addHeader call as a practical template example.
  request = new HttpRequest();
  request.addHeader("Content-Type: application/json");

  // Perform a blocking HTTP request, like Zabbix runtime behavior.
  body = request.get(url);
  statusCode = request.getStatus();

  // Helpful warning if the expected status does not match.
  if (!isNaN(expectedStatusCode) && statusCode !== expectedStatusCode) {
    Zabbix.log(3, "Expected status " + expectedStatusCode + " but got " + statusCode);
  }

  // Check if requested text exists in response body.
  searchStringFound = searchText.length ? body.indexOf(searchText) !== -1 : false;

  // Return a JSON string because Zabbix scripts usually return text values.
  return JSON.stringify({
    url: url,
    statusCode: statusCode,
    searchStringFound: searchStringFound
  });
}

// Preprocessor scripts usually receive a single raw value (commonly a string),
// transform it, and return the transformed value.
// Webhook scripts usually receive an event/alert payload object and often map
// it into one or more outbound API requests.

// Export for local Node.js harness debug runs.
// This block is not required when pasting into Zabbix UI.
if (typeof module !== "undefined" && module.exports) {
  module.exports = zabbixScript;
}
