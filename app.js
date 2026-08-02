// ==========================================================================
// ChatGPT Classic — Gemini Edition — app.js (نسخه کامل و بدون خطا)
// ==========================================================================

// ---- Model catalog (single source of truth) --------------------------------
const MODEL_CATALOG = [
  // ---- Text (Gemini) ----
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', group: '📝 متنی (Gemini)', category: 'text', desc: 'جدیدترین مدل فلش — سریع' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', group: '📝 متنی (Gemini)', category: 'text', desc: 'مدل پایدار و سریع' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', group: '📝 متنی (Gemini)', category: 'text', desc: 'نسخه سبک، مصرف کم' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', group: '📝 متنی (Gemini)', category: 'text', desc: 'سبک‌ترین نسخه ۳.۱' },
  { id: 'gemma-4-31b-it', name: 'Gemma 4 31B IT', group: '📝 متنی (Gemini)', category: 'text', desc: 'مدل متن‌باز ۳۱ میلیاردی' },
  { id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B MoE IT', group: '📝 متنی (Gemini)', category: 'text', desc: 'مدل متن‌باز MoE' },

  // ---- Text (Groq) ----
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', group: '📝 متنی (Groq)', category: 'text', desc: 'قدرتمندترین مدل Groq' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', group: '📝 متنی (Groq)', category: 'text', desc: 'سریع و مقرون‌به‌صرفه' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B', group: '📝 متنی (Groq)', category: 'text', desc: 'مدل استدلال عمیق' },

  // ---- Image (Imagen) ----
  { id: 'imagen-3.0-generate-001', name: 'Imagen 3.0', group: '🎨 تصویر (Imagen)', category: 'imagen', desc: 'کیفیت بالا' },
  { id: 'imagen-3.0-generate-002', name: 'Imagen 3.0 Ultra', group: '🎨 تصویر (Imagen)', category: 'imagen', desc: 'بهترین کیفیت' },
];

