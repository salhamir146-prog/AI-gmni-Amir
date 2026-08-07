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

// تنظیم آدرس کلودفلر ورکر خودت (اینجا رو با آدرس دقیق Worker خودت جایگزین کن)
const WORKER_URL = "https://your-worker-subdomain.workers.dev/chat";

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
  
  document.querySelectorAll('.chat-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.id === chatId) item.classList.add('active');
  });

  const currentChat = state.chats.find(c => c.id === chatId);
  if (currentChat) {
    dom.currentChatTitle.textContent = currentChat.title;
    dom.messagesContainer.innerHTML = '';
    
    if (currentChat.messages.length === 0) {
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
  event.stopPropagation();
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
      <h2 style="color: white; margin-top: 15px; font-weight: 400;">چت‌بات متصل به Cloudflare Worker</h2>
      <p style="font-size: 14px; margin-top: 10px; line-height: 1.6;">
        کلیدهای API شما روی سرور فعال است. مدل مورد نظر را انتخاب کرده و پیام خود را ارسال کنید.
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
// موتور ارسال پیام واقعی به Cloudflare Worker
// ==========================================================================
async function handleSendMessage() {
  const text = dom.chatInput.value.trim();
  if (!text) return;

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
  
  if (currentChat && currentChat.messages.length === 0) {
    currentChat.title = text.substring(0, 25) + (text.length > 25 ? '...' : '');
    renderSidebar();
    dom.currentChatTitle.textContent = currentChat.title;
  }

  currentChat.messages.push({ sender: 'user', text: text });
  if (currentChat.messages.length === 1) dom.messagesContainer.innerHTML = '';
  renderMessageItem(text, 'user');
  
  dom.chatInput.value = '';
  dom.chatInput.style.height = '44px';
  saveToStorage();

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

  // ارسال به API واقعی
  const selectedModel = dom.modelSelect ? dom.modelSelect.value : state.settings.model;

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: text,
        model: selectedModel,
        systemPrompt: state.settings.systemPrompt
      })
    });

    const data = await response.json();
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();

    const finalResponse = data.response || data.error || "پاسخی از سرور دریافت نشد.";

    currentChat.messages.push({ sender: 'bot', text: finalResponse });
    saveToStorage();
    renderMessageItem(finalResponse, 'bot');

  } catch (error) {
    console.error("Worker connection error:", error);
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();

    const errorMsg = "خطا در ارتباط با سرور کلودفلر. لطفاً آدرس Worker یا اتصال اینترنت را بررسی کنید.";
    currentChat.messages.push({ sender: 'bot', text: errorMsg });
    saveToStorage();
    renderMessageItem(errorMsg, 'bot');
  }
}

// ==========================================================================
// لایه رویدادها و مدیریت پنل تنظیمات (Event Listeners)
// ==========================================================================
function initEventListeners() {
  dom.sendBtn.addEventListener('click', handleSendMessage);
  dom.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  dom.chatInput.addEventListener('input', function() {
    this.style.height = '44px';
    this.style.height = (this.scrollHeight) + 'px';
  });

  dom.newChatBtn.addEventListener('click', createNewChat);

  dom.settingsBtn.addEventListener('click', () => {
    dom.settingsModal.style.display = 'flex';
  });
  dom.closeModalBtn.addEventListener('click', () => {
    dom.settingsModal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === dom.settingsModal) dom.settingsModal.style.display = 'none';
  });

  dom.saveSettingsBtn.addEventListener('click', () => {
    state.settings.model = dom.modelSelect.value;
    state.settings.systemPrompt = dom.systemPromptInput.value;
    saveToStorage();
    updateModelBadge();
    dom.settingsModal.style.display = 'none';
    
    if (state.activeChatId && state.chats.length > 0) {
      const currentChat = state.chats.find(c => c.id === state.activeChatId);
      const selectedText = dom.modelSelect.options[dom.modelSelect.selectedIndex].text;
      const sysNotice = `[سیستم: سوئیچ موفق به مدل ${selectedText}]`;
      currentChat.messages.push({ sender: 'bot', text: sysNotice });
      renderMessageItem(sysNotice, 'bot');
      saveToStorage();
    }
  });

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

function initApp() {
  loadFromStorage();
  initEventListeners();
  
  if (state.chats.length > 0) {
    renderSidebar();
    const validChat = state.chats.find(c => c.id === state.activeChatId);
    switchChat(validChat ? state.activeChatId : state.chats[0].id);
  } else {
    showWelcomeScreen();
  }
}

document.addEventListener('DOMContentLoaded', initApp);
