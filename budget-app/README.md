# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# budget-app

## ESLint Ignore Patterns Migration

As of the latest update, ESLint ignore patterns have been migrated from the deprecated `.eslintignore` file to the `ignores` property in `eslint.config.js`. This ensures compatibility with ESLint 9.x and above. The following directories are now ignored by ESLint:

- dist/
- build/
- node_modules/

You can update the ignore patterns directly in `eslint.config.js` under the `ignores` property. The `.eslintignore` file is no longer used or needed.
