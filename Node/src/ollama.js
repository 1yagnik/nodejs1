
import "dotenv/config";

export async function askOllama(content = "", question = "") {
  const pdfContent = content?.trim()
    ? `PDF ka content:\n\n${content.trim()}`
    : "Koi PDF upload nahi ki gayi.";

  const userQuestion = question?.trim()
    ? `Mera sawaal:\n${question.trim()}`
    : "User ne koi sawaal nahi poochha.";

  const response = await fetch("https://ollama.com/api/chat", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      model: "gemma4:31b",

      messages: [
        {
          role: "system",
          content: `Tum ek PDF research assistant ho.
PDF ke content ke aadhar par simple Hindi mein jawab do.
Agar jawab PDF mein nahi hai, to saaf batao.
Agar PDF nahi di gayi hai, to user ke sawaal ka jawab apni available knowledge ke aadhar par do.
Apni taraf se facts mat ghadho.`
        },

        {
          role: "user",
          content: `${pdfContent}\n\n${userQuestion}`
        }
      ],

      stream: false
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || `Ollama API error: ${response.status}`
    );
  }

  return data.message.content;
}
