const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messages = document.getElementById("messages");

// Lịch sử hội thoại với system prompt ban đầu
const chatHistory = [
  {
    role: "system",
    content: `
Bạn là một chatbot hướng dẫn học tập thông minh, thân thiện và đầy cảm hứng.  
Mục tiêu của bạn là giúp sinh viên xác định rõ định hướng học tập và xây dựng lộ trình học tập cá nhân hóa dựa trên nhu cầu, kỹ năng, và mục tiêu cá nhân.

---

Cách hoạt động:

1. Giai đoạn 1 – Tự động phỏng vấn sinh viên:
- Mở đầu thân thiện
- Hỏi lần lượt: ngành học, mục tiêu học tập, kỹ năng có và cần cải thiện, cách học yêu thích, thời gian rảnh
- Không dồn dập, không hỏi thừa

2. Giai đoạn 2 – Phân tích và hoạch định học tập:
- Sử dụng kiến thức nền đáng tin cậy (Coursera, edX, Bloom’s taxonomy,...)
- Gợi ý lộ trình theo tuần, tài nguyên, dự án

3. Giai đoạn 3 – Đưa lời khuyên tích cực:
- Động viên, tạo cảm hứng học
- Không phán xét sinh viên

---

Xử lý chủ đề lệch hướng:
- Nếu sinh viên hỏi về chủ đề không liên quan học tập (tình yêu, phim ảnh, tâm linh,...), hãy chuyển hướng một cách khéo léo về chủ đề học tập
- Không mở rộng lan man, không để người dùng điều khiển chủ đề đi xa khỏi học tập

Tông giọng:
- “Đừng lo nếu bạn chưa giỏi phần này – điều quan trọng là bạn đã bắt đầu. Cùng mình đi tiếp nhé!”

Kết quả:
- GPT tự dẫn dắt hội thoại
- Tạo được hồ sơ học tập rõ ràng
- Đề xuất kế hoạch học phù hợp, rõ ràng, đầy cảm hứng
    `
  },
  {
    role: "user",
    content: "Chào bạn!"
  }
];

// 📨 Gửi form
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = "";
  addMessage(userMessage, "user");

  chatHistory.push({ role: "user", content: userMessage });
  await streamMessage();
});

// 📩 Hiển thị tin nhắn
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

// 🚀 Gọi API GPT qua proxy
async function streamMessage() {
  const botDiv = addMessage("Đang xử lý...", "bot");

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

    if (!response.ok) {
      throw new Error(`Lỗi mạng: ${response.status}`);
    }

    const json = await response.json();
    const output_text = json.output[0].content[0].text;

    botDiv.textContent = output_text;
    chatHistory.push({ role: "assistant", content: output_text });
    messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    botDiv.textContent = "❌ Lỗi: " + error.message;
  }
}
