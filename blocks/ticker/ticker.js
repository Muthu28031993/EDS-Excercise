const stocks = [
    { symbol: "NIFTY 50", price: "22,514.65", change: "+0.45%" },
    { symbol: "SENSEX", price: "74,248.22", change: "+0.47%" },
    { symbol: "RELIANCE", price: "2,971.30", change: "-0.12%" },
    { symbol: "TCS", price: "3,945.00", change: "+1.20%" },
    { symbol: "HDFC BANK", price: "1,528.00", change: "-0.85%" },
    { symbol: "INFY", price: "1,452.10", change: "+0.30%" },
    { symbol: "ICICI BANK", price: "1,084.50", change: "+1.15%" }
];
 
function createTicker() {
    // Use querySelector to select by data-id if id is not present
    const ticker = document.getElementById('stock-ticker') || document.querySelector('[data-id="stock-ticker"]');
    if (!ticker) return; // Exit if ticker element is not found
    // Function to generate the HTML for a single stock
    const stockHTML = stocks.map(stock => {
        const isUp = stock.change.includes('+');
        return `
<div class="stock-item">
<span class="symbol">${stock.symbol}</span>
<span class="price">₹${stock.price}</span>
<span class="change ${isUp ? 'up' : 'down'}">
                    ${isUp ? '▲' : '▼'} ${stock.change}
</span>
</div>
        `;
    }).join('');
 
    // Duplicate the content to ensure the loop is seamless
    ticker.innerHTML = stockHTML + stockHTML;
}
 
// Initialize
createTicker();