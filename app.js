// ==========================================================================
// ChatGPT Classic — Gemini Edition — Full Fixed Functionality app.js
// ==========================================================================

// توابع جهانی کپی و دانلود کد داخل کادر
window.copyCodeSnippet = function(btn) {
  const container = btn.closest('.code-block-container');
  if (!container) return;
  const code = container.querySelector('code').innerText;
  navigator.clipboard.writeText(code).then(() => {
    const span = btn.querySelector('span');
    const originalText = span ? span.textContent : 'کپی کد';
    if (span) span.textContent = 'کپی شد!';
    btn.classList.add('copied');
    setTimeout(() => {
      if (span) span.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
  });
};

window.downloadCodeSnippet = function(btn) {
  const container = btn.closest('.code-block-container');
  if (!container) return;
  const code = container.querySelector('code').innerText;
  const lang = container.querySelector('.code-lang').innerText.toLowerCase();
  
  const extensions = { 
    html: 'html', css: 'css', javascript: 'js', js: 'js', 
    python: 'py', cpp: 'cpp', c: 'c', json: 'json', 
    php: 'php', sql: 'sql', java: 'java', typescript: 'ts', ts: 'ts'
  };
  const ext = extensions[lang] || 'txt';
  
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `code.${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
};

// ---- Model catalog -------------------------------------------------------
const MODEL_CATALOG = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', group: '📝 متنی (Gemini)', category: 'text', desc: 'جدیدترین مدل فلش — سریع' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', group: '📝 متنی (Gemini)', category: 'text', desc: 'مدل پایدار و دقیق' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', group: '📝 متنی (Gemini)', category: 'text', desc: 'نسخه سبک، مصرف کم' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', group: '📝 متنی (Gemini)', category: 'text', desc: 'سبک‌ترین نسخه ۳.۱' },
  { id: 'gemma-4-31b-it', name: 'Gemma 4 31B IT', group: '📝 متنی (Gemini)', category: 'text', desc: 'مدل متن‌باز ۳۱ میلیاردی' },
  { id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B MoE IT', group: '📝 متنی (Gemini)', category: 'text', desc: 'مدل متن‌باز MoE' },

  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', group: '📝 متنی (Groq)', category: 'text', desc: 'قدرتمندترین مدل Groq' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', group: '📝 متنی (Groq)', category: 'text', desc: 'سریع و مقرون‌به‌صرفه' },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B', group: '📝 متنی (Groq)', category: 'text', desc: 'مدل استدلال عمیق' },
];

const CATEGORY_META = {
  text:        { label: 'متنی',   icon: 'fa-comment-dots' },
  tts:         { label: 'صوتی',   icon: 'fa-microphone-lines' },
  music:       { label: 'موسیقی', icon: 'fa-music' },
  video:       { label: 'ویدیو',  icon: 'fa-clapperboard' },
  unsupported: { label: 'تخصصی',  icon: 'fa-triangle-exclamation' },
};

const SUGGESTIONS = [
  'یک ایده برای پروژه برنامه‌نویسی بده',
  'خلاصه‌ای از یک کتاب معروف بنویس',
  'یک مقاله کوتاه درباره هوش مصنوعی بفرست',
  'طراحی صفحه لاگین با HTML و CSS',
];

function findModel(id) { return MODEL_CATALOG.find(m => m.id === id) || MODEL_CATALOG[0]; }

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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

  const fileUploadBtn = $('fileUploadBtn');
  const fileInput = $('fileInput');
  const fileBadge = $('fileBadge');
  const fileNameDisplay = $('fileNameDisplay');

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

  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = (crypto.randomUUID ? crypto.randomUUID() : 'uid-' + Date.now() + '-' + Math.random().toString(16).slice(2));
    localStorage.setItem('clientId', clientId);
  }

  state.params.temperature ??= 0.7;
  state.params.maxOutputTokens ??= 4096;
  state.params.topP ??= 0.95;

  applyTheme(state.theme);

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
    } catch (err) { /* ignore */ }
  }
  loadMemory();

  function buildSystemInstruction() {
    let sys = state.systemPrompt || '';
    if (state.memoryEnabled && state.longTermMemory) {
      sys += (sys ? '\n\n' : '') + '--- حافظه بلندمدت درباره کاربر ---\n' + state.longTermMemory;
    }
    return sys ? { parts: [{ text: sys }] } : undefined;
  }

  async function updateLongTermMemory(userText, assistantText) {
    if (!state.memoryEnabled) return;
    try {
      const extractPrompt =
        'حافظه فعلی کاربر:\n' + (state.longTermMemory || '(خالی)') +
        '\n\nتبادل جدید:\nکاربر: ' + userText + '\nپاسخ دستیار: ' + assistantText +
        '\n\nوظیفه: نکات مهم و جدید کاربر را استخراج و ادغام کن. فهرست نهایی را به صورت - خروجی بده.';

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
    modelDescBox.innerHTML = `<i class="fa-solid ${CATEGORY_META[m.category]?.icon || 'fa-comment-dots'}"></i> ${escapeHtml(m.desc)}`;
  }

  const categories = ['all', 'text', 'tts', 'music', 'video', 'unsupported'];
  const categoryLabels = { all: 'همه', text: '📝 متنی', tts: '🎵 صوتی', music: '🎶 موسیقی', video: '🎬 ویدیو', unsupported: '🔍 تخصصی' };
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

    if (m.category === 'text') {
      sliderRow('temperature', 'دما (Temperature)', 0, 2, 0.05, 'خلاقیت خروجی', v => v.toFixed(2));
      sliderRow('topP', 'Top-P', 0, 1, 0.01, 'تنوع کلمات', v => v.toFixed(2));
      sliderRow('maxOutputTokens', 'حداکثر توکن', 256, 8192, 256, 'طول پاسخ');
    }
  }

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

  function updateHeaderForModel(modelId) {
    const m = findModel(modelId);
    if (currentModelName) currentModelName.textContent = m.name;
    if (modelCatIcon) modelCatIcon.innerHTML = `<i class="fa-solid ${CATEGORY_META[m.category]?.icon || 'fa-comment-dots'}"></i>`;
    if (modelContextBar) modelContextBar.style.display = 'none';
  }

  if (promptInput) {
    promptInput.addEventListener('input', () => {
      promptInput.style.height = 'auto';
      promptInput.style.height = Math.min(promptInput.scrollHeight, 180) + 'px';
      if (sendBtn) sendBtn.disabled = promptInput.value.trim() === '' && !state.uploadedFile;
    });
  }

  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => sidebar.classList.add('closed'));
  if (openSidebarBtn) openSidebarBtn.addEventListener('click', () => sidebar.classList.remove('closed'));

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

      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result.split(',')[1];
        state.uploadedFile = {
          data: base64,
          mimeType: file.type || 'text/plain',
          name: file.name,
          size: file.size,
        };
        
        if (fileBadge) {
          fileBadge.textContent = '1';
          fileBadge.style.display = 'flex';
        }
        if (fileUploadBtn) fileUploadBtn.classList.add('has-file');

        if (fileNameDisplay) {
          const fileIcon = file.type.startsWith('image/') ? 'fa-image' : 'fa-file-code';
          fileNameDisplay.innerHTML = `
            <i class="fa-regular ${fileIcon}"></i>
            <span>${escapeHtml(file.name)}</span>
            <button id="removeFileBtn"><i class="fa-regular fa-circle-xmark"></i></button>
          `;
          fileNameDisplay.style.display = 'flex';
          const rBtn = $('removeFileBtn');
          if (rBtn) rBtn.addEventListener('click', (e) => { e.stopPropagation(); clearUploadedFile(); });
        }
        if (promptInput) promptInput.placeholder = `📎 ${file.name} — پیام خود را بنویسید...`;
        if (sendBtn) sendBtn.disabled = false;
        showToast(`فایل "${file.name}" آماده ارسال است`, 'success');
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    });
  }

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
      state.modelId = pendingModelId;
      state.systemPrompt = systemInstructionInput ? systemInstructionInput.value : '';
      localStorage.setItem('selectedModel', state.modelId);
      localStorage.setItem('systemPrompt', state.systemPrompt);
      localStorage.setItem('genParams', JSON.stringify(state.params));
      updateHeaderForModel(state.modelId);
      closeModal();
      showToast(`مدل به «${findModel(state.modelId).name}» تغییر کرد`, 'success');
    });
  }

  if (testConnBtn) testConnBtn.addEventListener('click', testConnection);

  function saveCurrentChat() {
    if (conversationHistory.length === 0) return;
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
    if (existingIndex !== -1) chats[existingIndex] = chatData;
    else chats.push(chatData);

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
      return text.length > 35 ? text.substring(0, 35) + '...' : text;
    }
    return 'گفت‌وگوی جدید';
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

      item.innerHTML = `
        <i class="fa-regular fa-comment"></i>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(chat.title)}</span>
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
    if (!chat) return;

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
  }

  function deleteChat(chatId) {
    if (!confirm('آیا این گفت‌وگو حذف شود؟')) return;
    let chats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    chats = chats.filter(c => c.id !== chatId);
    localStorage.setItem('savedChats', JSON.stringify(chats));

    if (state.currentChatId === chatId) {
      state.currentChatId = null;
      conversationHistory = [];
      messagesList.innerHTML = '';
      messagesList.style.display = 'none';
      if (welcomeContainer) welcomeContainer.style.display = 'flex';
    }
    loadChatsList();
    showToast('چت حذف شد', 'success');
  }

  function autoSaveChat() {
    if (conversationHistory.length === 0) return;
    const currentData = JSON.stringify(conversationHistory);
    if (currentData === lastSavedChat) return;

    if (!state.currentChatId) state.currentChatId = 'chat_' + Date.now();
    const chatData = {
      id: state.currentChatId,
      title: getChatTitle(),
      history: conversationHistory,
      timestamp: Date.now(),
      model: state.modelId,
    };

    let chats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    const existingIndex = chats.findIndex(c => c.id === state.currentChatId);
    if (existingIndex !== -1) chats[existingIndex] = chatData;
    else chats.push(chatData);

    localStorage.setItem('savedChats', JSON.stringify(chats));
    lastSavedChat = currentData;
    loadChatsList();
  }

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      conversationHistory = [];
      state.currentChatId = null;
      lastSavedChat = null;
      messagesList.innerHTML = '';
      messagesList.style.display = 'none';
      if (welcomeContainer) welcomeContainer.style.display = 'flex';
      clearUploadedFile();
      loadChatsList();
      if (sidebar) sidebar.classList.add('closed');
    });
  }

  if (saveChatBtn) saveChatBtn.addEventListener('click', saveCurrentChat);

  if (promptInput) {
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (promptInput.value.trim() !== '' || state.uploadedFile) handleSend();
      }
    });
  }
  if (sendBtn) sendBtn.addEventListener('click', handleSend);

  async function handleSend() {
    const text = promptInput ? promptInput.value.trim() : '';
    if (!text && !state.uploadedFile) return;

    const modelSelectEl = document.getElementById('modelSelect');
    const activeModelId = modelSelectEl ? modelSelectEl.value : state.modelId;

    if (welcomeContainer) welcomeContainer.style.display = 'none';
    if (messagesList) messagesList.style.display = 'flex';

    let displayText = text || (state.uploadedFile ? `[فایل: ${state.uploadedFile.name}]` : '');
    appendUserMessage(displayText, state.uploadedFile);

    if (promptInput) {
      promptInput.value = '';
      promptInput.style.height = 'auto';
    }
    if (sendBtn) sendBtn.disabled = true;

    clearUploadedFile();

    const { bubble } = appendAssistantTyping();

    try {
      const modelObj = findModel(activeModelId) || { id: activeModelId };
      const userEntry = { role: 'user', parts: [{ text: text || displayText }] };
      conversationHistory.push(userEntry);
      await handleGeminiGenerate(modelObj, bubble);
      autoSaveChat();
    } catch (err) {
      renderError(bubble, err.message);
    }

    scrollToBottom();
    if (sendBtn) sendBtn.disabled = false;
  }

  async function handleGeminiGenerate(model, bubble) {
    const modelId = model?.id || state.modelId || 'gemini-3.6-flash';

    const body = {
      model: modelId,
      contents: conversationHistory,
      systemInstruction: buildSystemInstruction(),
      generationConfig: {
        temperature: state.params?.temperature ?? 0.7,
        topP: state.params?.topP ?? 0.95,
        maxOutputTokens: state.params?.maxOutputTokens ?? 4096,
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

  function renderMarkdown(text) {
    if (!text) return '';
    const codeBlocks = [];

    let processed = text.replace(/```(\w*)\r?\n?([\s\S]*?)```/g, (match, lang, code) => {
      const index = codeBlocks.length;
      const language = lang.trim() || 'code';
      const cleanCode = code.trim();

      const blockHtml = `
        <div class="code-block-container" dir="ltr">
          <div class="code-block-header">
            <span class="code-lang">${escapeHtml(language)}</span>
            <div class="code-actions">
              <button type="button" class="code-btn download-btn" onclick="downloadCodeSnippet(this)" title="دانلود فایل">
                <i class="fa-solid fa-download"></i> <span>دانلود</span>
              </button>
              <button type="button" class="code-btn copy-btn" onclick="copyCodeSnippet(this)" title="کپی کد">
                <i class="fa-regular fa-copy"></i> <span>کپی کد</span>
              </button>
            </div>
          </div>
          <pre><code class="language-${escapeHtml(language)}">${escapeHtml(cleanCode)}</code></pre>
        </div>`;

      codeBlocks.push(blockHtml);
      return `___CODE_BLOCK_${index}___`;
    });

    processed = escapeHtml(processed);
    processed = processed.replace(/`([^`]+)`/g, '<code class="inline-code" dir="ltr">$1</code>');
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    processed = processed.replace(/\n/g, '<br>');

    codeBlocks.forEach((block, index) => {
      processed = processed.replace(`___CODE_BLOCK_${index}___`, block);
    });

    return processed;
  }

  function attachMessageEnhancements(bubble) {
    const messageCol = bubble.closest('.message-col');
    if (!messageCol) return;

    let actions = messageCol.querySelector('.msg-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'msg-actions';
      messageCol.appendChild(actions);
    }
    actions.innerHTML = '';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-msg-btn';
    copyBtn.title = 'کپی کل متن پاسخ';
    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> <span>کپی</span>';
    
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(bubble.innerText);
      const span = copyBtn.querySelector('span');
      if (span) span.textContent = 'کپی شد!';
      setTimeout(() => { if (span) span.textContent = 'کپی'; }, 2000);
      showToast('متن پاسخ کپی شد', 'success');
    });

    actions.appendChild(copyBtn);
  }

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

  async function testConnection() {
    if (connStatus) connStatus.textContent = 'در حال بررسی...';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3.5-flash',
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        }),
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        if (connStatus) connStatus.textContent = 'ارتباط برقرار است ✅';
        showToast('اتصال با موفقیت برقرار شد', 'success');
      } else {
        throw new Error(data.error?.message || 'خطا در سرور');
      }
    } catch (e) {
      if (connStatus) connStatus.textContent = 'خطا در ارتباط ❌';
      showToast('خطا: ' + e.message, 'error');
    }
  }

  loadChatsList();
});
