// ==============================================================================
// CẤU HÌNH WEBHOOK n8n
// ==============================================================================

// [1] Webhook đặt lịch (Booking form)
const N8N_WEBHOOK_URL = 'https://duytrong.app.n8n.cloud/webhook-test/dat-lich-may-lanh';

// [2] Webhook Chat AI — Dán Production URL từ n8n Webhook Node vào đây
//     Ví dụ: 'https://duytrong.app.n8n.cloud/webhook/chat-ai'
//     Để trống ('') → tự động dùng keyword fallback
const N8N_CHAT_WEBHOOK_URL = 'https://duytrong.app.n8n.cloud/webhook/chat-ai';

// Set default date for booking picker (Today)
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('appointmentDate');
  if (dateInput) {
    dateInput.value = today;
    dateInput.min = today;
  }
  initBeforeAfterSlider();
  initServiceFilter();
  initFAQAccordion();
  initMobileMenu();
  calculateTotal();
});

/* --------------------------------------------------------------------------
   1. Mobile Menu Drawer
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const openBtn = document.getElementById('mobileMenuOpen');
  const closeBtn = document.getElementById('mobileMenuClose');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  const navLinks = document.querySelectorAll('.mobile-nav-item');

  function openMenu() {
    drawer.classList.add('active');
    overlay.classList.add('active');
  }

  function closeMenu() {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  }

  if (openBtn) openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
}

/* --------------------------------------------------------------------------
   2. Filterable Services Grid
   -------------------------------------------------------------------------- */
function initServiceFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.service-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const category = btn.getAttribute('data-filter');
      cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

function filterServices(category) {
  const targetBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
  if (targetBtn) {
    targetBtn.click();
  }
}

/* --------------------------------------------------------------------------
   3. Draggable Before / After Slider
   -------------------------------------------------------------------------- */
function initBeforeAfterSlider() {
  const container = document.getElementById('compareContainer');
  const slider = document.getElementById('compareSlider');
  const afterImg = document.getElementById('compareAfterImg');
  if (!container || !slider || !afterImg) return;

  let isDragging = false;

  function updateSliderPosition(x) {
    const rect = container.getBoundingClientRect();
    let posX = x - rect.left;
    if (posX < 0) posX = 0;
    if (posX > rect.width) posX = rect.width;

    const percentage = (posX / rect.width) * 100;
    slider.style.left = percentage + '%';
    afterImg.style.width = percentage + '%';
    slider.setAttribute('aria-valuenow', Math.round(percentage));
  }

  // Mouse events
  slider.addEventListener('mousedown', () => isDragging = true);
  window.addEventListener('mouseup', () => isDragging = false);
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  });

  // Touch events
  slider.addEventListener('touchstart', () => isDragging = true, { passive: true });
  window.addEventListener('touchend', () => isDragging = false);
  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    updateSliderPosition(e.touches[0].clientX);
  }, { passive: true });

  // Click anywhere on container to move slider
  container.addEventListener('click', (e) => {
    updateSliderPosition(e.clientX);
  });
}

/* --------------------------------------------------------------------------
   4. Interactive Cost Calculator
   -------------------------------------------------------------------------- */
let currentQty = 1;

const basePrices = {
  wall: { clean: 200000, install: 400000, reinstall: 450000, repair: 150000 },
  ceiling: { clean: 850000, install: 1500000, reinstall: 2000000, repair: 150000 },
  standing: { clean: 400000, install: 700000, reinstall: 850000, repair: 400000 }
};

const typeNames = {
  wall: 'Treo Tường',
  ceiling: 'Âm Trần / Cassette',
  standing: 'Tủ Đứng'
};

const serviceNames = {
  clean: 'Vệ Sinh Toàn Diện',
  install: 'Lắp Đặt Máy Mới',
  reinstall: 'Tháo & Di Dời',
  repair: 'Khảo Sát Sửa Chữa'
};

function changeQuantity(delta) {
  currentQty += delta;
  if (currentQty < 1) currentQty = 1;
  if (currentQty > 20) currentQty = 20;
  document.getElementById('qtyDisplay').innerText = currentQty;
  calculateTotal();
}

