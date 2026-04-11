// Decorate the stock-picker block and render as ticker-style stock boxes
export default function decorate(block) {
  const stocks = {};
  const children = block.querySelectorAll(":scope > div");
  children.forEach((child) => {
    const name = child.querySelector("div:first-child p").innerText.trim();
    const values = Array.from(child.querySelectorAll("div:last-child p")).map(
      (p) => p.innerText.trim(),
    );
    const symbol = name.toUpperCase();
    let price = NaN;
    for (let v of values) {
      if (!isNaN(parseFloat(v)) && isFinite(v)) {
        price = parseFloat(v);
        break;
      }
    }
    let change = 0;
    let foundPrice = false;
    for (let v of values) {
      if (!foundPrice && !isNaN(parseFloat(v)) && isFinite(v)) {
        foundPrice = true;
        continue;
      }
      if (foundPrice && !isNaN(parseFloat(v)) && isFinite(v)) {
        change = parseFloat(v);
        break;
      }
    }
    let isUp = false;
    for (let i = values.length - 1; i >= 0; i--) {
      if (values[i] === "true" || values[i] === "false") {
        isUp = values[i] === "true";
        break;
      }
    }
    if (isNaN(price)) {
      console.warn("Invalid price for", symbol, values);
    }
    stocks[symbol] = { price, change, isUp };
  });

  let html = "";
  Object.keys(stocks).forEach((symbol) => {
    const data = stocks[symbol];
    const sign = data.isUp ? "+" : "";
    const colorClass = data.isUp ? "up" : "down";
    const arrow = data.isUp ? "▲" : "▼";
    html += `\n      <div class="stock-box" data-symbol="${symbol}">\n        <span class="stock-symbol">${symbol}</span>\n        <span class="stock-price">₹${isNaN(data.price) ? "--" : data.price.toFixed(2)}</span>\n        <span class="stock-change ${colorClass}">${arrow} ${sign}${data.change.toFixed(2)}</span>\n      </div>\n    `;
  });

  block.innerHTML = html + html;
}
