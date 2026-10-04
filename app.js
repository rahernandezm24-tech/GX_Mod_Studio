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

function setSection(section) {
  document.querySelectorAll('.step').forEach((step) => step.classList.toggle('active', step.dataset.section === section));
  document.querySelectorAll('.editor-section').forEach((panel) => panel.classList.toggle('active', panel.id === `${section}Section`));
  const labels = { identity: ['Identidad del mod', '1 / 6'], wallpapers: ['Wallpapers', '2 / 6'], audio: ['Audio del mod', '3 / 6'], sound: ['Sonidos del navegador', '4 / 6'], keyboard: ['Keyboard sounds', '5 / 6'], license: ['Licencia y créditos', '6 / 6'] };
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
  $('#browserPreview').classList.toggle('light', kind === 'light');
  $('#previewStatus').textContent = `${kind === 'light' ? 'Light' : 'Dark'} mode preview`;
  updatePreviewAsset(kind);
}));
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

async function exportMod() {
  if (!window.JSZip) return showToast('No se pudo cargar el exportador ZIP.');
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
  let iconPath;
  if (state.files.icon) {
    iconPath = state.files.icon.name;
    zip.file(iconPath, state.files.icon);
  } else {
    try {
      const response = await fetch(state.defaults.icon);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const icon = await response.blob();
      iconPath = state.defaults.icon;
      zip.file(iconPath, icon);
    } catch (error) { console.warn('Could not include default icon', error); }
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
  const manifest = { name, description: $('#modDescription').value.trim(), developer: { name: $('#modCreator').value.trim() || 'GX Creator' }, manifest_version: 3, mod: { license: 'license.txt', payload: { background_music: [assetPath('audio', 'music/track_1.mp3')], browser_sounds: browserSounds, keyboard_sounds: keyboardSounds, wallpaper }, schema_version: 1 }, version: '1.0' };
  if (iconPath) manifest.icons = { '512': iconPath };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('license.txt', $('#licenseText').value.trim() || 'This mod is provided for personal, non-commercial use in Opera GX.');
  const blob = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${safeName}.zip`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Tu mod está listo para descargar');
}

updatePreview();
updatePreviewAsset('dark');
$('#exportButton').addEventListener('click', exportMod);
