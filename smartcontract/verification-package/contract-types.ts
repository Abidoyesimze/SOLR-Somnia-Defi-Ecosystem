// Auto-generated TypeScript types for Somnia DeFi contracts
// Generated on: 2025-08-16T11:39:25.012Z

export interface ContractAddresses {
  WrappedSomnia: string; // 0x37FcBDc9Ff829279Ad49dFFdDeDAa7B224B1b0B2
  USDCToken: string; // 0xA20E9Db778125527a53069f502292B2b02e3D7CF
  SomniaLPToken: string; // 0xE018246306b3e3AE88b618aD2c2E0Bc10A86AD65
  TestTokenFaucet: string; // 0x5908225583f89A3060D5f9eecbc0288fcEc2c512
}

export const CONTRACT_ADDRESSES: ContractAddresses = {
  WrappedSomnia: "0x37FcBDc9Ff829279Ad49dFFdDeDAa7B224B1b0B2",
  USDCToken: "0xA20E9Db778125527a53069f502292B2b02e3D7CF",
  SomniaLPToken: "0xE018246306b3e3AE88b618aD2c2E0Bc10A86AD65",
  TestTokenFaucet: "0x5908225583f89A3060D5f9eecbc0288fcEc2c512",
};

export const NETWORK_NAME = "Somnia Testnet";

// Contract names for type safety
export type ContractName = "WrappedSomnia" | "USDCToken" | "SomniaLPToken" | "TestTokenFaucet";

// Example usage:
// import { ethers } from 'ethers';
// import { CONTRACT_ADDRESSES } from './contract-types';
// 
// const provider = new ethers.providers.Web3Provider(window.ethereum);
// const signer = provider.getSigner();
// 
// // Create contract instances
// const wrappedSomnia = new ethers.Contract(
//   CONTRACT_ADDRESSES.WrappedSomnia,
//   WrappedSomniaABI, // Import from individual verification files
//   signer
// );
