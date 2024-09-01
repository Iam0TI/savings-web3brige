const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("WEB3CXI TOken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner] = await hre.ethers.getSigners();

    const erc20Token = await hre.ethers.getContractFactory("Web3CXI");
    const token = await erc20Token.deploy();

    return { token, owner };
  }

  describe("Deployment", function () {
    it("Should mint the right 100k token ", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      const tokents = ethers.parseUnits("100000", 18);
      expect(await token.totalSupply()).to.equal(tokents);
    });

    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should mint correct token ", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      const tokents = ethers.parseUnits("100000", 18);
      const tokenminted = ethers.parseUnits("100000", 18);
      await token.mint(100000);
      expect(await token.totalSupply()).to.equal(tokents + tokenminted);
    });
  });
});
