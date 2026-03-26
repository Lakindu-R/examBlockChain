// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title FundFlow
 * @notice A decentralized fee-splitting ETH vault. Users deposit ETH; a configurable
 *         fee is forwarded to a treasury address, and the net amount is credited to
 *         the depositor's on-chain balance for later withdrawal.
 * @dev Inherits OpenZeppelin Ownable (v4.x) and Pausable (v4.x).
 *      Follows the Checks-Effects-Interactions (CEI) pattern throughout.
 */
contract FundFlow is Ownable, Pausable {
    // ──────────────────────────────────────────────
    // State Variables
    // ──────────────────────────────────────────────

    /// @notice Address that receives the fee portion of every deposit
    address public treasury;

    /// @notice Fee in basis points (e.g. 500 = 5%). Max is MAX_FEE_BPS.
    uint256 public feeBasisPoints;

    /// @notice Net ETH balances available for withdrawal, keyed by depositor address
    mapping(address => uint256) public balances;

    /// @notice Hard cap on the fee: 1000 bps = 10%
    uint256 public constant MAX_FEE_BPS = 1000;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    /**
     * @notice Emitted on every successful deposit
     * @param user    The depositor's address
     * @param gross   Total ETH sent by the user
     * @param fee     Fee forwarded to treasury
     * @param net     Net ETH credited to user's balance
     */
    event Deposited(
        address indexed user,
        uint256 gross,
        uint256 fee,
        uint256 net
    );

    /**
     * @notice Emitted on every successful withdrawal
     * @param user   The withdrawer's address
     * @param amount ETH sent back to the user
     */
    event Withdrawn(address indexed user, uint256 amount);

    /**
     * @notice Emitted when the treasury address is updated by the owner
     * @param newTreasury The newly configured treasury address
     */
    event TreasuryUpdated(address indexed newTreasury);

    /**
     * @notice Emitted when the fee is updated by the owner
     * @param newFeeBasisPoints The new fee in basis points
     */
    event FeeUpdated(uint256 newFeeBasisPoints);

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    /**
     * @notice Deploys FundFlow with an initial treasury and fee setting
     * @dev Calls Ownable(msg.sender) to set deployer as owner.
     *      Reverts if treasury is the zero address or fee exceeds MAX_FEE_BPS.
     * @param _treasury       Address that will receive deposit fees
     * @param _feeBasisPoints Initial fee in basis points (0–1000)
     */
    constructor(address _treasury, uint256 _feeBasisPoints) {
        require(_treasury != address(0), "Treasury cannot be zero address");
        require(_feeBasisPoints <= MAX_FEE_BPS, "Fee exceeds maximum");
        treasury = _treasury;
        feeBasisPoints = _feeBasisPoints;
    }

    // User Functions

    /**
     * @notice Deposit ETH into the vault. A fee is deducted and forwarded to the
     *         treasury; the net amount is credited to the caller's balance.
     * @dev Reverts when the contract is paused or when msg.value is zero.
     *      Fee forwarding uses a low-level call; reverts on failure.
     */
    function deposit() external payable whenNotPaused {
        require(msg.value > 0, "Deposit must be greater than zero");

        uint256 fee = (msg.value * feeBasisPoints) / 10000;
        uint256 net = msg.value - fee;

        // Credit net amount before any external call (CEI)
        balances[msg.sender] += net;

        // Forward fee to treasury
        if (fee > 0) {
            (bool success, ) = treasury.call{value: fee}("");
            require(success, "Fee transfer to treasury failed");
        }

        emit Deposited(msg.sender, msg.value, fee, net);
    }

    /**
     * @notice Withdraw a specified amount of ETH from the caller's balance.
     * @dev Strictly follows Checks-Effects-Interactions (CEI):
     *      balance is decremented BEFORE the ETH transfer to prevent reentrancy.
     *      Reverts when paused, amount is zero, or amount exceeds caller's balance.
     * @param amount The amount of ETH (in wei) to withdraw
     */
    function withdraw(uint256 amount) external whenNotPaused {
        // Checks
        require(amount > 0, "Withdraw amount must be greater than zero");
        require(amount <= balances[msg.sender], "Insufficient balance");

        // Effects — update state before external call
        balances[msg.sender] -= amount;

        // Interactions
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    // ──────────────────────────────────────────────
    // Owner Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Update the treasury address that receives deposit fees
     * @dev Only callable by the owner. Reverts on zero address.
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Treasury cannot be zero address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    /**
     * @notice Update the fee charged on deposits
     * @dev Only callable by the owner. Reverts if new fee exceeds MAX_FEE_BPS (1000).
     * @param _feeBasisPoints New fee in basis points (0–1000)
     */
    function setFee(uint256 _feeBasisPoints) external onlyOwner {
        require(_feeBasisPoints <= MAX_FEE_BPS, "Fee exceeds maximum");
        feeBasisPoints = _feeBasisPoints;
        emit FeeUpdated(_feeBasisPoints);
    }

    /**
     * @notice Pause all deposits and withdrawals
     * @dev Only callable by the owner. Emits OZ Pausable's Paused event.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Resume all deposits and withdrawals
     * @dev Only callable by the owner. Emits OZ Pausable's Unpaused event.
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
