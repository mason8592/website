# INFO

From main directory:

For production only:
pnpm run build = Build the frontend and backend
pnpm run start = Build everything AND run the backend (which serves the frontend)

For development only:
pnpm run dev = Start backend and frontend in dev mode

# CHEATSHEET

NGINX

sudo systemctl reload nginx = Reload nginx

PM2 - pm2 is used to keep my node files running even when the DigitalOcean console is not open
(./server) pm2 start index.js = Start the server
pm2 ls = List pm2 processes
pm2 stop 0 = Stop the server (0 is usually going to be the ID for the server)
pm2 stop all = Stop all pm2 tasks (shouldn't be necessary)
pm2 restart 0 = Restart the server