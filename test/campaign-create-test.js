const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding - Campaign Creation", function () {
  
  it("Should create a campaign successfully", async function () {
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdfunding = await CrowdFunding.deploy();
    await crowdfunding.waitForDeployment();

    const title = "Save the Animals";
    const description = "A campaign to protect wildlife";
    const targetAmount = ethers.parseEther("1"); // 1 ETH
    const deadline = (await ethers.provider.getBlock("latest")).timestamp + 86400; // +1 day

    const tx = await crowdfunding.createCampaign(
      title,
      description,
      targetAmount,
      deadline
    );
    await tx.wait();

    const campaign = await crowdfunding.campaigns(0);

    expect(campaign.title).to.equal(title);
    expect(campaign.targetAmount).to.equal(targetAmount);
    expect(campaign.creator).to.not.equal(ethers.ZeroAddress);
  });

});
