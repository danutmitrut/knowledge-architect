import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "@next/eslint-plugin-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals"),
    {
        // ***** AICI ESTE MODIFICAREA *****
        // Adăugăm un obiect nou în array-ul de configurare
        // pentru a dezactiva regula problematică.
        rules: {
            "react/no-unescaped-entities": "off"
        }
    }
];

export default eslintConfig;