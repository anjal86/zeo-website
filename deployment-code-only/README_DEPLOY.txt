Zeo Tourism Website - Deployment Instructions
=============================================

This folder contains everything needed to deploy the website to a cPanel/hosting environment.

Structure:
- /         -> Contains the React Frontend files (index.html, assets/, etc.)
- /api      -> Contains the Node.js Backend
- .htaccess -> Application routing configuration

Instructions:
1. Upload all contents of this folder to your 'public_html' (or subdomain folder).
2. Backend Setup:
   - Go to 'api' folder.
   - If using cPanel Node.js Selector:
     - Point Application Root to 'api' folder.
     - IMPORTANT: Ensure NO 'node_modules' folder exists in 'api' before clicking 'Create' or 'Run NPM Install'.
     - The panel will create a symlink for 'node_modules'.
     - Run 'npm install' via the panel or terminal.
     - Restart the Node.js application.
   - Note on Database Isolation:
     This deployment package ONLY contains database templates (*.json.default).
     On server startup, missing database files are auto-generated from these templates.
     Your live database files (e.g. tours.json) on the production server will NEVER be overwritten.

3. Frontend Setup:
   - The frontend files are static and pre-built.
   - Ensure .htaccess is present in the root.

IMPORTANT:
- Edit 'api/.env' with your production secrets if needed.
- Ensure file permissions are correct (usually 644 for files, 755 for folders).

