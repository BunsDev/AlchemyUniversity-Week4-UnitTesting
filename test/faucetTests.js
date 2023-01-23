const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const BigNumber = require("bignumber.js");

describe("Faucet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    let deposit = ethers.utils.parseUnits("1", "ether");
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy({ value: deposit }); //sending 1 ETH, which is used in the last it test.

    const [owner, signer2] = await ethers.getSigners();

    let withdrawAmount = ethers.utils.parseUnits("1", "ether");

    let contractBalanceBefore = await ethers.provider.getBalance(
      faucet.address
    );
    let ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

    return {
      faucet,
      owner,
      withdrawAmount,
      signer2,
      contractBalanceBefore,
      ownerBalanceBefore,
    };
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
  it("should check that the withdrawAll() function successfully return all of the ether held in the smart contract", async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    await faucet.withdrawAll();

    expect(
      await (await ethers.provider.getBalance(owner.address)).toString()
    ).to.equal("9999999226039357158946");
  });
});
