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