function calculateTotal() {
  const acTypeRadio = document.querySelector('input[name="acType"]:checked');
  const serviceRadio = document.querySelector('input[name="calcService"]:checked');
  const addGas = document.getElementById('addGasCheck').checked;

  const acType = acTypeRadio ? acTypeRadio.value : 'wall';
  const service = serviceRadio ? serviceRadio.value : 'clean';

  let unitPrice = basePrices[acType][service];
  let gasCost = addGas ? 80000 : 0;
  let subtotal = (unitPrice + gasCost) * currentQty;

  // 10% discount for >= 3 AC units
  let discount = 0;
  if (currentQty >= 3) {
    discount = subtotal * 0.1;
  }
  let finalTotal = subtotal - discount;

  // Update UI displays
  document.getElementById('summaryType').innerText = typeNames[acType];
  document.getElementById('summaryService').innerText = serviceNames[service] + (addGas ? ' (+Gas)' : '');
  document.getElementById('summaryQty').innerText = currentQty + ' máy';

  const discountRow = document.getElementById('discountRow');
  if (currentQty >= 3) {
    discountRow.style.display = 'flex';
    document.getElementById('summaryDiscount').innerText = '-' + discount.toLocaleString('vi-VN') + '₫';
  } else {
    discountRow.style.display = 'none';
  }

  document.getElementById('totalPriceDisplay').innerText = finalTotal.toLocaleString('vi-VN') + '₫';
}

function openBookingFromCalculator() {
  const serviceRadio = document.querySelector('input[name="calcService"]:checked');
  const service = serviceRadio ? serviceRadio.value : 'clean';
  const serviceTitle = serviceNames[service];
  openBookingModal(serviceTitle);
}

/* --------------------------------------------------------------------------
   5. FAQ Accordion
   -------------------------------------------------------------------------- */
function initFAQAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. Booking Modal & Submission Flow
   -------------------------------------------------------------------------- */
function openBookingModal(preselectedService) {
  const modal = document.getElementById('bookingModal');
  const serviceSelect = document.getElementById('serviceSelect');
  const form = document.getElementById('bookingForm');
  const successBox = document.getElementById('successBox');

  form.style.display = 'block';
  successBox.style.display = 'none';

  if (preselectedService && serviceSelect) {
    for (let i = 0; i < serviceSelect.options.length; i++) {
      if (serviceSelect.options[i].text.includes(preselectedService) || serviceSelect.options[i].value.includes(preselectedService)) {
        serviceSelect.selectedIndex = i;
        break;
      }
    }
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Close on overlay click
document.getElementById('bookingModal').addEventListener('click', (e) => {
  if (e.target.id === 'bookingModal') {
    closeBookingModal();
  }
});

// Escape key closes modal
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeBookingModal();
  }
});

async function handleBookingSubmit(event) {
  event.preventDefault();
  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  const form = document.getElementById('bookingForm');
  const successBox = document.getElementById('successBox');
  const bookingCode = document.getElementById('bookingCode');

  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';

  // 1. Tạo mã lịch hẹn ngẫu nhiên (AC-xxxx)
  const randomCode = 'AC-' + Math.floor(1000 + Math.random() * 9000);

  // 2. Thu thập đầy đủ thông tin khách hàng và thông số dự toán
  const bookingPayload = {
    bookingCode: randomCode,
    customerName: document.getElementById('clientName').value.trim(),
    customerPhone: document.getElementById('clientPhone').value.trim(),
    service: document.getElementById('serviceSelect').value,
    appointmentDate: document.getElementById('appointmentDate').value,
    address: document.getElementById('clientAddress').value.trim(),
    note: document.getElementById('clientNote').value.trim(),
    estimatedPrice: document.getElementById('totalPriceDisplay') ? document.getElementById('totalPriceDisplay').innerText : 'Chưa tính giá',
    createdAt: new Date().toISOString(),
    createdAtFormatted: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
    source: window.location.href
  };

  console.log('Đang gửi dữ liệu đặt lịch sang n8n:', bookingPayload);

  // 3. Gửi sang n8n Webhook Node
  try {
    if (N8N_WEBHOOK_URL && !N8N_WEBHOOK_URL.includes('your-n8n-instance')) {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      });

      if (!response.ok) {
        console.warn('n8n Webhook phản hồi mã trạng thái:', response.status);
      } else {
        console.log('n8n Webhook đã nhận dữ liệu thành công!');
      }
    } else {
      console.warn('Vui lòng cập nhật N8N_WEBHOOK_URL ở đầu tệp script.js với URL n8n của bạn.');
    }
  } catch (error) {
    console.error('Không thể kết nối tới n8n Webhook (kiểm tra lại URL hoặc CORS):', error);
  } finally {
    // 4. Cập nhật giao diện thành công cho khách hàng
    btn.disabled = false;
    btnText.style.display = 'inline-block';
    btnLoader.style.display = 'none';

    bookingCode.innerText = randomCode;
    form.style.display = 'none';
    successBox.style.display = 'block';
    form.reset();
  }
}

