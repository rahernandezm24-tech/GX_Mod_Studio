const state = { files: { light: null, dark: null, audio: null, icon: null, sound: {}, keyboard: {} }, defaults: { light: 'wallpaper/light.png', dark: 'wallpaper/dark.png', audio: 'music/track_1.mp3', icon: 'icon_512.png' } };
const soundEvents = { CLICK: 'click.mp3', FEATURE_SWITCH_OFF: 'feature_switch_off.mp3', FEATURE_SWITCH_ON: 'feature_switch_on.mp3', HOVER: 'hover.mp3', HOVER_UP: 'hover.mp3', IMPORTANT_CLICK: 'important_click.mp3', LEVEL_UPGRADE: 'level_upgrade.mp3', LIMITER_OFF: 'limiter_off.mp3', LIMITER_ON: 'limiter_on.mp3', SWITCH_TOGGLE: 'switch.mp3', TAB_CLOSE: 'close_tab.mp3', TAB_INSERT: 'new_tab.mp3', TAB_SLASH: 'tab_slash.mp3' };
const keyboardEvents = { TYPING_BACKSPACE: ['backspace.wav'], TYPING_ENTER: ['enter.wav'], TYPING_LETTER: ['letter_1.wav', 'letter_2.wav', 'letter_3.wav'], TYPING_SPACE: ['space.wav'] };
const $ = (selector) => document.querySelector(selector);

const showToast = (message) => {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
};

function updatePreviewAsset(kind) {
  const canvas = $('#previewCanvas');
  const file = state.files[kind] || state.files[kind === 'light' ? 'dark' : 'light'];
  const oldVideo = canvas.querySelector('video');
  if (oldVideo) oldVideo.remove();
  canvas.style.backgroundImage = '';
  if (!file) {
    canvas.style.backgroundImage = `url('${state.defaults[kind]}')`;
    return;
  }
  const url = URL.createObjectURL(file);
  if (isVideo(file)) {
    const video = document.createElement('video');
    video.src = url;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.className = 'preview-video';
    canvas.prepend(video);
  } else {
    canvas.style.backgroundImage = `url('${url}')`;
  }
}

function updatePreview() {
  const name = $('#modName').value.trim() || 'Untitled Mod';
  $('#previewTab').textContent = name;
  $('#projectBadge').textContent = name.replace(/\s+/g, '_').toUpperCase().slice(0, 18);
}

function updateThemePreview() {
  const preview = $('#themeBrowserPreview');
  if (!preview) return;
  preview.style.setProperty('--theme-accent', $('#webAccent').value);
  preview.style.setProperty('--theme-base', $('#webBase').value);
}

function setSection(section) {
  document.querySelectorAll('.step').forEach((step) => step.classList.toggle('active', step.dataset.section === section));
  document.querySelectorAll('.editor-section').forEach((panel) => panel.classList.toggle('active', panel.id === `${section}Section`));
  const labels = { identity: ['Identidad del mod', '1 / 7'], wallpapers: ['Wallpapers', '2 / 7'], audio: ['Audio del mod', '3 / 7'], sound: ['Sonidos del navegador', '4 / 7'], keyboard: ['Keyboard sounds', '5 / 7'], webmodding: ['Webmodding / Temas', '6 / 7'], license: ['Licencia y créditos', '7 / 7'] };
  $('#sectionTitle').textContent = labels[section][0];
  $('.step-count').textContent = labels[section][1];
}

