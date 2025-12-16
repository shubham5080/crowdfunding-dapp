const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding - Donations", function () {

  it("Should allow users to donate to a campaign", async function () {
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdfunding = await CrowdFunding.deploy();
    await crowdfunding.waitForDeployment();

    const [owner, donor] = await ethers.getSigners();

    const deadline =
      (await ethers.provider.getBlock("latest")).timestamp + 86400;

    await crowdfunding.createCampaign(
      "Help Farmers",
      "Support farmers financially",
      ethers.parseEther("1"),
      deadline
    );

    await crowdfunding.connect(donor).donateToCampaign(0, {
      value: ethers.parseEther("0.5"),
    });

    const campaign = await crowdfunding.campaigns(0);
    const donated = await crowdfunding.donations(0, donor.address);

    expect(campaign.amountCollected).to.equal(
      ethers.parseEther("0.5")
    );
    expect(donated).to.equal(ethers.parseEther("0.5"));
  });

});