/* --------------------------------------------------------------------------
   7. Live Chat Widget — n8n AI Agent + Human Handoff
   -------------------------------------------------------------------------- */

let chatIsOpen = false;
let chatIsWaiting = false;       // Khoá input khi đang chờ AI
let chatHandoffTriggered = false; // Đã chuyển sang người thật?

// Lịch sử hội thoại gửi kèm lên n8n để AI nhớ context
let chatHistory = [];

// Session ID duy nhất cho mỗi khách
const chatSessionId = (() => {
  const key = 'aircool_chat_session';
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(key, sid);
  }
  return sid;
})();

let chatUserName = '';
let chatUserPhone = '';
let isUserInfoCollected = false;

// Initialize User Info from LocalStorage
const chatSessionInfo = (() => {
  const key = 'aircool_chat_user';
  try {
    const data = JSON.parse(localStorage.getItem(key));
    if (data && data.name && data.phone) return data;
  } catch (e) { }
  return null;
})();

if (chatSessionInfo) {
  chatUserName = chatSessionInfo.name;
  chatUserPhone = chatSessionInfo.phone;
  isUserInfoCollected = true;
}

function handlePrechatSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById('chatClientName');
  const phoneInput = document.getElementById('chatClientPhone');

  if (!nameInput || !phoneInput || !nameInput.value.trim() || !phoneInput.value.trim()) return;

  chatUserName = nameInput.value.trim();
  chatUserPhone = phoneInput.value.trim();
  isUserInfoCollected = true;

  localStorage.setItem('aircool_chat_user', JSON.stringify({
    name: chatUserName,
    phone: chatUserPhone
  }));

  document.getElementById('chatPreform').style.display = 'none';
  document.getElementById('chatMainContent').style.display = 'flex';

  const input = document.getElementById('chatInput');
  if (input) input.focus();
}

// ---------------------------------------------------------------------------
// [CÁch 2] Từ khoá nhạy cảm — bắt TRƯỚC khi gửi lên AI (safety-net)
// ---------------------------------------------------------------------------
const HANDOFF_KEYWORDS = [
  'khiếu nại', 'khieu nai', 'phàn nàn', 'không hài lòng', 'thất vọng',
  'hoàn tiền', 'hoàn lại tiền', 'bồi thường', 'boi thuong',
  'tức quá', 'bực quá', 'tệ quá', 'tệ lắm', 'kém quá',
  'gặp người thật', 'gặp nhân viên', 'nói chuyện trực tiếp',
  'muốn gặp', 'cho tôi gặp', 'tìm quản lý', 'tìm sếp',
  'làm hỏng', 'làm vỡ', 'thiệt hại', 'hư hỏng do thợ',
  'kiện', 'tố cáo', 'báo cơ quan'
];

function checkLocalHandoffKeywords(text) {
  const lower = text.toLowerCase();
  return HANDOFF_KEYWORDS.some(kw => lower.includes(kw));
}

// ---------------------------------------------------------------------------
// Keyword fallback (dùng khi URL chưa cấu hình / lỗi mạng)
// ---------------------------------------------------------------------------
const chatFallbackReplies = {
  'vệ sinh': 'Dịch vụ vệ sinh máy lạnh bao gồm rửa dàn lạnh, dàn nóng và phin lọc. Giá từ 200.000đ/máy. Bạn muốn đặt lịch không? 📅',
  'lắp đặt': 'Chúng tôi lắp đặt tất cả các hãng: Daikin, LG, Panasonic, Midea... Bao gồm đục tường, đi ống đồng, kiểm tra gas. Từ 400.000đ.',
  'sửa chữa': 'Kỹ thuật viên khảo sát miễn phí và báo giá trước khi sửa. Phản hồi trong 30 phút. Bạn có thể mô tả triệu chứng máy không? 🔧',
  'tháo dời': 'Dịch vụ tháo và di dời từ 450.000đ, bao gồm tháo lắp an toàn và bơm gas nếu cần. Địa chỉ mới của bạn ở đâu?',
  'giá': 'Dùng **Bảng Tính Giá** trên web để ước tính nhanh! Hoặc nhắn Zalo 0968.831.027 để được tư vấn. 💰',
  'bảo hành': 'Tất cả dịch vụ được bảo hành **6 – 12 tháng**. Có sự cố sau dịch vụ → chúng tôi quay lại sửa miễn phí! ✅',
  'thời gian': 'Phục vụ 7:30 – 21:00, kể cả Thứ 7, Chủ nhật và Lễ. ⏰',
  'default': 'Cảm ơn bạn! Nhân viên sẽ phản hồi trong vài phút. Hoặc nhắn Zalo **0968.831.027** để được hỗ trợ ngay. 💬'
};