function renderEventPickers() {
  const groups = [{ kind: 'sound', container: '#soundEvents', events: Object.keys(soundEvents) }, { kind: 'keyboard', container: '#keyboardEvents', events: Object.keys(keyboardEvents) }];
  groups.forEach(({ kind, container, events }) => {
    $(container).innerHTML = events.map((event) => `<div class="event-row" data-kind="${kind}" data-event="${event}"><span class="event-icon">${kind === 'sound' ? '♪' : '⌨'}</span><div class="event-label"><strong>${event}</strong><small>${kind === 'sound' ? 'Browser sound' : 'Keyboard sound'}</small></div><input class="event-input" type="file" accept="audio/*,.wav,.mp3,.ogg" hidden><button class="event-button" type="button">Elegir archivo</button><span class="event-file">Predeterminado</span></div>`).join('');
    document.querySelectorAll(`${container} .event-row`).forEach((row) => {
      const input = row.querySelector('.event-input');
      const event = row.dataset.event;
      const choose = (file) => {
        if (!file || (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg)$/i.test(file.name))) return showToast('Selecciona un archivo de audio compatible.');
        state.files[kind][event] = file;
        row.querySelector('.event-file').textContent = file.name;
        row.classList.add('configured');
        showToast(`${event} actualizado`);
      };
      row.querySelector('.event-button').addEventListener('click', () => input.click());
      input.addEventListener('change', () => choose(input.files[0]));
      row.addEventListener('dragover', (dragEvent) => { dragEvent.preventDefault(); row.classList.add('dragover'); });
      row.addEventListener('dragleave', () => row.classList.remove('dragover'));
      row.addEventListener('drop', (dropEvent) => { dropEvent.preventDefault(); row.classList.remove('dragover'); choose(dropEvent.dataTransfer.files[0]); });
    });
  });
}

document.querySelectorAll('.step').forEach((step) => step.addEventListener('click', () => setSection(step.dataset.section)));
renderEventPickers();
document.querySelectorAll('#modName, #modCreator, #modDescription').forEach((input) => input.addEventListener('input', updatePreview));
document.querySelectorAll('.preview-mode').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.preview-mode').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const kind = button.dataset.preview;
  const isTheme = kind === 'theme';
  $('#browserPreview').classList.toggle('light', kind === 'light');
  $('#browserPreview').classList.toggle('theme-mode', isTheme);
  $('#previewStatus').textContent = isTheme ? 'Theme preview' : `${kind === 'light' ? 'Light' : 'Dark'} mode preview`;
  $('#previewFooterLabel').textContent = isTheme ? 'Opera GX theme' : 'Wallpaper only';
  if (isTheme) updateThemePreview();
  else updatePreviewAsset(kind);
}));
document.querySelectorAll('.theme-preset').forEach((preset) => preset.addEventListener('click', () => {
  document.querySelectorAll('.theme-preset').forEach((item) => item.classList.remove('active'));
  preset.classList.add('active');
  $('#webAccent').value = preset.dataset.accent;
  $('#webBase').value = preset.dataset.base;
  updateThemePreview();
}));
['#webAccent', '#webBase'].forEach((selector) => $(selector).addEventListener('input', updateThemePreview));
document.querySelectorAll('.drop-zone').forEach((zone) => {
  const input = zone.querySelector('.file-input');
  const kind = zone.dataset.kind;
  zone.querySelectorAll('.browse-button').forEach((button) => button.addEventListener('click', () => input.click()));
  input.addEventListener('change', () => input.files.length && acceptFiles(input.files, kind, zone));
  zone.addEventListener('dragover', (event) => { event.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (event) => { event.preventDefault(); zone.classList.remove('dragover'); if (event.dataTransfer.files.length) acceptFiles(event.dataTransfer.files, kind, zone); });
});

function acceptFiles(fileList, kind, zone) {
  const files = Array.from(fileList);
  if (kind === 'sound' || kind === 'keyboard') {
    const validFiles = files.filter((file) => file.type.startsWith('audio/') || /\.(mp3|wav|ogg)$/i.test(file.name));
    if (!validFiles.length) return showToast('Selecciona archivos de audio compatibles.');
    state.files[kind] = validFiles;
    zone.querySelector('.file-name').textContent = `${validFiles.length} archivo(s) seleccionado(s)`;
    return showToast(`${validFiles.length} sonido(s) añadido(s) al proyecto`);
  }
  acceptFile(files[0], kind, zone);
}

function acceptFile(file, kind, zone) {
  const valid = kind === 'audio' ? file.type.startsWith('audio/') : kind === 'icon' ? file.type === 'image/png' : file.type.startsWith('image/') || file.type.startsWith('video/');
  if (!valid) return showToast(kind === 'icon' ? 'El icono debe ser un PNG.' : 'Ese tipo de archivo no es compatible.');
  state.files[kind] = file;
  zone.querySelector('.file-name').textContent = file.name;
  if (kind === 'light' || kind === 'dark') updatePreviewAsset(kind);
  if (kind === 'icon') zone.querySelector('.icon-preview').textContent = '✓';
  showToast(`${file.name} añadido al proyecto`);
}

function isVideo(file) {
  return file && (file.type.startsWith('video/') || /\.(mp4|webm|ogv|mov)$/i.test(file.name));
}

function captureVideoFrame(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.addEventListener('loadeddata', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) resolve(blob);
        else reject(new Error('Could not capture video frame'));
      }, 'image/jpeg', 0.9);
    }, { once: true });
    video.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load video'));
    }, { once: true });
    video.src = url;
  });
}

