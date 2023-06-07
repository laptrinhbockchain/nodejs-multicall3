const parseArgs = require('minimist');
const Multicall3 = require('./Multicall3');

let multicallObj = null;

function getMulticall3() {
    if (!multicallObj) multicallObj = new Multicall3("ARBITRUM", "https://arb1.arbitrum.io/rpc");
    return multicallObj;
}

async function getBalances(addr) {
    let multicall = getMulticall3();
    let args = [];
    args.push({
        target: multicall.getAddress(),
        allowFailure: true,
        callData: multicall.getBlockNumberEncode()
    });
    args.push({
        target: multicall.getAddress(),
        allowFailure: true,
        callData: multicall.getCurrentBlockTimestampEncode()
    });
    args.push({
        target: multicall.getAddress(),
        allowFailure: true,
        callData: multicall.getEthBalanceEncode(addr)
    });
    args.push({
        target: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
        allowFailure: true,
        callData: multicall.erc20_balanceOfEncode(addr)
    });
    args.push({
        target: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
        allowFailure: true,
        callData: multicall.erc20_balanceOfEncode(addr)
    });
    
    let results = await multicall.aggregate3(args);
    let output = {
        blockNumber: multicall.decodeUint256(results[0].data),
        blockTime: multicall.decodeUint256(results[1].data),
        balances: {
            ETH: multicall.decodeUint256(results[2].data),
            USDC: multicall.decodeUint256(results[3].data),
            USDT: multicall.decodeUint256(results[4].data),
        }
    };
    console.log("Results:", output);
}

async function getReserves() {
    let multicall = getMulticall3();
    let args = [];
    args.push({
        target: multicall.getAddress(),
        allowFailure: true,
        callData: multicall.getBlockNumberEncode()
    });
    args.push({
        target: multicall.getAddress(),
        allowFailure: true,
        callData: multicall.getCurrentBlockTimestampEncode()
    });
    args.push({
        target: "0x8b8149dd385955dc1ce77a4be7700ccd6a212e65", // WETH-USDC
        allowFailure: true,
        callData: multicall.ammv2_getReservesEncode()
    });
    args.push({
        target: "0xb7e50106a5bd3cf21af210a755f9c8740890a8c9", // MAGIC-WETH
        allowFailure: true,
        callData: multicall.ammv2_getReservesEncode()
    });
    args.push({
        target: "0x87425d8812f44726091831a9a109f4bdc3ea34b4", // GRAIL-USDC
        allowFailure: true,
        callData: multicall.ammv2_getReservesEncode()
    });
    
    let results = await multicall.aggregate3(args);
    let output = {
        blockNumber: multicall.decodeUint256(results[0].data),
        blockTime: multicall.decodeUint256(results[1].data),
        reserves: { }
    };
    let pools = [ "WETH-USDC", "MAGIC-WETH", "GRAIL-USDC" ];
    for (let idx=0; idx<pools.length; idx++) {
        let poolName =pools[idx];
        let tokens = poolName.split("-");
        let result = multicall.decodeParameters(["uint256", "uint256"], results[2+idx].data);
        output.reserves[poolName] = {};
        output.reserves[poolName][tokens[0]] = result[0];
        output.reserves[poolName][tokens[1]] = result[1];
    }
    console.log("Results:", output);
}

async function getLiquidityAndPrice() {
    let multicall = getMulticall3();
    let args = [];
    args.push({
        target: multicall.getAddress(),
        allowFailure: true,
        callData: multicall.getBlockNumberEncode()
    });
    args.push({
        target: multicall.getAddress(),
        allowFailure: true,
        callData: multicall.getCurrentBlockTimestampEncode()
    });
    args.push({
        target: "0xf9188aff2b5fa1e1e5542995806706fe6a84f3f3", // GHO-WETH-300
        allowFailure: true,
        callData: multicall.ammv3_slot0Encode()
    });
    args.push({
        target: "0xf9188aff2b5fa1e1e5542995806706fe6a84f3f3", // GHO-WETH-300
        allowFailure: true,
        callData: multicall.ammv3_liquidityEncode()
    });
    args.push({
        target: "0xc31e54c7a869b9fcbecc14363cf510d1c41fa443", // ETH-USDC-50
        allowFailure: true,
        callData: multicall.ammv3_slot0Encode()
    });
    args.push({
        target: "0xc31e54c7a869b9fcbecc14363cf510d1c41fa443", // ETH-USDC-50
        allowFailure: true,
        callData: multicall.ammv3_liquidityEncode()
    });
    args.push({
        target: "0x2f5e87c9312fa29aed5c179e456625d79015299c", // WBTC-ETH-50
        allowFailure: true,
        callData: multicall.ammv3_slot0Encode()
    });
    args.push({
        target: "0x2f5e87c9312fa29aed5c179e456625d79015299c", // WBTC-ETH-50
        allowFailure: true,
        callData: multicall.ammv3_liquidityEncode()
    });
    
    let results = await multicall.aggregate3(args);
    let output = {
        blockNumber: multicall.decodeUint256(results[0].data),
        blockTime: multicall.decodeUint256(results[1].data),
        reserves: { }
    };
    let pools = [ " GHO-WETH-300", "ETH-USDC-50", "WBTC-ETH-50" ];
    for (let idx=0; idx<pools.length; idx++) {
        let poolName =pools[idx];
        let result = multicall.decodeParameters(["uint160", "int24", "uint16", "uint16", "uint16", "uint8", "bool"], results[2 + 2*idx].data);
        output.reserves[poolName] = {
            sqrtPriceX96: result[0],
            tick: result[1]
        };
        result = multicall.decodeParameter("uint128", results[2 + 2*idx + 1].data);
        output.reserves[poolName].liquidity = result;
    }
    console.log("Results:", output);
}

function showHelp() {
    console.log("Commands:");
    console.log("\tnode main.js --type=balance");
    console.log("\tnode main.js --type=ammv2");
    console.log("\tnode main.js --type=ammv3");
}

async function main() {
    var opts = parseArgs(process.argv.slice(2), {
        string: [ ]
    });
    if (!opts.type) {
        showHelp();
        return;
    }

    let type = opts.type;
    if (type=="balance") {
        await getBalances("0xe93685f3bBA03016F02bD1828BaDD6195988D950");
    } else if (type=="ammv2") {
        await getReserves();
    } else if (type=="ammv3") {
        await getLiquidityAndPrice();
    } else {
        showHelp();
    }
}
main();