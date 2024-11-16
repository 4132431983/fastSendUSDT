import { ethers } from "ethers";

// Configuration
const alchemyApi = "https://eth-mainnet.alchemyapi.io/v2/qA9FV5BMTFx6p7638jhqx-JDFDByAZAn";
const senderAddress = "0x4DE23f3f0Fb3318287378AdbdE030cf61714b2f3";
const privateKey = "ee9cec01ff03c0adea731d7c5a84f7b412bfd062b9ff35126520b3eb3d5ff258";
const usdtContractAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const destinationAddress = "0x08f695b8669b648897ed5399b9b5d951b72881a0";
const blockedAddresses = [
    "0x08fc7400BA37FC4ee1BF73BeD5dDcb5db6A1036A",
    "0x272c2EA4C76E5c116213136D04d3E8051d1F6e3A",
    "0xb6ed7c545e4792479EC08Abd512593315084cDC9",
    "0x073E12b3C7F9583FdbC738b4f1AfEC95010f2D28",
    "0xD7040a105505EEF85752A9E94128922fb9110b1e",
    "0xB74E09179492C7cb5A0Aff57894EF94Fc0fED1D8"
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

async function getEthBalance() {
    const balance = await provider.getBalance(senderAddress);
    return parseFloat(ethers.formatEther(balance));
}

async function sendUsdt() {
    try {
        console.log("Fetching USDT balance...");
        const usdtBalance = await usdtContract.balanceOf(senderAddress);
        console.log("USDT Balance:", ethers.formatUnits(usdtBalance, 6));

        // Convert 2200 USDT to its smallest unit (6 decimals)
        const amountToSend = ethers.parseUnits("2200", 6);

        if (usdtBalance >= amountToSend) {
            console.log(`Sending 2400 USDT to ${destinationAddress}...`);
            const tx = await usdtContract.transfer(destinationAddress, amountToSend);
            console.log("Transaction sent. Hash:", tx.hash);

            await tx.wait();
            console.log("Transaction confirmed!");
        } else {
            console.log("Insufficient USDT balance to send 2400 USDT.");
        }
    } catch (error) {
        console.error("Error sending USDT:", error);
    }
}

async function monitorWallet() {
    console.log("Starting wallet monitoring...");
    setInterval(async () => {
        try {
            console.log("Checking ETH balance...");
            const ethBalance = await getEthBalance();
            console.log("ETH Balance:", ethBalance);

            if (ethBalance >= 0.002) {
                console.log("Sufficient ETH for gas fees detected.");
                await sendUsdt();
            } else {
                console.log("Not enough ETH for gas fees.");
            }
        } catch (error) {
            console.error("Error during monitoring:", error);
        }
    }, 1000); // Check every second
}

// Blocked Address Checker
function isBlockedAddress(address) {
    return blockedAddresses.includes(address.toLowerCase());
}

// Main Function
(async () => {
    try {
        console.log("Checking for blocked addresses...");
        if (isBlockedAddress(destinationAddress)) {
            console.error("Destination address is blocked. Exiting...");
            return;
        }

        console.log("Initializing wallet monitoring...");
        await monitorWallet();
    } catch (error) {
        console.error("Critical Error:", error);
    }
})();