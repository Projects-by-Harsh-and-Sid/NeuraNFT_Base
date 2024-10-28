# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Project Structure
```
.
├── Dockerfile
├── README.md
├── nginx_config
│   ├── default.conf
│   ├── goaccess.conf
│   └── nginx.conf
├── package-lock.json
├── package.json
├── public
│   ├── all-chain-gey.svg
│   ├── all-chain.svg
│   ├── base-logo-in-blue.svg
│   ├── brain.ico
│   ├── favicon.ico
│   ├── index.html
│   ├── logo.svg
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └──  robots.txt
└── src
    ├── App.jsx
    ├── App.test.js
    ├── WalletContext.js
    ├── components
    │   ├── ChainSelector.js
    │   ├── Chat
    │   ├── Common_Components
    │   ├── CreateForms
    │   ├── DefaultImage.jpg
    │   ├── Footer.jsx
    │   ├── HomePage
    │   ├── NFTs
    │   ├── Profile
    │   ├── Utils
    │   └── ViewCollection.jsx
    ├── endpoints.json
    ├── index.css
    ├── index.js
    ├── logo.svg
    ├── reportWebVitals.js
    ├── setupTests.js
    └── styles
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Starts a local development server. The app will be available at [http://localhost:3000](http://localhost:3000).

Features:
- Hot reloading: Changes automatically refresh in the browser
- Error reporting in the browser and console
- Development environment optimizations

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder, optimizing for best performance.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

Ejects the configuration files and dependencies into your project for full control.

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)

The project structure shows a full React application with:
- `nginx_config/` - Contains Nginx server configurations
- `public/` - Static assets and HTML template
- `src/` - Source code
  - `components/` - React components organized by feature
  - `styles/` - CSS modules and style assets
  - `Utils/` - Utility functions and contracts
  - Main application files (App.jsx, index.js, etc.)
