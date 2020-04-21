module.exports = {
    "env": {
      "browser": true,
      "es6": true,
      "amd":true,
      "jquery": true
    },
    "parser": "babel-eslint",
    "parserOptions": {
      "sourceType": "module",
      "ecmaFeatures": {
        "impliedStrict": false,
      },
    },
    "rules": {
      "comma-dangle": [
        "error", {
        "arrays": "never",
        "objects": "never",
        "imports": "never",
        "exports": "never",
        "functions": "ignore",
      }],
      "indent": [
        "error",
        2
      ],
      "max-len": [
        "error",
        { "code": 180 }
      ],
      "no-extra-semi": [
        "error"
      ],
      "operator-linebreak": [
        "error",
        "after", { "overrides": { "?": "before", ":": "before" } }
      ],
      "quotes": [
        "error",
        "single"
      ],
      "semi": [
        "error",
        "always"
      ]
    }
  };