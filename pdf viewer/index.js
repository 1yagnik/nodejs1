
let pdfPages = [];

async function initpdf() {
    let files = document.getElementById("pdfFiles").files;

    if (files.length === 0) {
        alert("Pehle PDF select karo");
        return;
    }

    pdfPages = [];
    $("#pdfViewer").empty();

    for (let file of files) {
        try {
            let pdfDoc = await pdfjsLib.getDocument({
                data: await file.arrayBuffer()
            }).promise;

            let title = document.createElement("h2");
            title.textContent = file.name;
            $("#pdfViewer").append(title);

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                let page = await pdfDoc.getPage(i);

                let viewport = page.getViewport({ scale: 1.5 });

                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");

                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.maxWidth = "100%";
                canvas.style.height = "auto";
                canvas.style.display = "block";
                canvas.style.marginBottom = "20px";

                $("#pdfViewer").append(canvas);

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
    }

    console.log("All PDFs loaded:", pdfPages.length);
}

document.getElementById("pdfFiles").addEventListener(
    "change",
    initpdf
);

document.getElementById("searchBtn").addEventListener(
    "click",
    searchWord
);

async function searchWord() {
    let word = document.getElementById("searchWord")
        .value.trim().toLowerCase();
    
    

    if (!word) {
        alert("Search word likho");
        return;
    }

    let found = 0;

    for (let data of pdfPages) {
        let { page, viewport, canvas, textContent } = data;
        let ctx = canvas.getContext("2d");

        // Pehle page ko saaf tarike se dobara render karo
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;

        for (let item of textContent.items) {
            if (!item.str || !item.str.trim()) continue;

            let text = item.str;
            let lowerText = text.toLowerCase();
            let start = 0;

            while (true) {
                let index = lowerText.indexOf(word, start);

                if (index === -1) break;

                // PDF text ki position viewport coordinates mein
                let tx = pdfjsLib.Util.transform(
                    viewport.transform,
                    item.transform
                );

                let fontHeight = Math.hypot(tx[2], tx[3]);
                let totalWidth = item.width * viewport.scale;

                // Matching word ki approximate horizontal position
                let beforeRatio = index / text.length;
                let matchRatio = word.length / text.length;

                let x = tx[4] + totalWidth * beforeRatio;
                let y = tx[5] - fontHeight;
                let width = totalWidth * matchRatio;
                let height = fontHeight * 1.2;

                // Black border
                ctx.save();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    x - 2,
                    y - 2,
                    Math.max(width, 3) + 4,
                    height + 4
                );
                ctx.restore();

                found++;
                start = index + word.length;
            }
        }
    }

    console.log("Total matches:", found);

    if (found === 0) {
        alert("Word kisi bhi loaded PDF mein nahi mila.");
    } else {
        alert("Word mila: " + found + " matches");
    }
}
