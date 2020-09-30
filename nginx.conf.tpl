worker_processes 4;
daemon off;

error_log /dev/stdout info;

events {
    worker_connections 1024;
}

http {
    server {
        access_log /dev/stdout;

        listen ${LISTEN_PORT};

        root  /usr/share/nginx/html;
        include /etc/nginx/mime.types;

        location / {
            try_files $uri /index.html;
        }

        location /api {
            proxy_pass ${BACKEND_URL}/;
        }
    }
}
