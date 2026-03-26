import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const treasuryAddress =
    process.env.TREASURY_ADDRESS || "0x0000000000000000000000000000000000000001";
  const feeBasisPoints = parseInt(process.env.FEE_BASIS_POINTS || "500", 10);

  console.log("─────────────────────────────────────────");
  console.log("  FundFlow Deployment");
  console.log("─────────────────────────────────────────");
  console.log(`  Treasury Address : ${treasuryAddress}`);
  console.log(`  Fee Basis Points : ${feeBasisPoints} (${feeBasisPoints / 100}%)`);
  console.log("─────────────────────────────────────────");

  const [deployer] = await ethers.getSigners();
  console.log(`  Deployer         : ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`  Deployer Balance : ${ethers.formatEther(balance)} ETH`);
  console.log("─────────────────────────────────────────");

  const FundFlow = await ethers.getContractFactory("FundFlow");
  console.log("  Deploying FundFlow...");

  const fundFlow = await FundFlow.deploy(treasuryAddress, feeBasisPoints);
  await fundFlow.waitForDeployment();

  const deployedAddress = await fundFlow.getAddress();

  console.log(`  ✅ FundFlow deployed to: ${deployedAddress}`);
  console.log("─────────────────────────────────────────");

  // Write address to deployment.txt
  const deploymentPath = path.join(__dirname, "..", "deployment.txt");
  const deploymentContent = `FundFlow Contract Address: ${deployedAddress}
Network: ${(await ethers.provider.getNetwork()).name}
Treasury: ${treasuryAddress}
Fee Basis Points: ${feeBasisPoints}
Deployed At: ${new Date().toISOString()}
`;
  fs.writeFileSync(deploymentPath, deploymentContent, "utf8");
  console.log(`  📄 Deployment info written to deployment.txt`);

  // Run `npx hardhat verify` command shown below
  const verifyCommand = `npx hardhat verify --network sepolia ${deployedAddress} "${treasuryAddress}" "${feeBasisPoints}"`;
  console.log("─────────────────────────────────────────");
  console.log("  To verify on Etherscan, run:");
  console.log(`  ${verifyCommand}`);
  console.log("─────────────────────────────────────────");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
