# GX Mod Studio

Editor web estatico para crear y exportar mods de Opera GX.

## Ejecutar localmente

Abre `index.html` directamente o usa un servidor local:

```powershell
python -m http.server 5500
```

Luego visita `http://localhost:5500`.

## Publicar en Vercel

1. Entra en [vercel.com](https://vercel.com) e inicia sesion con GitHub.
2. Selecciona **Add New Project**.
3. Importa `rahernandezm24-tech/GX_Mod_Studio`.
4. En la pantalla de proyecto, cambia el preset a **Other**.
5. Deja vacios **Build Command** y **Output Directory**.
6. Pulsa **Deploy**.

Este proyecto es un sitio estatico puro: no usa Vite ni npm. Si Vercel detecta Vite, debes quitar el archivo `package.json` del repositorio y volver a desplegar. La app principal se sirve desde `index.html` y sus recursos adyacentes (`app.js`, `styles.css`, carpetas `wallpaper`, `sound`, `music`, `keyboard`).
