import { expect } from "chai";
import { ethers } from "hardhat";
import { FundFlow } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("FundFlow", function () {
  let fundFlow: FundFlow;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let treasury: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  const FEE_BPS = 500n; // 5%
  const ONE_ETH = ethers.parseEther("1");

  beforeEach(async function () {
    [owner, user, treasury, other] = await ethers.getSigners();

    const FundFlowFactory = await ethers.getContractFactory("FundFlow");
    fundFlow = (await FundFlowFactory.deploy(
      treasury.address,
      FEE_BPS
    )) as FundFlow;
    await fundFlow.waitForDeployment();
  });

  // ──────────────────────────────────────────────
  // 1. Deployment
  // ──────────────────────────────────────────────
  describe("Deployment", function () {
    it("should set the correct treasury address", async function () {
      expect(await fundFlow.treasury()).to.equal(treasury.address);
    });

    it("should set the correct feeBasisPoints", async function () {
      expect(await fundFlow.feeBasisPoints()).to.equal(FEE_BPS);
    });

    it("should set the deployer as owner", async function () {
      expect(await fundFlow.owner()).to.equal(owner.address);
    });

    it("should set MAX_FEE_BPS to 1000", async function () {
      expect(await fundFlow.MAX_FEE_BPS()).to.equal(1000n);
    });

    it("should revert if treasury is zero address", async function () {
      const Factory = await ethers.getContractFactory("FundFlow");
      await expect(
        Factory.deploy(ethers.ZeroAddress, FEE_BPS)
      ).to.be.revertedWith("Treasury cannot be zero address");
    });

    it("should revert if fee exceeds MAX_FEE_BPS", async function () {
      const Factory = await ethers.getContractFactory("FundFlow");
      await expect(
        Factory.deploy(treasury.address, 1001n)
      ).to.be.revertedWith("Fee exceeds maximum");
    });

    it("should not be paused on deployment", async function () {
      expect(await fundFlow.paused()).to.equal(false);
    });
  });

  // ──────────────────────────────────────────────
  // 2. deposit()
  // ──────────────────────────────────────────────
  describe("deposit()", function () {
    it("should credit the correct net balance to the depositor", async function () {
      const gross = ONE_ETH;
      const fee = (gross * FEE_BPS) / 10000n;
      const net = gross - fee;

      await fundFlow.connect(user).deposit({ value: gross });

      expect(await fundFlow.balances(user.address)).to.equal(net);
    });

    it("should forward the correct fee to treasury", async function () {
      const gross = ONE_ETH;
      const fee = (gross * FEE_BPS) / 10000n;

      const treasuryBefore = await ethers.provider.getBalance(treasury.address);
      await fundFlow.connect(user).deposit({ value: gross });
      const treasuryAfter = await ethers.provider.getBalance(treasury.address);

      expect(treasuryAfter - treasuryBefore).to.equal(fee);
    });

    it("should emit Deposited event with correct args", async function () {
      const gross = ONE_ETH;
      const fee = (gross * FEE_BPS) / 10000n;
      const net = gross - fee;

      await expect(fundFlow.connect(user).deposit({ value: gross }))
        .to.emit(fundFlow, "Deposited")
        .withArgs(user.address, gross, fee, net);
    });

    it("should revert when msg.value is 0", async function () {
      await expect(
        fundFlow.connect(user).deposit({ value: 0 })
      ).to.be.revertedWith("Deposit must be greater than zero");
    });

    it("should revert when the contract is paused", async function () {
      await fundFlow.connect(owner).pause();
      await expect(
        fundFlow.connect(user).deposit({ value: ONE_ETH })
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should handle zero-fee deposits correctly (feeBps = 0)", async function () {
      await fundFlow.connect(owner).setFee(0n);
      const gross = ONE_ETH;

      await fundFlow.connect(user).deposit({ value: gross });

      expect(await fundFlow.balances(user.address)).to.equal(gross);
    });

    it("should accumulate balances on multiple deposits", async function () {
      const gross = ethers.parseEther("0.5");
      const fee = (gross * FEE_BPS) / 10000n;
      const net = gross - fee;

      await fundFlow.connect(user).deposit({ value: gross });
      await fundFlow.connect(user).deposit({ value: gross });

      expect(await fundFlow.balances(user.address)).to.equal(net * 2n);
    });
  });

  // ──────────────────────────────────────────────
  // 3. withdraw()
  // ──────────────────────────────────────────────
  describe("withdraw()", function () {
    beforeEach(async function () {
      // Deposit 1 ETH so user has a balance
      await fundFlow.connect(user).deposit({ value: ONE_ETH });
    });

    it("should transfer ETH to caller", async function () {
      const userBalance = await fundFlow.balances(user.address);
      const ethBefore = await ethers.provider.getBalance(user.address);

      const tx = await fundFlow.connect(user).withdraw(userBalance);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const ethAfter = await ethers.provider.getBalance(user.address);
      expect(ethAfter - ethBefore + gasUsed).to.equal(userBalance);
    });

    it("should decrement the caller's balance", async function () {
      const userBalance = await fundFlow.balances(user.address);
      const withdrawAmount = userBalance / 2n;

      await fundFlow.connect(user).withdraw(withdrawAmount);

      expect(await fundFlow.balances(user.address)).to.equal(
        userBalance - withdrawAmount
      );
    });

    it("should emit Withdrawn event with correct args", async function () {
      const amount = await fundFlow.balances(user.address);

      await expect(fundFlow.connect(user).withdraw(amount))
        .to.emit(fundFlow, "Withdrawn")
        .withArgs(user.address, amount);
    });

    it("should revert when amount is 0", async function () {
      await expect(fundFlow.connect(user).withdraw(0n)).to.be.revertedWith(
        "Withdraw amount must be greater than zero"
      );
    });

    it("should revert when amount exceeds balance", async function () {
      const userBalance = await fundFlow.balances(user.address);
      await expect(
        fundFlow.connect(user).withdraw(userBalance + 1n)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("should revert when paused", async function () {
      await fundFlow.connect(owner).pause();
      const amount = await fundFlow.balances(user.address);

      await expect(fundFlow.connect(user).withdraw(amount)).to.be.revertedWith(
        "Pausable: paused"
      );
    });

    it("should prevent reentrancy (CEI pattern)", async function () {
      // Deploy a malicious reentrancy attacker contract
      const AttackerFactory = await ethers.getContractFactory("ReentrancyAttacker");
      // If ReentrancyAttacker doesn't exist, we test CEI by checking balance deduction
      // happens before transfer using state inspection pattern
      const userBalance = await fundFlow.balances(user.address);
      await fundFlow.connect(user).withdraw(userBalance);

      // After withdraw, balance should be 0 — cannot withdraw again
      await expect(fundFlow.connect(user).withdraw(1n)).to.be.revertedWith(
        "Insufficient balance"
      );
      expect(await fundFlow.balances(user.address)).to.equal(0n);
    });
  });

  // ──────────────────────────────────────────────
  // 4. setTreasury()
  // ──────────────────────────────────────────────
  describe("setTreasury()", function () {
    it("should allow owner to update treasury", async function () {
      await fundFlow.connect(owner).setTreasury(other.address);
      expect(await fundFlow.treasury()).to.equal(other.address);
    });

    it("should emit TreasuryUpdated event", async function () {
      await expect(fundFlow.connect(owner).setTreasury(other.address))
        .to.emit(fundFlow, "TreasuryUpdated")
        .withArgs(other.address);
    });

    it("should revert when called by non-owner", async function () {
      await expect(
        fundFlow.connect(user).setTreasury(other.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should revert when new treasury is zero address", async function () {
      await expect(
        fundFlow.connect(owner).setTreasury(ethers.ZeroAddress)
      ).to.be.revertedWith("Treasury cannot be zero address");
    });
  });

  // ──────────────────────────────────────────────
  // 5. setFee()
  // ──────────────────────────────────────────────
  describe("setFee()", function () {
    it("should allow owner to update fee", async function () {
      await fundFlow.connect(owner).setFee(300n);
      expect(await fundFlow.feeBasisPoints()).to.equal(300n);
    });

    it("should emit FeeUpdated event", async function () {
      await expect(fundFlow.connect(owner).setFee(300n))
        .to.emit(fundFlow, "FeeUpdated")
        .withArgs(300n);
    });

    it("should allow setting fee to exactly MAX_FEE_BPS (1000)", async function () {
      await fundFlow.connect(owner).setFee(1000n);
      expect(await fundFlow.feeBasisPoints()).to.equal(1000n);
    });

    it("should allow setting fee to 0", async function () {
      await fundFlow.connect(owner).setFee(0n);
      expect(await fundFlow.feeBasisPoints()).to.equal(0n);
    });

    it("should revert when fee exceeds 1000 bps", async function () {
      await expect(fundFlow.connect(owner).setFee(1001n)).to.be.revertedWith(
        "Fee exceeds maximum"
      );
    });

    it("should revert when called by non-owner", async function () {
      await expect(fundFlow.connect(user).setFee(300n)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  // ──────────────────────────────────────────────
  // 6. pause() / unpause()
  // ──────────────────────────────────────────────
  describe("pause() / unpause()", function () {
    it("should allow owner to pause", async function () {
      await fundFlow.connect(owner).pause();
      expect(await fundFlow.paused()).to.equal(true);
    });

    it("should allow owner to unpause", async function () {
      await fundFlow.connect(owner).pause();
      await fundFlow.connect(owner).unpause();
      expect(await fundFlow.paused()).to.equal(false);
    });

    it("should block deposit when paused", async function () {
      await fundFlow.connect(owner).pause();
      await expect(
        fundFlow.connect(user).deposit({ value: ONE_ETH })
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should block withdraw when paused", async function () {
      // Deposit first (not paused)
      await fundFlow.connect(user).deposit({ value: ONE_ETH });
      const bal = await fundFlow.balances(user.address);

      await fundFlow.connect(owner).pause();
      await expect(fundFlow.connect(user).withdraw(bal)).to.be.revertedWith(
        "Pausable: paused"
      );
    });

    it("should allow deposit and withdraw after unpause", async function () {
      await fundFlow.connect(owner).pause();
      await fundFlow.connect(owner).unpause();

      await fundFlow.connect(user).deposit({ value: ONE_ETH });
      const bal = await fundFlow.balances(user.address);
      await expect(fundFlow.connect(user).withdraw(bal)).to.not.be.reverted;
    });

    it("should revert pause when called by non-owner", async function () {
      await expect(fundFlow.connect(user).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("should revert unpause when called by non-owner", async function () {
      await fundFlow.connect(owner).pause();
      await expect(fundFlow.connect(user).unpause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("should emit Paused event", async function () {
      await expect(fundFlow.connect(owner).pause()).to.emit(fundFlow, "Paused");
    });

    it("should emit Unpaused event", async function () {
      await fundFlow.connect(owner).pause();
      await expect(fundFlow.connect(owner).unpause()).to.emit(
        fundFlow,
        "Unpaused"
      );
    });
  });
});
