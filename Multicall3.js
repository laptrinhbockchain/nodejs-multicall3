const IMulticall3 = require('./abi/IMulticall3');
const Web3 = require('web3');

class Multicall3 {
    constructor(network, rpcNode, contractAddr) {
        this.network = network;
        this.rpcNode = rpcNode;
        this.contractAddr = contractAddr;
        if (!this.contractAddr) this.contractAddr = "0xcA11bde05977b3631167028862bE2a173976CA11";
        this.web3 = null;
        this.contract = null;
    }

    // args is array of objects: { address target, bool allowFailure, bytes callData }
    // Return array of objects { bool success, bytes data }
    async aggregate3(args) {
        try {
            let contract = this._getContract();
            let result = await contract.methods.aggregate3(args).call();
            if (!result) return null;
            return result.map(item => {
                return { success: item.success, data: item.returnData };
            });
        } catch(ex) {
            console.error("aggregate3() EXCEPTION", args, ex);
        }
        return null;
    }

    getAddress() {
        return this.contractAddr;
    }

    getBlockNumberEncode() {
        return this._getContract().methods.getBlockNumber().encodeABI();
    }

    getBlockHashEncode(blockNumber) {
        return this._getContract().methods.getBlockHash(blockNumber).encodeABI();
    }

    getCurrentBlockCoinbaseEncode() {
        return this._getContract().methods.getCurrentBlockCoinbase().encodeABI();
    }

    getCurrentBlockDifficultyEncode() {
        return this._getContract().methods.getCurrentBlockDifficulty().encodeABI();
    }

    getCurrentBlockGasLimitEncode() {
        return this._getContract().methods.getCurrentBlockGasLimit().encodeABI();
    }

    getCurrentBlockTimestampEncode() {
        return this._getContract().methods.getCurrentBlockTimestamp().encodeABI();
    }

    getEthBalanceEncode(addr) {
        return this._getContract().methods.getEthBalance(addr).encodeABI();
    }

    getLastBlockHashEncode() {
        return this._getContract().methods.getLastBlockHash().encodeABI();
    }

    getBasefeeEncode() {
        return this._getContract().methods.getBasefee().encodeABI();
    }

    getChainIdEncode() {
        return this._getContract().methods.getChainId().encodeABI();
    }

    erc20_balanceOfEncode(addr) {
        let web3 = this._getWeb3();
        return web3.eth.abi.encodeFunctionCall({
            name: "balanceOf",
            type: "function",
            inputs: [{
                type: "address",
                name: "account"
            }]
        }, [ addr ]);
    }

    ammv2_getReservesEncode() {
        let web3 = this._getWeb3();
        return web3.eth.abi.encodeFunctionCall({
            name: "getReserves",
            type: "function",
            inputs: []
        }, [ ]);
    }

    ammv3_slot0Encode() {
        let web3 = this._getWeb3();
        return web3.eth.abi.encodeFunctionCall({
            name: "slot0",
            type: "function",
            inputs: []
        }, [ ]);
    }

    ammv3_liquidityEncode() {
        let web3 = this._getWeb3();
        return web3.eth.abi.encodeFunctionCall({
            name: "liquidity",
            type: "function",
            inputs: []
        }, [ ]);
    }

    decodeParameter(type, hexString) {
        let web3 = this._getWeb3();
        return web3.eth.abi.decodeParameter(type, hexString);
    }

    decodeUint256(hexString) {
        return this.decodeParameter("uint256", hexString);
    }

    decodeParameters(typesArray, hexString) {
        let web3 = this._getWeb3();
        return web3.eth.abi.decodeParameters(typesArray, hexString);
    }
    
    _getContract() {
        if (!this.contract) {
            let web3 = this._getWeb3();
            this.contract = new web3.eth.Contract(IMulticall3, this.contractAddr);
        }
        return this.contract;
    }

    _getWeb3() {
        if (!this.web3) {
            this.web3 = new Web3(this.rpcNode);
        }
        return this.web3;
    }
}
module.exports = Multicall3;