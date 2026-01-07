# Crowdfunding DApp (Web3)

A decentralized crowdfunding platform built with Solidity, Hardhat, Next.js, and ethers.js.

## Features
- Create fundraising campaigns
- Donate ETH to campaigns
- Deadline-based fund locking
- Creator-only withdrawal if target is reached
- Refunds if target is not met
- Fully decentralized & trustless

## Tech Stack
- **Solidity** (^0.8.x)
- **Hardhat** - Development environment & testing
- **ethers.js** (v6) - Ethereum library
- **Next.js** (App Router) - Frontend framework
- **MetaMask** - Wallet integration
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Project Architecture

### High-level Flow
```
User (Browser)
   ↓
Next.js Frontend (ethers.js)
   ↓
MetaMask (Signer)
   ↓
CrowdFunding Smart Contract
   ↓
Ethereum (Hardhat / Testnet)
```

### Responsibilities
- **Frontend**: UI, validation, wallet UX
- **MetaMask**: Signing + user consent
- **Smart Contract**: Funds, rules, trust
- **Blockchain**: Source of truth

This separation is clean and interview-grade.

## Smart Contract Design

- Funds are locked until campaign deadline
- Withdrawal allowed only if target is reached
- Refunds enabled if target is not met
- Reentrancy-safe logic
- Events emitted for indexing

### Key Functions
- `createCampaign()` - Create a new fundraising campaign
- `donateToCampaign()` - Donate ETH to a campaign
- `withdrawFunds()` - Creator withdraws funds if target reached
- `refund()` - Donors get refund if target not met
- `getCampaign()` - Get campaign details
- `getAllCampaigns()` - Get all campaigns

## Security Considerations

- State updates before external calls (Checks-Effects-Interactions pattern)
- Access control on withdrawals (only creator can withdraw)
- Built-in overflow checks (Solidity 0.8.x)
- Pull-based refund pattern
- Campaign existence and active state modifiers
- Deadline validation

## Running Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MetaMask browser extension

### 1. Install Dependencies
```bash
npm install
cd frontend-app && npm install
```

### 2. Start Hardhat Node
```bash
npx hardhat node
```

This starts a local Ethereum node on `http://localhost:8545` with 20 test accounts pre-funded with ETH.

### 3. Deploy Contract
In a new terminal:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address and update it in `frontend-app/config.js`.

### 4. Configure MetaMask
- **Network Name**: Hardhat Local
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `31337`
- **Currency Symbol**: ETH

### 5. Import Test Account
Import one of the Hardhat test accounts into MetaMask:
- **Account #0**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Account #1**: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

### 6. Start Frontend
```bash
cd frontend-app
npm run dev
```

Open `http://localhost:3000` in your browser.

## Testing

Run the test suite:
```bash
npx hardhat test
```

Test coverage includes:
- Campaign creation
- Donations
- Withdrawals
- Refunds
- Edge cases and error handling

## Project Structure

```
crowdfunding-dapp/
├── contracts/
│   └── CrowdFunding.sol      # Main smart contract
├── scripts/
│   └── deploy.js              # Deployment script
├── test/
│   ├── campaign-create-test.js
│   ├── campaign-donate-test.js
│   ├── campaign-withdraw-refund-test.js
│   ├── campaign-getters-test.js
│   └── campaign-edgecases-test.js
├── frontend-app/
│   ├── app/
│   │   ├── page.tsx          # Main UI component
│   │   └── layout.tsx        # App layout
│   ├── abi/
│   │   └── CrowdFunding.json # Contract ABI
│   └── config.js             # Contract address & config
├── hardhat.config.js          # Hardhat configuration
└── README.md                  # This file
```

## Future Improvements

- **Testnet deployment** (Sepolia/Goerli)
- **The Graph indexing** for efficient campaign queries
- **Better UI** with enhanced Tailwind components
- **Campaign images & categories** (IPFS integration)
- **DAO / multisig withdrawals** for added security
- **Campaign search and filtering**
- **Donor leaderboards**
- **Email notifications** for campaign updates
- **Gas optimization** improvements

## Interview Narrative

**"Tell me about your project"**

> "I built a decentralized crowdfunding DApp where users can create campaigns, donate ETH, and withdraw funds only if the target is reached after a deadline.
>
> The smart contract enforces trust: funds are locked, creators can't rug-pull, and donors can refund if goals aren't met.
>
> I wrote comprehensive unit tests, handled MetaMask UX, and focused on security like reentrancy protection and access control."

### Scaling Answers

**"How would you scale this?"**

- Use **The Graph** to index campaigns and events for efficient queries
- Cache reads with read-only provider to reduce RPC calls
- Add **IPFS** for campaign metadata (images, descriptions)
- Implement **DAO / multisig** for withdrawals on high-value campaigns
- Add rate limiting on frontend to prevent spam
- Use **Layer 2 solutions** (Polygon, Arbitrum) for lower gas costs
- Implement **batching** for multiple donations

## Author

Built by Shubham

## License

MIT
