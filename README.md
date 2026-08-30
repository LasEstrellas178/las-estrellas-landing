# LAS ESTRELLAS — Landing + Admin seguro

## Requisitos
- Node.js 18+
- Hosting que ejecute Node.js y permita almacenamiento persistente.

## Variables de entorno
ADMIN_USER=usuario del panel
ADMIN_PASSWORD=contraseña del panel
SESSION_SECRET=clave aleatoria larga
NODE_ENV=production

## Uso local
1. `npm install`
2. Configurá las variables de entorno.
3. `npm start`
4. Landing: `/`
5. Administración: `/admin`

La configuración se guarda en `data.json`. Para producción, asegurate de que el hosting tenga disco persistente o reemplazá este almacenamiento por una base de datos.
