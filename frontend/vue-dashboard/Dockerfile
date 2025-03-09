FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Remove the problematic fix scripts from the public directory
RUN rm -f public/profile-fix.js public/button-fix.js public/loading-state-fix.js

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Move the index.html to a temp location
RUN mv /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.orig

# Create a new index.html without any references to the fix scripts
RUN cat /usr/share/nginx/html/index.html.orig | grep -v "profile-fix.js" | grep -v "button-fix.js" | grep -v "loading-state-fix.js" > /usr/share/nginx/html/index.html

# Remove the original index.html
RUN rm -f /usr/share/nginx/html/index.html.orig

# Remove the fix scripts from the dist directory if they were copied
RUN rm -f /usr/share/nginx/html/profile-fix.js /usr/share/nginx/html/button-fix.js /usr/share/nginx/html/loading-state-fix.js

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
