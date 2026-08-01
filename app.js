// ==========================================================================
// ChatGPT Classic — Gemini Edition — app.js
// ==========================================================================

const MODEL_CATALOG = [
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

  { id: 'gemini-3.1-flash-image', name: 'Nano Banana 2', group: '🎨 تصویر', category: 'gemini-image', desc: 'جدیدترین مدل تصویر Gemini' },
  { id: 'gemini-3.1-flash-lite-image', name: 'Nano Banana 2 Lite', group: '🎨 تصویر', category: 'gemini-image', desc: 'نسخه سبک و ارزان' },
  { id: 'gemini-3-pro-image-preview', name: 'Nano Banana Pro', group: '🎨 تصویر', category: 'gemini-image', desc: 'کیفیت حرفه‌ای' },
  { id: 'gemini-2.5-flash-image', name: 'Nano Banana', group: '🎨 تصویر', category: 'gemini-image', desc: 'مدل پایدار و پرسرعت' },

  { id: 'imagen-4.0-generate-001', name: 'Imagen 4', group: '🎨 تصویر', category: 'imagen', desc: 'کیفیت بالا — endpoint مجزا' },
  { id: 'imagen-4.0-ultra-generate-001', name: 'Imagen 4 Ultra', group: '🎨 تصویر', category: 'imagen', desc: 'بالاترین کیفیت' },
  { id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4 Fast', group: '🎨 تصویر', category: 'imagen', desc: 'سریع و مقرون‌به‌صرفه' },

  { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS', group: '🎵 صوتی', category: 'tts', desc: 'تبدیل متن به گفتار' },
  { id: 'gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro TTS', group: '🎵 صوتی', category: 'tts', desc: 'کیفیت بالاتر' },
  { id: 'gemini-3.1-flash-tts-preview', name: 'Gemini 3.1 Flash TTS', group: '🎵 صوتی', category: 'tts', desc: 'جدیدترین TTS' },

  { id: 'lyria-3-clip-preview', name: 'Lyria 3 Clip', group: '🎶 موسیقی', category: 'music', desc: 'تولید قطعه کوتاه موسیقی' },
  { id: 'lyria-3-pro-preview', name: 'Lyria 3 Pro', group: '🎶 موسیقی', category: 'music', desc: 'کیفیت حرفه‌ای' },

  { id: 'veo-3.1-generate-preview', name: 'Veo 3.1', group: '🎬 ویدیو', category: 'video', desc: 'تولید ویدیو — ممکن است چند دقیقه طول بکشد' },

  { id: 'gemini-embedding-2', name: 'Gemini Embedding 2', group: '🔍 تخصصی', category: 'unsupported', desc: 'فقط API — بردار متن' },
  { id: 'gemini-embedding-001', name: 'Gemini Embedding 001', group: '🔍 تخصصی', category: 'unsupported', desc: 'فقط API — بردار متن' },
  { id: 'gemini-robotics-er-2-preview', name: 'Gemini Robotics ER 2', group: '🔍 تخصصی', category: 'unsupported', desc: 'رباتیک' },
  { id: 'antigravity-preview-05-2026', name: 'Antigravity Agent', group: '🔍 تخصصی', category: 'unsupported', desc: 'عامل هوشمند' },
  { id: 'gemini-2.5-computer-use-preview', name: 'Computer Use', group: '🔍 تخصصی', category: 'unsupported', desc: 'کنترل کامپیوتر' },
];

const CATEGORY_META = {
  text:            { label: 'متنی',    icon: 'fa-comment-dots' },
  'gemini-image':{ label: 'تصویر',   icon: 'fa-image' },
  imagen:          { label: 'تصویر',   icon: 'fa-image' },
  tts:             { label: 'صوتی',   icon: 'fa-microphone-lines' },
  music:           { label: 'موسیقی', icon: 'fa-music' },
  video:           { label: 'ویدیو',   icon: 'fa-clapperboard' },
  unsupported:     { label: 'تخصصی',   icon: 'fa-triangle-exclamation' },
};

const SUGGESTIONS = [
  'یک ایده برای پروژه برنامه‌نویسی بده',
  'یک تصویر از یک شهر آینده‌نگر بساز',
  'خلاصه‌ای از یک کتاب معروف بنویس',
  'یک متن با صدای Kore تولید کن',
];

function findModel(id) { return MODEL_CATALOG.find(m => m.id === id) || MODEL_CATALOG[0]; }

document.addEventListener('DOMContentLoaded', () => {
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
  const toastStack = $('toastStack');
  const connStatus = $('connStatus');

  const settingsModal = $('settingsModal');
  const openSettingsLink = $('openSettingsLink');
  const settingsGearBtn = $('openSidebarBtn'); // یا دکمه تنظیمات
  const closeModalBtn = $('closeModalBtn');
  const saveSettingsBtn = $('saveSettingsBtn');
  const testConnBtn = { disabled: false }; // پلاس‌هولدر
  const systemInstructionInput = $('systemInstruction');
  const themeToggleBtn = $('themeToggleBtn');
  const memoryEnabledToggle = $('memoryEnabledToggle');
  const memoryBox = $('memoryBox');
  const clearMemoryBtn = $('clearMemoryBtn');

  const sidebar = $('sidebar');
  const closeSidebarBtn = $('closeSidebarBtn');
  const openSidebarBtns = document.querySelectorAll('#openSidebarBtn');
  const newChatBtn = $('newChatBtn');
  const imageInput = $('imageInput');
  const uploadBtn = $('uploadBtn');

  let state = {
    modelId: localStorage.getItem('selectedModel') || 'gemini-3.6-flash',
    systemPrompt: localStorage.getItem('systemPrompt') || '',
    theme: localStorage.getItem('theme') || 'light',
    params: JSON.parse(localStorage.getItem('genParams') || '{}'),
    memoryEnabled: localStorage.getItem('memoryEnabled') !== 'false',
    longTermMemory: '',
  };

  let conversationHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  let pendingModelId = state.modelId;

  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = (crypto.randomUUID ? crypto.randomUUID() : 'uid-' + Date.now() + '-' + Math.random().toString(16).slice(2));
    localStorage.setItem('clientId', clientId);
  }

  state.params.temperature ??= 1.0;
  state.params.maxOutputTokens ??= 2048;
  state.params.topP ??= 0.95;
  state.params.voiceName ??= 'Kore';
  state.params.imagenAspectRatio ??= '1:1';
  state.params.imagenSampleCount ??= 1;

  applyTheme(state.theme);

  // بازیابی تاریخچه چت روی صفحه در زمان لود
  if (conversationHistory.length > 0) {
    welcomeContainer.style.display = 'none';
    messagesList.style.display = 'flex';
    renderHistoryToDOM();
  }

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
    } catch (err) {}
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
        '\n\nوظیفه: فقط نکات پایدار و مهم درباره کاربر را استخراج کن و با حافظه فعلی ادغام کن. فهرست نهایی را به‌صورت bullet (با خط تیره -) و به فارسی برگردان بدون مقدمه.';

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
    } catch (err) {}
  }

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

  const categories = ['all', 'text', 'gemini-image', 'imagen', 'tts', 'music', 'video', 'unsupported'];
  const categoryLabels = { all: 'همه', text: '📝 متنی', 'gemini-image': '🎨 تصویر (Gemini)', imagen: '🎨 تصویر (Imagen)', tts: '🎵 صوتی', music: '🎶 موسیقی', video: '🎬 ویدیو', unsupported: '🔍 تخصصی' };
  let activeCategory = 'all';
  categories.forEach(cat => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'cat-pill' + (cat === 'all' ? ' active' : '');
    pill.textContent = categoryLabels[cat];
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
        <input type="text" class="form-control" id="voiceNameInput" value="${escapeHtml(state.params.voiceName)}">`;
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
      sliderRow('imagenSampleCount', 'تعداد تصاویر', 1, 4, 1, 'تعداد تصویر');
    }
  }

  renderModelOptions('all');
  renderDynamicParams();
  systemInstructionInput.value = state.systemPrompt;
  updateHeaderForModel(state.modelId);
  suggestionChips.innerHTML = SUGGESTIONS.map(s => `<button class="suggestion-chip">${escapeHtml(s)}</button>`).join('');
  suggestionChips.querySelectorAll('.suggestion-chip').forEach((chip, i) => {
    chip.addEventListener('click', () => { promptInput.value = SUGGESTIONS[i]; promptInput.dispatchEvent(new Event('input')); promptInput.focus(); });
  });

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    themeToggleBtn.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
  themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    applyTheme(state.theme);
  });

  function updateHeaderForModel(modelId) {
    const m = findModel(modelId);
    currentModelName.textContent = m.name;
    modelCatIcon.innerHTML = `<i class="fa-solid ${CATEGORY_META[m.category].icon}"></i>`;
    modelContextBar.style.display = m.category !== 'text' && m.category !== 'gemini-image' ? 'flex' : 'none';
    if (m.category === 'tts') modelContextBar.innerHTML = `<i class="fa-solid fa-microphone-lines"></i> حالت TTS — صدا: ${escapeHtml(state.params.voiceName)}`;
    else if (m.category === 'imagen' || m.category === 'gemini-image') modelContextBar.innerHTML = `<i class="fa-solid fa-image"></i> حالت تولید تصویر فعال`;
    else if (m.category === 'video') modelContextBar.innerHTML = `<i class="fa-solid fa-clapperboard"></i> حالت ویدیو`;
  }

  promptInput.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 180) + 'px';
    sendBtn.disabled = promptInput.value.trim() === '' && !imageInput.files[0];
  });

  openSidebarBtns.forEach(btn => btn.addEventListener('click', () => sidebar.classList.toggle('closed')));
  closeSidebarBtn.addEventListener('click', () => sidebar.classList.add('closed'));

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
    state.modelId = pendingModelId;
    state.systemPrompt = systemInstructionInput.value;
    localStorage.setItem('selectedModel', state.modelId);
    localStorage.setItem('systemPrompt', state.systemPrompt);
    localStorage.setItem('genParams', JSON.stringify(state.params));
    updateHeaderForModel(state.modelId);
    closeModal();
    showToast(`مدل به «${findModel(state.modelId).name}» تغییر کرد`, 'success');
  });

  newChatBtn.addEventListener('click', () => {
    conversationHistory = [];
    localStorage.removeItem('chatHistory');
    messagesList.innerHTML = '';
    messagesList.style.display = 'none';
    welcomeContainer.style.display = 'flex';
  });

  uploadBtn.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', () => {
    if (imageInput.files[0]) {
      sendBtn.disabled = false;
      showToast('تصویر پیوست شد', 'success');
    }
  });

  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (promptInput.value.trim() !== '' || imageInput.files[0]) handleSend();
    }
  });
  sendBtn.addEventListener('click', handleSend);

  async function handleSend() {
    const text = promptInput.value.trim();
    const file = imageInput.files[0];
    if (!text && !file) return;
    const model = findModel(state.modelId);

    welcomeContainer.style.display = 'none';
    messagesList.style.display = 'flex';

    let imageBase64 = null;
    let imageMime = null;
    let parts = [];

    if (text) parts.push({ text });

    if (file) {
      imageMime = file.type;
      imageBase64 = await toBase64(file);
      parts.push({ inlineData: { mimeType: imageMime, data: imageBase64 } });
    }

    appendUserMessage(text, imageBase64);
    promptInput.value = '';
    promptInput.style.height = 'auto';
    imageInput.value = '';
    sendBtn.disabled = true;

    conversationHistory.push({ role: 'user', parts });
    saveChatHistory();

    const bubble = appendAssistantTyping();

    try {
      if (model.category === 'text' || model.category === 'gemini-image') {
        await handleGeminiGenerate(model, bubble);
      } else if (model.category === 'imagen') {
        await handleImagenGenerate(model, text || 'تصویر', bubble);
      } else if (model.category === 'tts') {
        await handleTtsGenerate(model, text, bubble);
      } else if (model.category === 'video') {
        await handleVideoGenerate(model, text, bubble);
      }
    } catch (err) {
      renderError(bubble, 'خطا در ارتباط: ' + err.message);
    }
    scrollToBottom();
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

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
    if (model.category === 'gemini-image') body.generationConfig.responseModalities = ['TEXT', 'IMAGE'];

    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.error) return renderError(bubble, typeof data.error === 'string' ? data.error : (data.error.message || 'خطا'));

    const resParts = data.candidates?.[0]?.content?.parts;
    if (!resParts || !resParts.length) return renderError(bubble, 'پاسخی دریافت نشد.');

    let html = '';
    let replyText = '';
    let historyParts = [];

    resParts.forEach(part => {
      if (part.text) {
        replyText += part.text;
        html += escapeHtml(part.text);
        historyParts.push({ text: part.text });
      } else if (part.inlineData) {
        html += `<br><img class="gen-image" src="data:${part.inlineData.mimeType};base64,${part.inlineData.data}" alt="تصویر">`;
        historyParts.push({ inlineData: part.inlineData });
      }
    });

    bubble.innerHTML = html;
    conversationHistory.push({ role: 'model', parts: historyParts });
    saveChatHistory();

    if (model.category === 'text' && replyText) {
      const lastUserText = conversationHistory[conversationHistory.length - 2]?.parts?.find(p => p.text)?.text || '';
      updateLongTermMemory(lastUserText, replyText);
    }
  }

  async function handleImagenGenerate(model, prompt, bubble) {
    const res = await fetch('/api/imagen', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: model.id, prompt, aspectRatio: state.params.imagenAspectRatio, sampleCount: state.params.imagenSampleCount }),
    });
    const data = await res.json();
    if (data.error) return renderError(bubble, data.error.message || data.error);
    const predictions = data.predictions || [];
    if (!predictions.length) return renderError(bubble, 'تصویری دریافت نشد.');
    bubble.innerHTML = predictions.map(p => `<img class="gen-image" src="data:image/png;base64,${p.bytesBase64Encoded}" alt="تصویر">`).join('');
    conversationHistory.push({ role: 'model', parts: [{ text: '[تصویر تولید شد]' }] });
    saveChatHistory();
  }

  async function handleTtsGenerate(model, text, bubble) {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.id,
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: state.params.voiceName } } } },
      }),
    });
    const data = await res.json();
    if (data.error) return renderError(bubble, data.error.message || data.error);
    const audioPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!audioPart) return renderError(bubble, 'صدایی دریافت نشد.');
    bubble.innerHTML = `<audio controls src="data:audio/wav;base64,${audioPart.inlineData.data}"></audio>`;
    conversationHistory.push({ role: 'model', parts: [{ text: '[صدا تولید شد]' }] });
    saveChatHistory();
  }

  async function handleVideoGenerate(model, prompt, bubble) {
    bubble.innerHTML = `در حال شروع تولید ویدیو...`;
    const startRes = await fetch('/api/video', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: model.id, prompt }) });
    const startData = await startRes.json();
    if (startData.error) return renderError(bubble, startData.error.message || 'خطا در شروع ویدیو');
    const opName = startData.name;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      const pollRes = await fetch('/api/video?op=' + encodeURIComponent(opName));
      const pollData = await pollRes.json();
      if (pollData.done) {
        const uri = pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
        if (uri) bubble.innerHTML = `<video controls class="gen-image" src="${uri}"></video>`;
        else bubble.innerHTML = `عملیات کامل شد اما لینک ویدیو یافت نشد.`;
        conversationHistory.push({ role: 'model', parts: [{ text: '[ویدیو تولید شد]' }] });
        saveChatHistory();
        return;
      }
      if (attempts > 40) { bubble.innerHTML = `زمان انتظار به پایان رسید.`; return; }
      setTimeout(poll, 8000);
    };
    setTimeout(poll, 5000);
  }

  function appendUserMessage(text, imageBase64) {
    const row = document.createElement('div');
    row.className = 'message-row user';
    let imgHtml = imageBase64 ? `<img src="data:image/jpeg;base64,${imageBase64}" class="gen-image" style="max-width:200px; margin-bottom:6px; border-radius:8px;">` : '';
    row.innerHTML = `
      <div class="avatar-mini"><i class="fa-solid fa-user"></i></div>
      <div class="message-col">
        <div class="message-bubble">${imgHtml}${escapeHtml(text)}</div>
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
      </div>`;
    messagesList.appendChild(row);
    scrollToBottom();
    return row.querySelector('.message-bubble');
  }

  function renderError(bubble, msg) {
    bubble.innerHTML = `<span style="color: var(--error-color, #ef4444);">خطا: ${escapeHtml(msg)}</span>`;
  }

  function renderHistoryToDOM() {
    messagesList.innerHTML = '';
    conversationHistory.forEach(item => {
      if (item.role === 'user') {
        let text = '';
        let imgBase64 = null;
        item.parts.forEach(p => {
          if (p.text) text = p.text;
          if (p.inlineData) imgBase64 = p.inlineData.data;
        });
        appendUserMessage(text, imgBase64);
      } else if (item.role === 'model') {
        const bubble = appendAssistantTyping();
        let html = '';
        item.parts.forEach(p => {
          if (p.text) html += escapeHtml(p.text);
          if (p.inlineData) html += `<br><img class="gen-image" src="data:${p.inlineData.mimeType};base64,${p.inlineData.data}" alt="تصویر">`;
        });
        bubble.innerHTML = html;
      }
    });
  }

  function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
  }

  function scrollToBottom() {
    const chatContentEl = $('chatContent');
    chatContentEl.scrollTop = chatContentEl.scrollHeight;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});