const CATEGORY_META = {
  text:           { label: 'متنی',   icon: 'fa-comment-dots' },
  'gemini-image': { label: 'تصویر',  icon: 'fa-image' },
  imagen:         { label: 'تصویر',  icon: 'fa-image' },
  tts:            { label: 'صوتی',   icon: 'fa-microphone-lines' },
  music:          { label: 'موسیقی', icon: 'fa-music' },
  video:          { label: 'ویدیو',  icon: 'fa-clapperboard' },
  unsupported:    { label: 'تخصصی',  icon: 'fa-triangle-exclamation' },
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

  // File upload elements
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

  // ---- Long-term memory (Cloudflare KV / Backend API) ----
  if (memoryEnabledToggle) {
    memoryEnabledToggle.checked = state.memoryEnabled;
    memoryEnabledToggle.addEventListener('change', () => {
      state.memoryEnabled = memoryEnabledToggle.checked;
      localStorage.setItem('memoryEnabled', String(state.memoryEnabled));
    });
  }

  if (clearMemoryBtn) {
    clearMemoryBtn.addEventListener('click', async () => {
      if (!confirm('حافظه بلندمدت برای همیشه پاک شود؟')) return;
      clearMemoryBtn.disabled = true;
      try {
        const res = await fetch('/api/memory?uid=' + encodeURIComponent(clientId), { method: 'DELETE' });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || data.error);
        state.longTermMemory = '';
        if (memoryBox) memoryBox.value = '';
        showToast('حافظه پاک شد', 'success');
      } catch (err) {
        showToast('حذف حافظه ناموفق بود: ' + err.message, 'error');
      } finally {
        clearMemoryBtn.disabled = false;
      }
    });
  }

  async function loadMemory() {
    try {
      const res = await fetch('/api/memory?uid=' + encodeURIComponent(clientId));
      const data = await res.json();
      if (!data.error) {
        state.longTermMemory = data.memory || '';
        if (memoryBox) memoryBox.value = state.longTermMemory;
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
          model: 'gemini-3.5-flash',
          contents: [{ role: 'user', parts: [{ text: extractPrompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
        }),
      });
      const data = await res.json();
      const newMemory = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (newMemory === undefined || newMemory === state.longTermMemory) return;
      state.longTermMemory = newMemory;
      if (memoryBox) memoryBox.value = newMemory;
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
    if (!modelSelect) return;
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
    if (!modelDescBox || !modelSelect) return;
    const m = findModel(modelSelect.value);
    modelDescBox.innerHTML = `<i class="fa-solid ${CATEGORY_META[m.category].icon}"></i> ${escapeHtml(m.desc)}`;
  }

  // ---- Category pills ----
  const categories = ['all', 'text', 'imagen', 'tts', 'music', 'video', 'unsupported'];
  const categoryLabels = { all: 'همه', text: '📝 متنی', imagen: '🎨 تصویر (Imagen)', tts: '🎵 صوتی', music: '🎶 موسیقی', video: '🎬 ویدیو', unsupported: '🔍 تخصصی' };
  let activeCategory = 'all';

  if (categoryPills) {
    categoryPills.innerHTML = '';
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
  }

  if (modelSelect) {
    modelSelect.addEventListener('change', () => {
      pendingModelId = modelSelect.value;
      updateModelDescBox();
      renderDynamicParams();
    });
  }

  // ---- Dynamic params ----
  function renderDynamicParams() {
    if (!dynamicParams) return;
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
  if (systemInstructionInput) systemInstructionInput.value = state.systemPrompt;
  updateHeaderForModel(state.modelId);

  if (suggestionChips) {
    suggestionChips.innerHTML = SUGGESTIONS.map(s => `<button class="suggestion-chip">${escapeHtml(s)}</button>`).join('');
    suggestionChips.querySelectorAll('.suggestion-chip').forEach((chip, i) => {
      chip.addEventListener('click', () => { promptInput.value = SUGGESTIONS[i]; promptInput.dispatchEvent(new Event('input')); promptInput.focus(); });
    });
  }

  // ---- Theme ----
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeToggleBtn) themeToggleBtn.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
      applyTheme(state.theme);
    });
  }

  // ---- Header / context bar ----
  function updateHeaderForModel(modelId) {
    const m = findModel(modelId);
    if (currentModelName) currentModelName.textContent = m.name;
    if (modelCatIcon) modelCatIcon.innerHTML = `<i class="fa-solid ${CATEGORY_META[m.category].icon}"></i>`;
    if (!modelContextBar) return;

    if (m.category === 'unsupported') {
      modelContextBar.style.display = 'flex';
      modelContextBar.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> این مدل برای گفتگو مناسب نیست — لطفاً از تنظیمات یک مدل دیگر انتخاب کنید.`;
    } else if (m.category === 'video') {
      modelContextBar.style.display = 'flex';
      modelContextBar.innerHTML = `<i class="fa-solid fa-clapperboard"></i> حالت تولید ویدیو فعال — ممکن است چند دقیقه طول بکشد.`;
    } else if (m.category === 'tts') {
      modelContextBar.style.display = 'flex';
      modelContextBar.innerHTML = `<i class="fa-solid fa-microphone-lines"></i> حالت تبدیل متن به گفتار — صدا: ${escapeHtml(state.params.voiceName)}`;
    } else if (m.category === 'imagen' || m.category === 'gemini-image') {
      modelContextBar.style.display = 'flex';
      modelContextBar.innerHTML = `<i class="fa-solid fa-image"></i> حالت تولید تصویر فعال`;
    } else {
      modelContextBar.style.display = 'none';
    }
  }

  // ---- Textarea autosize ----
  if (promptInput) {
    promptInput.addEventListener('input', () => {
      promptInput.style.height = 'auto';
      promptInput.style.height = Math.min(promptInput.scrollHeight, 180) + 'px';
      sendBtn.disabled = promptInput.value.trim() === '' && !state.uploadedFile;
    });
  }

  // ---- Sidebar ----
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => sidebar.classList.add('closed'));
  if (openSidebarBtn) openSidebarBtn.addEventListener('click', () => sidebar.classList.remove('closed'));

  // ============================================================
  // FILE UPLOAD HANDLERS
  // ============================================================
  function clearUploadedFile() {
    state.uploadedFile = null;
    if (fileBadge) fileBadge.style.display = 'none';
    if (fileNameDisplay) {
      fileNameDisplay.style.display = 'none';
      fileNameDisplay.innerHTML = '';
    }
    if (fileUploadBtn) fileUploadBtn.classList.remove('has-file');
    if (promptInput) promptInput.placeholder = 'هر چه می‌خواهید بپرسید...';
    if (sendBtn) sendBtn.disabled = promptInput.value.trim() === '';
  }

  function updateFileBadge() {
    if (state.uploadedFile) {
      if (fileBadge) {
        fileBadge.textContent = '1';
        fileBadge.style.display = 'flex';
      }
      if (fileUploadBtn) fileUploadBtn.classList.add('has-file');

      const file = state.uploadedFile;
      const fileIcon = file.mimeType.startsWith('image/') ? 'fa-image' : 'fa-file-lines';
      if (fileNameDisplay) {
        fileNameDisplay.innerHTML = `
          <i class="fa-regular ${fileIcon} file-icon"></i>
          <span class="file-name-text" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
          <button class="file-remove-btn" id="removeFileBtn" title="حذف فایل">
            <i class="fa-regular fa-circle-xmark"></i>
          </button>
        `;
        fileNameDisplay.style.display = 'flex';

        const removeBtn = $('removeFileBtn');
        if (removeBtn) {
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearUploadedFile();
          });
        }
      }
      if (promptInput) promptInput.placeholder = `📎 ${file.name} — پیام خود را تایپ کنید...`;
    } else {
      clearUploadedFile();
    }
  }

  if (fileUploadBtn) fileUploadBtn.addEventListener('click', () => fileInput && fileInput.click());

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showToast('حجم فایل نباید بیشتر از ۵ مگابایت باشد', 'error');
        fileInput.value = '';
        return;
      }

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
        if (sendBtn) sendBtn.disabled = false;
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    });
  }

  // ---- Modal ----
  function openModal() {
    pendingModelId = state.modelId;
    renderModelOptions(activeCategory);
    renderDynamicParams();
    if (memoryBox) memoryBox.value = state.longTermMemory;
    if (memoryEnabledToggle) memoryEnabledToggle.checked = state.memoryEnabled;
    if (settingsModal) settingsModal.classList.add('active');
  }
  function closeModal() { if (settingsModal) settingsModal.classList.remove('active'); }

  if (openSettingsLink) openSettingsLink.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  if (settingsGearBtn) settingsGearBtn.addEventListener('click', openModal);
  if (modelDropdownBadge) modelDropdownBadge.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (settingsModal) settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(); });

  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const targetPanel = document.querySelector(`.tab-panel[data-panel="${tab.dataset.tab}"]`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      const prevCategory = findModel(state.modelId).category;
      state.modelId = pendingModelId;
      state.systemPrompt = systemInstructionInput ? systemInstructionInput.value : '';
      localStorage.setItem('selectedModel', state.modelId);
      localStorage.setItem('systemPrompt', state.systemPrompt);
      localStorage.setItem('genParams', JSON.stringify(state.params));
      updateHeaderForModel(state.modelId);
      closeModal();
      const m = findModel(state.modelId);
      showToast(`مدل به «${m.name}» تغییر کرد`, 'success');
      if (m.category !== prevCategory) {
        appendSystemNotice(`سویچ به مدل ${m.name} (${CATEGORY_META[m.category].label}) انجام شد.`);
      }
    });
  }

  if (testConnBtn) testConnBtn.addEventListener('click', testConnection);

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
    const historyList = $('chatHistoryList');
    const emptyMsg = $('historyEmpty');
    if (!historyList) return;

    const chats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    historyList.querySelectorAll('.history-item').forEach(el => el.remove());

    if (chats.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

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
        if (sidebar) sidebar.classList.add('closed');
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
    if (welcomeContainer) welcomeContainer.style.display = 'none';

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
      if (welcomeContainer) {
        welcomeContainer.style.display = 'flex';
        welcomeContainer.style.flexDirection = 'column';
      }
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
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      conversationHistory = [];
      state.currentChatId = null;
      lastSavedChat = null;
      messagesList.innerHTML = '';
      messagesList.style.display = 'none';
      if (welcomeContainer) {
        welcomeContainer.style.display = 'flex';
        welcomeContainer.style.flexDirection = 'column';
      }
      clearUploadedFile();
      loadChatsList();
      if (sidebar) sidebar.classList.add('closed');
    });
  }

  // ---- Save Chat Button ----
  if (saveChatBtn) saveChatBtn.addEventListener('click', saveCurrentChat);

  // ---- Enter to send ----
  if (promptInput) {
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (promptInput.value.trim() !== '' || state.uploadedFile) handleSend();
      }
    });
  }
  if (sendBtn) sendBtn.addEventListener('click', handleSend);

// ==========================================================================
  // SEND LOGIC (نسخه هوشمند و ایزوله)
  // ==========================================================================
  async function handleSend() {
    const text = promptInput ? promptInput.value.trim() : '';
    if (!text && !state.uploadedFile) return;

    const model = findModel(state.modelId) || { id: state.modelId, category: '' };
    const currentModelId = (model.id || state.modelId || '').toLowerCase();

    // 🎯 تشخیص ۱۰۰٪ قطعی مدل‌های Imagen
    const isImagen = currentModelId.includes('imagen') || model.category === 'imagen';

    if (welcomeContainer) welcomeContainer.style.display = 'none';
    if (messagesList) messagesList.style.display = 'flex';

    let displayText = text || (state.uploadedFile ? `[فایل: ${state.uploadedFile.name}]` : '');
    appendUserMessage(displayText, state.uploadedFile);

    if (promptInput) {
      promptInput.value = '';
      promptInput.style.height = 'auto';
    }
    if (sendBtn) sendBtn.disabled = true;

    const uploadedFileCopy = state.uploadedFile;
    clearUploadedFile();

    const { bubble } = appendAssistantTyping();

    try {
      if (isImagen) {
        // 🚀 هدایت مستقیم و بدون خطا به اندپوینت /api/imagen
        await handleImagenGenerate(model, text || displayText, bubble);
      } else {
        // 💬 هدایت به چت متنی (/api/chat)
        const userEntry = { role: 'user', parts: [{ text: text || displayText }] };
        conversationHistory.push(userEntry);
        await handleGeminiGenerate(model, bubble);
      }
      autoSaveChat();
    } catch (err) {
      renderError(bubble, err.message);
    }

    scrollToBottom();
    if (sendBtn) sendBtn.disabled = false;
  }

  // ==========================================================================
  // GENERATION HANDLERS
  // ==========================================================================
  async function handleGeminiGenerate(model, bubble) {
    // گارد ایمنی پیشگیرانه
    if (model.id.includes('imagen') || model.category === 'imagen') {
      const currentPrompt = promptInput ? promptInput.value.trim() : '';
      return await handleImagenGenerate(model, currentPrompt, bubble);
    }

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

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'پاسخی دریافت نشد.';
    bubble.classList.remove('typing-dots');
    bubble.innerHTML = renderMarkdown(replyText);
    attachMessageEnhancements(bubble);

    conversationHistory.push({ role: 'model', parts: [{ text: replyText }] });

    const lastUserMsg = conversationHistory[conversationHistory.length - 2]?.parts?.find(p => p.text)?.text || '';
    if (lastUserMsg && replyText) {
      updateLongTermMemory(lastUserMsg, replyText);
    }
  }

  async function handleImagenGenerate(model, promptText, bubble) {
    const res = await fetch('/api/imagen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.id,
        prompt: promptText,
        aspectRatio: state.params.imagenAspectRatio,
        sampleCount: state.params.imagenSampleCount,
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

    bubble.classList.remove('typing-dots');
    if (data.images && data.images.length > 0) {
      let html = '<div class="generated-images-grid">';
      data.images.forEach(imgBase64 => {
        html += `<div class="img-wrapper"><img src="data:image/png;base64,${imgBase64}" class="generated-img" alt="تصویر تولید شده"/><a href="data:image/png;base64,${imgBase64}" download="imagen.png" class="dl-btn" title="دانلود"><i class="fa-solid fa-download"></i></a></div>`;
      });
      html += '</div>';
      bubble.innerHTML = html;
    } else {
      bubble.textContent = 'تصویری تولید نشد.';
    }
    attachMessageEnhancements(bubble);
  }

  async function handleTtsGenerate(model, text, bubble) {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, voiceName: state.params.voiceName }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

    bubble.classList.remove('typing-dots');
    if (data.audioContent) {
      bubble.innerHTML = `
        <div class="tts-player">
          <audio controls src="data:audio/mp3;base64,${data.audioContent}"></audio>
        </div>`;
    } else {
      bubble.textContent = 'صوت تولید نشد.';
    }
    attachMessageEnhancements(bubble);
  }

  async function handleVideoGenerate(model, promptText, bubble) {
    bubble.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال ارسال درخواست تولید ویدیو...';
    // شبیه‌سازی / اندپوینت ویدیو
    setTimeout(() => {
      bubble.innerHTML = '<i class="fa-solid fa-circle-check"></i> درخواست تولید ویدیو ثبت شد. قابلیت پخش ویدیو به‌زودی فعال می‌شود.';
      attachMessageEnhancements(bubble);
    }, 2000);
  }

  // ==========================================================================
  // UI & DOM HELPERS
  // ==========================================================================
  function appendUserMessage(text, file) {
    const row = document.createElement('div');
    row.className = 'message-row user';
    let contentHtml = escapeHtml(text).replace(/\n/g, '<br>');

    if (file && file.mimeType.startsWith('image/')) {
      contentHtml += `<br><img src="data:${file.mimeType};base64,${file.data}" class="chat-attached-img" alt="تصویر پیوست"/>`;
    }

    row.innerHTML = `
      <div class="avatar-mini"><i class="fa-solid fa-user"></i></div>
      <div class="message-col">
        <div class="message-bubble">${contentHtml}</div>
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
        <div class="message-bubble typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>`;
    messagesList.appendChild(row);
    scrollToBottom();
    return { row, bubble: row.querySelector('.message-bubble') };
  }

  function appendNotice(msg) {
    const div = document.createElement('div');
    div.className = 'system-notice';
    div.innerHTML = `<i class="fa-solid fa-info-circle"></i> ${escapeHtml(msg)}`;
    messagesList.appendChild(div);
    scrollToBottom();
  }

  function appendSystemNotice(msg) {
    appendNotice(msg);
  }

  function renderError(bubble, errText) {
    bubble.classList.remove('typing-dots');
    bubble.classList.add('error-bubble');
    bubble.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${escapeHtml(errText)}`;
  }

  function scrollToBottom() {
    if (chatContent) chatContent.scrollTop = chatContent.scrollHeight;
  }

  function showToast(text, type = 'info') {
    if (!toastStack) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = escapeHtml(text);
    toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderMarkdown(text) {
    if (!text) return '';
    // تبدیل ساده‌ی کدهای داخل گراو (```)
    let formatted = escapeHtml(text);
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  function attachMessageEnhancements(bubble) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-msg-btn';
    copyBtn.title = 'کپی متن';
    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(bubble.innerText);
      showToast('متن کپی شد', 'success');
    });
    const actions = bubble.parentElement.querySelector('.msg-actions') || bubble.parentElement;
    actions.appendChild(copyBtn);
  }

  async function testConnection() {
    if (connStatus) connStatus.textContent = 'در حال بررسی ارتباط...';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: state.modelId,
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        }),
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        if (connStatus) connStatus.textContent = 'ارتباط برقرار است ✅';
        showToast('اتصال به سرور با موفقیت برقرار شد', 'success');
      } else {
        throw new Error(data.error?.message || 'پاسخ نامعتبر از سرور');
      }
    } catch (e) {
      if (connStatus) connStatus.textContent = 'خطا در ارتباط ❌';
      showToast('خطا در اتصال: ' + e.message, 'error');
    }
  }

  // بارگذاری اولیه لیست چت‌های ذخیره‌شده
  loadChatsList();
});
