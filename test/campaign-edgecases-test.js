const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding - Edge Cases", function () {

  it("Should revert if donating to invalid campaign", async function () {
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdfunding = await CrowdFunding.deploy();
    await crowdfunding.waitForDeployment();

    await expect(
      crowdfunding.donateToCampaign(99, { value: ethers.parseEther("1") })
    ).to.be.revertedWith("Campaign does not exist");
  });

  it("Should prevent double refund", async function () {
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdfunding = await CrowdFunding.deploy();
    await crowdfunding.waitForDeployment();

    const [, donor] = await ethers.getSigners();
    const now = (await ethers.provider.getBlock("latest")).timestamp;

    await crowdfunding.createCampaign(
      "Fail Case",
      "Refund test",
      ethers.parseEther("1"),
      now + 10
    );

    await crowdfunding.connect(donor).donateToCampaign(0, {
      value: ethers.parseEther("0.2"),
    });

    await ethers.provider.send("evm_increaseTime", [20]);
    await ethers.provider.send("evm_mine");

    await crowdfunding.connect(donor).refund(0);

    await expect(
      crowdfunding.connect(donor).refund(0)
    ).to.be.revertedWith("Nothing to refund");
  });

});
