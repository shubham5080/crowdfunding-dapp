const { expect } = require("chai");

describe("HelloWorld", function () {
  it("Should set and return message", async function () {
    const HelloWorld = await ethers.getContractFactory("HelloWorld");
    const contract = await HelloWorld.deploy("Initial message");
await contract.waitForDeployment();


    expect(await contract.message()).to.equal("Initial message");

    await contract.setMessage("New message");
    expect(await contract.message()).to.equal("New message");
  });
});

