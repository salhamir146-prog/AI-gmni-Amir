// ==========================================================================
// معماری مدیریت وضعیت برنامه (State Management)
// ==========================================================================
const state = {
  chats: [],
  activeChatId: null,
  settings: {
    model: 'gemini-3.5-flash',
    systemPrompt: 'تو یک دستیار کدنویسی و توسعه وب صمیمی و کاربلد هستی.'
  }
};

// الگوهای دسترسی به اجزای DOM
const dom = {
  chatList: document.getElementById('chatListContainer'),
  messagesContainer: document.getElementById('chatMessagesContainer'),
  chatInput: document.getElementById('chatInput'),
  sendBtn: document.getElementById('sendBtn'),
  newChatBtn: document.getElementById('newChatBtn'),
  currentChatTitle: document.getElementById('currentChatTitle'),
  activeModelBadge: document.getElementById('activeModelBadge'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  modelSelect: document.getElementById('modelSelect'),
  systemPromptInput: document.getElementById('systemPromptInput'),
  backupBtn: document.getElementById('backupBtn')
};

// ==========================================================================
// موتور ذخیره‌سازی محلی (LocalStorage Driver)
// ==========================================================================
function saveToStorage() {
  localStorage.setItem('ai_workspace_chats', JSON.stringify(state.chats));
  localStorage.setItem('ai_workspace_active_id', state.activeChatId);
  localStorage.setItem('ai_workspace_settings', JSON.stringify(state.settings));
}

function loadFromStorage() {
  const savedChats = localStorage.getItem('ai_workspace_chats');
  const savedActiveId = localStorage.getItem('ai_workspace_active_id');
  const savedSettings = localStorage.getItem('ai_workspace_settings');

  if (savedChats) state.chats = JSON.parse(savedChats);
  if (savedActiveId) state.activeChatId = savedActiveId;
  if (savedSettings) {
    state.settings = JSON.parse(savedSettings);
    // اعمال مقادیر ذخیره شده در فرم تنظیمات
    if (dom.modelSelect) dom.modelSelect.value = state.settings.model;
    if (dom.systemPromptInput) dom.systemPromptInput.value = state.settings.systemPrompt;
  }
  
  updateModelBadge();
}

// ==========================================================================
// توابع کنترلر و لایه رابط کاربری (UI Controller)
// ==========================================================================
function createNewChat() {
  const newId = 'chat_' + Date.now();
  const newChat = {
    id: newId,
    title: `گفتگوی جدید ${state.chats.length + 1}`,
    messages: []
  };
  state.chats.unshift(newChat);
  state.activeChatId = newId;
  saveToStorage();
  renderSidebar();
  switchChat(newId);
}

function switchChat(chatId) {
  state.activeChatId = chatId;
  saveToStorage();
  
  // فعال کردن کلاس اکتیو در سایدبار
  document.querySelectorAll('.chat-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.id === chatId) item.classList.add('active');
  });

  const currentChat = state.chats.find(c => c.id === chatId);
  if (currentChat) {
    dom.currentChatTitle.textContent = currentChat.title;
    dom.messagesContainer.innerHTML = '';
    
    if (currentChat.messages.length === 0) {
      // نمایش صفحه خوش‌آمدگویی در صورت خالی بودن گفتگو
      showWelcomeScreen();
    } else {
      currentChat.messages.forEach(msg => {
        renderMessageItem(msg.text, msg.sender);
      });
    }
    dom.messagesContainer.scrollTop = dom.messagesContainer.scrollHeight;
  }
}

function deleteChat(chatId, event) {
  event.stopPropagation(); // جلوگیری از کلیک روی کل آیتم چت
  state.chats = state.chats.filter(c => c.id !== chatId);
  
  if (state.activeChatId === chatId) {
    state.activeChatId = state.chats.length > 0 ? state.chats[0].id : null;
  }
  
  saveToStorage();
  renderSidebar();
  
  if (state.activeChatId) {
    switchChat(state.activeChatId);
  } else {
    dom.currentChatTitle.textContent = 'منوی گفتگو خالی است';
    dom.messagesContainer.innerHTML = '';
    showWelcomeScreen();
  }
}

