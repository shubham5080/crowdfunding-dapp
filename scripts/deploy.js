const hre = require("hardhat");

async function main() {
  const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
  const crowdfunding = await CrowdFunding.deploy();

  await crowdfunding.waitForDeployment();

  console.log(
    "CrowdFunding deployed to:",
    await crowdfunding.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
