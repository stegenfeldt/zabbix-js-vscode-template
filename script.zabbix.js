// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source: script.js
function zabbixScript(value) {
  // Parsed JSON input from Zabbix or the local harness.
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

  // Zabbix passes input as a string. Parse it once and work with an object.
  try {
    payload = JSON.parse(value);
  } catch (error) {
    throw "Input value must be a valid JSON string";
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

// Zabbix entrypoint call
return zabbixScript(value);
