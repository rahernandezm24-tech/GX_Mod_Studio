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
4. Deja el framework como **Other**.
5. Deja vacios **Build Command** y **Output Directory**.
6. Pulsa **Deploy**.

`index.html` se sirve como la pagina principal. El proyecto no necesita instalacion de dependencias ni proceso de compilacion.
