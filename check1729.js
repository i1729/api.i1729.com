import handler from "./libs/handler-lib.js";
import Web3 from "web3";

export const main = handler(async (event, context) => {
  const toAddress = event.pathParameters.id;

  // Initialize web3 with Infura Ropsten
  const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/544c350a4cbf425ba5148a140fa9237f"));

  // Ropsten Private Key
  const pKey = process.env.ethereumRopstenPrivateKey;

  // Setup web3 account
  web3.eth.accounts.wallet.add(pKey);
  const account = web3.eth.accounts.privateKeyToAccount(pKey);
  web3.eth.defaultAccount = account.address;
  console.log(web3.eth.defaultAccount);

  // Set data for claim
  const timeNow = "1606960879144"; // 12-02-2020 at 8pm CST
  const foreverTime = "4132252800"; // 12-12-2100 at 12am

  // Create message and hash it
  const message = [web3.eth.defaultAccount, toAddress, timeNow, foreverTime];

  // MembershipClaimsRegistry contract address and ABI
  const contractAddress = "0xeE64ad43Ec053b7Ce4bd8F0896ffc26e7e8Bc171";
  const contractAbi = [ { "inputs": [ { "internalType": "address", "name": "_verifier", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "issuer", "type": "address" }, { "internalType": "address", "name": "subject", "type": "address" }, { "internalType": "uint256", "name": "validFrom", "type": "uint256" }, { "internalType": "uint256", "name": "validTo", "type": "uint256" } ], "internalType": "struct Claim", "name": "claim", "type": "tuple" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "name": "addClaim", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "components": [ { "internalType": "address", "name": "issuer", "type": "address" }, { "internalType": "address", "name": "subject", "type": "address" }, { "internalType": "uint256", "name": "validFrom", "type": "uint256" }, { "internalType": "uint256", "name": "validTo", "type": "uint256" } ], "internalType": "struct Claim", "name": "claim", "type": "tuple" } ], "name": "checkClaim", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" } ];

  // Initialize and try to call contract
  const contract = new web3.eth.Contract(contractAbi, contractAddress);
  try {
    console.log("checking claim");
    console.log(message);
    return contract.methods.checkClaim(message).call({ from: web3.eth.defaultAccount })
    .then((res) => {
      console.log(res);
      return res;
    });
  } catch (err) {
    console.log("ERRORED!!!!!!!!!!!!!!!!!!!");
    console.log(err);
    return err;
  }
});
