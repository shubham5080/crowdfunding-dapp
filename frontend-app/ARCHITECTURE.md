# Frontend Architecture

## Overview
Production-grade Web3 frontend with clean separation of concerns, type safety, and reusable components.

## Project Structure

```
frontend-app/
├── app/
│   ├── page.tsx          # Main page (orchestrates components)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── WalletButton.tsx      # Wallet connection UI
│   ├── NetworkWarning.tsx    # Network mismatch warning
│   ├── CreateCampaignModal.tsx # Campaign creation modal
│   ├── CampaignCard.tsx       # Campaign display & actions
│   └── index.ts              # Component exports
├── hooks/
│   ├── useWallet.ts      # Wallet state & connection logic
│   └── useCampaigns.ts   # Campaign CRUD operations
├── utils/
│   ├── contract.ts       # Contract instance helpers
│   ├── format.ts         # Data formatting utilities
│   └── network.ts        # Network validation
├── types/
│   └── index.ts          # TypeScript type definitions
└── config.js             # Contract address & ABI

```

## Architecture Principles

### 1. Separation of Concerns
- **Hooks**: Business logic & state management
- **Components**: UI rendering & user interactions
- **Utils**: Pure functions (formatting, validation)
- **Types**: Type safety across the app

### 2. Data Flow
```
User Action → Component → Hook → Contract → Blockchain
                ↓
            State Update → Re-render
```

### 3. Key Patterns

**Wallet Management (`useWallet`)**
- Auto-detects connection status
- Listens for network/account changes
- Provides clean API for components

**Campaign Management (`useCampaigns`)**
- Centralized campaign state
- Handles all contract interactions
- Automatic error handling
- Loading states

**Component Composition**
- Small, focused components
- Props-based communication
- Reusable across app

## Component Details

### WalletButton
- Shows connect/disconnect state
- Displays shortened address
- Shows current network
- Handles MetaMask connection flow

### CampaignCard
- Displays all campaign info
- Progress bar visualization
- Conditional action buttons:
  - Donate (if active & not expired)
  - Withdraw (creator, expired, target reached)
  - Refund (donor, expired, target not reached)
- Prevents invalid actions

### CreateCampaignModal
- Modal-based UX (not inline)
- Form validation
- ETH amount validation
- Deadline validation
- Error handling

### NetworkWarning
- Shows when on wrong network
- Non-blocking (doesn't prevent viewing)
- Clear call-to-action

## Security & UX Features

1. **Transaction Safety**
   - Disabled buttons during transactions
   - Loading states prevent double-clicks
   - Clear error messages
   - MetaMask rejection handling

2. **Data Validation**
   - ETH amount validation
   - Deadline validation
   - Network validation
   - Address validation

3. **Error Handling**
   - Try-catch blocks everywhere
   - User-friendly error messages
   - Console logging for debugging
   - Graceful degradation

4. **State Management**
   - Loading states for all async operations
   - Error states per operation
   - Optimistic updates where safe

## Type Safety

All data structures are typed:
- `Campaign` - Raw contract data
- `CampaignWithId` - Campaign with index
- `CampaignStatus` - Status enum
- Function parameters & returns

## Environment Configuration

- `.env.local` - Contract address per environment
- Supports both Hardhat (localhost) and Sepolia
- Automatic fallback to localhost

## Responsive Design

- Mobile-first approach
- Grid layout adapts to screen size
- Touch-friendly buttons
- Readable on all devices

## Performance

- Lazy loading where appropriate
- Efficient re-renders
- Minimal re-fetches
- Optimized contract calls

## Future Enhancements

- Add React Query for caching
- Implement optimistic updates
- Add transaction history
- Campaign filtering & search
- Pagination for large lists
- Skeleton loaders
