// 1. Initial State / Fallback Data
const stocks = {
  "RELIANCE": { price: 2971.30, change: 12.40, isUp: true },
  "TCS": { price: 3945.00, change: -5.20, isUp: false },
  "HDFCBANK": { price: 1528.00, change: 8.50, isUp: true },
  "INFY": { price: 1452.10, change: 10.30, isUp: true },
  "ICICIBANK": { price: 1084.50, change: -2.15, isUp: false },
  "SBI": { price: 765.20, change: 4.10, isUp: true }
};

const tickerContainer = document.getElementById('ticker-container') || document.querySelector('[data-id="ticker-container"]');

// 2. Build the Ticker UI
function initializeTicker() {
  let html = '';
  
  // Generate the HTML blocks
  Object.keys(stocks).forEach(symbol => {
    const data = stocks[symbol];
    const sign = data.isUp ? '+' : '';
    const colorClass = data.isUp ? 'up' : 'down';
    const arrow = data.isUp ? '▲' : '▼';
    
    // Note the data-symbol attribute; we use this to target specific stocks later
    html += `
      <div class="stock-box" data-symbol="${symbol}">
        <span class="stock-symbol">${symbol}</span>
        <span class="stock-price">₹${data.price.toFixed(2)}</span>
        <span class="stock-change ${colorClass}">${arrow} ${sign}${data.change.toFixed(2)}</span>
      </div>
    `;
  });
  
  // Duplicate the content to ensure the CSS infinite loop is seamless
  tickerContainer.innerHTML = html + html;
}

// 3. Real-Time Update Logic
// This function targets existing HTML to prevent the scrolling animation from resetting.
function updateStockPrice(symbol, newPrice) {
  if (!stocks[symbol]) return; // Ignore stocks not in our ticker
  
  const oldPrice = stocks[symbol].price;
  if (oldPrice === newPrice) return; // Do nothing if price hasn't moved

  // Calculate new metrics
  const difference = newPrice - oldPrice;
  stocks[symbol].price = newPrice;
  stocks[symbol].change += difference;
  stocks[symbol].isUp = stocks[symbol].change >= 0;

  // Find all DOM nodes for this symbol (remember, we duplicated them for the loop)
  const stockNodes = document.querySelectorAll(`[data-symbol="${symbol}"]`);
  
  stockNodes.forEach(node => {
    const priceEl = node.querySelector('.stock-price');
    const changeEl = node.querySelector('.stock-change');
    
    // Update the Text
    priceEl.innerText = `₹${newPrice.toFixed(2)}`;
    
    const sign = stocks[symbol].isUp ? '+' : '';
    const arrow = stocks[symbol].isUp ? '▲' : '▼';
    changeEl.innerText = `${arrow} ${sign}${stocks[symbol].change.toFixed(2)}`;
    
    // Update Up/Down Colors
    changeEl.className = `stock-change ${stocks[symbol].isUp ? 'up' : 'down'}`;
    
    // Add flashing effect to indicate a live trade happened
    priceEl.classList.remove('flash-green', 'flash-red');
    void priceEl.offsetWidth; // Trigger a DOM reflow to restart the CSS animation
    priceEl.classList.add(difference > 0 ? 'flash-green' : 'flash-red');
  });
}

// Render the initial UI
initializeTicker();

// =========================================================
// 4. THE LIVE CONNECTION
// =========================================================

/*
  HOW TO USE A REAL BROKER WEBSOCKET:
  Uncomment and configure the code below using your Indian broker's API.
*/

  const ws = new WebSocket('wss://api.yourbroker.com/v1/websocket');
  
  ws.onmessage = function(event) {
     const liveData = JSON.parse(event.data);
     // Assuming liveData looks like: { symbol: "RELIANCE", ltp: 2975.50 }
     updateStockPrice(liveData.symbol, liveData.ltp); 
  };


// SIMULATION FOR DEMONSTRATION: 
// This simulates incoming WebSocket ticks. It randomly selects a stock 
// every 1 second and fluctuates its price to demonstrate the live update.
setInterval(() => {
  const symbols = Object.keys(stocks);
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fluctuate price by -2 to +2 rupees
  const volatility = (Math.random() * 4) - 2; 
  const newPrice = stocks[randomSymbol].price + volatility;
  
  // Trigger the update function just like a WebSocket would
  updateStockPrice(randomSymbol, newPrice);
}, 1000);