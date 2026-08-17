# PUIG & ASOCIADOS — Sitio web corporativo

Sitio one-page estático (HTML5 + CSS3 + JavaScript vanilla + un único archivo PHP para el formulario), preparado para publicarse en **GoDaddy Web Hosting Linux con cPanel**.

No requiere Node, npm, React, Next.js ni base de datos. Se sube por FTP o File Manager y funciona.

---

## 1. Estructura de archivos

```
puig-asociados/
├── index.html          Todo el contenido del sitio (una sola página)
├── contact.php         Procesa el formulario y envía el email
├── .htaccess           Caché, compresión, seguridad y (opcional) redirección HTTPS
├── robots.txt          Indicaciones para buscadores
├── sitemap.xml         Mapa del sitio
├── favicon.ico         Ícono del navegador
├── README.md           Este archivo
│
└── assets/
    ├── css/styles.css              Todos los estilos
    ├── js/main.js                  Menú, acordeones, formulario, animaciones
    └── img/
        ├── logo-puig.png           Logo completo (símbolo + texto) — footer
        ├── logo-puig-simbolo.png   Solo el símbolo — header
        ├── logo-puig-marca.png     Solo el texto — header
        ├── hero-puig-1920.webp     Foto del hero (pantallas grandes)
        ├── hero-puig-1280.webp     Foto del hero (pantallas medianas)
        ├── hero-puig-768.webp      Foto del hero (celulares)
        ├── hero-puig-1920.jpg      Respaldo por si el navegador no soporta WebP
        ├── og-puig.jpg             Imagen que se ve al compartir el link
        ├── apple-touch-icon.png    Ícono para iPhone/iPad
        └── icon-512.png            Ícono grande de reserva
```

---

## 2. Editar los textos

Todos los textos están en `index.html`. Se abre con cualquier editor de texto (Bloc de notas, VS Code, el editor de cPanel).

Cada sección está señalizada con un comentario, por ejemplo:

```html
<!-- ============ SERVICIOS ============ -->
```

Buscá el comentario de la sección y modificá el texto que está entre las etiquetas. **No borres las etiquetas** (`<p>`, `<h2>`, etc.), solo el texto que está adentro.

---

## 3. Colores

El verde institucional se tomó del logo original: **`#389870`**.

Todos los colores están definidos en un solo lugar, al principio de `assets/css/styles.css`:

```css
:root {
  --brand-green:      #389870;  /* verde del logo: acentos, líneas, íconos */
  --brand-green-dark: #1F6E51;  /* botones y textos verdes (mejor contraste) */
  --brand-green-deep: #0E3B2C;  /* fondo de Mi Unidad y del pie de página */
  --brand-green-soft: #EAF3EE;  /* fondo suave de la franja de valores */
  ...
}
```

Cambiando ese valor cambia el sitio entero. No hay verdes escritos "a mano" en otras partes.

---

## 4. Reemplazar el logo

Sustituí los archivos manteniendo **el mismo nombre**:

- `assets/img/logo-puig.png` → logo completo (usado en el pie de página)
- `assets/img/logo-puig-simbolo.png` → solo los edificios (usado en el header)
- `assets/img/logo-puig-marca.png` → solo el texto "PUIG & ASOC." (usado en el header)

Los dos últimos son recortes del logo original: no se redibujó ni se modificó nada, solo se separaron los elementos para que el texto quede legible en la barra superior. El CSS solo define la **altura**; el ancho se calcula solo, así que el logo nunca se deforma.

---

## 5. Reemplazar la foto del hero

Si se cambia la fotografía, hay que generar las tres versiones con los mismos nombres:

- `hero-puig-1920.webp` (1920 px de ancho)
- `hero-puig-1280.webp` (1280 px de ancho)
- `hero-puig-768.webp` (768 px de ancho)
- `hero-puig-1920.jpg` (respaldo)

