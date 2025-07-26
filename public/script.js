const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const messages = document.getElementById("messages");

// Danh sách tin nhắn
const chatHistory = [];

// Xử lý gửi tin nhắn
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = userInput.value.trim();
  if (!input) return;

  // Hiển thị tin nhắn người dùng
  addMessage(input, "user");
  userInput.value = "";

  // Gọi GPT từ backend
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: input,
        history: chatHistory,
      }),
    });

    const data = await response.json();
    const gptMessage = data.reply;

    addMessage(gptMessage, "bot");
  } catch (error) {
    addMessage("Lỗi khi kết nối tới máy chủ.", "bot");
  }
});

// Hàm hiển thị tin nhắn
function addMessage(text, sender) {
  const messageElement = document.createElement("p");
  messageElement.classList.add(sender === "user" ? "user-msg" : "bot-msg");
  messageElement.innerHTML = text.replace(/\n/g, "<br>");
  messages.appendChild(messageElement);
  messages.scrollTop = messages.scrollHeight;

  // Lưu lịch sử
  chatHistory.push({ role: sender === "user" ? "user" : "assistant", content: text });
}
