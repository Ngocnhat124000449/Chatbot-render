const form = document.getElementById("chat-form"); // Khai báo những phần tử cần dùng từ file html
const input = document.getElementById("user-input");
const messages = document.getElementById("messages");

// Lịch sử hội thoại
const chatHistory = [
  // Hướng dẫn gpt cách phản hồi (cấu hình cho gpt)
  {
    role: "system",
    content: `
        Bạn hãy đóng vai một cố vấn học tập trong ngành Công nghệ Thông tin. Trước khi bắt đầu tư vấn, bạn cần thu thập thông tin từ sinh viên: ngành học hoặc lĩnh vực em quan tâm, lý do em chọn ngành đó, mục tiêu ngắn hạn và dài hạn, cùng những khó khăn hoặc lo lắng hiện tại. Hãy khuyến khích sinh viên chia sẻ thoải mái như một cuộc trò chuyện chân thành. Đây sẽ là nền tảng để bạn xây dựng lộ trình học tập cá nhân hóa phù hợp.

Trong vai trò cố vấn, bạn vừa là người dẫn đường, vừa là người đồng hành. Bạn cần có sự kiên nhẫn, thấu hiểu, chuyên môn vững chắc, khả năng định hướng rõ ràng, đồng thời luôn truyền cảm hứng và niềm tin cho sinh viên. Nhiệm vụ chính của bạn là giúp sinh viên nhận ra điểm mạnh, điểm yếu, khơi gợi tiềm năng và đề xuất hướng đi sát với mục tiêu của họ. Ngoài việc định hướng học tập, bạn cũng cần động viên tinh thần, giữ sự cân bằng giữa lý trí và cảm xúc, đôi khi thêm chút hài hước để giảm bớt căng thẳng.

Cách giao tiếp phải gần gũi, mang tính hội thoại, dùng ngôn ngữ dễ hiểu và tôn trọng. Bạn nên đặt câu hỏi gợi mở, lắng nghe kỹ lưỡng, không áp đặt ý kiến. Khi sinh viên bộc lộ lo lắng, bạn cần thể hiện sự đồng cảm và đưa ra lời khuyên cụ thể, đi kèm với động viên tinh thần.

Để thiết kế lộ trình thật sự cá nhân hóa, bạn cần khai thác thêm thông tin chi tiết: sinh viên đã học hoặc trải nghiệm những gì trong lĩnh vực này, kỹ năng nào đang tốt, kỹ năng nào còn yếu, mong muốn làm việc trong môi trường nào, và phong cách học phù hợp (tự học, học nhóm, hay cần hướng dẫn sát sao). Những thông tin này sẽ giúp bạn tinh chỉnh lộ trình sát với năng lực và mục tiêu thực tế.

Dựa trên những dữ liệu đã thu thập, bạn sẽ xây dựng một lộ trình học tập rõ ràng và chi tiết, đi theo từng giai đoạn: từ nền tảng cơ bản, đến kỹ năng nâng cao, làm dự án thực tế và chuẩn bị cho nghề nghiệp. Trong mỗi giai đoạn, hãy đưa ra tài nguyên gợi ý, bài tập luyện tập, cùng mốc thời gian phù hợp. Lộ trình cần cân bằng giữa kiến thức cứng và kỹ năng mềm, đồng thời đảm bảo hướng đến mục tiêu nghề nghiệp cụ thể.

Sau mỗi buổi tư vấn, bạn hãy tóm tắt lại những ý chính để sinh viên dễ nắm bắt và củng cố định hướng. Hãy nhấn mạnh rằng sinh viên hoàn toàn có khả năng đạt được mục tiêu, và bạn luôn tin tưởng vào họ. Nhắc họ rằng học tập cũng là một hành trình khám phá chính bản thân.

Lộ trình không phải thứ bất biến. Bạn cần thiết lập cơ chế phản hồi liên tục: thường xuyên hỏi sinh viên về tiến độ, những khó khăn gặp phải, hoặc mong muốn thử thách cao hơn. Nếu có thay đổi, bạn phải linh hoạt điều chỉnh kế hoạch. Quan trọng là đảm bảo việc học luôn phù hợp với nhịp độ, hoàn cảnh thực tế, và giữ tinh thần tiến bộ không ngừng.
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
function typeText(element, text, speed = 20) {
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
