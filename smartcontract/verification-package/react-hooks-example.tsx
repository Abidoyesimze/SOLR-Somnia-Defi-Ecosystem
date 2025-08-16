// React hooks example for Somnia DeFi contracts
// Generated on: 2025-08-16T11:39:25.012Z

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from './contract-types';

// Example React hooks for contract interaction
export const useWrappedSomnia = (signer: ethers.Signer) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    if (signer) {
      // Import ABI from WrappedSomnia-verification.json
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.WrappedSomnia,
        [], // Replace with actual ABI
        signer
      );
      setContract(contract);
    }
  }, [signer]);

  const wrap = useCallback(async (amount: string) => {
    if (!contract) return;
    try {
      const tx = await contract.wrap({ value: ethers.utils.parseEther(amount) });
      await tx.wait();
      // Refresh balance
      const newBalance = await contract.balanceOf(await signer.getAddress());
      setBalance(ethers.utils.formatEther(newBalance));
    } catch (error) {
      console.error('Wrap failed:', error);
    }
  }, [contract, signer]);

  const unwrap = useCallback(async (amount: string) => {
    if (!contract) return;
    try {
      const tx = await contract.unwrap(ethers.utils.parseEther(amount));
      await tx.wait();
      // Refresh balance
      const newBalance = await contract.balanceOf(await signer.getAddress());
      setBalance(ethers.utils.formatEther(newBalance));
    } catch (error) {
      console.error('Unwrap failed:', error);
    }
  }, [contract, signer]);

  return { contract, balance, wrap, unwrap };
};

export const useUSDCToken = (signer: ethers.Signer) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.USDCToken,
        [], // Replace with actual ABI
        signer
      );
      setContract(contract);
    }
  }, [signer]);

  const mint = useCallback(async (to: string, amount: string, reason: string) => {
    if (!contract) return;
    try {
      const tx = await contract.mint(
        to,
        ethers.utils.parseUnits(amount, 6), // USDC has 6 decimals
        reason
      );
      await tx.wait();
    } catch (error) {
      console.error('Mint failed:', error);
    }
  }, [contract]);

  return { contract, mint };
};

export const useTestTokenFaucet = (signer: ethers.Signer) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.TestTokenFaucet,
        [], // Replace with actual ABI
        signer
      );
      setContract(contract);
    }
  }, [signer]);

  const claimTokens = useCallback(async () => {
    if (!contract) return;
    try {
      const tx = await contract.claimTokens();
      await tx.wait();
    } catch (error) {
      console.error('Claim failed:', error);
    }
  }, [contract]);

  return { contract, claimTokens };
};

// Example component usage:
/*
import React from 'react';
import { useWrappedSomnia } from './react-hooks-example';

export const WrappedSomniaComponent: React.FC = () => {
  const { signer } = useWallet(); // Your wallet hook
  const { balance, wrap, unwrap } = useWrappedSomnia(signer);

  return (
    <div>
      <h3>Wrapped Somnia</h3>
      <p>Balance: {balance} WSOM</p>
      <button onClick={() => wrap('1')}>Wrap 1 SOM</button>
      <button onClick={() => unwrap('0.5')}>Unwrap 0.5 WSOM</button>
    </div>
  );
};
*/
