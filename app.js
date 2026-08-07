
document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. وضعیت اصلی برنامه (State Management)
  // ==========================================================================
  const state = {
    chats: [],
    activeChatId: null,
    settings: {
      model: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 4096,
      systemInstruction: ''
    },
    attachedFiles: [],
    isGenerating: false,
    theme: 'dark'
  };

  // ==========================================================================
  // 2. ارجاعات DOM
  // ==========================================================================
  const DOM = {
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    openSidebarBtn: document.getElementById('openSidebarBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    historyContainer: document.getElementById('historyContainer'),
    historyEmpty: document.getElementById('historyEmpty'),
    searchHistoryInput: document.getElementById('searchHistoryInput'),
    
    modal: document.getElementById('settingsModal'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    settingsGearBtn: document.getElementById('settingsGearBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    clearChatBtn: document.getElementById('clearChatBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    clearAllHistoryBtn: document.getElementById('clearAllHistoryBtn'),
    
    promptInput: document.getElementById('promptInput'),
    sendBtn: document.getElementById('sendBtn'),
    fileUploadBtn: document.getElementById('fileUploadBtn'),
    fileInput: document.getElementById('fileInput'),
    filePreviewContainer: document.getElementById('filePreviewContainer'),
    voiceInputBtn: document.getElementById('voiceInputBtn'),
    charCounter: document.getElementById('charCounter'),
    
    chatContent: document.getElementById('chatContent'),
    welcomeContainer: document.getElementById('welcomeContainer'),
    messagesList: document.getElementById('messagesList'),
    scrollToBottomBtn: document.getElementById('scrollToBottomBtn'),
    
    currentModelName: document.getElementById('currentModelName'),
    chatTitleHeader: document.getElementById('chatTitleHeader'),
    modelSelect: document.getElementById('modelSelect'),
    temperatureInput: document.getElementById('temperatureInput'),
    tempValueDisplay: document.getElementById('tempValueDisplay'),
    maxTokensSelect: document.getElementById('maxTokensSelect'),
    systemInstruction: document.getElementById('systemInstruction'),
    totalChatsCount: document.getElementById('totalChatsCount'),
    storageSizeCount: document.getElementById('storageSizeCount'),
    toastContainer: document.getElementById('toastContainer')
  };

  // ==========================================================================
  // 3. توابع اعلانات Toast
  // ==========================================================================
  function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ==========================================================================
  // 4. مدیریت حافظه محلی LocalStorage
  // ==========================================================================
  function loadFromStorage() {
    try {
      const savedChats = localStorage.getItem('gemini_chats');
      if (savedChats) state.chats = JSON.parse(savedChats);

      const savedSettings = localStorage.getItem('gemini_settings');
      if (savedSettings) state.settings = JSON.parse(savedSettings);

      const savedTheme = localStorage.getItem('gemini_theme') || 'dark';
      state.theme = savedTheme;
      document.body.setAttribute('data-theme', savedTheme);
      updateThemeIcon(savedTheme);

      applySettingsToUI();
    } catch (e) {
      console.error('Error loading local storage', e);
      showToast('خطا در بارگذاری حافظه محلی', 'error');
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem('gemini_chats', JSON.stringify(state.chats));
      localStorage.setItem('gemini_settings', JSON.stringify(state.settings));
      localStorage.setItem('gemini_theme', state.theme);
      updateStorageMetrics();
    } catch (e) {
      console.error('Storage quota exceeded', e);
      showToast('حافظه مرورگر پر شده است', 'error');
    }
  }

  function updateStorageMetrics() {
    const dataStr = JSON.stringify(state.chats) + JSON.stringify(state.settings);
    const bytes = new Blob([dataStr]).size;
    const kb = (bytes / 1024).toFixed(1);
    
    if (DOM.totalChatsCount) DOM.totalChatsCount.textContent = state.chats.length;
    if (DOM.storageSizeCount) DOM.storageSizeCount.textContent = `${kb} KB`;
  }

  // ==========================================================================
  // 5. مدیریت تم (تاریک / روشن)
  // ==========================================================================
  function updateThemeIcon(theme) {
    if (!DOM.themeToggleBtn) return;
    const icon = DOM.themeToggleBtn.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  DOM.themeToggleBtn?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', state.theme);
    updateThemeIcon(state.theme);
    saveToStorage();
    showToast(`حالت ${state.theme === 'dark' ? 'شب' : 'روز'} فعال شد`, 'info');
  });

  // ==========================================================================
  // 6. مدیریت سایدبار و منو
  // ==========================================================================
  function toggleSidebar(open) {
    if (open) {
      DOM.sidebar.classList.add('active');
      DOM.sidebarOverlay.classList.add('active');
    } else {
      DOM.sidebar.classList.remove('active');
      DOM.sidebarOverlay.classList.remove('active');
    }
  }

  DOM.openSidebarBtn?.addEventListener('click', () => toggleSidebar(true));
  DOM.closeSidebarBtn?.addEventListener('click', () => toggleSidebar(false));
  DOM.sidebarOverlay?.addEventListener('click', () => toggleSidebar(false));

  // ==========================================================================
  // 7. سیستم مدیریت گفتگوها (Chats Management)
  // ==========================================================================
  function createNewChat() {
    const newChat = {
      id: 'chat_' + Date.now(),
      title: 'گفتگوی جدید',
      createdAt: new Date().toISOString(),
      messages: []
    };

    state.chats.unshift(newChat);
    state.activeChatId = newChat.id;
    saveToStorage();
    renderSidebarHistory();
    loadActiveChat();
    showToast('گفتگوی جدید ایجاد شد', 'success');
  }

  function loadActiveChat() {
    const currentChat = state.chats.find(c => c.id === state.activeChatId);
    
    if (!currentChat || currentChat.messages.length === 0) {
      DOM.welcomeContainer.style.display = 'flex';
      DOM.messagesList.style.display = 'none';
      DOM.messagesList.innerHTML = '';
      DOM.chatTitleHeader.textContent = 'گفتگوی جدید';
      return;
    }

    DOM.welcomeContainer.style.display = 'none';
    DOM.messagesList.style.display = 'flex';
    DOM.messagesList.innerHTML = '';
    DOM.chatTitleHeader.textContent = currentChat.title;

    currentChat.messages.forEach(msg => {
      renderMessageItem(msg.text, msg.sender, false);
    });

    scrollToBottom();
  }

  function deleteChat(chatId, event) {
    event?.stopPropagation();
    state.chats = state.chats.filter(c => c.id !== chatId);
    
    if (state.activeChatId === chatId) {
      state.activeChatId = state.chats.length > 0 ? state.chats[0].id : null;
    }

    saveToStorage();
    renderSidebarHistory();
    loadActiveChat();
    showToast('گفتگو حذف شد', 'info');
  }

  function renameChat(chatId, event) {
    event?.stopPropagation();
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    const newTitle = prompt('عنوان جدید گفتگو را وارد کنید:', chat.title);
    if (newTitle && newTitle.trim()) {
      chat.title = newTitle.trim();
      saveToStorage();
      renderSidebarHistory();
      if (state.activeChatId === chatId) {
        DOM.chatTitleHeader.textContent = chat.title;
      }
    }
  }

  function renderSidebarHistory(filterText = '') {
    DOM.historyContainer.innerHTML = '';
    
    const filteredChats = state.chats.filter(c => 
      c.title.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filteredChats.length === 0) {
      DOM.historyEmpty.style.display = 'block';
      return;
    }

    DOM.historyEmpty.style.display = 'none';

    filteredChats.forEach(chat => {
      const item = document.createElement('div');
      item.className = `history-item ${chat.id === state.activeChatId ? 'active' : ''}`;
      
      item.innerHTML = `
        <span class="history-item-title">${escapeHtml(chat.title)}</span>
        <div class="history-item-actions">
          <button class="history-action-btn edit-btn" title="تغییر نام"><i class="fa-solid fa-pen"></i></button>
          <button class="history-action-btn delete-btn" title="حذف"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;

      item.addEventListener('click', () => {
        state.activeChatId = chat.id;
        renderSidebarHistory(filterText);
        loadActiveChat();
        if (window.innerWidth <= 768) toggleSidebar(false);
      });

      item.querySelector('.edit-btn').addEventListener('click', (e) => renameChat(chat.id, e));
      item.querySelector('.delete-btn').addEventListener('click', (e) => deleteChat(chat.id, e));

      DOM.historyContainer.appendChild(item);
    });
  }

  DOM.newChatBtn?.addEventListener('click', createNewChat);
  DOM.clearChatBtn?.addEventListener('click', () => {
    if (!state.activeChatId) return;
    if (confirm('آیا از پاک کردن پیام‌های این گفتگو اطمینان دارید؟')) {
      const currentChat = state.chats.find(c => c.id === state.activeChatId);
      if (currentChat) {
        currentChat.messages = [];
        saveToStorage();
        loadActiveChat();
        showToast('پیام‌ها پاک شدند', 'info');
      }
    }
  });

  DOM.searchHistoryInput?.addEventListener('input', (e) => {
    renderSidebarHistory(e.target.value.trim());
  });

  // ==========================================================================
  // 8. ورود سریع و پرامپت‌های پیشنهادی
  // ==========================================================================
  document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const promptText = btn.dataset.prompt;
      if (promptText) {
        DOM.promptInput.value = promptText;
        handleSendMessage();
      }
    });
  });

  // ==========================================================================
  // 9. تغییر ارتفاع اتوماتیک و کنترل دکمه ارسال
  // ==========================================================================
  DOM.promptInput?.addEventListener('input', () => {
    DOM.promptInput.style.height = 'auto';
    DOM.promptInput.style.height = Math.min(DOM.promptInput.scrollHeight, 180) + 'px';
    
    const length = DOM.promptInput.value.length;
    DOM.charCounter.textContent = `${length} / 4000`;
    
    const isValid = length > 0 && length <= 4000;
    DOM.sendBtn.disabled = !isValid;
  });

  DOM.promptInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!DOM.sendBtn.disabled) {
        handleSendMessage();
      }
    }
  });

  DOM.sendBtn?.addEventListener('click', handleSendMessage);

  // ==========================================================================
  // 10. آپلود فایل و پیش‌نمایش
  // ==========================================================================
  DOM.fileUploadBtn?.addEventListener('click', () => DOM.fileInput.click());

  DOM.fileInput?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      state.attachedFiles.push(file);
    });
    renderFilePreviews();
  });

  function renderFilePreviews() {
    if (state.attachedFiles.length === 0) {
      DOM.filePreviewContainer.style.display = 'none';
      DOM.filePreviewContainer.innerHTML = '';
      return;
    }

    DOM.filePreviewContainer.style.display = 'flex';
    DOM.filePreviewContainer.innerHTML = '';

    state.attachedFiles.forEach((file, index) => {
      const chip = document.createElement('div');
      chip.className = 'file-chip';
      chip.innerHTML = `
        <i class="fa-solid fa-file-code"></i>
        <span>${escapeHtml(file.name)}</span>
        <i class="fa-solid fa-xmark file-chip-remove" data-index="${index}"></i>
      `;

      chip.querySelector('.file-chip-remove').addEventListener('click', () => {
        state.attachedFiles.splice(index, 1);
        renderFilePreviews();
      });

      DOM.filePreviewContainer.appendChild(chip);
    });
  }

  // ==========================================================================
  // 11. موتور پردازش و ارسال پیام
  // ==========================================================================
  function handleSendMessage() {
    const text = DOM.promptInput.value.trim();
    if (!text && state.attachedFiles.length === 0) return;

    if (!state.activeChatId) {
      const newChat = {
        id: 'chat_' + Date.now(),
        title: text.substring(0, 30) || 'گفتگوی جدید',
        createdAt: new Date().toISOString(),
        messages: []
      };
      state.chats.unshift(newChat);
      state.activeChatId = newChat.id;
      renderSidebarHistory();
    }

    const currentChat = state.chats.find(c => c.id === state.activeChatId);
    if (currentChat && currentChat.messages.length === 0 && text) {
      currentChat.title = text.substring(0, 30);
      DOM.chatTitleHeader.textContent = currentChat.title;
      renderSidebarHistory();
    }

    // افزودن پیام کاربر
    currentChat.messages.push({ sender: 'user', text: text });
    renderMessageItem(text, 'user');

    // ریست حالت ورودی
    DOM.promptInput.value = '';
    DOM.promptInput.style.height = 'auto';
    DOM.charCounter.textContent = '0 / 4000';
    DOM.sendBtn.disabled = true;
    state.attachedFiles = [];
    renderFilePreviews();

    DOM.welcomeContainer.style.display = 'none';
    DOM.messagesList.style.display = 'flex';

    // نمایش وضعیت لودینگ
    const loadingId = showLoadingIndicator();

    // شبیه‌سازی پاسخ استریمینگ هوش مصنوعی
    simulateAIResponse(text, loadingId, currentChat);
  }

  function renderMessageItem(content, sender, animate = true) {
    const msgItem = document.createElement('div');
    msgItem.className = `message-item ${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (sender === 'bot') {
      bubble.innerHTML = renderMarkdown(content);
    } else {
      bubble.textContent = content;
    }

    msgItem.appendChild(bubble);
    DOM.messagesList.appendChild(msgItem);
    scrollToBottom();
  }

  function showLoadingIndicator() {
    const id = 'loading_' + Date.now();
    const msgItem = document.createElement('div');
    msgItem.className = 'message-item bot';
    msgItem.id = id;

    msgItem.innerHTML = `
      <div class="message-bubble">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    DOM.messagesList.appendChild(msgItem);
    scrollToBottom();
    return id;
  }

  function simulateAIResponse(userPrompt, loadingId, currentChat) {
    setTimeout(() => {
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();

      let mockResponse = `پاسخ بررسی شد. این یک کد نمونه کامل طبق درخواست شماست:

\`\`\`html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>نمونه کارت UI</title>
  <style>
    body { font-family: Tahoma, sans-serif; background: #f4f4f9; padding: 20px; }
    .card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="card">
    <h2>عنوان کارت</h2>
    <p>این یک متن توضیحی داخل کارت است.</p>
  </div>
</body>
</html>
\`\`\`

### نکات کد:
- استفاده از ساختار استاندارد HTML5
- رعایت جهت‌نما \`dir="rtl"\` برای زبان فارسی`;

      if (userPrompt.includes('پایتون')) {
        mockResponse = `این هم کد پایتون محاسبه فاکتوریل:

\`\`\`python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

# تست تابع
number = 5
print(f"فاکتوریل {number} برابر است با: {factorial(number)}")
\`\`\`

**توضیحات:** این تابع به صورت **بازگشتی (Recursive)** نوشته شده است.`;
      }

      currentChat.messages.push({ sender: 'bot', text: mockResponse });
      saveToStorage();
      renderMessageItem(mockResponse, 'bot');
    }, 1200);
  }

  function scrollToBottom() {
    DOM.chatContent.scrollTop = DOM.chatContent.scrollHeight;
  }

  DOM.chatContent?.addEventListener('scroll', () => {
    const diff = DOM.chatContent.scrollHeight - DOM.chatContent.clientHeight - DOM.chatContent.scrollTop;
    if (diff > 150) {
      DOM.scrollToBottomBtn.style.display = 'flex';
    } else {
      DOM.scrollToBottomBtn.style.display = 'none';
    }
  });

  DOM.scrollToBottomBtn?.addEventListener('click', scrollToBottom);

  // ==========================================================================
  // 12. رندر مارک‌داون و هایلایت سنتکس کد
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function highlightSyntax(code, lang) {
    let escaped = escapeHtml(code);
    const l = (lang || '').toLowerCase();

    if (l === 'html' || l === 'xml') {
      return escaped
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="code-comment">$1</span>')
        .replace(/(&lt;\/?[a-zA-Z0-9-]+)/g, '<span class="code-tag">$1</span>')
        .replace(/\s([a-zA-Z-]+)=/g, ' <span class="code-attr">$1</span>=')
        .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="code-string">$1</span>');
    }

    if (l === 'css') {
      return escaped
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>')
        .replace(/([a-zA-Z-]+)\s*:/g, '<span class="code-keyword">$1</span>:')
        .replace(/(#[a-fa-f0-9]{3,8}|\b\d+px|\b\d+rem)/gi, '<span class="code-number">$1</span>')
        .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="code-string">$1</span>');
    }

    if (['js', 'javascript', 'ts', 'python', 'py'].includes(l)) {
      const keywords = /\b(const|let|var|function|return|if|else|for|while|import|export|class|def|print|async|await)\b/g;
      return escaped
        .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, '<span class="code-comment">$1</span>')
        .replace(keywords, '<span class="code-keyword">$1</span>')
        .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, '<span class="code-string">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');
    }

    return escaped;
  }

  function renderMarkdown(text) {
    if (!text) return '';

    const codeBlocks = [];

    // ۱. استخراج بلوک‌های کد سه تایی
    let processed = text.replace(/```(\w*)\r?\n?([\s\S]*?)```/g, (match, lang, code) => {
      const index = codeBlocks.length;
      const language = lang.trim() || 'code';
      const highlightedCode = highlightSyntax(code.trim(), language);

      const blockHtml = `
        <div class="code-block-container" dir="ltr">
          <div class="code-block-header">
            <span class="code-lang"><i class="fa-solid fa-code"></i> ${escapeHtml(language)}</span>
            <div class="code-actions">
              <button type="button" class="code-btn" onclick="copyCodeSnippet(this)">
                <i class="fa-regular fa-copy"></i> کپی
              </button>
              <button type="button" class="code-btn" onclick="downloadCodeSnippet(this)">
                <i class="fa-solid fa-download"></i> دانلود
              </button>
            </div>
          </div>
          <pre><code>${highlightedCode}</code></pre>
        </div>`;

      codeBlocks.push(blockHtml);
      return `___CODE_BLOCK_${index}___`;
    });

    // ۲. امن‌سازی متن
    processed = escapeHtml(processed);

    // ۳. کدهای درون‌خطی Inline Code
    processed = processed.replace(/`([^`]+)`/g, '<code class="inline-code" dir="ltr">$1</code>');

    // ۴. تیترها
    processed = processed.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
    processed = processed.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
    processed = processed.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

    // ۵. فرمت متن (بولد و ایتالیک)
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    processed = processed.replace(/\n/g, '<br>');

    // ۶. جایگذاری مجدد بلوک‌های کد
    codeBlocks.forEach((block, index) => {
      processed = processed.replace(`___CODE_BLOCK_${index}___`, block);
    });

    return processed;
  }

  // ==========================================================================
  // 13. توابع جهانی کپی و دانلود کد
  // ==========================================================================
  window.copyCodeSnippet = function(btn) {
    const container = btn.closest('.code-block-container');
    const code = container.querySelector('code')?.innerText || '';
    
    navigator.clipboard.writeText(code).then(() => {
      btn.innerHTML = `<i class="fa-solid fa-check"></i> کپی شد`;
      setTimeout(() => {
        btn.innerHTML = `<i class="fa-regular fa-copy"></i> کپی`;
      }, 2000);
      showToast('کد در حافظه کپی شد', 'success');
    });
  };

  window.downloadCodeSnippet = function(btn) {
    const container = btn.closest('.code-block-container');
    const code = container.querySelector('code')?.innerText || '';
    const lang = container.querySelector('.code-lang')?.innerText.trim().toLowerCase() || 'txt';
    
    const extMap = { html: 'html', css: 'css', js: 'js', python: 'py', py: 'py' };
    const ext = extMap[lang] || 'txt';

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('فایل کد دانلود شد', 'info');
  };

  // ==========================================================================
  // 14. مدال تنظیمات
  // ==========================================================================
  function toggleModal(show) {
    if (show) DOM.modal.classList.add('active');
    else DOM.modal.classList.remove('active');
  }

  DOM.openSettingsBtn?.addEventListener('click', () => toggleModal(true));
  DOM.settingsGearBtn?.addEventListener('click', () => toggleModal(true));
  DOM.closeModalBtn?.addEventListener('click', () => toggleModal(false));
  DOM.modal?.addEventListener('click', (e) => {
    if (e.target === DOM.modal) toggleModal(false);
  });

  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add('active');
    });
  });

  DOM.temperatureInput?.addEventListener('input', (e) => {
    DOM.tempValueDisplay.textContent = e.target.value;
  });

  function applySettingsToUI() {
    if (DOM.modelSelect) DOM.modelSelect.value = state.settings.model;
    if (DOM.temperatureInput) DOM.temperatureInput.value = state.settings.temperature;
    if (DOM.tempValueDisplay) DOM.tempValueDisplay.textContent = state.settings.temperature;
    if (DOM.maxTokensSelect) DOM.maxTokensSelect.value = state.settings.maxTokens;
    if (DOM.systemInstruction) DOM.systemInstruction.value = state.settings.systemInstruction;
    if (DOM.currentModelName) {
      const selectedOpt = DOM.modelSelect.options[DOM.modelSelect.selectedIndex];
      DOM.currentModelName.textContent = selectedOpt.text.split('(')[0].trim();
    }
  }

  DOM.saveSettingsBtn?.addEventListener('click', () => {
    state.settings.model = DOM.modelSelect.value;
    state.settings.temperature = parseFloat(DOM.temperatureInput.value);
    state.settings.maxTokens = parseInt(DOM.maxTokensSelect.value);
    state.settings.systemInstruction = DOM.systemInstruction.value.trim();

    saveToStorage();
    applySettingsToUI();
    toggleModal(false);
    showToast('تنظیمات با موفقیت ذخیره شد', 'success');
  });

  DOM.clearAllHistoryBtn?.addEventListener('click', () => {
    if (confirm('آیا از حذف تمام گفتگوها اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) {
      state.chats = [];
      state.activeChatId = null;
      saveToStorage();
      renderSidebarHistory();
      loadActiveChat();
      toggleModal(false);
      showToast('تمام گفتگوها پاکسازی شدند', 'info');
    }
  });

  DOM.exportDataBtn?.addEventListener('click', () => {
    const dataStr = JSON.stringify(state.chats, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('خروجی با موفقیت گرفته شد', 'success');
  });

  // ==========================================================================
  // 15. راه‌اندازی اولیه
  // ==========================================================================
  loadFromStorage();
  renderSidebarHistory();
  loadActiveChat();
});
