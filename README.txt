MM ENTERPRISES V2 — FIXED VERSION

THE ERROR YOU SAW
The old script used fetch("products.json"). When index.html was opened using a D:\...\ file:// path, the browser can block fetch requests because of local-file CORS/security rules. This caused the error at load().

THIS VERSION FIXES IT
The new script:
- Tries to load products.json when served normally.
- Automatically falls back to built-in product data if products.json cannot be loaded.
- Therefore it works with Live Server AND by double-clicking index.html.

RECOMMENDED RUN
1. Extract ZIP.
2. Open folder in VS Code.
3. Right-click index.html -> Open with Live Server.
4. Browser should show the store.

You can also double-click index.html now if necessary.

EDIT PRODUCTS
For easy maintenance, edit products.json when using Live Server. The built-in fallback in script.js is also included so the page remains functional offline. If you add products, copy them into the FALLBACK_PRODUCTS section too if you want double-click/offline mode to include the new products.

BUSINESS DETAILS
MM Enterprises
#95, Kamadhenu Badavane, Bogadi, Mysore - 570026
8310271582 / 9008331316
GSTIN 29LENPS5239B1ZW
Email placeholder: info@mmenterprises.in
