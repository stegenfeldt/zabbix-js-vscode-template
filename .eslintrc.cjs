module.exports = {
  root: true,
  env: {
    es6: false,
    node: true
  },
  parserOptions: {
    ecmaVersion: 5,
    sourceType: "script"
  },
  globals: {
    Zabbix: "readonly",
    HttpRequest: "readonly",
    value: "readonly",
    params: "readonly",
    XML: "readonly",
    btoa: "readonly",
    atob: "readonly",
    md5: "readonly",
    sha256: "readonly",
    hmac: "readonly",
    sign: "readonly"
  },
  rules: {
    "no-var": "off",
    "prefer-const": "off",
    "no-console": "off",
    "no-undef": "error",
    "no-unused-vars": ["warn", { "args": "none" }]
  }
};
