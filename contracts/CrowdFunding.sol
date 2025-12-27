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

modifier campaignExists(uint256 _campaignId) {
    require(_campaignId < numberOfCampaigns, "Campaign does not exist");
    _;
}
modifier campaignActive(uint256 _campaignId) {
    require(block.timestamp < campaigns[_campaignId].deadline, "Campaign ended");
    require(!campaigns[_campaignId].isClosed, "Campaign closed");
    _;
}

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



function donateToCampaign(uint256 _campaignId)
    public
    payable
    campaignExists(_campaignId)
    campaignActive(_campaignId)
{
    require(msg.value > 0, "Donation must be greater than 0");

    donations[_campaignId][msg.sender] += msg.value;
    campaigns[_campaignId].amountCollected += msg.value;

    emit DonationReceived(_campaignId, msg.sender, msg.value);
}


function withdrawFunds(uint256 _campaignId)
    public
    campaignExists(_campaignId)
{
    Campaign storage campaign = campaigns[_campaignId];

    require(campaign.creator == msg.sender, "Only creator");
    require(block.timestamp >= campaign.deadline, "Campaign active");
    require(!campaign.isClosed, "Already closed");
    require(campaign.amountCollected >= campaign.targetAmount, "Target not reached");

    uint256 amount = campaign.amountCollected;

    campaign.amountCollected = 0;
    campaign.isClosed = true;

    (bool success, ) = campaign.creator.call{value: amount}("");
    require(success, "Withdraw failed");

    emit FundsWithdrawn(_campaignId, campaign.creator, amount);
}


function refund(uint256 _campaignId)
    public
    campaignExists(_campaignId)
{
    Campaign storage campaign = campaigns[_campaignId];

    require(block.timestamp >= campaign.deadline, "Campaign active");
    require(campaign.amountCollected < campaign.targetAmount, "Target reached");

    uint256 donated = donations[_campaignId][msg.sender];
    require(donated > 0, "Nothing to refund");

    donations[_campaignId][msg.sender] = 0;

    (bool success, ) = payable(msg.sender).call{value: donated}("");
    require(success, "Refund failed");

    emit Refunded(_campaignId, msg.sender, donated);
}

function getCampaign(uint256 _campaignId)
    public
    view
    campaignExists(_campaignId)
    returns (
        address creator,
        string memory title,
        string memory description,
        uint256 targetAmount,
        uint256 deadline,
        uint256 amountCollected,
        bool isClosed
    )
{
    Campaign storage c = campaigns[_campaignId];
    return (
        c.creator,
        c.title,
        c.description,
        c.targetAmount,
        c.deadline,
        c.amountCollected,
        c.isClosed
    );
}

function getAllCampaigns()
    public
    view
    returns (Campaign[] memory)
{
    Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

    for (uint256 i = 0; i < numberOfCampaigns; i++) {
        allCampaigns[i] = campaigns[i];
    }

    return allCampaigns;
}

function getDonation(uint256 _campaignId, address _donor)
    public
    view
    campaignExists(_campaignId)
    returns (uint256)
{
    return donations[_campaignId][_donor];
}

}
