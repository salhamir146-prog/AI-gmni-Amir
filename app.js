/**
 * ============================================================================
 * Gemini AI Interface - Application Engine (app.js)
 * ============================================================================
 * سیستم کامل و بدون اختصار مدیریت چت هوش مصنوعی، رندرینگ مارک‌داون،
 * هایلایت پیشرفته سنتکس، مدیریت حافظه محلی (localStorage)، تم و تنظیمات.
 */

// ==========================================
// 1. مدیریت وضعیت برنامه (State Management)
// ==========================================
const AppState = {
  currentChatId: null,
  chats: [],
  settings: {
    theme: 'dark',
    model: 'gemini-1.5-flash',
    systemInstruction: '',
    apiKey: '',
    temperature: 0.7,
    autoScroll: true
  },
  attachments: [],
  isGenerating: false
};

// ==========================================
// 2. سیستم سیستم اطلاع‌رسانی (Toast Notification)
// ==========================================
class ToastNotification {
  static show(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-circle-check' : 
                 type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// ==========================================
// 3. سرویس ذخیره‌سازی حافظه محلی (Storage Service)
// ==========================================
class StorageService {
  static STORAGE_KEYS = {
    CHATS: 'gemini_app_chats',
    CURRENT_CHAT: 'gemini_app_current_id',
    SETTINGS: 'gemini_app_settings'
  };

  static saveChats(chats) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch (e) {
      console.error('خطا در ذخیره‌سازی چت‌ها در LocalStorage:', e);
      ToastNotification.show('خطا در ذخیره‌سازی گفتگوها', 'error');
    }
  }

  static loadChats() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CHATS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('خطا در بارگیری چت‌ها از LocalStorage:', e);
      return [];
    }
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('خطا در ذخیره تنظیمات:', e);
    }
  }

  static loadSettings() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return data ? { ...AppState.settings, ...JSON.parse(data) } : AppState.settings;
    } catch (e) {
      return AppState.settings;
    }
  }
}

