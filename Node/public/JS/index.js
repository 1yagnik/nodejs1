const form = document.getElementById("uploadForm");
        const pdfInput = document.getElementById("pdfFiles");
        const questionInput = document.getElementById("question");
        const selectedFiles = document.getElementById("selectedFiles");
        const fileCount = document.getElementById("fileCount");
        const status = document.getElementById("status");
        const sendButton = document.getElementById("sendButton");
        const messages = document.getElementById("messages");
        const welcome = document.getElementById("welcome");
        const chatArea = document.getElementById("chatArea");
        const history = document.getElementById("history");

        let chosenFiles = [];

        // PDF select karne par
        pdfInput.addEventListener("change", () => {
            const newFiles = Array.from(pdfInput.files);

            for (const file of newFiles) {
                if (!chosenFiles.some(
                    existing => existing.name === file.name &&
                        existing.size === file.size
                )) {
                    chosenFiles.push(file);
                }
            }

            if (chosenFiles.length > 1500) {
                chosenFiles = chosenFiles.slice(0, 5);
                status.textContent = "Maximum 5 PDFs select kar sakte ho.";
            }

            renderFiles();

            // Same file ko dobara select karne ki permission
            pdfInput.value = "";
        });

        function renderFiles() {
            selectedFiles.replaceChildren();

            chosenFiles.forEach((file, index) => {
                const chip = document.createElement("div");
                chip.className = "file-chip";

                const name = document.createElement("span");
                name.textContent = "📄 " + file.name;

                const remove = document.createElement("button");
                remove.type = "button";
                remove.textContent = "✕";
                remove.title = "Remove PDF";

                remove.addEventListener("click", () => {
                    chosenFiles.splice(index, 1);
                    renderFiles();
                });

                chip.append(name, remove);
                selectedFiles.appendChild(chip);
            });

            fileCount.textContent = chosenFiles.length + " PDFs selected";
        }

        // Form submit: PDF + question backend ko bhejo
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const question = questionInput.value.trim();

            if (!question) {
                status.textContent = "Pehle apna sawaal likho.";
                questionInput.focus();
                return;
            }



            const formData = new FormData();

            for (const file of chosenFiles) {
                formData.append("myFiles", file);
            }

            // IMPORTANT: Backend ko sawaal bhi bhej rahe hain
            formData.append("question", question);

            welcome.style.display = "none";

            addMessage("You", question, "user-message");

            status.textContent = "PDF process ho rahi hain. Please wait...";
            sendButton.disabled = true;
            sendButton.textContent = "Working...";

            try {
                const response = await fetch("/", {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Request failed");
                }

                status.textContent = data.message || "Research complete.";



                if (Array.isArray(data.results) && data.results.length > 0) {
                    // Multiple PDFs ke answers
                    data.results.forEach((item) => {
                        addMessage(
                            "ANSWER",
                            item.answer || "Koi answer nahi mila.",
                            "ai-message"
                        );
                    });

                } else if (data.answer) {
                    // Single PDF ya normal chat ka answer
                    addMessage(
                        "ANSWER",
                        data.answer,
                        "ai-message"
                    );

                } else {
                    addMessage(
                        "ANSWER",
                        data.message?.content || "Koi answer nahi mila.",
                        "ai-message"
                    );
                }



                const historyItem = document.createElement("div");
                historyItem.className = "history-item";
                historyItem.textContent = question;
                history.prepend(historyItem);

                questionInput.value = "";
                chosenFiles = [];
                renderFiles();

            } catch (error) {
                status.textContent = "Error: " + error.message;

                addMessage(
                    "Error",
                    error.message,
                    "ai-message"
                );
            } finally {
                sendButton.disabled = false;
                sendButton.textContent = "Send ↑";
                chatArea.scrollTop = chatArea.scrollHeight;
            }
        });

        function addMessage(label, text, className) {
            const message = document.createElement("div");
            message.className = "message " + className;

            const heading = document.createElement("div");
            heading.className = "message-label";
            heading.textContent = label;

            const content = document.createElement("div");
            content.textContent = text;

            message.append(heading, content);
            messages.appendChild(message);

            chatArea.scrollTop = chatArea.scrollHeight;
        }

        // New chat
        document.getElementById("newChat").addEventListener("click", () => {
            messages.replaceChildren();
            chosenFiles = [];
            renderFiles();
            questionInput.value = "";
            welcome.style.display = "block";
            status.textContent = "PDF upload karo, sawaal likho aur Send dabao.";
        });

        // Clear chat
        document.getElementById("clearButton").addEventListener("click", () => {
            messages.replaceChildren();
            history.replaceChildren();

            const empty = document.createElement("div");
            empty.className = "history-item";
            empty.textContent = "Abhi koi research nahi hai.";
            history.appendChild(empty);

            welcome.style.display = "block";
        });

        // Dark / light theme toggle
        let darkMode = true;

        document.getElementById("themeButton").addEventListener("click", () => {
            darkMode = !darkMode;

            document.body.style.background = darkMode ? "#343541" : "#f5f5f5";
            document.body.style.color = darkMode ? "#ececf1" : "#222";
            document.querySelector(".main").style.background =
                darkMode ? "#343541" : "#f5f5f5";
            document.querySelector(".sidebar").style.background =
                darkMode ? "#202123" : "#e5e5e5";

            document.getElementById("themeButton").textContent =
                darkMode ? "☾ Dark mode" : "☀ Light mode";
        });