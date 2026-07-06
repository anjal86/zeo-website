import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals.map(config => {
    if (config.plugins && config.plugins["react-hooks"]) {
      return {
        ...config,
        rules: {
          ...config.rules,
          "react-hooks/exhaustive-deps": "warn",
          "@next/next/no-img-element": "warn",
          "react/no-unescaped-entities": "warn",
        }
      };
    }
    return config;
  }),
  ...nextTypescript.map(config => {
    if (config.plugins && config.plugins["@typescript-eslint"]) {
      return {
        ...config,
        rules: {
          ...config.rules,
          "@typescript-eslint/no-explicit-any": "warn",
          "@typescript-eslint/no-unused-vars": [
            "warn",
            {
              argsIgnorePattern: "^_",
              varsIgnorePattern: "^_",
              caughtErrorsIgnorePattern: "^_",
            },
          ],
        }
      };
    }
    return config;
  }),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
];

export default eslintConfig;
