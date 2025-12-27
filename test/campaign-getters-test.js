const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding - Getters", function () {

  it("Should return campaign details correctly", async function () {
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdfunding = await CrowdFunding.deploy();
    await crowdfunding.waitForDeployment();

    const deadline =
      (await ethers.provider.getBlock("latest")).timestamp + 86400;

    await crowdfunding.createCampaign(
      "Water Project",
      "Clean water initiative",
      ethers.parseEther("1"),
      deadline
    );

    const campaign = await crowdfunding.getCampaign(0);

    expect(campaign[1]).to.equal("Water Project");
    expect(campaign[3]).to.equal(ethers.parseEther("1"));
  });

  it("Should return all campaigns", async function () {
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdfunding = await CrowdFunding.deploy();
    await crowdfunding.waitForDeployment();

    const now = (await ethers.provider.getBlock("latest")).timestamp;

    await crowdfunding.createCampaign(
      "A",
      "Desc A",
      ethers.parseEther("1"),
      now + 100
    );

    await crowdfunding.createCampaign(
      "B",
      "Desc B",
      ethers.parseEther("2"),
      now + 200
    );

    const all = await crowdfunding.getAllCampaigns();
    expect(all.length).to.equal(2);
  });

});
