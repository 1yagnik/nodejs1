const totalItems = 100000; // 1 Lac
const availableItems = 400;

function updateProgress(available, total) {
  // Percentage calculate karein
  const percentage = (available / total) * 100;

  // Bar ki width set karein
  const bar = document.getElementById('progress-fill');
  bar.style.width = percentage + '%';

  // Text ko bar ke bahar dikhayein (kyunki 0.4% bar ke andar text fit nahi hoga)
  const text = document.getElementById('progressText');
  text.textContent = `${available.toLocaleString('en-IN')} / ${total.toLocaleString('en-IN')} items available (${percentage.toFixed(2)}%)`;

  const TotalText = document.getElementById('texttotl');
  TotalText.textContent = `${availableItems}`;
}

// Function call karein
updateProgress(availableItems, totalItems);