function getFallbackReply(text) {
  const lower = text.toLowerCase();
  for (const [kw, reply] of Object.entries(chatFallbackReplies)) {
    if (kw !== 'default' && lower.includes(kw)) return reply;
  }
  return chatFallbackReplies['default'];
}

// ---------------------------------------------------------------------------
// Hiển thị banner "Nhân viên đang tham gia" khi Handoff kích hoạt
// ---------------------------------------------------------------------------
function appendHandoffBanner() {
  const container = document.getElementById('chatMessages');
  const banner = document.createElement('div');
  banner.className = 'chat-handoff-banner';
  banner.setAttribute('role', 'status');
  banner.innerHTML = `
    <div class="handoff-banner-inner">
      <span class="handoff-live-dot" aria-hidden="true"></span>
      <div>
        <strong>Nhân viên AirCool Pro đang tham gia</strong>
        <p>Yêu cầu của bạn đã được chuyển đến nhân viên hỗ trợ. Vui lòng chờ trong giây lát hoặc nhắn <a href="https://zalo.me/0968831027" target="_blank">Zalo 0968.831.027</a> để được hỗ trợ ngay.</p>
      </div>
    </div>`;
  container.appendChild(banner);
  container.scrollTop = container.scrollHeight;
}

// ---------------------------------------------------------------------------
// [Cách 1] Gọi n8n → AI trả về JSON có {handoff, reason, reply}
// ---------------------------------------------------------------------------
async function callN8nChatAI(userMessage) {
  if (!N8N_CHAT_WEBHOOK_URL || N8N_CHAT_WEBHOOK_URL.trim() === '') {
    console.warn('[Chat] N8N_CHAT_WEBHOOK_URL chưa cấu hình → keyword fallback.');
    return { handoff: false, reply: getFallbackReply(userMessage) };
  }

  const payload = {
    message: userMessage,
    sessionId: chatSessionId,
    history: chatHistory.slice(-10),
    userInfo: {
      name: chatUserName,
      phone: chatUserPhone
    },
    source: window.location.href,
    timestamp: new Date().toISOString()
  };

  console.log('[Chat] Gửi tới n8n:', payload);

  try {
    const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log('[Chat] Nhận từ n8n:', data);

    // --- Parse kết quả ---
    // n8n trả về: { handoff: bool, reason: string, reply: string }
    // hoặc dạng cũ: { reply/output/text: string } (backward compat)
    const raw = Array.isArray(data) ? data[0] : data;

    const handoff = raw.handoff === true;
    const reason = raw.reason || '';
    const reply = raw.reply || raw.output || raw.text || null;

    if (!reply) {
      console.warn('[Chat] Không đọc được field reply. Raw data:', raw);
      return { handoff: false, reply: getFallbackReply(userMessage) };
    }

    return { handoff, reason, reply };

  } catch (err) {
    console.error('[Chat] Lỗi kết nối n8n:', err.message);
    return {
      handoff: false,
      reply: '⚠️ Kết nối AI tạm thời gián đoạn. Vui lòng nhắn Zalo **0968.831.027** để được hỗ trợ!'
    };
  }
}

