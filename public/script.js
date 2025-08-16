const form = document.getElementById("chat-form"); // Khai báo những phần tử cần dùng từ file html
const input = document.getElementById("user-input");
const messages = document.getElementById("messages");

// Lịch sử hội thoại
const chatHistory = [
  // Hướng dẫn gpt cách phản hồi (cấu hình cho gpt)
  {
    role: "system",
    content: `
  Bạn là một cố vấn học tập chuyên ngành Công nghệ Thông tin. 
Nhiệm vụ của bạn:
1. Tiến hành thu thập thông tin từ sinh viên trước khi đưa ra lời khuyên. 
   - Hỏi ngắn gọn, từng bước (vd: mục tiêu nghề nghiệp, kỹ năng hiện có, môn yêu thích, khó khăn đang gặp phải). 
   - Luôn giữ giọng điệu khuyến khích, thân thiện, không phán xét.
2. Sau khi có thông tin cơ bản, hãy:
   - Tóm tắt lại những gì sinh viên đã chia sẻ để xác nhận sự hiểu đúng. 
   - Đưa ra định hướng học tập phù hợp (môn học, kỹ năng, công nghệ cần tập trung).
   - Đề xuất lộ trình ngắn hạn (3–6 tháng) và dài hạn (1–3 năm).
3. Nếu sinh viên chưa rõ định hướng, hãy gợi ý các hướng đi trong ngành CNTT (Web, Mobile, AI, Data, An ninh mạng...) và so sánh ưu/nhược điểm để sinh viên lựa chọn.
4. Phản hồi theo phong cách: rõ ràng, thực tế, gần gũi, có chút hài hước để sinh viên thoải mái.
5. Luôn khuyến khích sinh viên tự học, trải nghiệm thực tế (làm project cá nhân, tham gia CLB, hackathon, thực tập).

      `,
  },
  {
    role: "user", // Tin nhắn tự gửi để tạo cảm giác gpt như một cố vấn thật, cuộc trò chuyện tự nhiên hơn.
    content: "Chào bạn!",
  },
];

// Hàm hiển thị tin nhắn
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerHTML = text.replace(/\n/g, "<br>"); // Hỗ trợ xuống dòng, thay \n bằng <br>;

  messages.appendChild(div);

  // Đợi DOM cập nhật xong rồi mới cuộn
  setTimeout(() => {
    messages.scrollTop = messages.scrollHeight;
  }, 0);

  return div;
}

// Gửi tin nhắn đến server và xử lý phản hồi
async function sendToGPT() {
  const botDiv = addMessage("Đang suy nghĩ...", "bot"); // chờ phản hồi.

  try {
    const response = await fetch("/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        input: chatHistory,
      }),
    });

    const json = await response.json();
    const output_text =
      json?.output?.[0]?.content?.[0]?.text ||
      "⚠️ Không có phản hồi từ chatbot.";

    botDiv.innerHTML = ""; // Xóa dấu "..."
    typeText(botDiv, output_text); // Gõ từng chữ

    chatHistory.push({ role: "assistant", content: output_text });
  } catch (error) {
    botDiv.textContent = "❌ Lỗi: " + error.message;
  }
}

// Khởi động khi trang load
window.addEventListener("DOMContentLoaded", () => {
  sendToGPT();
});

// Gửi khi người dùng nhập
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = "";
  addMessage(userMessage, "user");
  chatHistory.push({ role: "user", content: userMessage });

  sendToGPT();
});

const userInput = document.getElementById("user-input");

userInput.addEventListener("input", () => {
  userInput.style.height = "auto"; // reset
  userInput.style.height = userInput.scrollHeight + "px"; // fit nội dung
});

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // Ngăn xuống dòng
    form.requestSubmit(); // Kích hoạt sự kiện submit form
  }
});
function typeText(element, text, speed = 50) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      const char = text[i] === "\n" ? "<br>" : text[i];
      element.innerHTML += char;
      messages.scrollTop = messages.scrollHeight; // auto scroll xuống cuối
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}
