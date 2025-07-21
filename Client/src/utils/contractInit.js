import Web3 from 'web3';
import VaultContract from '../../../Server/build/contracts/VaultContract.json'; // adjust as needed

const CONTRACT_ADDRESS = '0xCc4986d4371016F0ff9689634b7eB075AE6ef66c';

let web3;
let contract;

export const initWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    contract = new web3.eth.Contract(VaultContract.abi, CONTRACT_ADDRESS);
    return { web3, contract };
  } else {
    alert("MetaMask not detected");
    throw new Error("No Ethereum provider");
  }
};

export const getContract = () => {
  if (!contract) {
    throw new Error("Contract not initialized. Call initWeb3() first.");
  }
  return contract;
};