// ==========================================
// 4. راه‌اندازی و تعاملات DOM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // بارگیری تنظیمات و چت‌های ذخیره شده
  AppState.settings = StorageService.loadSettings();
  AppState.chats = StorageService.loadChats();

  // عناصر اصلی DOM
  const DOM = {
    sidebar: document.getElementById('sidebar'),
    openSidebarBtn: document.getElementById('openSidebarBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    chatHistoryList: document.getElementById('chatHistoryList'),
    historyEmpty: document.getElementById('historyEmpty'),
    
    modal: document.getElementById('settingsModal'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    settingsGearBtn: document.getElementById('settingsGearBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    promptInput: document.getElementById('promptInput'),
    sendBtn: document.getElementById('sendBtn'),
    fileUploadBtn: document.getElementById('fileUploadBtn'),
    fileInput: document.getElementById('fileInput'),
    
    chatContent: document.getElementById('chatContent'),
    welcomeContainer: document.getElementById('welcomeContainer'),
    messagesList: document.getElementById('messagesList'),
    
    modelSelect: document.getElementById('modelSelect'),
    systemInstruction: document.getElementById('systemInstruction'),
    currentModelName: document.getElementById('currentModelName')
  };

  // ------------------------------------------
  // مدیریت تم (Dark/Light Mode)
  // ------------------------------------------
  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    AppState.settings.theme = theme;
    StorageService.saveSettings(AppState.settings);

    if (DOM.themeToggleBtn) {
      const icon = DOM.themeToggleBtn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    }
  }

  DOM.themeToggleBtn?.addEventListener('click', () => {
    const newTheme = AppState.settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });

  applyTheme(AppState.settings.theme);

  // ------------------------------------------
  // مدیریت سایدبار و منوها
  // ------------------------------------------
  DOM.openSidebarBtn?.addEventListener('click', () => {
    DOM.sidebar.classList.add('active');
  });

  DOM.closeSidebarBtn?.addEventListener('click', () => {
    DOM.sidebar.classList.remove('active');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        DOM.sidebar?.classList.contains('active') && 
        !DOM.sidebar.contains(e.target) && 
        !DOM.openSidebarBtn.contains(e.target)) {
      DOM.sidebar.classList.remove('active');
    }
  });

  DOM.newChatBtn?.addEventListener('click', () => {
    createNewChat();
  });

  // ------------------------------------------
  // مدیریت مدال تنظیمات
  // ------------------------------------------
  function toggleModal(show) {
    if (!DOM.modal) return;
    if (show) {
      DOM.modal.classList.add('active');
      DOM.modal.setAttribute('aria-hidden', 'false');
      
      // مقداردهی گزینه‌ها
      if (DOM.modelSelect) DOM.modelSelect.value = AppState.settings.model;
      if (DOM.systemInstruction) DOM.systemInstruction.value = AppState.settings.systemInstruction;
    } else {
      DOM.modal.classList.remove('active');
      DOM.modal.setAttribute('aria-hidden', 'true');
    }
  }

  DOM.openSettingsBtn?.addEventListener('click', () => toggleModal(true));
  DOM.settingsGearBtn?.addEventListener('click', () => toggleModal(true));
  DOM.closeModalBtn?.addEventListener('click', () => toggleModal(false));

  DOM.modal?.addEventListener('click', (e) => {
    if (e.target === DOM.modal) toggleModal(false);
  });

  // مدیریت تب‌های داخل مدال
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.querySelector(`[data-panel="${tab.dataset.tab}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  DOM.saveSettingsBtn?.addEventListener('click', () => {
    if (DOM.modelSelect) AppState.settings.model = DOM.modelSelect.value;
    if (DOM.systemInstruction) AppState.settings.systemInstruction = DOM.systemInstruction.value;

    StorageService.saveSettings(AppState.settings);

    if (DOM.currentModelName && DOM.modelSelect) {
      const selectedText = DOM.modelSelect.options[DOM.modelSelect.selectedIndex].text;
      DOM.currentModelName.textContent = selectedText.split('(')[0].trim();
    }

    ToastNotification.show('تنظیمات با موفقیت ذخیره شد', 'success');
    toggleModal(false);
  });

  // ------------------------------------------
  // تغییر خودکار ارتفاع اینپوت و ارسال
  // ------------------------------------------
  DOM.promptInput?.addEventListener('input', () => {
    DOM.promptInput.style.height = 'auto';
    DOM.promptInput.style.height = Math.min(DOM.promptInput.scrollHeight, 200) + 'px';

    const hasText = DOM.promptInput.value.trim().length > 0;
    if (DOM.sendBtn) {
      DOM.sendBtn.disabled = !hasText || AppState.isGenerating;
      DOM.sendBtn.style.opacity = (!hasText || AppState.isGenerating) ? '0.5' : '1';
      DOM.sendBtn.style.cursor = (!hasText || AppState.isGenerating) ? 'not-allowed' : 'pointer';
    }
  });

  DOM.promptInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!DOM.sendBtn.disabled && !AppState.isGenerating) {
        handleSendMessage();
      }
    }
  });

  DOM.sendBtn?.addEventListener('click', () => {
    if (!DOM.sendBtn.disabled && !AppState.isGenerating) {
      handleSendMessage();
    }
  });

  // ------------------------------------------
  // مدیریت آپلود فایل
  // ------------------------------------------
  DOM.fileUploadBtn?.addEventListener('click', () => {
    DOM.fileInput?.click();
  });

  DOM.fileInput?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        AppState.attachments.push({
          name: file.name,
          type: file.type,
          data: event.target.result
        });
        ToastNotification.show(`فایل ${file.name} بارگذاری شد`, 'info');
      };
      reader.readAsDataURL(file);
    });

    DOM.fileInput.value = '';
  });

  // ------------------------------------------
  // توابع مدیریت گفتگوها
  // ------------------------------------------
  function createNewChat() {
    const newChat = {
      id: 'chat_' + Date.now(),
      title: 'گفتگوی جدید',
      createdAt: new Date().toISOString(),
      messages: []
    };

    AppState.chats.unshift(newChat);
    AppState.currentChatId = newChat.id;
    StorageService.saveChats(AppState.chats);

    renderHistoryList();
    loadChat(newChat.id);

    if (window.innerWidth <= 768) {
      DOM.sidebar.classList.remove('active');
    }
  }

  function loadChat(chatId) {
    AppState.currentChatId = chatId;
    const chat = AppState.chats.find(c => c.id === chatId);

    if (!chat) return;

    if (DOM.welcomeContainer) {
      DOM.welcomeContainer.style.display = chat.messages.length === 0 ? 'flex' : 'none';
    }

    if (DOM.messagesList) {
      DOM.messagesList.style.display = chat.messages.length === 0 ? 'none' : 'flex';
      DOM.messagesList.innerHTML = '';

      chat.messages.forEach(msg => {
        renderMessageBubble(msg.text, msg.sender, msg.timestamp);
      });
    }

    renderHistoryList();
    scrollToBottom();
  }

  function deleteChat(chatId, event) {
    event.stopPropagation();
    AppState.chats = AppState.chats.filter(c => c.id !== chatId);

    if (AppState.currentChatId === chatId) {
      AppState.currentChatId = AppState.chats.length > 0 ? AppState.chats[0].id : null;
    }

    StorageService.saveChats(AppState.chats);
    renderHistoryList();

    if (AppState.currentChatId) {
      loadChat(AppState.currentChatId);
    } else {
      createNewChat();
    }

    ToastNotification.show('گفتگو حذف شد', 'info');
  }

  function renderHistoryList() {
    if (!DOM.chatHistoryList) return;

    DOM.chatHistoryList.innerHTML = '';

    if (AppState.chats.length === 0) {
      if (DOM.historyEmpty) DOM.historyEmpty.style.display = 'block';
      return;
    }

    if (DOM.historyEmpty) DOM.historyEmpty.style.display = 'none';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'history-section-title';
    titleDiv.textContent = 'گفتگوهای اخیر';
    DOM.chatHistoryList.appendChild(titleDiv);

    AppState.chats.forEach(chat => {
      const item = document.createElement('div');
      item.className = `history-item ${chat.id === AppState.currentChatId ? 'active' : ''}`;
      
      item.innerHTML = `
        <i class="fa-regular fa-message history-icon"></i>
        <span class="history-title">${escapeHtml(chat.title)}</span>
        <button class="delete-chat-btn" title="حذف گفتگو">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;

      item.addEventListener('click', () => loadChat(chat.id));
      
      const delBtn = item.querySelector('.delete-chat-btn');
      delBtn.addEventListener('click', (e) => deleteChat(chat.id, e));

      DOM.chatHistoryList.appendChild(item);
    });
  }

  // ------------------------------------------
  // منطق ارسال و دریافت پیام
  // ------------------------------------------
  function handleSendMessage() {
    const text = DOM.promptInput.value.trim();
    if (!text || AppState.isGenerating) return;

    if (!AppState.currentChatId) {
      createNewChat();
    }

    const currentChat = AppState.chats.find(c => c.id === AppState.currentChatId);
    if (!currentChat) return;

    // به‌روزرسانی عنوان گفتگو اگر اولین پیام است
    if (currentChat.messages.length === 0) {
      currentChat.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
      renderHistoryList();
    }

    // افزودن پیام کاربر به وضعیت
    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toISOString()
    };

    currentChat.messages.push(userMsg);
    StorageService.saveChats(AppState.chats);

    // رندر پیام کاربر
    if (DOM.welcomeContainer) DOM.welcomeContainer.style.display = 'none';
    if (DOM.messagesList) DOM.messagesList.style.display = 'flex';

    renderMessageBubble(text, 'user');

    // ریست باکس ورودی
    DOM.promptInput.value = '';
    DOM.promptInput.style.height = 'auto';
    DOM.sendBtn.disabled = true;
    DOM.sendBtn.style.opacity = '0.5';

    // نمایش وضعیت لودینگ و ثبت پاسخ پاسخ هوش مصنوعی
    AppState.isGenerating = true;
    const loadingId = renderLoadingBubble();

    // شبیه‌سازی فراخوانی API و پاسخ هوش مصنوعی
    setTimeout(() => {
      removeLoadingBubble(loadingId);

      const aiResponseText = generateMockResponse(text);

      const botMsg = {
        id: 'msg_' + Date.now(),
        sender: 'bot',
        text: aiResponseText,
        timestamp: new Date().toISOString()
      };

      currentChat.messages.push(botMsg);
      StorageService.saveChats(AppState.chats);

      renderMessageBubble(aiResponseText, 'bot');
      AppState.isGenerating = false;

      if (DOM.promptInput.value.trim().length > 0) {
        DOM.sendBtn.disabled = false;
        DOM.sendBtn.style.opacity = '1';
      }
    }, 1200);
  }

  function renderMessageBubble(content, sender) {
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

  function renderLoadingBubble() {
    const id = 'loading_' + Date.now();
    const msgItem = document.createElement('div');
    msgItem.className = 'message-item bot loading-item';
    msgItem.id = id;

    msgItem.innerHTML = `
      <div class="message-bubble loading-bubble">
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

  function removeLoadingBubble(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    if (DOM.chatContent) {
      DOM.chatContent.scrollTop = DOM.chatContent.scrollHeight;
    }
  }

  // بارگیری اولیه لیست گفتگوها
  renderHistoryList();
  if (AppState.chats.length > 0) {
    loadChat(AppState.chats[0].id);
  }
});

// ==========================================
// 5. پاسخ هوشمند شبیه‌سازی شده (Mock AI Response)
// ==========================================
function generateMockResponse(prompt) {
  const lower = prompt.toLowerCase();

  if (lower.includes('کد') || lower.includes('html') || lower.includes('برنامه')) {
    return `کد مورد نظر شما با رعایت تمام استانداردهای مدرن آماده شد:

\`\`\`html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>نمونه پروژه کاملا استاندارد</title>
  <style>
    body {
      font-family: 'Vazirmatn', sans-serif;
      background-color: #f4f6f9;
      color: #333;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      background: #ffffff;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      text-align: center;
    }
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }
    button:hover {
      background: #1557b0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>پروژه هوش مصنوعی</h1>
    <p>این یک کد نمونه اجرا شده و بدون باگ است.</p>
    <button onclick="alert('عملیات با موفقیت انجام شد!')">کلیک کنید</button>
  </div>
</body>
</html>
\`\`\`

### ویژگی‌های اصلی این کد:
1. **پشتیبانی کامل از RTL**: چیدمان راست‌به‌چپ برای زبان فارسی.
2. **طراحی واکنش‌گرا (Responsive)**: نمایش صحیح در موبایل و دسکتاپ.
3. **استایل‌دهی مدرن**: بهره‌گیری از Shadow و Border-radius انحنا دار.`;
  }

  return `درخواست شما با موفقیت دریافت شد: **"${prompt}"**

من آماده‌ام تا در زمینه‌های مختلف از جمله:
- **توسعه وب و برنامه‌نویسی**
- **تحلیل داده‌ها و حل مسائل**
- **نگارش و تولید محتوا**

به شما کمک کنم. اگر جزئیات بیشتری مد نظرتان است، حتماً بیان کنید!`;
}