Podés convertirlas gratis en https://squoosh.app (calidad 80–85, formato WebP).

Si la foto nueva tiene otra composición y los edificios quedan mal encuadrados, se ajusta esta línea de `styles.css` (busque `object-position`):

```css
.hero-media img { object-position: 78% 62%; }
```

El primer número mueve el encuadre horizontalmente (0% = izquierda, 100% = derecha).

---

## 6. Mi Unidad

Todos los accesos (botón del header, menú, hero, sección Tecnología, menú mobile y pie de página) apuntan a:

```
https://app.designware.uy/MiUnidad/login.aspx
```

Si esa dirección cambia, buscá `app.designware.uy` en `index.html` y reemplazá **todas** las apariciones.

> Nota: el ítem **MI UNIDAD** del menú abre directamente la plataforma en una pestaña nueva, tal como fue solicitado. Si en algún momento se prefiere que ese ítem lleve a la sección informativa del sitio, hay que cambiar su `href` por `#mi-unidad` (y quitar `target="_blank" rel="noopener noreferrer"`).

El sitio **no** tiene login, usuarios ni base de datos propia: todo eso vive en Mi Unidad.

---

## 7. Datos de contacto

Buscá y reemplazá en `index.html`:

| Dato | Aparece como |
|---|---|
| Teléfono visible | `094 120 356` |
| WhatsApp (enlaces) | `59894120356` |
| Email | `administracion@puigyasociados.com` |
| Instagram | `puigyasociados` |

El email también está configurado en `contact.php` (variable `$DESTINATARIO`).

---

## 8. Formulario de contacto

**Cómo funciona:** el visitante completa el formulario → JavaScript valida los campos y los envía sin recargar la página → `contact.php` vuelve a validar todo en el servidor y envía un email a `administracion@puigyasociados.com`.

Incluye:

- Validación en el navegador **y** en el servidor (no depende solo de JavaScript).
- Campo trampa invisible ("honeypot") para descartar bots.
- Límite de 5 envíos cada 15 minutos por visitante.
- Limpieza de los datos y protección contra inyección de cabeceras.
- Si el visitante tiene JavaScript desactivado, el formulario igual funciona: se envía de forma tradicional y muestra una página de confirmación.

**Dónde se cambia el destinatario:** primeras líneas de `contact.php`.

```php
$DESTINATARIO = 'administracion@puigyasociados.com';
$REMITENTE    = 'no-reply@puigyasociados.com';
```

> **El envío de emails debe probarse una vez desplegado en GoDaddy.** El PHP está escrito y es correcto, pero cada hosting tiene su propia configuración de correo. Si los mails no llegan:
> 1. Verificá que exista la casilla `no-reply@puigyasociados.com` en cPanel (algunos hostings rechazan remitentes de dominios ajenos).
> 2. Revisá la carpeta de spam del destinatario.
> 3. Si aun así no llegan, hay que pasar el envío a SMTP autenticado (con PHPMailer). El archivo está armado de forma simple justamente para poder sustituir el método de envío sin tocar el resto del sitio.
>
> No se configuraron usuario, contraseña, servidor ni puerto SMTP porque esos datos los provee el hosting.

---

## 9. Publicar en GoDaddy — paso a paso

