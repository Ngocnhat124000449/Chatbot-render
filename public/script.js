const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messages = document.getElementById("messages");

let stage = "collecting_info";
let currentQuestionIndex = 0;
let studentProfile = {};
const questions = [
  { key: "name", question: "👋 Xin chào! Bạn tên là gì?" },
  { key: "age", question: "📅 Bạn bao nhiêu tuổi?" },
  { key: "major", question: "📚 Ngành học hiện tại của bạn là gì?" },
  { key: "currentYear", question: "🎓 Bạn đang học năm mấy?" },
  { key: "careerGoal", question: "🎯 Mục tiêu nghề nghiệp của bạn là gì?" },
  { key: "learningStyle", question: "📖 Phong cách học tập bạn thích là gì (tự học, nhóm, video, đọc sách...)?" },
];

// Lịch sử hội thoại
const chatHistory = [
  {
    role: "system",
    content:
      "Bạn là một trợ lý học tập AI, chuyên tư vấn hướng học và kế hoạch cá nhân hóa cho sinh viên Việt Nam.",
  },
];

// Gửi form
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = "";
  addMessage(userMessage, "user");

  if (stage === "collecting_info") {
    const currentKey = questions[currentQuestionIndex].key;
    studentProfile[currentKey] = userMessage;
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
      setTimeout(() => addMessage(questions[currentQuestionIndex].question, "bot"), 300);
    } else {
      stage = "chatting";
      const introPrompt = generateIntroPrompt(studentProfile);
      chatHistory.push({ role: "user", content: introPrompt });
      await streamMessage();
    }
  } else {
    chatHistory.push({ role: "user", content: userMessage });
    await streamMessage();
  }
});

// Hiển thị tin nhắn
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

// Hiển thị câu hỏi đầu tiên
addMessage(questions[0].question, "bot");

// Gọi API GPT
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

// Tạo prompt giới thiệu sinh viên
function generateIntroPrompt(profile) {
  return (
    `Dưới đây là thông tin của sinh viên:\n` +
    `- Họ tên: ${profile.name}\n` +
    `- Tuổi: ${profile.age}\n` +
    `- Ngành học: ${profile.major}\n` +
    `- Năm học: ${profile.currentYear}\n` +
    `- Mục tiêu nghề nghiệp: ${profile.careerGoal}\n` +
    `- Phong cách học: ${profile.learningStyle}\n\n` +
    `Hãy đóng vai trò là cố vấn học tập. Từ các thông tin trên, hãy gợi ý:\n` +
    `1. Con đường học tập phù hợp\n` +
    `2. Những kỹ năng cần học\n` +
    `3. Cách lập kế hoạch học hiệu quả theo phong cách của sinh viên\n` +
    `Chỉ phản hồi các nội dung trong phạm vi học tập.`
  );
}
