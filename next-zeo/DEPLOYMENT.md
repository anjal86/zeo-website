# Zeo Tourism Deployment Guide

This guide explains how to correctly and safely deploy the Next.js application to the production server (`salom-vps`).

## Prerequisites

- You must have SSH access to `salom-vps` configured in your `~/.ssh/config`. If you haven't set this up, add the following to `~/.ssh/config` (or use the equivalent IP/Keys you normally use to connect to `salom-vps`):
  ```ssh-config
  Host salom-vps
      HostName 187.77.188.170
      User root
      # IdentityFile ~/.ssh/id_rsa
  ```
- You should run the deployment script from **inside** the `next-zeo` directory.

## Deploying to Production

The deployment process is entirely automated via a single shell script. It uses `rsync` to push the code and `ssh` to build and restart the application on the server.

To deploy the latest changes to production, simply run:

```bash
cd next-zeo
./deploy.sh
```

### What the script does:
1. **Syncs files to the VPS (`/var/www/zeo/next-zeo`)**: It copies all local source files to the production server.
2. **Excludes sensitive/unnecessary files**: It strictly ignores `.env`, `.env.local`, `.git`, `node_modules`, and `.next`. **This ensures we never accidentally overwrite the production database credentials with local development secrets.**
3. **Installs dependencies**: It runs `npm install` on the VPS.
4. **Builds the Next.js app**: It runs `npm run build` on the VPS to generate static pages and prepare the production server.
5. **Restarts PM2**: It triggers a zero-downtime restart of the `zeo-next` PM2 process.

## Environment Variables

**CRITICAL RULE:** Never sync `.env` or `.env.local` to the production server using the deploy script. 

If you ever need to change a production environment variable (e.g., adding a new API key, changing a database password):
1. SSH into the production server: `ssh salom-vps`
2. Open the file on the server: `nano /var/www/zeo/next-zeo/.env`
3. Save your changes and manually run:
   ```bash
   cd /var/www/zeo/next-zeo
   npm run build
   pm2 restart zeo-next
   ```

## Troubleshooting

- **Error: Access denied for user...**
  If the Next.js build fails on the VPS with a database connection error, it means the `.env` file on the VPS was either overwritten or has incorrect credentials. Ensure the VPS `.env` explicitly contains:
  ```env
  MYSQL_HOST=127.0.0.1
  MYSQL_USER=zeo_prod
  MYSQL_PASSWORD=ZeoProd2026!
  ```
- **File permission errors when running `./deploy.sh`:**
  If you get a "Permission denied" error when running the deployment script, make it executable by running:
  ```bash
  chmod +x deploy.sh
  ```
