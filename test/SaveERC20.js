const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe(" SaveERC20 ", function () {
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
  async function delpoySavERC20Fixture() {
    const { token } = await loadFixture(deployTokenFixture);

    const [owner, other] = await hre.ethers.getSigners();

    const saveERC20 = await hre.ethers.getContractFactory("SaveERC20");
    const saveERC20Address = await saveERC20.deploy(token);

    return { token, owner, other, saveERC20Address };
  }

  describe(" Web3CXI Deployment", function () {
    it("Should mint the right 100k token ", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      const tokents = ethers.parseUnits("100000", 18);
      await expect(await token.totalSupply()).to.equal(tokents);
    });

    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      await expect(await token.owner()).to.equal(owner.address);
    });

    it("Should mint correct token ", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      const tokents = ethers.parseUnits("100000", 18);
      const tokenminted = ethers.parseUnits("100000", 18);
      await token.mint(100000);
      await expect(await token.totalSupply()).to.equal(tokents + tokenminted);
    });
  });

  describe(" SaveERC20 Deployment", function () {
    it("Should set the right token address ", async function () {
      const { token, owner, saveERC20Address } = await loadFixture(
        delpoySavERC20Fixture
      );

      await expect(await saveERC20Address.tokenAddress()).to.equal(token);
    });

    it("Should set the right owner", async function () {
      const { owner, saveERC20Address } = await loadFixture(
        delpoySavERC20Fixture
      );

      await expect(await saveERC20Address.owner()).to.equal(owner.address);
    });
  });

  describe(" Deposit", function () {
    it("Should should revert on zero amount", async function () {
      const { token, owner, saveERC20Address } = await loadFixture(
        delpoySavERC20Fixture
      );
      const zero = ethers.parseUnits("0", 18);

      await expect(
        saveERC20Address.deposit(zero)
      ).to.be.revertedWithCustomError(saveERC20Address, "ZeroValueNotAllowed");
    });

    it("Should deposit successfully", async function () {
      const { token, owner, saveERC20Address } = await loadFixture(
        delpoySavERC20Fixture
      );

      const balanceOf = await token.balanceOf(owner);
      // approve amount amount
      const approvedAmount = ethers.parseUnits("10000", 18);
      // approve the token for contract to spend
      await token.approve(saveERC20Address, approvedAmount);
      const depositAmount = ethers.parseUnits("1000", 18);
      await saveERC20Address.deposit(depositAmount);
      expect(await token.balanceOf(owner)).to.equal(balanceOf - depositAmount);
      await expect(await saveERC20Address.myBalance()).to.equal(depositAmount);
      await expect(await saveERC20Address.getContractBalance()).to.equal(
        depositAmount
      );
    });
    it("Should emit depositsuccessful", async function () {
      const { token, owner, saveERC20Address } = await loadFixture(
        delpoySavERC20Fixture
      );

      const balanceOf = await token.balanceOf(owner);
      // approve amount amount
      const approvedAmount = ethers.parseUnits("10000", 18);
      // approve the token for contract to spend
      await token.approve(saveERC20Address, approvedAmount);
      const depositAmount = ethers.parseUnits("1000", 18);
      await saveERC20Address.deposit(depositAmount);
      expect(await token.balanceOf(owner)).to.equal(balanceOf - depositAmount);
      await expect(await saveERC20Address.myBalance()).to.equal(depositAmount);
      await expect(await saveERC20Address.getContractBalance()).to.equal(
        depositAmount
      );
      await expect(saveERC20Address.deposit(depositAmount))
        .to.emit(saveERC20Address, "DepositSuccessful")
        .withArgs(owner, depositAmount);
    });
  });
});
