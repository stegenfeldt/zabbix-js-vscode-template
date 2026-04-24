var HttpRequest = require("./HttpRequest");

function sleepMs(ms) {
  var waitUntil = Date.now() + Number(ms || 0);
  while (Date.now() < waitUntil) {
    /* intentional busy wait to mimic blocking runtime */
  }
}

function installGlobals(options) {
  var logLevel = (options && options.logLevel) || 4;

  global.Zabbix = {
    log: function (level, message) {
      var now = new Date().toISOString();
      var safeLevel = typeof level === "number" ? level : logLevel;
      process.stdout.write("[" + now + "] [Zabbix:" + safeLevel + "] " + String(message) + "\n");
    },
    sleep: function (ms) {
      sleepMs(ms);
    }
  };

  global.HttpRequest = HttpRequest;

  global.console = {
    log: function (message) {
      global.Zabbix.log(4, message);
    },
    warn: function (message) {
      global.Zabbix.log(3, message);
    },
    error: function (message) {
      global.Zabbix.log(2, message);
    }
  };
}

module.exports = {
  installGlobals: installGlobals
};
