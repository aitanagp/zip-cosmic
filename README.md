# 🌀 Zip Cósmico — Puzles de Caminos Hamiltonianos

[![Deploy to Netlify](https://img.shields.io/badge/Deploy%20to-Netlify-00AD9F?style=for-the-badge&logo=netlify)](https://www.netlify.com)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-D22128?style=for-the-badge&logo=apache)](LICENSE)

**Zip Cósmico** es un elegante, dinámico y adictivo videojuego lógico-espacial de deducción geométrica. Inspirado en el concepto matemático del **Camino Hamiltoniano**, los jugadores deben trazar una línea continua que visite absolutamente todas las celdas blancas de la cuadrícula exactamente una vez, conectando secuencias numéricas en un estricto orden ascendente.

---

## ✨ Características Premium Implementadas

### 🎨 Estética Galáctica Avanzada
- **Tipografías Premium**: Cargadas de forma optimizada de Google Fonts (**Outfit** para cuerpo geométrico y **Space Grotesk** para contadores y números de la cuadrícula).
- **Diseño Ultra Moderno**: Fondos oscuros fluidos, luces de neón cian e índigo, y degradados cósmicos dinámicos con efectos de cristal templado.
- **Scrollbars Cósmicas**: Barras de desplazamiento transparentes hechas a medida en CSS para listados de niveles y perfiles de juego, evitando barras nativas grises y toscas de escritorio.
- **Fondo de Polvo Estelar**: Render dinámico e interactivo sobre HTML5 Canvas con gravedad y líneas de constelaciones que reaccionan de manera fluida a la posición del cursor o toques táctiles.

### 🎮 Jugabilidad y Control Absoluto
- **Dibujo Multidispositivo**: Soporte impecable tanto para ratón de sobremesa (arrastrar y soltar) como para gestos táctiles fluidos en dispositivos móviles.
- **Respuesta Háptica Física (`navigator.vibrate`)**: Diseñada a medida para enriquecer el dibujo táctil en pantallas móviles:
  - Movimiento válido: clic mecánico imperceptible de **8ms**.
  - Deshacer / Retroceder: pulso rápido de **12ms**.
  - Choque contra obstáculo o error: vibración de **40ms**.
  - Pantalla de Victoria: vibración festiva en cascada `[15, 30, 15]`.
- **Navegación Interactiva por Teclado**: Juega sin ratón utilizando las teclas **WASD** o las **Flechas de Dirección** para moverte por el tablero, **R** para reiniciar el nivel y **Retroceso (Backspace) / U** para deshacer pasos.
- **Pistas Inteligentes y Auto-Corrección**: El forjador analiza el trazado actual, detecta desviaciones y retrocede al usuario hasta la última celda correcta mientras destaca el siguiente paso con un anillo brillante.

### ⚡ Rendimiento de Grado Comercial
- **Pausa de Animación Inteligente**: ElCanvas detecta cuando la pestaña del juego pasa a segundo plano (`visibilitychange`) deteniendo el render por completo. Esto reduce a **0%** el consumo de batería y CPU cuando el juego se minimiza.

---

## 🛠️ Ejecución Local

### Prerrequisitos
- Tener instalado **Node.js** (Versión 18 o superior recomendada).

### Pasos
1. Descarga el repositorio o descomprime los archivos.
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor local de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en [http://localhost:3000](http://localhost:3000) para comenzar a forjar caminos estelares.

---

## 🚀 Despliegue en Netlify

El proyecto cuenta con un archivo `netlify.toml` pre-configurado para que el despliegue en Netlify sea 100% automático y libre de errores de navegación:

1. Crea o inicia sesión en tu cuenta de [Netlify](https://www.netlify.com).
2. Haz clic en **Add new site** > **Import an existing project**.
3. Vincula tu repositorio de GitHub/GitLab.
4. Netlify detectará de manera automática los comandos del `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. ¡Listo! El juego estará desplegado en una CDN global ultrarrápida con enrutamiento SPA configurado para evitar errores 404 al recargar páginas internas.

---

## 💵 Integración y Monetización con Monetag

Si deseas monetizar **Zip Cósmico** utilizando **Monetag** (Popunder, anuncios de pantalla completa, notificaciones push, etc.), hemos preparado la estructura adecuada:

### Paso 1: Verificación de Propiedad del Dominio
1. Añade tu dominio de Netlify en tu panel de **Monetag**.
2. Selecciona el método de verificación por **Etiqueta Meta HTML**.
3. Abre el archivo `index.html` de este proyecto y busca la sección del marcador: `<!-- MONETAG MONETIZATION CODE PLACEHOLDER -->`.
4. Descomenta la etiqueta meta y reemplaza `TU_CODIGO_DE_VERIFICACION_AQUI` con el token de verificación que te provee Monetag:
   ```html
   <meta name="monetag" content="1234567890abcdef1234567890abcdef" />
   ```

### Paso 2: Integración de los Anuncios
1. **Script de Anuncio General / Popunder**: Obtén el código de anuncio de Monetag en formato script y colócalo justo dentro de la sección comentada del `<head>` en `index.html`.
2. **Notificaciones Push (Service Worker)**: Si utilizas las notificaciones automáticas push de Monetag, descarga el archivo del service worker provisto por Monetag (`sw.js`). Coloca este archivo directamente dentro de la carpeta **`public/`** de este proyecto (quedando en la ruta `public/sw.js`). Vite lo compilará al directorio raíz en producción y Monetag podrá registrarlo sin inconvenientes.

---

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia Apache 2.0**. Para más información, consulta el archivo [LICENSE](LICENSE) adjunto.
