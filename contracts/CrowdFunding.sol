// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CrowdFunding {

    struct Campaign {
        address payable creator;
        string title;
        string description;
        uint256 targetAmount;
        uint256 deadline;
        uint256 amountCollected;
        bool isClosed;
    }

    uint256 public numberOfCampaigns = 0;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donations;

    event CampaignCreated(uint256 indexed id, address creator);
    event DonationReceived(uint256 indexed id, address donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address creator, uint256 amount);
    event Refunded(uint256 indexed id, address donor, uint256 amount);


function createCampaign(
    string memory _title,
    string memory _description,
    uint256 _targetAmount,
    uint256 _deadline
) public returns (uint256) {

    require(_targetAmount > 0, "Target must be greater than 0");
    require(_deadline > block.timestamp, "Deadline must be in the future");
    require(bytes(_title).length > 0, "Title cannot be empty");

    Campaign storage newCampaign = campaigns[numberOfCampaigns];

    newCampaign.creator = payable(msg.sender);
    newCampaign.title = _title;
    newCampaign.description = _description;
    newCampaign.targetAmount = _targetAmount;
    newCampaign.deadline = _deadline;
    newCampaign.amountCollected = 0;
    newCampaign.isClosed = false;

    emit CampaignCreated(numberOfCampaigns, msg.sender);

    numberOfCampaigns++;

    return numberOfCampaigns - 1;
}
}
