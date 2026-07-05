module.exports = {
    apps: [
        {
            name: "zeo-next",
            cwd: "/var/www/zeo/next-zeo",
            script: "node_modules/.bin/next",
            args: "start -p 3000",
            instances: 1,
            exec_mode: "fork",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            env_file: ".env",
            max_restarts: 10,
            restart_delay: 5000,
            watch: false,
            error_file: "/var/log/zeo/next-error.log",
            out_file: "/var/log/zeo/next-out.log",
            merge_logs: true,
            time: true,
        },
    ],
};