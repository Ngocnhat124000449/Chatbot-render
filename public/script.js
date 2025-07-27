  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const messages = document.getElementById("messages");

  // Lịch sử hội thoại
  const chatHistory = [
    {
      role: "system",
      content: `
  Bạn là một chatbot hướng dẫn học tập thông minh, thân thiện và truyền cảm hứng.  
  Nhiệm vụ của bạn là giúp sinh viên xác định mục tiêu, kỹ năng, và xây dựng lộ trình học tập cá nhân hóa.  

  Hướng dẫn:
  1. Bắt đầu cuộc trò chuyện một cách thân thiện, gần gũi.
  2. Tự đặt những câu hỏi từng bước để thu thập thông tin quan trọng như:
    - Tôi có thể gọi bạn là gì?
    - Bạn đang học ngành gì?
    - Hiện bạn đang học năm mấy?
    - Mục tiêu học tập hoặc nghề nghiệp của bạn là gì?
    - Bạn muốn cải thiện kỹ năng nào?
    - Phong cách học tập bạn thấy hiệu quả nhất?
    - Bạn dành được bao nhiêu thời gian học mỗi ngày?
  3. Sau khi thu thập đủ thông tin, đưa ra một kế hoạch học tập cá nhân hóa, rõ ràng, có lộ trình từng bước.
  4. Nếu người dùng trả lời lan man hoặc đi lạc chủ đề, hãy khéo léo đưa họ quay lại nội dung chính.
  5. Luôn thể hiện sự khích lệ, truyền động lực, và tinh thần đồng hành cùng sinh viên.

  Hãy nhớ: Bạn không chỉ là chatbot, bạn là người đồng hành giúp sinh viên phát triển bản thân.
      `
    },
    {
      role: "user",
      content: "Chào bạn!"
    }
  ];


  // Hàm hiển thị tin nhắn
  function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerHTML = text.replace(/\n/g, "<br>");
  messages.appendChild(div);

  requestAnimationFrame(() => {
    messages.scrollTop = messages.scrollHeight;
  });

  return div;
}



  // Gửi tin nhắn đến server và xử lý phản hồi
  async function sendToGPT() {
    const botDiv = addMessage("...", "bot"); // chờ phản hồi

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
      const output_text = json?.output?.[0]?.content?.[0]?.text || "⚠️ Không có phản hồi từ chatbot.";  

      botDiv.innerHTML = output_text.replace(/\n/g, "<br>");
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


  const userInput = document.getElementById('user-input');

  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto'; // reset
    userInput.style.height = userInput.scrollHeight + 'px'; // fit nội dung
  });


  userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // Ngăn xuống dòng
    form.requestSubmit(); // Kích hoạt sự kiện submit form
  }
});


