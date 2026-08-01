// ==========================================================================
// ChatGPT Classic — Gemini Edition — app.js
// ==========================================================================

// ---- Model catalog (single source of truth) --------------------------------
const MODEL_CATALOG = [
  // ---- Text ----
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', group: '📝 متنی', category: 'text', desc: 'جدیدترین مدل فلش — سریع، پنجره ۱M توکن' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', group: '📝 متنی', category: 'text', desc: 'مدل پایدار و سریع، ۱M توکن' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', group: '📝 متنی', category: 'text', desc: 'نسخه سبک، مصرف کم' },
  { id: 'gemini-3.1-flash', name: 'Gemini 3.1 Flash', group: '📝 متنی', category: 'text', desc: 'مدل همه‌کاره' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', group: '📝 متنی', category: 'text', desc: 'سبک‌ترین نسخه' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', group: '📝 متنی', category: 'text', desc: 'نسخه حرفه‌ای و قدرتمند' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', group: '📝 متنی', category: 'text', desc: 'Pro جدیدتر' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', group: '📝 متنی', category: 'text', desc: 'Pro پایدار' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', group: '📝 متنی', category: 'text', desc: 'نسخه سبک ۲.۵' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', group: '📝 متنی', category: 'text', desc: 'مدل فلش ۲.۰' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', group: '📝 متنی', category: 'text', desc: 'همیشه آخرین نسخه فلش' },
  { id: 'gemini-pro-latest', name: 'Gemini Pro Latest', group: '📝 متنی', category: 'text', desc: 'همیشه آخرین نسخه Pro' },
  { id: 'gemini-omni-flash-preview', name: 'Gemini Omni Flash Preview', group: '📝 متنی', category: 'text', desc: 'چندوجهی، ۱۳۱K توکن' },
  { id: 'aqa', name: 'AQA', group: '📝 متنی', category: 'text', desc: 'پاسخ‌گویی مستند' },
  { id: 'deep-research-preview', name: 'Deep Research', group: '📝 متنی', category: 'text', desc: 'تحقیق عمیق' },
  { id: 'deep-research-pro-preview', name: 'Deep Research Pro', group: '📝 متنی', category: 'text', desc: 'تحقیق عمیق حرفه‌ای' },
  { id: 'deep-research-max-preview', name: 'Deep Research Max', group: '📝 متنی', category: 'text', desc: 'تحقیق عمیق Max' },
  { id: 'gemma-4-31b-it', name: 'Gemma 4 31B IT', group: '📝 متنی', category: 'text', desc: 'مدل متن‌باز ۳۱ میلیاردی' },
  { id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B MoE IT', group: '📝 متنی', category: 'text', desc: 'مدل متن‌باز MoE' },

  // ---- Image (native Gemini — generateContent + responseModalities) ----
  { id: 'gemini-3.1-flash-image', name: 'Nano Banana 2', group: '🎨 تصویر', category: 'gemini-image', desc: 'جدیدترین مدل تصویر Gemini' },
  { id: 'gemini-3.1-flash-lite-image', name: 'Nano Banana 2 Lite', group: '🎨 تصویر', category: 'gemini-image', desc: 'نسخه سبک و ارزان' },
  { id: 'gemini-3-pro-image-preview', name: 'Nano Banana Pro', group: '🎨 تصویر', category: 'gemini-image', desc: 'کیفیت حرفه‌ای' },
  { id: 'gemini-2.5-flash-image', name: 'Nano Banana', group: '🎨 تصویر', category: 'gemini-image', desc: 'مدل پایدار و پرسرعت' },

  // ---- Image (Imagen — predict endpoint) ----
  { id: 'imagen-4.0-generate-001', name: 'Imagen 4', group: '🎨 تصویر', category: 'imagen', desc: 'کیفیت بالا — endpoint مجزا' },
  { id: 'imagen-4.0-ultra-generate-001', name: 'Imagen 4 Ultra', group: '🎨 تصویر', category: 'imagen', desc: 'بالاترین کیفیت' },
  { id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4 Fast', group: '🎨 تصویر', category: 'imagen', desc: 'سریع و مقرون‌به‌صرفه' },

  // ---- Audio TTS ----
  { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS', group: '🎵 صوتی', category: 'tts', desc: 'تبدیل متن به گفتار' },
  { id: 'gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro TTS', group: '🎵 صوتی', category: 'tts', desc: 'کیفیت بالاتر' },
  { id: 'gemini-3.1-flash-tts-preview', name: 'Gemini 3.1 Flash TTS', group: '🎵 صوتی', category: 'tts', desc: 'جدیدترین TTS' },

  // ---- Music (not wired — different streaming protocol) ----
  { id: 'lyria-3-clip-preview', name: 'Lyria 3 Clip', group: '🎶 موسیقی', category: 'music', desc: 'تولید قطعه کوتاه موسیقی' },
  { id: 'lyria-3-pro-preview', name: 'Lyria 3 Pro', group: '🎶 موسیقی', category: 'music', desc: 'کیفیت حرفه‌ای' },

  // ---- Video ----
  { id: 'veo-3.1-generate-preview', name: 'Veo 3.1', group: '🎬 ویدیو', category: 'video', desc: 'تولید ویدیو — ممکن است چند دقیقه طول بکشد' },

  // ---- Unsupported for chat ----
  { id: 'gemini-embedding-2', name: 'Gemini Embedding 2', group: '🔍 تخصصی', category: 'unsupported', desc: 'فقط API — بردار متن' },
  { id: 'gemini-embedding-001', name: 'Gemini Embedding 001', group: '🔍 تخصصی', category: 'unsupported', desc: 'فقط API — بردار متن' },
  { id: 'gemini-robotics-er-2-preview', name: 'Gemini Robotics ER 2', group: '🔍 تخصصی', category: 'unsupported', desc: 'رباتیک' },
  { id: 'antigravity-preview-05-2026', name: 'Antigravity Agent', group: '🔍 تخصصی', category: 'unsupported', desc: 'عامل هوشمند' },
  { id: 'gemini-2.5-computer-use-preview', name: 'Computer Use', group: '🔍 تخصصی', category: 'unsupported', desc: 'کنترل کامپیوتر' },
];

const CATEGORY_META = {
  text:          { label: 'متنی',   icon: 'fa-comment-dots' },
  'gemini-image':{ label: 'تصویر',  icon: 'fa-image' },
  imagen:        { label: 'تصویر',  icon: 'fa-image' },
  tts:           { label: 'صوتی',   icon: 'fa-microphone-lines' },
  music:         { label: 'موسیقی', icon: 'fa-music' },
  video:         { label: 'ویدیو',  icon: 'fa-clapperboard' },
  unsupported:   { label: 'تخصصی',  icon: 'fa-triangle-exclamation' },
};

const SUGGESTIONS = [
  'یک ایده برای پروژه برنامه‌نویسی بده',
  'یک تصویر از یک شهر آینده‌نگر بساز',
  'خلاصه‌ای از یک کتاب معروف بنویس',
  'یک متن با صدای Kore تولید کن',
];

function findModel(id) { return MODEL_CATALOG.find(m => m.id === id) || MODEL_CATALOG[0]; }

document.addEventListener('DOMContentLoaded', () => {
  // ---- DOM refs ----
  const $ = (id) => document.getElementById(id);
  const promptInput = $('promptInput');
  const sendBtn = $('sendBtn');
  const welcomeContainer = $('welcomeContainer');
  const messagesList = $('messagesList');
  const modelSelect = $('modelSelect');
  const currentModelName = $('currentModelName');
  const modelCatIcon = $('modelCatIcon');
  const modelDropdownBadge = $('modelDropdownBadge');
  const modelContextBar = $('modelContextBar');
  const modelDescBox = $('modelDescBox');
  const categoryPills = $('categoryPills');
  const dynamicParams = $('dynamicParams');
  const suggestionChips = $('suggestionChips');
  const chatContent = $('chatContent');
  const toastStack = $('toastStack');
  const connStatus = $('connStatus');

  const settingsModal = $('settingsModal');
  const openSettingsLink = $('openSettingsLink');
  const settingsGearBtn = $('settingsGearBtn');
  const closeModalBtn = $('closeModalBtn');
  const saveSettingsBtn = $('saveSettingsBtn');
  const testConnBtn = $('testConnBtn');
  const systemInstructionInput = $('systemInstruction');
  const themeToggleBtn = $('themeToggleBtn');
  const memoryEnabledToggle = $('memoryEnabledToggle');
  const memoryBox = $('memoryBox');
  const clearMemoryBtn = $('clearMemoryBtn');

  const sidebar = $('sidebar');
  const closeSidebarBtn = $('closeSidebarBtn');
  const openSidebarBtn = $('openSidebarBtn');
  const newChatBtn = $('newChatBtn');
  const saveChatBtn = $('saveChatBtn');

  // File upload elements with new design
  const fileUploadBtn = $('fileUploadBtn');
  const fileInput = $('fileInput');
  const fileBadge = $('fileBadge');
  const fileNameDisplay = $('fileNameDisplay');

  // ---- State ----
  let state = {
    modelId: localStorage.getItem('selectedModel') || 'gemini-3.6-flash',
    systemPrompt: localStorage.getItem('systemPrompt') || '',
    theme: localStorage.getItem('theme') || 'light',
    params: JSON.parse(localStorage.getItem('genParams') || '{}'),
    memoryEnabled: localStorage.getItem('memoryEnabled') !== 'false',
    longTermMemory: '',
    currentChatId: null,
    uploadedFile: null,
  };
  let conversationHistory = [];
  let pendingModelId = state.modelId;
  let lastSavedChat = null;

  // ---- Client id ----
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = (crypto.randomUUID ? crypto.randomUUID() : 'uid-' + Date.now() + '-' + Math.random().toString(16).slice(2));
    localStorage.setItem('clientId', clientId);
  }

  // defaults for generation params
  state.params.temperature ??= 1.0;
  state.params.maxOutputTokens ??= 2048;
  state.params.topP ??= 0.95;
  state.params.voiceName ??= 'Kore';
  state.params.imagenAspectRatio ??= '1:1';
  state.params.imagenSampleCount ??= 1;

  applyTheme(state.theme);

  // ---- Long-term memory (Cloudflare KV) ----
  memoryEnabledToggle.checked = state.memoryEnabled;
  memoryEnabledToggle.addEventListener('change', () => {
    state.memoryEnabled = memoryEnabledToggle.checked;
    localStorage.setItem('memoryEnabled', String(state.memoryEnabled));
  });

  clearMemoryBtn.addEventListener('click', async () => {
    if (!confirm('حافظه بلندمدت برای همیشه پاک شود؟')) return;
    clearMemoryBtn.disabled = true;
    try {
      const res = await fetch('/api/memory?uid=' + encodeURIComponent(clientId), { method: 'DELETE' });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || data.error);
      state.longTermMemory = '';
      memoryBox.value = '';
      showToast('حافظه پاک شد', 'success');
    } catch (err) {
      showToast('حذف حافظه ناموفق بود: ' + err.message, 'error');
    } finally {
      clearMemoryBtn.disabled = false;
    }
  });

  async function loadMemory() {
    try {
      const res = await fetch('/api/memory?uid=' + encodeURIComponent(clientId));
      const data = await res.json();
      if (!data.error) {
        state.longTermMemory = data.memory || '';
        memoryBox.value = state.longTermMemory;
      }
    } catch (err) { /* silently ignore */ }
  }
  loadMemory();

  function buildSystemInstruction() {
    let sys = state.systemPrompt || '';
    if (state.memoryEnabled && state.longTermMemory) {
      sys += (sys ? '\n\n' : '') + '--- حافظه بلندمدت درباره کاربر (از گفتگوهای قبلی) ---\n' + state.longTermMemory;
    }
    return sys ? { parts: [{ text: sys }] } : undefined;
  }

  async function updateLongTermMemory(userText, assistantText) {
    if (!state.memoryEnabled) return;
    try {
      const extractPrompt =
        'حافظه فعلی کاربر (فهرست نکات پایدار):\n' + (state.longTermMemory || '(خالی)') +
        '\n\nتبادل جدید:\nکاربر: ' + userText + '\nپاسخ دستیار: ' + assistantText +
        '\n\nوظیفه: فقط نکات پایدار و مهم درباره کاربر (نام، شغل، علایق، ترجیحات، پروژه‌های در حال انجام) را از «تبادل جدید» استخراج کن و با «حافظه فعلی» ادغام کن. ' +
        'نکات موقتی، احساسات لحظه‌ای، سوالات عمومی را ذخیره نکن. ' +
        'فقط فهرست نهایی به‌روزشده را به‌صورت خطوط bullet (هر خط با -) و به فارسی خروجی بده، بدون هیچ توضیح اضافه. ' +
        'اگر نکته پایدار جدیدی وجود نداشت، همان حافظه فعلی را بدون تغییر برگردان.';

      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-flash-latest',
          contents: [{ role: 'user', parts: [{ text: extractPrompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
        }),
      });
      const data = await res.json();
      const newMemory = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (newMemory === undefined || newMemory === state.longTermMemory) return;
      state.longTermMemory = newMemory;
      memoryBox.value = newMemory;
      await fetch('/api/memory', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: clientId, memory: newMemory }),
      });
    } catch (err) {
      console.warn('memory update failed', err);
    }
  }

  // ---- Populate model <select> ----
  function renderModelOptions(filterCategory) {
    modelSelect.innerHTML = '';
    const groups = {};
    MODEL_CATALOG.forEach(m => {
      if (filterCategory && filterCategory !== 'all' && m.category !== filterCategory) return;
      if (!groups[m.group]) groups[m.group] = [];
      groups[m.group].push(m);
    });
    Object.keys(groups).forEach(groupName => {
      const og = document.createElement('optgroup');
      og.label = groupName;
      groups[groupName].forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        if (m.id === pendingModelId) opt.selected = true;
        og.appendChild(opt);
      });
      modelSelect.appendChild(og);
    });
    updateModelDescBox();
  }

  function updateModelDescBox() {
    const m = findModel(modelSelect.value);
    modelDescBox.innerHTML = `<i class="fa-solid ${CATEGORY_META[m.category].icon}"></i> ${escapeHtml(m.desc)}`;
  }

  // ---- Category pills ----
  const categories = ['all', 'text', 'gemini-image', 'imagen', 'tts', 'music', 'video', 'unsupported'];
  const categoryLabels = { all: 'همه', text: '📝 متنی', 'gemini-image': '🎨 تصویر (Gemini)', imagen: '🎨 تصویر (Imagen)', tts: '🎵 صوتی', music: '🎶 موسیقی', video: '🎬 ویدیو', unsupported: '🔍 تخصصی' };
  let activeCategory = 'all';
  categories.forEach(cat => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'cat-pill' + (cat === 'all' ? ' active' : '');
    pill.textContent = categoryLabels[cat];
    pill.dataset.cat = cat;
    pill.addEventListener('click', () => {
      activeCategory = cat;
      categoryPills.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p === pill));
      renderModelOptions(cat);
    });
    categoryPills.appendChild(pill);
  });

  modelSelect.addEventListener('change', () => {
    pendingModelId = modelSelect.value;
    updateModelDescBox();
    renderDynamicParams();
  });

  // ---- Dynamic params ----
  function renderDynamicParams() {
    const m = findModel(pendingModelId);
    dynamicParams.innerHTML = '';

    function sliderRow(key, label, min, max, step, hint, fmt) {
      const row = document.createElement('div');
      row.className = 'param-row';
      const value = state.params[key];
      row.innerHTML = `
        <div class="param-head"><span>${label}</span><span class="val">${fmt ? fmt(value) : value}</span></div>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${value}">
        <div class="param-hint">${hint}</div>`;
      const input = row.querySelector('input');
      const valSpan = row.querySelector('.val');
      input.addEventListener('input', () => {
        state.params[key] = parseFloat(input.value);
        valSpan.textContent = fmt ? fmt(state.params[key]) : state.params[key];
      });
      dynamicParams.appendChild(row);
    }

    if (m.category === 'text' || m.category === 'gemini-image') {
      sliderRow('temperature', 'دما (Temperature)', 0, 2, 0.05, 'مقدار بالاتر = خلاقانه‌تر', v => v.toFixed(2));
      sliderRow('topP', 'Top-P', 0, 1, 0.01, 'کنترل تنوع کلمات', v => v.toFixed(2));
      sliderRow('maxOutputTokens', 'حداکثر توکن خروجی', 256, 8192, 256, 'محدودیت طول پاسخ');
    }
    if (m.category === 'tts') {
      const row = document.createElement('div');
      row.className = 'param-row';
      row.innerHTML = `
        <div class="param-head"><span>نام صدا (Voice)</span></div>
        <input type="text" class="form-control" id="voiceNameInput" value="${escapeHtml(state.params.voiceName)}" placeholder="مثلاً Kore, Puck, Zephyr">
        <div class="param-hint">لیست کامل صداها در مستندات Gemini TTS</div>`;
      dynamicParams.appendChild(row);
      row.querySelector('#voiceNameInput').addEventListener('input', (e) => { state.params.voiceName = e.target.value.trim() || 'Kore'; });
    }
    if (m.category === 'imagen') {
      const row = document.createElement('div');
      row.className = 'param-row';
      row.innerHTML = `
        <div class="param-head"><span>نسبت تصویر (Aspect Ratio)</span></div>
        <select class="form-control" id="aspectRatioSelect">
          ${['1:1','16:9','9:16','4:3','3:4'].map(r => `<option value="${r}" ${state.params.imagenAspectRatio===r?'selected':''}>${r}</option>`).join('')}
        </select>`;
      dynamicParams.appendChild(row);
      row.querySelector('#aspectRatioSelect').addEventListener('change', (e) => { state.params.imagenAspectRatio = e.target.value; });
      sliderRow('imagenSampleCount', 'تعداد تصاویر', 1, 4, 1, 'تعداد تصویر در هر درخواست');
    }
    if (m.category === 'music' || m.category === 'video' || m.category === 'unsupported') {
      const note = document.createElement('div');
      note.className = 'model-desc';
      note.style.marginTop = '4px';
      note.innerHTML = m.category === 'video'
        ? '<i class="fa-solid fa-circle-info"></i> تولید ویدیو زمان‌بر و غیرهمزمان است.'
        : '<i class="fa-solid fa-circle-info"></i> این دسته در این نسخه پشتیبانی کامل ندارند.';
      dynamicParams.appendChild(note);
    }
  }

  // ---- Init ----
  renderModelOptions('all');
  renderDynamicParams();
  systemInstructionInput.value = state.systemPrompt;
  updateHeaderForModel(state.modelId);
  suggestionChips.innerHTML = SUGGESTIONS.map(s => `<button class="suggestion-chip">${escapeHtml(s)}</button>`).join('');
  suggestionChips.querySelectorAll('.suggestion-chip').forEach((chip, i) => {
    chip.addEventListener('click', () => { promptInput.value = SUGGESTIONS[i]; promptInput.dispatchEvent(new Event('input')); promptInput.focus(); });
  });

  // ---- Theme ----
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    themeToggleBtn.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
  themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    applyTheme(state.theme);
  });

  // ---- Header / context bar ----
  function updateHeaderForModel(modelId) {
    const m = findModel(modelId);
    currentModelName.textContent = m.name;
    modelCatIcon.innerHTML = `<i class="fa-solid ${CATEGORY_META[m.category].icon}"></i>`;
    if (m.category === 'unsupported') {
      modelContextBar.style.display = 'flex';
      modelContextBar.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> این مدل برای گفتگو مناسب نیست — لطفاً از تنظیمات یک مدل دیگر انتخاب کنید.`;
    } else if (m.category === 'video') {
      modelContextBar.style.display = 'flex';
      modelContextBar.innerHTML = `<i class="fa-solid fa-clapperboard"></i> حالت تولید ویدیو فعال — ممکن است چند دقیقه طول بکشد.`;
    } else if (m.category === 'tts') {
      modelContextBar.style.display = 'flex';
      modelContextBar.innerHTML = `<i class="fa-solid fa-microphone-lines"></i> حالت تبدیل متن به گفتار — صدا: ${escapeHtml(state.params.voiceName)}`;
    } else if (m.category === 'gemini-image' || m.category === 'imagen') {
      modelContextBar.style.display = 'flex';
      modelContextBar.innerHTML = `<i class="fa-solid fa-image"></i> حالت تولید تصویر فعال`;
    } else {
      modelContextBar.style.display = 'none';
    }
  }

  // ---- Textarea autosize ----
  promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 180) + 'px';
    sendBtn.disabled = promptInput.value.trim() === '' && !state.uploadedFile;
  });

  // ---- Sidebar ----
  closeSidebarBtn.addEventListener('click', () => sidebar.classList.add('closed'));
  openSidebarBtn.addEventListener('click', () => sidebar.classList.remove('closed'));

  // ============================================================
  // FILE UPLOAD — NEW DESIGN WITH BADGE & FILE NAME DISPLAY
  // ============================================================
  
  // Clear uploaded file function
  function clearUploadedFile() {
    state.uploadedFile = null;
    fileBadge.style.display = 'none';
    if (fileNameDisplay) {
      fileNameDisplay.style.display = 'none';
      fileNameDisplay.innerHTML = '';
    }
    fileUploadBtn.classList.remove('has-file');
    promptInput.placeholder = 'هر چه می‌خواهید بپرسید...';
    sendBtn.disabled = promptInput.value.trim() === '';
  }

  // Update file badge
  function updateFileBadge() {
    if (state.uploadedFile) {
      fileBadge.textContent = '1';
      fileBadge.style.display = 'flex';
      fileUploadBtn.classList.add('has-file');
      
      // Show file name
      const file = state.uploadedFile;
      const fileIcon = file.mimeType.startsWith('image/') ? 'fa-image' : 'fa-file-lines';
      fileNameDisplay.innerHTML = `
        <i class="fa-regular ${fileIcon} file-icon"></i>
        <span class="file-name-text" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
        <button class="file-remove-btn" id="removeFileBtn" title="حذف فایل">
          <i class="fa-regular fa-circle-xmark"></i>
        </button>
      `;
      fileNameDisplay.style.display = 'flex';
      
      // Remove button handler
      const removeBtn = document.getElementById('removeFileBtn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          clearUploadedFile();
        });
      }
      
      promptInput.placeholder = `📎 ${file.name} — پیام خود را تایپ کنید...`;
    } else {
      fileBadge.style.display = 'none';
      fileUploadBtn.classList.remove('has-file');
      fileNameDisplay.style.display = 'none';
      fileNameDisplay.innerHTML = '';
      promptInput.placeholder = 'هر چه می‌خواهید بپرسید...';
    }
  }

  // File upload button click
  fileUploadBtn.addEventListener('click', () => fileInput.click());

  // File input change handler
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم فایل نباید بیشتر از ۵ مگابایت باشد', 'error');
      fileInput.value = '';
      return;
    }

    // Check if image or text file
    const validTypes = ['image/', 'text/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const isValid = validTypes.some(type => file.type.startsWith(type) || file.type === type);
    
    if (!isValid) {
      showToast('فقط تصاویر و فایل‌های متنی پشتیبانی می‌شوند', 'error');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      state.uploadedFile = {
        data: base64,
        mimeType: file.type,
        name: file.name,
        size: file.size,
      };
      
      updateFileBadge();
      showToast(`فایل "${file.name}" آپلود شد ✅`, 'success');
      sendBtn.disabled = false;
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });

  // ---- Modal ----
  function openModal() {
    pendingModelId = state.modelId;
    renderModelOptions(activeCategory);
    renderDynamicParams();
    memoryBox.value = state.longTermMemory;
    memoryEnabledToggle.checked = state.memoryEnabled;
    settingsModal.classList.add('active');
  }
  function closeModal() { settingsModal.classList.remove('active'); }
  openSettingsLink.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  settingsGearBtn.addEventListener('click', openModal);
  modelDropdownBadge.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(); });

  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.tab-panel[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    });
  });

  saveSettingsBtn.addEventListener('click', () => {
    const prevCategory = findModel(state.modelId).category;
    state.modelId = pendingModelId;
    state.systemPrompt = systemInstructionInput.value;
    localStorage.setItem('selectedModel', state.modelId);
    localStorage.setItem('systemPrompt', state.systemPrompt);
    localStorage.setItem('genParams', JSON.stringify(state.params));
    updateHeaderForModel(state.modelId);
    closeModal();
    const m = findModel(state.modelId);
    showToast(`مدل به «${m.name}» تغییر کرد`, 'success');
    const newCategory = m.category;
    if (newCategory !== prevCategory) {
      appendSystemNotice(`سویچ به مدل ${m.name} (${CATEGORY_META[m.category].label}) انجام شد.`);
    }
  });

  testConnBtn.addEventListener('click', testConnection);

  // ---- Chat Management (Save/Load/Delete) ----
  function saveCurrentChat() {
    if (conversationHistory.length === 0) {
      showToast('چیزی برای ذخیره وجود ندارد', 'error');
      return;
    }

    const title = getChatTitle();
    const chatId = state.currentChatId || 'chat_' + Date.now();
    const chatData = {
      id: chatId,
      title: title,
      history: conversationHistory,
      timestamp: Date.now(),
      model: state.modelId,
    };

    let chats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    const existingIndex = chats.findIndex(c => c.id === chatId);
    if (existingIndex !== -1) {
      chats[existingIndex] = chatData;
    } else {
      chats.push(chatData);
    }

    localStorage.setItem('savedChats', JSON.stringify(chats));
    state.currentChatId = chatId;
    lastSavedChat = JSON.stringify(chatData);
    loadChatsList();
    showToast('چت ذخیره شد ✅', 'success');
  }

  function getChatTitle() {
    const firstUser = conversationHistory.find(msg => msg.role === 'user');
    if (firstUser && firstUser.parts && firstUser.parts[0] && firstUser.parts[0].text) {
      const text = firstUser.parts[0].text;
      return text.length > 40 ? text.substring(0, 40) + '...' : text;
    }
    return 'چت بدون عنوان';
  }

  function loadChatsList() {
    const historyList = document.getElementById('chatHistoryList');
    const emptyMsg = document.getElementById('historyEmpty');
    const chats = JSON.parse(localStorage.getItem('savedChats') || '[]');

    historyList.querySelectorAll('.history-item').forEach(el => el.remove());

    if (chats.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }
    emptyMsg.style.display = 'none';

    chats.sort((a, b) => b.timestamp - a.timestamp);

    chats.forEach(chat => {
      const item = document.createElement('div');
      item.className = 'history-item';
      if (chat.id === state.currentChatId) item.classList.add('active');

      const date = new Date(chat.timestamp);
      const timeStr = date.toLocaleDateString('fa-IR') + ' ' + date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

      item.innerHTML = `
        <i class="fa-regular fa-comment"></i>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(chat.title)}</span>
        <span style="font-size:10px;color:var(--text-muted);direction:ltr;margin-left:4px;">${timeStr}</span>
        <button class="icon-btn delete-chat-btn" data-id="${chat.id}" style="width:24px;height:24px;font-size:11px;color:#dc2626;" title="حذف چت">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.delete-chat-btn')) return;
        loadChat(chat.id);
        sidebar.classList.add('closed');
      });

      const deleteBtn = item.querySelector('.delete-chat-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChat(chat.id);
      });

      historyList.appendChild(item);
    });
  }

  function loadChat(chatId) {
    const chats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    const chat = chats.find(c => c.id === chatId);
    if (!chat) {
      showToast('چت پیدا نشد', 'error');
      return;
    }

    messagesList.innerHTML = '';
    messagesList.style.display = 'flex';
    welcomeContainer.style.display = 'none';

    conversationHistory = chat.history || [];
    state.currentChatId = chat.id;

    chat.history.forEach(msg => {
      const row = document.createElement('div');
      row.className = `message-row ${msg.role === 'user' ? 'user' : 'assistant'}`;
      const isUser = msg.role === 'user';
      row.innerHTML = `
        <div class="avatar-mini">${isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-sparkles"></i>'}</div>
        <div class="message-col">
          <div class="message-bubble">${msg.parts && msg.parts[0] && msg.parts[0].text ? renderMarkdown(msg.parts[0].text) : ''}</div>
          <div class="msg-actions"></div>
        </div>
      `;
      messagesList.appendChild(row);

      if (!isUser) {
        const bubble = row.querySelector('.message-bubble');
        attachMessageEnhancements(bubble);
      }
    });

    if (chat.model) {
      state.modelId = chat.model;
      updateHeaderForModel(chat.model);
    }

    scrollToBottom();
    loadChatsList();
    showToast(`چت "${chat.title}" بارگذاری شد`, 'success');
  }

  function deleteChat(chatId) {
    if (!confirm('آیا این چت برای همیشه حذف شود؟')) return;

    let chats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    chats = chats.filter(c => c.id !== chatId);
    localStorage.setItem('savedChats', JSON.stringify(chats));

    if (state.currentChatId === chatId) {
      state.currentChatId = null;
      conversationHistory = [];
      messagesList.innerHTML = '';
      messagesList.style.display = 'none';
      welcomeContainer.style.display = 'flex';
      welcomeContainer.style.flexDirection = 'column';
    }

    loadChatsList();
    showToast('چت حذف شد', 'success');
  }

  function autoSaveChat() {
    if (conversationHistory.length === 0) return;

    const currentData = JSON.stringify(conversationHistory);
    if (currentData === lastSavedChat) return;

    if (!state.currentChatId) {
      state.currentChatId = 'chat_' + Date.now();
    }

    const title = getChatTitle();
    const chatData = {
      id: state.currentChatId,
      title: title,
      history: conversationHistory,
      timestamp: Date.now(),
      model: state.modelId,
    };

    let chats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    const existingIndex = chats.findIndex(c => c.id === state.currentChatId);
    if (existingIndex !== -1) {
      chats[existingIndex] = chatData;
    } else {
      chats.push(chatData);
    }

    localStorage.setItem('savedChats', JSON.stringify(chats));
    lastSavedChat = currentData;
    loadChatsList();
  }

  // ---- New Chat ----
  newChatBtn.addEventListener('click', () => {
    conversationHistory = [];
    state.currentChatId = null;
    lastSavedChat = null;
    messagesList.innerHTML = '';
    messagesList.style.display = 'none';
    welcomeContainer.style.display = 'flex';
    welcomeContainer.style.flexDirection = 'column';
    clearUploadedFile();
    loadChatsList();
    sidebar.classList.add('closed');
  });

  // ---- Save Chat Button ----
  saveChatBtn.addEventListener('click', saveCurrentChat);

  // ---- Enter to send ----
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (promptInput.value.trim() !== '' || state.uploadedFile) handleSend();
    }
  });
  sendBtn.addEventListener('click', handleSend);

  // ==========================================================================
  // SEND LOGIC
  // ==========================================================================
  async function handleSend() {
    const text = promptInput.value.trim();
    if (!text && !state.uploadedFile) return;

    const model = findModel(state.modelId);

    if (conversationHistory.length === 0 && !state.currentChatId) {
      state.currentChatId = 'chat_' + Date.now();
    }

    welcomeContainer.style.display = 'none';
    messagesList.style.display = 'flex';

    // Prepare user message
    let userParts = [];
    let displayText = text || '';

    if (state.uploadedFile) {
      const file = state.uploadedFile;
      if (file.mimeType.startsWith('image/')) {
        displayText = text || `[تصویر: ${file.name}]`;
        userParts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.data,
          }
        });
      } else {
        displayText = text ? `${text}\n\n📎 [فایل: ${file.name}]` : `📎 [فایل: ${file.name}]`;
        try {
          const decoded = atob(file.data);
          displayText += `\n\n--- محتوای فایل ---\n${decoded.substring(0, 4000)}${decoded.length > 4000 ? '...' : ''}`;
        } catch (e) {
          // Binary file
        }
      }
    }

    if (text) {
      userParts.push({ text: text });
    } else if (userParts.length === 0) {
      userParts.push({ text: displayText });
    }

    // Show user message
    appendUserMessage(displayText, state.uploadedFile);
    promptInput.value = '';
    promptInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Save file before clearing
    const uploadedFileCopy = state.uploadedFile;
    clearUploadedFile();

    if (model.category === 'unsupported') {
      appendNotice('این مدل (' + model.name + ') برای گفتگوی متنی پشتیبانی نمی‌شود.');
      sendBtn.disabled = false;
      return;
    }
    if (model.category === 'music') {
      appendNotice('مدل‌های موسیقی (Lyria) در این نسخه پشتیبانی نمی‌شوند.');
      sendBtn.disabled = false;
      return;
    }

    // Build conversation entry
    const userEntry = { role: 'user', parts: [] };
    if (uploadedFileCopy && uploadedFileCopy.mimeType.startsWith('image/')) {
      userEntry.parts.push({
        inlineData: {
          mimeType: uploadedFileCopy.mimeType,
          data: uploadedFileCopy.data,
        }
      });
    }
    if (text) {
      userEntry.parts.push({ text: text });
    }
    if (userEntry.parts.length === 0) {
      userEntry.parts.push({ text: displayText });
    }
    conversationHistory.push(userEntry);

    const { bubble, wrapper } = appendAssistantTyping();

    try {
      if (model.category === 'text' || model.category === 'gemini-image') {
        await handleGeminiGenerate(model, bubble, wrapper);
      } else if (model.category === 'imagen') {
        await handleImagenGenerate(model, text || displayText, bubble, wrapper);
      } else if (model.category === 'tts') {
        await handleTtsGenerate(model, text || displayText, bubble, wrapper);
      } else if (model.category === 'video') {
        await handleVideoGenerate(model, text || displayText, bubble, wrapper);
      }
      autoSaveChat();
    } catch (err) {
      renderError(bubble, 'خطا در ارتباط با سرور: ' + err.message);
    }

    scrollToBottom();
    sendBtn.disabled = false;
  }

  // ---- API Handlers ----
  async function handleGeminiGenerate(model, bubble) {
    const body = {
      model: model.id,
      contents: conversationHistory,
      systemInstruction: buildSystemInstruction(),
      generationConfig: {
        temperature: state.params.temperature,
        topP: state.params.topP,
        maxOutputTokens: state.params.maxOutputTokens,
      },
    };
    if (model.category === 'gemini-image') {
      body.generationConfig.responseModalities = ['TEXT', 'IMAGE'];
    }
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.error) return renderError(bubble, typeof data.error === 'string' ? data.error : (data.error.message || 'خطای نامشخص'));

    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts || !parts.length) return renderError(bubble, 'پاسخی از مدل دریافت نشد.');

    let html = '';
    let replyText = '';
    parts.forEach(part => {
      if (part.text) {
        replyText += part.text;
        html += renderMarkdown(part.text);
      } else if (part.inlineData) {
        html += `<img class="gen-image" src="data:${part.inlineData.mimeType};base64,${part.inlineData.data}" alt="تصویر تولیدشده">`;
      }
    });
    bubble.innerHTML = html;
    attachMessageEnhancements(bubble);
    conversationHistory.push({ role: 'model', parts: replyText ? [{ text: replyText }] : [] });

    if (model.category === 'text' && replyText) {
      const lastUserText = conversationHistory[conversationHistory.length - 2]?.parts?.[0]?.text || '';
      updateLongTermMemory(lastUserText, replyText);
    }
  }

  async function handleImagenGenerate(model, prompt, bubble) {
    const res = await fetch('/api/imagen', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: model.id, prompt, aspectRatio: state.params.imagenAspectRatio, sampleCount: state.params.imagenSampleCount }),
    });
    const data = await res.json();
    if (data.error) return renderError(bubble, typeof data.error === 'string' ? data.error : (data.error.message || 'خطای نامشخص'));
    const predictions = data.predictions || [];
    if (!predictions.length) return renderError(bubble, 'تصویری دریافت نشد.');
    bubble.innerHTML = predictions.map(p => `<img class="gen-image" src="data:image/png;base64,${p.bytesBase64Encoded}" alt="تصویر تولیدشده">`).join('');
    conversationHistory.push({ role: 'model', parts: [{ text: '[تصویر تولید شد]' }] });
  }

  async function handleTtsGenerate(model, text, bubble) {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.id,
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: state.params.voiceName } } },
        },
      }),
    });
    const data = await res.json();
    if (data.error) return renderError(bubble, typeof data.error === 'string' ? data.error : (data.error.message || 'خطای نامشخص'));
    const audioPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!audioPart) return renderError(bubble, 'صدایی دریافت نشد.');
    bubble.innerHTML = `<audio controls src="data:audio/wav;base64,${audioPart.inlineData.data}"></audio>`;
    conversationHistory.push({ role: 'model', parts: [{ text: '[پاسخ صوتی تولید شد]' }] });
  }

  async function handleVideoGenerate(model, prompt, bubble) {
    bubble.innerHTML = `<div class="notice-bubble"><i class="fa-solid fa-clapperboard"></i> در حال شروع تولید ویدیو... این فرآیند ممکن است چند دقیقه طول بکشد.</div>`;
    const startRes = await fetch('/api/video', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: model.id, prompt }) });
    const startData = await startRes.json();
    if (startData.error) return renderError(bubble, typeof startData.error === 'string' ? startData.error : (startData.error.message || 'خطا در شروع تولید ویدیو'));
    const opName = startData.name;
    if (!opName) return renderError(bubble, 'شناسه عملیات ویدیو دریافت نشد.');

    let attempts = 0;
    const poll = async () => {
      attempts++;
      const pollRes = await fetch('/api/video?op=' + encodeURIComponent(opName));
      const pollData = await pollRes.json();
      if (pollData.error) return renderError(bubble, typeof pollData.error === 'string' ? pollData.error : 'خطا در بررسی وضعیت ویدیو');
      if (pollData.done) {
        const uri = pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri
          || pollData.response?.videos?.[0]?.uri;
        if (uri) {
          bubble.innerHTML = `<video controls class="gen-image" src="${uri}"></video><div class="param-hint" style="margin-top:6px;">لینک مستقیم ویدیو</div>`;
        } else {
          bubble.innerHTML = `<div class="notice-bubble"><i class="fa-solid fa-circle-check"></i> عملیات کامل شد اما لینک ویدیو یافت نشد.</div>`;
        }
        conversationHistory.push({ role: 'model', parts: [{ text: '[ویدیو تولید شد]' }] });
        scrollToBottom();
        return;
      }
      if (attempts > 40) {
        bubble.innerHTML = `<div class="notice-bubble"><i class="fa-solid fa-clock"></i> تولید ویدیو هنوز تمام نشده؛ لطفاً بعداً بررسی کنید.</div>`;
        return;
      }
      bubble.innerHTML = `<div class="notice-bubble"><i class="fa-solid fa-spinner fa-spin"></i> در حال تولید ویدیو... (بررسی ${attempts})</div>`;
      setTimeout(poll, 8000);
    };
    setTimeout(poll, 5000);
  }

  // ---- Connection test ----
  async function testConnection() {
    connStatus.className = 'user-plan';
    connStatus.innerHTML = '<span class="dot"></span> در حال بررسی...';
    testConnBtn.disabled = true;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gemini-flash-latest', contents: [{ role: 'user', parts: [{ text: 'ping' }] }], generationConfig: { maxOutputTokens: 8 } }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || data.error);
      connStatus.className = 'user-plan online';
      connStatus.innerHTML = '<span class="dot"></span> متصل';
      showToast('اتصال به Gemini برقرار است', 'success');
    } catch (err) {
      connStatus.className = 'user-plan offline';
      connStatus.innerHTML = '<span class="dot"></span> قطع';
      showToast('اتصال ناموفق بود — کلید API را بررسی کنید', 'error');
    } finally {
      testConnBtn.disabled = false;
    }
  }
  testConnection();

  // ---- Rendering helpers ----
  function appendUserMessage(text, file) {
    const row = document.createElement('div');
    row.className = 'message-row user';
    let content = escapeHtml(text);
    if (file && file.mimeType.startsWith('image/')) {
      content += `<br><img class="gen-image" src="data:${file.mimeType};base64,${file.data}" alt="${escapeHtml(file.name)}" style="max-width:200px;max-height:200px;border-radius:8px;">`;
    }
    row.innerHTML = `
      <div class="avatar-mini"><i class="fa-solid fa-user"></i></div>
      <div class="message-col">
        <div class="message-bubble">${content}</div>
      </div>`;
    messagesList.appendChild(row);
    scrollToBottom();
  }

  function appendAssistantTyping() {
    const row = document.createElement('div');
    row.className = 'message-row assistant';
    row.innerHTML = `
      <div class="avatar-mini"><i class="fa-solid fa-sparkles"></i></div>
      <div class="message-col">
        <div class="message-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>
        <div class="msg-actions"></div>
      </div>`;
    messagesList.appendChild(row);
    scrollToBottom();
    return { bubble: row.querySelector('.message-bubble'), wrapper: row };
  }

  function appendNotice(text) {
    const row = document.createElement('div');
    row.className = 'message-row assistant';
    row.innerHTML = `<div class="avatar-mini"><i class="fa-solid fa-sparkles"></i></div><div class="message-col"><div class="notice-bubble"><i class="fa-solid fa-circle-info"></i> ${escapeHtml(text)}</div></div>`;
    messagesList.appendChild(row);
    scrollToBottom();
  }

  function appendSystemNotice(text) {
    if (messagesList.style.display === 'none') return;
    appendNotice(text);
  }

  function renderError(bubble, msg) {
    bubble.innerHTML = `<div class="error-bubble"><i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(msg)}</div>`;
  }

  function renderMarkdown(text) {
    const raw = marked.parse(text);
    return window.DOMPurify ? DOMPurify.sanitize(raw) : raw;
  }

  function attachMessageEnhancements(bubble) {
    bubble.querySelectorAll('pre').forEach(pre => {
      if (pre.querySelector('.code-copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')?.textContent || pre.textContent;
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = 'Copy'), 1500);
        });
      });
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
    const row = bubble.closest('.message-row');
    const actions = row?.querySelector('.msg-actions');
    if (actions && !actions.querySelector('.msg-action-btn')) {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'msg-action-btn';
      copyBtn.title = 'کپی پاسخ';
      copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(bubble.innerText);
        showToast('متن کپی شد', 'success');
      });
      actions.appendChild(copyBtn);
    }
  }

  function scrollToBottom() { chatContent.scrollTop = chatContent.scrollHeight; }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Toasts ----
  function showToast(msg, type) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    el.innerHTML = `<i class="fa-solid ${icon}"></i> ${escapeHtml(msg)}`;
    toastStack.appendChild(el);
    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.remove(), 300);
    }, 2800);
  }

  // ---- Load saved chats on startup ----
  loadChatsList();
});
// =========================================================
// 🎨 افزودنی Agnes AI (نسخه اصلاح‌شده و هوشمند)
// =========================================================
(function () {
  let isAgnesMode = false;

  function initAgnesAddon() {
    const leftActions = document.querySelector('.input-left-actions');
    const fileUploadBtn = document.getElementById('fileUploadBtn');
    const sendBtn = document.getElementById('sendBtn');
    const promptInput = document.getElementById('promptInput');
    const messagesList = document.getElementById('messagesList');
    const welcomeContainer = document.getElementById('welcomeContainer');

    if (!leftActions || !sendBtn || !promptInput) return;

    // ۱. جلوگیری از شکستن خط دکمه‌ها
    leftActions.style.display = 'flex';
    leftActions.style.alignItems = 'center';
    leftActions.style.flexWrap = 'nowrap';

    // ۲. ساخت دکمه جادویی (✨)
    const agnesBtn = document.createElement('button');
    agnesBtn.type = 'button';
    agnesBtn.id = 'agnesToggleBtn';
    agnesBtn.className = 'input-action-btn';
    agnesBtn.title = 'تولید تصویر با Agnes AI';
    agnesBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i>';
    agnesBtn.style.cssText = 'transition: all 0.2s ease; margin-left: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;';

    // قرار دادن دکمه سمت راستِ گیره کاغذ (در قالب RTL)
    if (fileUploadBtn) {
      leftActions.insertBefore(agnesBtn, fileUploadBtn);
    } else {
      leftActions.appendChild(agnesBtn);
    }

    // ۳. تغییر حالت با کلیک روی دکمه عصا
    agnesBtn.addEventListener('click', () => {
      isAgnesMode = !isAgnesMode;
      if (isAgnesMode) {
        agnesBtn.style.color = '#f59e0b';
        agnesBtn.style.transform = 'scale(1.25)';
        promptInput.placeholder = '🎨 توصیف عکسی که می‌خواهی بسازی را بنویس...';
      } else {
        agnesBtn.style.color = '';
        agnesBtn.style.transform = 'scale(1)';
        promptInput.placeholder = 'هر چه می‌خواهید بپرسید...';
      }
    });

    // تابع ارسال درخواست به Agnes AI
    async function sendAgnesRequest() {
      const text = promptInput.value.trim();
      if (!text) return;

      if (welcomeContainer) welcomeContainer.style.display = 'none';
      if (messagesList) messagesList.style.display = 'flex';

      // نمایش پیام کاربر
      const uRow = document.createElement('div');
      uRow.className = 'message-row user';
      uRow.innerHTML = `
        <div class="avatar-mini"><i class="fa-solid fa-user"></i></div>
        <div class="message-col"><div class="message-bubble">${text}</div></div>`;
      messagesList.appendChild(uRow);

      promptInput.value = '';

      // پیام در حال ساخت تصویر
      const aRow = document.createElement('div');
      aRow.className = 'message-row assistant';
      aRow.innerHTML = `
        <div class="avatar-mini"><i class="fa-solid fa-sparkles"></i></div>
        <div class="message-col">
          <div class="message-bubble">
            <i class="fa-solid fa-spinner fa-spin"></i> در حال ساخت تصویر با Agnes AI... 🎨
          </div>
        </div>`;
      messagesList.appendChild(aRow);
      messagesList.scrollTop = messagesList.scrollHeight;

      const bubble = aRow.querySelector('.message-bubble');

      try {
        const res = await fetch('/api/agnes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text }),
        });

        const data = await res.json();

        if (data.error) {
          bubble.innerHTML = `<span style="color:#ef4444;">❌ خطا: ${data.error}</span>`;
        } else {
          let imgUrl = data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : data.data?.[0]?.url;
          if (imgUrl) {
            bubble.innerHTML = `<img src="${imgUrl}" alt="Agnes AI Image" style="max-width:100%; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.15);">`;
          } else {
            bubble.innerHTML = `<span style="color:#ef4444;">تصویری از سرور دریافت نشد.</span>`;
          }
        }
      } catch (err) {
        bubble.innerHTML = `<span style="color:#ef4444;">خطا در ارتباط: ${err.message}</span>`;
      }

      messagesList.scrollTop = messagesList.scrollHeight;
    }

    // ۴. جلوداری کلیک دکمه ارسال (قبل از Gemini)
    sendBtn.addEventListener('click', (e) => {
      if (!isAgnesMode) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      sendAgnesRequest();
    }, true);

    // ۵. جلوداری کلید Enter روی کیبورد (قبل از Gemini)
    promptInput.addEventListener('keydown', (e) => {
      if (!isAgnesMode) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.stopImmediatePropagation();
        e.preventDefault();
        sendAgnesRequest();
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAgnesAddon);
  } else {
    initAgnesAddon();
  }
})();
