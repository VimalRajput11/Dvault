// config/contract.js
const VaultContract = require("../build/contracts/VaultContract.json");
const Web3 = require("web3");


const web3 = new Web3(process.env.RPC_URL);


const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; 

const contract = new web3.eth.Contract(VaultContract.abi, CONTRACT_ADDRESS);

module.exports = async function contractInit() {
  const accounts = await web3.eth.getAccounts().catch(() => []);
  return {
    contract,
    defaultAccount: accounts[0] || null, 
  };
};
