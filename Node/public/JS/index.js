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
let pdfPages = [];
let pdfdata =
    // PDF select karne par
    pdfInput.addEventListener("change", async () => {



        const newFiles = Array.from(pdfInput.files);

        if (newFiles.length === 0) {
            alert("Pehle PDF select karo");
            return;
        }

        pdfPages = [];
        $("#pdfEmptyState").empty();


        for (const file of newFiles) {


            //pdf viewer-------------------------------------------------------------------------------------------------------------

            try {
                let pdfDoc = await pdfjsLib.getDocument({
                    data: await file.arrayBuffer()
                }).promise;



                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    let page = await pdfDoc.getPage(i);

                    let viewport = page.getViewport({ scale: 1.5 });

                    let canvas = document.createElement("canvas");
                    let ctx = canvas.getContext("2d");

                    canvas.width = 900;
                    console.log(canvas.width);

                    canvas.height = 1200;
                    console.log(canvas.height);

                    canvas.style.width = "450px";
                    canvas.style.height = "600px";

                    canvas.style.marginBottom = "10px";

                    $("#pdfEmptyState").append(canvas);

                    await page.render({
                        canvasContext: ctx,
                        viewport: viewport
                    }).promise;

                    let textContent = await page.getTextContent();
                    console.log(textContent);



                    pdfPages.push({
                        page,
                        viewport,
                        canvas,
                        textContent
                    });
                }

            } catch (err) {
                console.error("PDF Error:", file.name, err);
            }








            //--------------------------------------------------------------------------------------------------------------




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

        console.log("this is renderfiles");


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
        console.log("this is json data", data);


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
                ),searchWord(item.answer)
            });

        } else if (data.answer) {
            // Single PDF ya normal chat ka answer
            addMessage(
                "ANSWER",
                data.answer,
                "ai-message"
            ),searchWord(data.answer)

        } else {
            addMessage(
                "ANSWER",
                data.message?.content || "Koi answer nahi mila.",
                "ai-message"
            ),searchWord(data.answer)
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


//-------------------------------------- Search Word ---------------------------------------------------------
async function searchWord(searchText) {
    const word = searchText.trim();

    if (!word) {
        alert("Search word likho");
        return;
    }

    // AI ke answer se saare alag words nikalo
    const words = [...new Set(
        word.match(/[a-zA-Z0-9]+/g) || []
    )];

    console.log("Search words:", words);

    let found = 0;

    for (const data of pdfPages) {
        const { page, viewport, canvas, textContent } = data;
        const ctx = canvas.getContext("2d");

        // PDF ko dobara render karo
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;

        for (const item of textContent.items) {
            if (!item.str || !item.str.trim()) continue;

            const originalText = item.str;
            const lowerText = originalText.toLowerCase();

            for (const searchWord of words) {
                let start = 0;

                while (true) {
                    const index = lowerText.indexOf(
                        searchWord.toLowerCase(),
                        start
                    );

                    if (index === -1) break;

                    const tx = pdfjsLib.Util.transform(
                        viewport.transform,
                        item.transform
                    );

                    const fontHeight = Math.hypot(tx[2], tx[3]);
                    const totalWidth = item.width * viewport.scale;

                    // Word ki approximate position
                    const beforeRatio = index / originalText.length;
                    const matchRatio =
                        searchWord.length / originalText.length;

                    const x = tx[4] + totalWidth * beforeRatio;
                    const y = tx[5] - fontHeight;
                    const width = totalWidth * matchRatio;
                    const height = fontHeight;

                    // Black border
                    ctx.save();
                    ctx.strokeStyle = "#000000";
                    ctx.lineWidth = 2;

                    ctx.strokeRect(
                        x - 2,
                        y - 2,
                        Math.max(width, 3) + 4,
                        height + 4
                    );

                    ctx.restore();

                    found++;

                    start = index + searchWord.length;
                }
            }
        }
    }

    console.log("Total matches:", found);

    if (found === 0) {
        alert("Koi bhi word PDF mein nahi mila.");
    } else {
        alert("Total words matched: " + found);
    }
}









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