let allowUnload = false;
window.addEventListener('beforeunload', (event) => { if (allowUnload) return; event.preventDefault(); event.returnValue = ''; });
$('#resetButton').addEventListener('click', () => { if (window.confirm('¿Restablecer el proyecto?')) { allowUnload = true; window.location.reload(); } });
document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') { event.preventDefault(); exportMod(); } });

function resizeImageToSquare(imageSource, size = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof Blob) {
      img.src = URL.createObjectURL(imageSource);
    } else if (imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      reject(new Error('Unsupported image source'));
      return;
    }

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);

      const scale = Math.min(size / img.width, size / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const offsetX = (size - drawWidth) / 2;
      const offsetY = (size - drawHeight) / 2;

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      canvas.toBlob((blob) => {
        if (typeof imageSource === 'string' || imageSource instanceof Blob || imageSource instanceof File) {
          if (imageSource instanceof Blob || imageSource instanceof File) {
            URL.revokeObjectURL(img.src);
          }
        }
        if (!blob) return reject(new Error('Could not generate resized icon'));
        resolve(blob);
      }, 'image/png');
    };

    img.onerror = () => {
      if (typeof imageSource === 'string' || imageSource instanceof Blob || imageSource instanceof File) {
        if (imageSource instanceof Blob || imageSource instanceof File) {
          URL.revokeObjectURL(img.src);
        }
      }
      reject(new Error('Could not load image for resizing'));
    };
  });
}

function hexToHsl(hex) {
  const value = hex.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16) / 255;
  const green = parseInt(value.slice(2, 4), 16) / 255;
  const blue = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }
  return { h: hue, s: Math.round(saturation * 100), l: Math.round(lightness * 100) };
}

function buildWebmodCss() {
  const accent = $('#webAccent').value;
  const base = $('#webBase').value;
  return `body { color: #f5f5f5; background: ${base}; border-color: ${accent}; }\n\na, button, [role="button"] { color: #ffffff; background-color: ${base}; border-color: ${accent}; }\n\na:hover, button:hover, [role="button"]:hover { background-color: ${accent}; }`;
}

