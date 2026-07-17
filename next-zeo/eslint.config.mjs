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
          "jsx-a11y/alt-text": "warn",
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
    // Keep the existing application lint backlog visible without blocking
    // unrelated API-only pull requests. New code should still avoid these.
    plugins: {
      "@next/next": nextVitals[0].plugins["@next/next"],
      "@typescript-eslint": nextVitals[1].plugins["@typescript-eslint"],
      react: nextVitals[0].plugins.react,
      "react-hooks": nextVitals[0].plugins["react-hooks"],
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-require-imports": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
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
