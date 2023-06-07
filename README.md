# NodeJs-Multicall3
Interaction example with Multicall3 on NodeJs

In this example, we encapsulate the Multicall interaction in the Multicall3 class in the file Multicall3.js. In this class, I implement the <b>aggregate3</b> function to get the data, in addition, I implement some additional functions to encode and decode the data. In this example, I only use the web.js library

<br />The main.js file uses the Multicall3 class to get multiple data at the same time, in which there are always 2 data: Block Number and Block Timestamp. These are 2 important data for you to know if this data is up to date or not. If the current data is too long, it means that the RPC Node is having problems.

<p>Trong main.js file, I have demo 3 functions to get data:
<ul>
<li><b>getBalances()</b>: Get balance on various assets of one or more wallets.</li>
<li><b>getReserves()</b>: Get information about the reserves in the pools of Uniswap V2</li>
<li><b>getLiquidityAndPrice()</b>: Get information about the liquidity, tick, sqrtPriceX96 in the pools of Uniswap V3 </li>
</ul>
<br />

<p><b><u>How to run the example</u></b>
<p>Firstly, you need to install the libraries:
<br /><code>npm install</code>
<p>And then, you can run one of the following commands:
<br /><code>node main.js --type=balance</code>
<br /><code>node main.js --type=ammv2</code>
<br /><code>node main.js --type=ammv3</code>

<p>Good luck!