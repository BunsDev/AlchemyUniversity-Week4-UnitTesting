const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { assertHardhatInvariant } = require("hardhat/internal/core/errors");

describe("Faucet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy();

    const [owner, signer2] = await ethers.getSigners();

    let withdrawAmount = ethers.utils.parseUnits("1", "ether");

    // console.log("Signer 1 address: ", owner.address);
    // console.log("Signer 2 address: ", signer2.address);
    // console.log(faucet.address);
    return { faucet, owner, withdrawAmount, signer2 };
  }

  it("should deploy and set the owner correctly", async function () {
    const { faucet, owner, Signer2 } = await loadFixture(
      deployContractAndSetVariables
    );

    expect(await faucet.owner()).to.equal(owner.address);
  });
  it("should not allow withdrawls above .1 ETH at a time", async function () {
    const { faucet, withdrawAmount } = await loadFixture(
      deployContractAndSetVariables
    );
    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });
  it("should not allow non-owner accounts to call said functions", async function () {
    const { faucet, owner, signer2 } = await loadFixture(
      deployContractAndSetVariables
    );
    await expect(faucet.connect(signer2).withdrawAll()).to.be.reverted;
  });
  it("should check that the contract actually self destructed", async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);
    await faucet.destroyFaucet();
    expect(await ethers.provider.getCode(faucet.address)).to.equal("0x");
  });
});
