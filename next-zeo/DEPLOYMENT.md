# Zeo Tourism Deployment Guide

This guide explains how to correctly and safely deploy the Next.js application to the production server.

## Prerequisites

- You must have SSH access to the production VPS configured in your `~/.ssh/config` using your private deployment details.
- Use a non-root deploy user wherever possible.
- You should run the deployment script from **inside** the `next-zeo` directory.

## Deploying to Production

The deployment process is automated via a shell script. It uses `rsync` to push the code and `ssh` to build and restart the application on the server.

To deploy the latest changes to production, run:

```bash
cd next-zeo
./deploy.sh
```

### What the script does:
1. **Syncs files to the VPS (`/var/www/zeo/next-zeo`)**: It copies local source files to the production server.
2. **Excludes sensitive/unnecessary files**: It ignores `.env`, `.env.local`, `.git`, `node_modules`, and `.next`. **This ensures we never accidentally overwrite production database credentials with local development secrets.**
3. **Installs dependencies**: It runs `npm install` on the VPS.
4. **Builds the Next.js app**: It runs `npm run build` on the VPS to generate static pages and prepare the production server.
5. **Restarts PM2**: It triggers a restart of the `zeo-next` PM2 process.

## Environment Variables

**CRITICAL RULE:** Never sync `.env` or `.env.local` to the production server using the deploy script.

If you ever need to change a production environment variable, such as adding an API key or rotating a database password:
1. SSH into the production server using your private deployment host alias.
2. Open the production environment file on the server:
   ```bash
   nano /var/www/zeo/next-zeo/.env
   ```
3. Save your changes and manually run:
   ```bash
   cd /var/www/zeo/next-zeo
   npm run build
   pm2 restart zeo-next
   ```

## Troubleshooting

- **Error: Access denied for user...**
  If the Next.js build fails on the VPS with a database connection error, the `.env` file on the VPS may be missing, overwritten, or using incorrect credentials. Verify the production server has the correct private values for:
  ```env
  MYSQL_HOST=127.0.0.1
  MYSQL_USER=<production-database-user>
  MYSQL_PASSWORD=<production-database-password>
  MYSQL_DATABASE=<production-database-name>
  ```
  Do not commit real credentials to the repository or paste them into documentation.

- **File permission errors when running `./deploy.sh`:**
  If you get a "Permission denied" error when running the script, make it executable:
  ```bash
  chmod +x deploy.sh
  ```

## Migrating to a New VPS (Using Docker)

To easily deploy this application to a new VPS without installing Node.js or PM2 directly on the server:

1. Install [Docker and Docker Compose](https://docs.docker.com/engine/install/) on the new VPS.
2. Clone or copy your application files to the VPS (including the new `Dockerfile` and `docker-compose.yml`).
3. Set up your `.env` file on the new server.
4. Run the following command in the application directory:
   ```bash
   docker-compose up -d --build
   ```
5. The application will start running in the background on port `3000`. You can configure a reverse proxy (like Nginx) to route external traffic to `localhost:3000`.

## Deploying to cPanel / Shared Hosting

cPanel's Node.js application manager usually does not run standard Next.js well due to `node_modules` size and build complexities. Instead, we use the Next.js `standalone` build:

1. On your local machine, generate the deployment package:
   ```bash
   npm run build:cpanel
   ```
2. This creates a `cpanel-deploy.zip` file.
3. Open your cPanel File Manager, create a folder for your app (e.g., `zeo-app`), and upload `cpanel-deploy.zip` into it.
4. Extract the ZIP file in cPanel.
5. In cPanel, open the **Setup Node.js App** tool.
6. Create a new application:
   - **Node.js version**: 18.x or newer
   - **Application mode**: Production
   - **Application root**: The folder where you extracted the zip (e.g., `zeo-app`)
   - **Application startup file**: `server.js`
7. Define any environment variables (like `MYSQL_HOST`, etc.) directly in the cPanel Node.js App UI or upload a `.env` file to the root.
8. Start the application. cPanel will handle the routing!

## Live Data Migration (Moving from an old VPS to a new one)

If your website is already live and you have data (database records, uploaded images), simply deploying the code to a new VPS won't move your data. You must migrate the database and uploaded files.

### 1. Export Data from the OLD VPS
SSH into your **old VPS** and run these commands:

**A. Export the MySQL Database:**
```bash
mysqldump -u <your_db_user> -p <your_db_name> > zeo_production_backup.sql
```
*(You will be prompted for your database password)*

**B. Archive the Uploads Directory:**
Check your `.env` file on the old VPS to see what `UPLOAD_DIR` is set to (e.g., `/var/www/zeo/next-zeo/uploads` or similar). Zip this folder:
```bash
zip -r zeo_uploads_backup.zip <path_to_UPLOAD_DIR>
```

### 2. Transfer Data to the NEW VPS
You can transfer these files directly from the old VPS to the new VPS using `scp` (run this on the **new VPS**):
```bash
scp user@old-vps-ip:/path/to/zeo_production_backup.sql .
scp user@old-vps-ip:/path/to/zeo_uploads_backup.zip .
```

### 3. Import Data on the NEW VPS
SSH into your **new VPS** and run these commands:

**A. Import the MySQL Database:**
Ensure you have created the empty database on the new VPS, then import the SQL file:
```bash
mysql -u <new_db_user> -p <new_db_name> < zeo_production_backup.sql
```

**B. Restore the Uploads:**
Unzip the uploads archive into the location specified by your new `.env` file's `UPLOAD_DIR`:
```bash
unzip zeo_uploads_backup.zip -d <new_path_to_UPLOAD_DIR>
```

Once the database and uploads are restored, you can follow the "Migrating to a New VPS (Using Docker)" steps above to deploy the codebase and connect it to your migrated data!