async function exportMod() {
  const exportButton = $('#exportButton');
  if (exportButton.disabled) return;
  exportButton.disabled = true;
  exportButton.classList.add('is-exporting');
  if (!window.JSZip) {
    showToast('No se pudo cargar el exportador ZIP.');
    exportButton.disabled = false;
    exportButton.classList.remove('is-exporting');
    return;
  }
  try {
  const zip = new JSZip();
  const name = $('#modName').value.trim() || 'Untitled Mod';
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'gx-mod';
  const assetPath = (kind, fallback) => state.files[kind] ? `${kind === 'audio' ? 'music' : kind === 'icon' ? '' : 'wallpaper'}${kind === 'icon' ? '' : '/'}${state.files[kind].name}` : fallback;
  const wallpaper = {};
  const defaultAssets = {};
  for (const kind of ['light', 'dark', 'audio']) {
    if (state.files[kind]) {
      const path = assetPath(kind, state.defaults[kind]);
      zip.file(path, state.files[kind]);
      if (kind !== 'audio') {
        wallpaper[kind] = { image: path, text_color: '#FFFFFF', text_shadow: '#000000' };
        if (isVideo(state.files[kind])) {
          const firstFrame = `wallpaper/${state.files[kind].name}.first-frame.jpg`;
          try {
            zip.file(firstFrame, await captureVideoFrame(state.files[kind]));
            wallpaper[kind].first_frame = firstFrame;
          } catch (error) {
            console.warn(`Could not capture ${kind} video first frame`, error);
          }
        }
      }
    } else {
      try {
        const response = await fetch(state.defaults[kind]);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        defaultAssets[kind] = await response.blob();
        zip.file(state.defaults[kind], defaultAssets[kind]);
      } catch (error) { console.warn(`Could not include default ${kind}`, error); }
    }
  }
  if (state.files.dark && !state.files.light) wallpaper.light = { ...wallpaper.dark };
  if (state.files.light && !state.files.dark) wallpaper.dark = { ...wallpaper.light };
  for (const kind of ['light', 'dark']) {
    if (!wallpaper[kind] && defaultAssets[kind]) wallpaper[kind] = { image: state.defaults[kind], text_color: '#FFFFFF', text_shadow: '#000000' };
  }
  let iconPath = 'icon_256.png';
  try {
    const iconBlob = state.files.icon
      ? await resizeImageToSquare(state.files.icon)
      : await resizeImageToSquare(await (await fetch(state.defaults.icon)).blob());
    zip.file(iconPath, iconBlob);
  } catch (error) {
    console.warn('Could not prepare icon at 256x256', error);
    if (state.files.icon) {
      zip.file(state.files.icon.name, state.files.icon);
      iconPath = state.files.icon.name;
    } else {
      const response = await fetch(state.defaults.icon);
      const icon = await response.blob();
      zip.file(state.defaults.icon, icon);
      iconPath = state.defaults.icon;
    }
  }
  const browserSounds = {};
  for (const [event, fallback] of Object.entries(soundEvents)) {
    const custom = state.files.sound[event];
    const path = custom ? `sound/${custom.name}` : `sound/${fallback}`;
    if (custom) zip.file(path, custom);
    else { const response = await fetch(path); zip.file(path, await response.blob()); }
    browserSounds[event] = [path];
  }
  const keyboardSounds = {};
  for (const [event, fallbacks] of Object.entries(keyboardEvents)) {
    const custom = state.files.keyboard[event];
    const paths = custom ? [`keyboard/${custom.name}`] : fallbacks.map((fallback) => `keyboard/${fallback}`);
    if (custom) zip.file(paths[0], custom);
    keyboardSounds[event] = paths;
    if (!custom) for (const fallback of fallbacks) { const response = await fetch(`keyboard/${fallback}`); zip.file(`keyboard/${fallback}`, await response.blob()); }
  }
  const accent = hexToHsl($('#webAccent').value);
  const base = hexToHsl($('#webBase').value);
  zip.file('webmodding/opera.css', buildWebmodCss());
  const manifest = { name, description: $('#modDescription').value.trim(), developer: { name: $('#modCreator').value.trim() || 'GX Creator' }, manifest_version: 3, mod: { license: 'license.txt', payload: { background_music: [assetPath('audio', 'music/track_1.mp3')], browser_sounds: browserSounds, keyboard_sounds: keyboardSounds, page_styles: [{ css: ['webmodding/opera.css'], matches: ['https://*.opera.com/*'] }], theme: { dark: { gx_accent: accent, gx_secondary_base: base }, light: { gx_accent: { ...accent, l: Math.min(95, accent.l + 8) }, gx_secondary_base: { ...base, l: Math.min(30, base.l + 8) } } }, wallpaper }, schema_version: 1 }, version: '1.0' };
  if (iconPath) manifest.icons = { '256': iconPath };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('license.txt', $('#licenseText').value.trim() || 'This mod is provided for personal, non-commercial use in Opera GX.');
  const blob = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${safeName}.zip`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Tu mod está listo para descargar');
  } catch (error) {
    console.error('Could not export mod', error);
    showToast('No se pudo exportar el mod. Revisa tus archivos e inténtalo de nuevo.');
  } finally {
    exportButton.disabled = false;
    exportButton.classList.remove('is-exporting');
  }
}

updatePreview();
updatePreviewAsset('dark');
$('#exportButton').addEventListener('click', exportMod);
