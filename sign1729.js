import handler from "./libs/handler-lib.js";
import Web3 from "web3";
import ethUtil from "ethereumjs-util";

export const main = handler(async (event, context) => {
  const toAddress = event.pathParameters.id;

  // Initialize web3 with Infura Ropsten
  const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/544c350a4cbf425ba5148a140fa9237f"));

  // Ropsten Private Key
  const pKey = process.env.PRIVATE_KEY;

  // Setup web3 account
  web3.eth.accounts.wallet.add(pKey);
  const account = web3.eth.accounts.privateKeyToAccount(pKey);
  web3.eth.defaultAccount = account.address;
  console.log(web3.eth.defaultAccount);

  // Set data for claim
  const timeNow = Date.now().toString();
  const foreverTime = "4132252800"; // 12-12-2100 at 12am

  // Create message and hash it
  const message = [web3.eth.defaultAccount, toAddress, timeNow, foreverTime];
  const messageHash = web3.utils.sha3(message);

  // Sign message hash
  const signedData = await web3.eth.sign(messageHash, web3.eth.defaultAccount);

  // Get r, s, v values from signature
  const rsv = ethUtil.fromRpcSig(signedData);

  // MembershipClaimsRegistry contract address and ABI
  const contractAddress = "0xeE64ad43Ec053b7Ce4bd8F0896ffc26e7e8Bc171";
  const contractAbi = [ { "inputs": [ { "internalType": "address", "name": "_verifier", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "issuer", "type": "address" }, { "internalType": "address", "name": "subject", "type": "address" }, { "internalType": "uint256", "name": "validFrom", "type": "uint256" }, { "internalType": "uint256", "name": "validTo", "type": "uint256" } ], "internalType": "struct Claim", "name": "claim", "type": "tuple" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "name": "addClaim", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "issuer", "type": "address" }, { "internalType": "address", "name": "subject", "type": "address" }, { "internalType": "uint256", "name": "validFrom", "type": "uint256" }, { "internalType": "uint256", "name": "validTo", "type": "uint256" } ], "internalType": "struct Claim", "name": "claim", "type": "tuple" } ], "name": "checkClaim", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" } ];

  // Initialize and try to call contract
  const contract = new web3.eth.Contract(contractAbi, contractAddress);
  const gasPrice = await web3.eth.getGasPrice();
  try {
    const gas = await contract.methods.addClaim(message, rsv.v, rsv.r, rsv.s).estimateGas({ from: web3.eth.defaultAccount });
    contract.methods.addClaim(message, rsv.v, rsv.r, rsv.s).send({ from: web3.eth.defaultAccount, gasPrice, gas }).then(async (res) => {
      console.log(res);
      return res;
    });
  } catch (err) {
    console.log("ERRORED!!!!!!!!!!!!!!!!!!!");
    console.log(err);
    return err;
  }
});
