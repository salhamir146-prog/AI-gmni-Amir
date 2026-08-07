document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. انتخاب المان‌های DOM
  // ==========================================
  const sidebar = document.getElementById('sidebar');
  const openSidebarBtn = document.getElementById('openSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  
  const modal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const settingsGearBtn = document.getElementById('settingsGearBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const promptInput = document.getElementById('promptInput');
  const sendBtn = document.getElementById('sendBtn');
  
  const chatContent = document.getElementById('chatContent');
  const welcomeContainer = document.getElementById('welcomeContainer');
  const messagesList = document.getElementById('messagesList');
  
  const modelSelect = document.getElementById('modelSelect');
  const currentModelName = document.getElementById('currentModelName');

  // ==========================================
  // 2. مدیریت سایدبار (منو)
  // ==========================================
  openSidebarBtn?.addEventListener('click', () => {
    sidebar.classList.add('active');
  });

  closeSidebarBtn?.addEventListener('click', () => {
    sidebar.classList.remove('active');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && 
        sidebar?.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !openSidebarBtn.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  });

  // ==========================================
  // 3. مدیریت مدال تنظیمات
  // ==========================================
  const toggleModal = (show) => {
    if (show) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    } else {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  openSettingsBtn?.addEventListener('click', () => toggleModal(true));
  settingsGearBtn?.addEventListener('click', () => toggleModal(true));
  closeModalBtn?.addEventListener('click', () => toggleModal(false));
  
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal(false);
  });

  const modalTabs = document.querySelectorAll('.modal-tab');
  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modalTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
      
      tab.classList.add('active');
      const targetPanel = document.querySelector(`[data-panel="${tab.dataset.tab}"]`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  saveSettingsBtn?.addEventListener('click', () => {
    if (modelSelect && currentModelName) {
      const selectedOption = modelSelect.options[modelSelect.selectedIndex];
      currentModelName.textContent = selectedOption.text.split('(')[0].trim();
    }
    toggleModal(false);
  });

  // ==========================================
  // 4. تغییر تم (تاریک / روشن)
  // ==========================================
  themeToggleBtn?.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
      icon.className = newTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    
    localStorage.setItem('theme', newTheme);
  });

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    const icon = themeToggleBtn?.querySelector('i');
    if (icon) {
      icon.className = savedTheme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  // ==========================================
  // 5. تغییر ارتفاع خودکار اینپوت و وضعیت دکمه ارسال
  // ==========================================
  promptInput?.addEventListener('input', () => {
    promptInput.style.height = 'auto';
    promptInput.style.height = Math.min(promptInput.scrollHeight, 180) + 'px';
    
    const hasText = promptInput.value.trim().length > 0;
    if (sendBtn) {
      sendBtn.disabled = !hasText;
      sendBtn.style.opacity = hasText ? '1' : '0.5';
      sendBtn.style.cursor = hasText ? 'pointer' : 'not-allowed';
    }
  });

  promptInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        handleSend();
      }
    }
  });

  sendBtn?.addEventListener('click', handleSend);

  // ==========================================
  // 6. ارسال پیام و پردازش پاسخ
  // ==========================================
  function handleSend() {
    const text = promptInput.value.trim();
    if (!text) return;

    if (welcomeContainer) welcomeContainer.style.display = 'none';
    if (messagesList) messagesList.style.display = 'flex';

    addMessage(text, 'user');

    promptInput.value = '';
    promptInput.style.height = 'auto';
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';
    sendBtn.style.cursor = 'not-allowed';

    const loadingMessageId = addLoadingIndicator();

    setTimeout(() => {
      removeLoadingIndicator(loadingMessageId);
      
      const mockAiResponse = `کد شما آماده شد:

\`\`\`html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>صفحه آزمایشی</title>
</head>
<body>
  <h1>سلام دنیا!</h1>
  <button onclick="alert('سلام!')">کلیک کنید</button>
</body>
</html>
\`\`\`

### نکات مهم:
1. استفاده از \`dir="rtl"\` جهت چیدمان راست به چپ.
2. انکودینگ \`UTF-8\` برای پشتیبانی زبان فارسی.`;

      addMessage(mockAiResponse, 'bot');
    }, 1200);
  }

  function addMessage(content, sender) {
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
    messagesList.appendChild(msgItem);
    scrollToBottom();
  }

  function addLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const msgItem = document.createElement('div');
    msgItem.className = 'message-item bot loading-item';
    msgItem.id = id;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble loading-bubble';
    bubble.innerHTML = `
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>`;

    msgItem.appendChild(bubble);
    messagesList.appendChild(msgItem);
    scrollToBottom();
    return id;
  }

  function removeLoadingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  }
});

// ==========================================
// 7. موتور رندر مارک‌داون و هایلایت سنتکس
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
      .replace(/(#[a-fa-f0-9]{3,8}|\b\d+px|\b\d+rem|\b\d+vh|\b\d+vw)/gi, '<span class="code-number">$1</span>')
      .replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="code-string">$1</span>');
  }

  if (l === 'js' || l === 'javascript' || l === 'ts' || l === 'typescript' || l === 'python' || l === 'py') {
    const keywords = /\b(const|let|var|function|return|if|else|for|while|import|export|from|class|async|await|def|print|in|is|not|and|or)\b/g;
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

  // ۱. استخراج بلوک‌های کد سه تایی (```)
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
            <button type="button" class="code-btn download-btn" onclick="downloadCodeSnippet(this)" title="دانلود کد">
              <i class="fa-solid fa-download"></i>
            </button>
          </div>
        </div>
        <pre><code>${highlightedCode}</code></pre>
      </div>`;

    codeBlocks.push(blockHtml);
    return `___CODE_BLOCK_${index}___`;
  });

  // ۲. امن‌سازی متن عادی
  processed = escapeHtml(processed);

  // ۳. پردازش کدهای درون‌خطی (`inline code`)
  processed = processed.replace(/`([^`]+)`/g, '<code class="inline-code" dir="ltr">$1</code>');

  // ۴. پردازش تیترها (Headings)
  processed = processed.replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>');
  processed = processed.replace(/^## (.*$)/gim, '<h2 class="md-h2">$1</h2>');
  processed = processed.replace(/^# (.*$)/gim, '<h1 class="md-h1">$1</h1>');

  // ۵. پردازش متون ضخیم و مورب
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // ۶. تبدیل خط جدید به <br>
  processed = processed.replace(/\n/g, '<br>');

  // ۷. بازگرداندن بلوک‌های کد به جایگاه اصلی
  codeBlocks.forEach((block, index) => {
    processed = processed.replace(`___CODE_BLOCK_${index}___`, block);
  });

  return processed;
}

// ==========================================
// 8. توابع کپی و دانلود کد
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

    setTimeout(() => {
      if (icon) icon.className = 'fa-regular fa-copy';
      if (span) span.textContent = 'کپی';
    }, 2000);
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
    json: 'json',
    xml: 'xml'
  };

  const ext = extMap[langText] || 'txt';
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `code.${ext}`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
