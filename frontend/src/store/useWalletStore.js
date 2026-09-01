import { create } from 'zustand'

export const useWalletStore = create((set) => ({
  wallet: null,
  setWallet: (wallet) => set({ wallet }),
  updateBalance: (newBalance) =>
    set((state) => ({
      wallet: state.wallet ? { ...state.wallet, balance: newBalance } : null,
    })),
}))