1. **Backup**: si ya hay un sitio publicado, descargá una copia antes de tocar nada.
2. Entrá a tu cuenta de GoDaddy → **Mis productos** → **Web Hosting** → **Administrar**.
3. Abrí **cPanel**.
4. Abrí **Administrador de archivos** (File Manager).
5. Ubicá la carpeta raíz del dominio: normalmente `public_html` (si el dominio es adicional, será `public_html/puigyasociados.com`).
6. Comprimí la carpeta del proyecto en un **ZIP** desde tu computadora y subilo con el botón **Cargar / Upload**.
7. Con el ZIP ya subido, hacé clic derecho sobre él → **Extraer / Extract**.
8. Confirmá que `index.html` quede **directamente** en la raíz del dominio, no dentro de una subcarpeta `puig-asociados/`. Si quedó adentro, seleccioná todos los archivos y movelos un nivel arriba.
9. Activá "Mostrar archivos ocultos" (Settings → Show hidden files) para confirmar que `.htaccess` se subió.
10. Permisos: carpetas `755`, archivos `644`.
11. Abrí el dominio en el navegador.
12. Revisá que se vean las **imágenes**.
13. Revisá que se apliquen los **estilos** (si el sitio se ve sin diseño, la carpeta `assets` no se subió completa).
14. Revisá que funcione el **menú** (JavaScript).
15. Probá el botón **Acceso a Mi Unidad**.
16. Probá el botón de **WhatsApp**.
17. Probá el enlace de **Instagram**.
18. Probá el enlace de **email**.
19. Enviá una consulta de prueba con el **formulario** y confirmá que llegue el mail.
20. Verificá **HTTPS** (ver punto siguiente).
21. Recién después activá la redirección a HTTPS.
22. Revisá el sitio en **celular**.
23. Revisá el sitio en **tablet**.
24. Revisá el sitio en **desktop**.
25. Pasá **Lighthouse** (Chrome → clic derecho → Inspeccionar → pestaña Lighthouse).
26. Revisá la **consola** del navegador: no debe haber errores en rojo.
27. Confirmá que abran `tudominio.com/robots.txt` y `tudominio.com/sitemap.xml`.

---

## 10. HTTPS

**Verificá el SSL antes de forzar HTTPS.**

1. En cPanel, abrí **SSL/TLS Status** y confirmá que el dominio tenga certificado válido.
2. Probá manualmente `https://www.puigyasociados.com` — debe abrir con el candado y sin advertencias.
3. Recién entonces, abrí `.htaccess` y quitá el `#` de las 4 líneas del bloque **HTTPS**.

Si se activa la redirección antes de tener el certificado instalado, el sitio queda inaccesible.

---

## 11. Pendientes a confirmar antes de producción

| Pendiente | Detalle |
|---|---|
| **Casilla del remitente** | Crear `no-reply@puigyasociados.com` en cPanel, o indicar cuál usar en `contact.php`. |
| **Prueba de envío del formulario** | Solo puede probarse con el sitio ya publicado en GoDaddy. |
| **Certificado SSL** | Verificar antes de activar la redirección HTTPS. |
| **Fotografías propias** | El sitio usa la panorámica provista. Cuando haya fotos reales de edificios administrados (con autorización), reemplazan a la imagen actual en la sección "Estamos para acompañarte". |
| **Foto del equipo** | Si se consigue, va en la sección "Estamos para acompañarte". |
| **Dirección física y horarios** | No se incluyeron porque no fueron provistos. Si se agregan, conviene sumarlos también al bloque de datos estructurados (JSON-LD) al final del `<head>`. |
| **Instagram** | Verificar que la URL `instagram.com/puigyasociados` sea la correcta. |

No se inventó ningún dato: no hay testimonios, cantidad de edificios, métricas, premios ni clientes ficticios.

---

## 12. Tipografías

El sitio usa **Archivo** (títulos) e **Inter** (texto), cargadas desde Google Fonts. Si en algún momento se prefiere no depender de un servicio externo, se puede borrar el `<link>` de Google Fonts del `<head>`: el sitio seguirá funcionando con las tipografías del sistema, sin romperse.

---

## 13. Accesibilidad

Implementado: HTML semántico, enlace "Saltar al contenido", navegación completa por teclado, foco visible, `aria-expanded` en menú y acordeones, cierre del menú con `Escape`, textos alternativos en imágenes, contraste conforme a WCAG AA y respeto por `prefers-reduced-motion` (si el usuario configuró su sistema para reducir animaciones, el sitio no las ejecuta).