function showWelcomeScreen() {
  dom.messagesContainer.innerHTML = `
    <div style="text-align: center; margin: auto; max-width: 500px; color: var(--text-muted); padding: 20px;">
      <i class="bi bi-chat-square-text" style="font-size: 48px; color: #3f607a;"></i>
      <h2 style="color: white; margin-top: 15px; font-weight: 400;">چت شبیه‌ساز مدل‌های نسل جدید</h2>
      <p style="font-size: 14px; margin-top: 10px; line-height: 1.6;">
        یک گفتگو را انتخاب کنید یا پیام خود را در باکس پایین بنویسید. مدل‌های جدید Gemini 3.6، DeepSeek و Llama آماده بررسی ساختارها هستند.
      </p>
    </div>
  `;
}

function renderSidebar() {
  dom.chatList.innerHTML = '';
  state.chats.forEach(chat => {
    const item = document.createElement('div');
    item.className = `chat-item ${chat.id === state.activeChatId ? 'active' : ''}`;
    item.dataset.id = chat.id;
    item.onclick = () => switchChat(chat.id);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'chat-item-title';
    titleSpan.innerHTML = `<i class="bi bi-chat-left-text" style="margin-left: 8px;"></i> ${chat.title}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-chat-btn';
    delBtn.innerHTML = '<i class="bi bi-trash3"></i>';
    delBtn.onclick = (e) => deleteChat(chat.id, e);

    item.appendChild(titleSpan);
    item.appendChild(delBtn);
    dom.chatList.appendChild(item);
  });
}

function renderMessageItem(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'avatar';
  avatarDiv.innerHTML = sender === 'user' ? '<i class="bi bi-person"></i>' : '<i class="bi bi-cpu"></i>';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  // فرمت‌دهی ساده برای نمایش بلاک‌های کدهای برنامه
  if (text.includes('```')) {
    contentDiv.innerHTML = formatCodeBlocks(text);
  } else {
    contentDiv.textContent = text;
  }

  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  dom.messagesContainer.appendChild(messageDiv);
  dom.messagesContainer.scrollTop = dom.messagesContainer.scrollHeight;
}

function formatCodeBlocks(text) {
  const parts = text.split(/```/g);
  for (let i = 1; i < parts.length; i += 2) {
    const block = parts[i];
    const firstNewLine = block.indexOf('\n');
    const language = block.substring(0, firstNewLine).trim();
    const code = block.substring(firstNewLine + 1);
    parts[i] = `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
  }
  return parts.join('');
}

function escapeHtml(html) {
  return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function updateModelBadge() {
  if (dom.modelSelect && dom.activeModelBadge) {
    const selectedText = dom.modelSelect.options[dom.modelSelect.selectedIndex]?.text || state.settings.model;
    dom.activeModelBadge.textContent = `مدل: ${selectedText}`;
  }
}

// ==========================================================================
// موتور هوش مصنوعی و شبیه‌ساز پاسخ (اصلاح شده و داینامیک)
// ==========================================================================
function handleSendMessage() {
  const text = dom.chatInput.value.trim();
  if (!text) return;

  // ایجاد گفتگوی اتوماتیک در صورت نبود چت فعال
  if (!state.activeChatId || state.chats.length === 0) {
    const newId = 'chat_' + Date.now();
    const newChat = {
      id: newId,
      title: text.substring(0, 20) + '...',
      messages: []
    };
    state.chats.unshift(newChat);
    state.activeChatId = newId;
    renderSidebar();
  }

  const currentChat = state.chats.find(c => c.id === state.activeChatId);
  
  // اگر اولین پیام چت باشه، عنوان چت رو بر اساس پیام تنظیم کن
  if (currentChat && currentChat.messages.length === 0) {
    currentChat.title = text.substring(0, 25) + (text.length > 25 ? '...' : '');
    renderSidebar();
    dom.currentChatTitle.textContent = currentChat.title;
  }

  // اضافه کردن و نمایش پیام کاربر
  currentChat.messages.push({ sender: 'user', text: text });
  // پاک کردن صفحه خوش‌آمدگویی در اولین پیام
  if (currentChat.messages.length === 1) dom.messagesContainer.innerHTML = '';
  renderMessageItem(text, 'user');
  
  dom.chatInput.value = '';
  dom.chatInput.style.height = '44px';
  saveToStorage();

  // ایجاد انیمیشن لودینگ و سه نقطه برای بات
  const loadingId = 'loading_' + Date.now();
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message bot';
  loadingDiv.id = loadingId;
  loadingDiv.innerHTML = `
    <div class="avatar"><i class="bi bi-cpu"></i></div>
    <div class="message-content" style="background-color: #202124; border: 1px solid var(--border-color);">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>
  `;
  dom.messagesContainer.appendChild(loadingDiv);
  dom.messagesContainer.scrollTop = dom.messagesContainer.scrollHeight;

  // فراخوانی موتور هوش مصنوعی اصلاح‌شده
  simulateAIResponse(text, loadingId, currentChat);
}

function simulateAIResponse(userPrompt, loadingId, currentChat) {
  setTimeout(() => {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();

    // استخراج دقیق نام مدل انتخاب شده از DOM یا وضعیت ذخیره‌شده
    const selectedModelValue = state.settings.model || 'gemini-3.5-flash';
    const selectedModelName = dom.modelSelect ? dom.modelSelect.options[dom.modelSelect.selectedIndex].text : selectedModelValue;

    // متن پیش‌فرض برای حالت جنرال
    let finalResponse = `سلام امیر صالح عزیز! من مدل **${selectedModelName}** هستم. پیام شما رو دریافت کردم: "${userPrompt}". این بخش به صورت هوشمند فرانت‌اند شبیه‌سازی شده و به محض متصل کردن کلید API به بک‌اند، پاسخ‌های زنده سرور رو دریافت می‌کنی!`;

    const promptLower = userPrompt.toLowerCase();
    
    // لایه شرطی پیشرفته برای فیلتر کردن کلمات صمیمی و دستورات اختصاصی
    if (promptLower.includes('سلام') || promptLower.includes('درود') || promptLower.includes('داداش') || promptLower.includes('داداشم') || promptLower.includes('داش')) {
      finalResponse = `مخلصم داداش! جانم؟ چطور می‌تونم کمکت کنم؟ من به عنوان مدل **${selectedModelName}** در خدمتتم تا هر پرامپت، پروژه وب‌توسعه، ربات یا کدی که داری رو با هم جلو ببریم.`;
    } else if (promptLower.includes('html') || promptLower.includes('طراحی') || promptLower.includes('css') || promptLower.includes('سایت')) {
      finalResponse = `البته! این هم یک ساختار نمونه تمیز سند HTML5 برای کارت‌های UI یا بخش‌های فرانت‌اند پروژه‌ات:\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="fa" dir="rtl">\n<head>\n  <meta charset="UTF-8">\n  <title>استودیو طراحی وب</title>\n  <style>\n    .box { border-radius: 8px; background: #222; color: #fff; padding: 15px; border: 1px solid #3c4043; }\n  </style>\n</head>\n<body>\n  <div class="box">\n    <h2>پروژه جدید با مدل ${selectedModelName}</h2>\n    <p>توسعه وب فرانت‌اند با سرعت عالی!</p>\n  </div>\n</body>\n</html>\n\`\`\``;
    } else if (promptLower.includes('پایتون') || promptLower.includes('python') || promptLower.includes('بات') || promptLower.includes('ربات')) {
      finalResponse = `واسه نوشتن ربات‌ها یا ساختارهای بک‌اند با پایتون، پکیج‌ها و کدهای پایه رو می‌تونی به این صورت استارت بزنی:\n\n\`\`\`python\nimport os\n\ndef check_ai_status():\n    active_model = "${selectedModelValue}"\n    print(f"[سیستم] ربات با موفقیت روی مدل {active_model} راه اندازی شد.")\n\nif __name__ == "__main__":\n    check_ai_status()\n\`\`\``;
    } else if (promptLower.includes('مدل') || promptLower.includes('چه مدلی') || promptLower.includes('تنظیمات')) {
      finalResponse = `در حال حاضر شما این گفتگو را تنظیم کرده‌اید روی موتور هوش مصنوعی: **${selectedModelName}**. پرامپت‌های شما از این پس با این مدل در بخش فرانت پردازش شبیه‌سازی می‌شوند.`;
    }

    // ذخیره در دیتابیس محلی چت و رندر نهایی
    currentChat.messages.push({ sender: 'bot', text: finalResponse });
    saveToStorage();
    renderMessageItem(finalResponse, 'bot');
  }, 1100);
}

// ==========================================================================
// لایه رویدادها و مدیریت پنل تنظیمات (Event Listeners)
// ==========================================================================
function initEventListeners() {
  
  // ارسال پیام با دکمه یا کلید اینتر
  dom.sendBtn.addEventListener('click', handleSendMessage);
  dom.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // تغییر خودکار ارتفاع textarea بر اساس متن ورودی
  dom.chatInput.addEventListener('input', function() {
    this.style.height = '44px';
    this.style.height = (this.scrollHeight) + 'px';
  });

  // دکمه گفتگوی جدید
  dom.newChatBtn.addEventListener('click', createNewChat);

  // باز و بستن مدال تنظیمات
  dom.settingsBtn.addEventListener('click', () => {
    dom.settingsModal.style.display = 'flex';
  });
  dom.closeModalBtn.addEventListener('click', () => {
    dom.settingsModal.style.display = 'none';
  });
  
  // بستن مدال با کلیک روی فضای بیرونی
  window.addEventListener('click', (e) => {
    if (e.target === dom.settingsModal) dom.settingsModal.style.display = 'none';
  });

  // ذخیره تنظیمات مدال
  dom.saveSettingsBtn.addEventListener('click', () => {
    state.settings.model = dom.modelSelect.value;
    state.settings.systemPrompt = dom.systemPromptInput.value;
    saveToStorage();
    updateModelBadge();
    dom.settingsModal.style.display = 'none';
    
    // ارسال یک پیام فیدبک سیستم در چت در صورت فعال بودن
    if (state.activeChatId && state.chats.length > 0) {
      const currentChat = state.chats.find(c => c.id === state.activeChatId);
      const selectedText = dom.modelSelect.options[dom.modelSelect.selectedIndex].text;
      const sysNotice = `[تنظیمات سیستم سیستم آپدیت شد: سوئیچ به مدل ${selectedText}]`;
      currentChat.messages.push({ sender: 'bot', text: sysNotice });
      renderMessageItem(sysNotice, 'bot');
      saveToStorage();
    }
  });

  // سیستم پشتیبان‌گیری سریع (Backup & Restore)
  dom.backupBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ai_workspace_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });
}

// ==========================================================================
// اورکستراسیون و راه‌اندازی اولیه اپلیکیشن (Initialization)
// ==========================================================================
function initApp() {
  loadFromStorage();
  initEventListeners();
  
  if (state.chats.length > 0) {
    renderSidebar();
    // اگر شناسه فعال نامعتبر بود، اولین چت را انتخاب کن
    const validChat = state.chats.find(c => c.id === state.activeChatId);
    switchChat(validChat ? state.activeChatId : state.chats[0].id);
  } else {
    showWelcomeScreen();
  }
}

// اجرای ساختار برنامه به محض لود شدن صفحه
document.addEventListener('DOMContentLoaded', initApp);