// ---------------------------------------------------------------------------
// UI Helpers
// ---------------------------------------------------------------------------
function getTimestamp() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(text, role) {
  const container = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg chat-msg--${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  // Render **bold** markdown và xuống dòng
  bubble.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  const ts = document.createElement('span');
  ts.className = 'chat-timestamp';
  ts.textContent = getTimestamp();

  msgDiv.appendChild(bubble);
  msgDiv.appendChild(ts);
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  return msgDiv;
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.id = 'chatTypingIndicator';
  typing.setAttribute('aria-label', 'Nhân viên AI đang soạn tin...');
  typing.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const t = document.getElementById('chatTypingIndicator');
  if (t) t.remove();
}

function setChatInputLock(locked) {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  chatIsWaiting = locked;
  if (input) {
    input.disabled = locked;
    input.placeholder = locked ? 'Đang kết nối AI...' : 'Nhập tin nhắn của bạn...';
  }
  if (sendBtn) sendBtn.disabled = locked;
}

// ---------------------------------------------------------------------------
// Core: gửi tin nhắn & nhận phản hồi AI + xử lý Handoff
// ---------------------------------------------------------------------------
async function sendChatMessage() {
  if (chatIsWaiting || chatHandoffTriggered) return;

  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  // Ẩn quick-reply chips sau tin nhắn đầu tiên
  const quickReplies = document.getElementById('chatQuickReplies');
  if (quickReplies) quickReplies.style.display = 'none';

  // Hiển thị tin nhắn của khách
  appendMessage(text, 'user');
  input.value = '';

  // Lưu lịch sử
  chatHistory.push({ role: 'user', content: text });

  // -----------------------------------------------------------------------
  // [Cách 2] Kiểm tra keyword nhạy cảm TRƯỚC khi gửi lên AI
  // -----------------------------------------------------------------------
  if (checkLocalHandoffKeywords(text)) {
    console.log('[Chat] Handoff local keyword triggered:', text);
    setChatInputLock(true);
    showTypingIndicator();
    // Vẫn gửi lên n8n để trigger Telegram alert — nhưng không cần đợi reply
    callN8nChatAI(text).catch(() => { });
    await new Promise(r => setTimeout(r, 1200)); // Hiệu ứng chờ tự nhiên
    removeTypingIndicator();
    triggerHandoffUI('local_keyword');
    return;
  }

  // Khoá input & hiện typing indicator
  setChatInputLock(true);
  showTypingIndicator();

  // Gọi n8n AI Agent — nhận { handoff, reason, reply }
  const result = await callN8nChatAI(text);

  removeTypingIndicator();

  // -----------------------------------------------------------------------
  // [Cách 1] AI tự đánh dấu handoff: true
  // -----------------------------------------------------------------------
  if (result.handoff === true) {
    console.log('[Chat] Handoff AI signal triggered. Reason:', result.reason);
    appendMessage(result.reply, 'agent'); // Hiển thị câu tạm biệt của AI
    chatHistory.push({ role: 'assistant', content: result.reply });
    triggerHandoffUI(result.reason || 'ai_signal');
    return;
  }

  // Trả lời bình thường
  setChatInputLock(false);
  appendMessage(result.reply, 'agent');
  chatHistory.push({ role: 'assistant', content: result.reply });
  if (input) input.focus();
}

// ---------------------------------------------------------------------------
// Kích hoạt giao diện Handoff — khoá chat, hiện banner
// ---------------------------------------------------------------------------
function triggerHandoffUI(reason) {
  chatHandoffTriggered = true;
  appendHandoffBanner();

  // Khoá input vĩnh viễn cho phiên này
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  if (input) {
    input.disabled = true;
    input.placeholder = 'Nhân viên đang tham gia...';
  }
  if (sendBtn) sendBtn.disabled = true;

  console.log('[Chat] Handoff UI activated. Reason:', reason);
}

function sendQuickReply(text) {
  const input = document.getElementById('chatInput');
  input.value = text;
  sendChatMessage();
}

function handleChatKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendChatMessage();
  }
  if (event.key === 'Escape' && chatIsOpen) {
    toggleChatWidget();
  }
}

// ---------------------------------------------------------------------------
// Toggle Chat Widget open/close
// ---------------------------------------------------------------------------
function toggleChatWidget() {
  chatIsOpen = !chatIsOpen;
  const widget = document.getElementById('chatWidget');
  const fabBtn = document.getElementById('chatFabBtn');
  const iconOpen = document.getElementById('chatIconOpen');
  const iconClose = document.getElementById('chatIconClose');
  const unreadDot = document.getElementById('chatUnreadDot');

  if (chatIsOpen) {
    widget.classList.add('open');
    widget.setAttribute('aria-hidden', 'false');
    fabBtn.setAttribute('aria-expanded', 'true');
    iconOpen.style.display = 'none';
    iconClose.style.display = 'block';
    if (unreadDot) unreadDot.style.display = 'none';

    if (!isUserInfoCollected) {
      document.getElementById('chatPreform').style.display = 'flex';
      document.getElementById('chatMainContent').style.display = 'none';
      setTimeout(() => {
        const inp = document.getElementById('chatClientName');
        if (inp) inp.focus();
      }, 320);
    } else {
      document.getElementById('chatPreform').style.display = 'none';
      document.getElementById('chatMainContent').style.display = 'flex';
      setTimeout(() => {
        const inp = document.getElementById('chatInput');
        if (inp) inp.focus();
      }, 320);
    }
  } else {
    widget.classList.remove('open');
    widget.setAttribute('aria-hidden', 'true');
    fabBtn.setAttribute('aria-expanded', 'false');
    iconOpen.style.display = 'block';
    iconClose.style.display = 'none';
  }
}