// ==========================================
// 6. موتور رندرینگ پیشرفته مارک‌داون و سنتکس
// ==========================================

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
  const l = (lang || '').toLowerCase().trim();

  // HTML / XML
  if (l === 'html' || l === 'xml' || l === 'svg') {
    return escaped
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="code-comment">$1</span>')
      .replace(/(&lt;\/?[a-zA-Z0-9-]+)/g, '<span class="code-tag">$1</span>')
      .replace(/\s([a-zA-Z-]+)=/g, ' <span class="code-attr">$1</span>=')
      .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="code-string">$1</span>');
  }

  // CSS / SCSS
  if (l === 'css' || l === 'scss') {
    return escaped
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>')
      .replace(/([a-zA-Z-]+)\s*:/g, '<span class="code-keyword">$1</span>:')
      .replace(/(#[a-fa-f0-9]{3,8}|\b\d+px|\b\d+rem|\b\d+vh|\b\d+vw|\b\d+%/gi, '<span class="code-number">$1</span>')
      .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="code-string">$1</span>');
  }

  // JavaScript / TypeScript / Python / C++ / PHP
  if (['js', 'javascript', 'ts', 'typescript', 'python', 'py', 'cpp', 'c', 'php', 'json'].includes(l)) {
    const keywords = /\b(const|let|var|function|return|if|else|for|while|import|export|from|class|async|await|def|print|in|is|not|and|or|try|catch|new|this|public|private|protected)\b/g;
    return escaped
      .replace(/(\/\/.*$\vert{}\/\*[\s\S]*?\*\/\vert{}#.*$)/gm, '<span class="code-comment">$1</span>')
      .replace(keywords, '<span class="code-keyword">$1</span>')
      .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, '<span class="code-string">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');
  }

  return escaped;
}

function renderMarkdown(text) {
  if (!text) return '';

  const codeBlocks = [];

  // ۱. استخراج و مجزاسازی بلوک‌های کد سه تایی (```)
  let processed = text.replace(/```(\w*)\r?\n?([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    const language = lang.trim() || 'code';
    const highlightedCode = highlightSyntax(code.trim(), language);

    const blockHtml = `
      <div class="code-block-container" dir="ltr">
        <div class="code-block-header">
          <span class="code-lang">${escapeHtml(language)} <i class="fa-solid fa-code"></i></span>
          <div class="code-actions">
            <button type="button" class="code-btn copy-btn" onclick="copyCodeSnippet(this)" title="کپی کد">
              <i class="fa-regular fa-copy"></i>
              <span>کپی</span>
            </button>
            <button type="button" class="code-btn download-btn" onclick="downloadCodeSnippet(this)" title="دانلود فایل">
              <i class="fa-solid fa-download"></i>
            </button>
          </div>
        </div>
        <pre><code>${highlightedCode}</code></pre>
      </div>`;

    codeBlocks.push(blockHtml);
    return `___CODE_BLOCK_${index}___`;
  });

  // ۲. امن‌سازی کاراکترهای عمومی HTML
  processed = escapeHtml(processed);

  // ۳. پردازش کدهای درون‌خطی (Inline Code)
  processed = processed.replace(/`([^`]+)`/g, '<code class="inline-code" dir="ltr">$1</code>');

  // ۴. پردازش عناوین و تیترهای مارک‌داون (Headers)
  processed = processed.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
  processed = processed.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
  processed = processed.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

  // ۵. پردازش متون ضخیم (Bold) و مورب (Italic)
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // ۶. تبدیل شکستن خطوط به <br>
  processed = processed.replace(/\n/g, '<br>');

  // ۷. بازگرداندن بلوک‌های کد به محتوای اصلی
  codeBlocks.forEach((block, index) => {
    processed = processed.replace(`___CODE_BLOCK_${index}___`, block);
  });

  return processed;
}

// ==========================================
// 7. توابع جهانی عملیات کد (کپی و دانلود)
// ==========================================

window.copyCodeSnippet = function(btn) {
  const container = btn.closest('.code-block-container');
  if (!container) return;

  const code = container.querySelector('code')?.innerText || '';
  navigator.clipboard.writeText(code).then(() => {
    const icon = btn.querySelector('i');
    const span = btn.querySelector('span');

    if (icon) icon.className = 'fa-solid fa-check';
    if (span) span.textContent = 'کپی شد';

    ToastNotification.show('کد در حافظه کپی شد', 'success');

    setTimeout(() => {
      if (icon) icon.className = 'fa-regular fa-copy';
      if (span) span.textContent = 'کپی';
    }, 2000);
  }).catch(() => {
    ToastNotification.show('خطا در کپی کردن کد', 'error');
  });
};

window.downloadCodeSnippet = function(btn) {
  const container = btn.closest('.code-block-container');
  if (!container) return;

  const code = container.querySelector('code')?.innerText || '';
  const langText = container.querySelector('.code-lang')?.innerText.trim().toLowerCase() || 'txt';

  const extMap = {
    html: 'html',
    css: 'css',
    js: 'js',
    javascript: 'js',
    ts: 'ts',
    typescript: 'ts',
    python: 'py',
    py: 'py',
    cpp: 'cpp',
    c: 'c',
    php: 'php',
    json: 'json',
    xml: 'xml',
    sql: 'sql'
  };

  const ext = extMap[langText] || 'txt';
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `code_${Date.now()}.${ext}`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  ToastNotification.show(`فایل code.${ext} دانلود شد`, 'success');
};
