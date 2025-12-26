const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding - Withdraw & Refund", function () {

  it("Should allow creator to withdraw if target reached", async function () {
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdfunding = await CrowdFunding.deploy();
    await crowdfunding.waitForDeployment();

    const [creator, donor] = await ethers.getSigners();

    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const deadline = now + 10;

    await crowdfunding.createCampaign(
      "Build School",
      "Education support",
      ethers.parseEther("1"),
      deadline
    );

    await crowdfunding.connect(donor).donateToCampaign(0, {
      value: ethers.parseEther("1"),
    });

    // Move time forward
    await ethers.provider.send("evm_increaseTime", [20]);
    await ethers.provider.send("evm_mine");

    await expect(
      crowdfunding.connect(creator).withdrawFunds(0)
    ).to.not.be.reverted;
  });

  it("Should refund donor if target not reached", async function () {
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdfunding = await CrowdFunding.deploy();
    await crowdfunding.waitForDeployment();

    const [, donor] = await ethers.getSigners();

    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const deadline = now + 10;

    await crowdfunding.createCampaign(
      "Help Patients",
      "Medical aid",
      ethers.parseEther("2"),
      deadline
    );

    await crowdfunding.connect(donor).donateToCampaign(0, {
      value: ethers.parseEther("0.5"),
    });

    await ethers.provider.send("evm_increaseTime", [20]);
    await ethers.provider.send("evm_mine");

    await expect(
      crowdfunding.connect(donor).refund(0)
    ).to.not.be.reverted;
  });

});
