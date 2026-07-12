export const CHAIN_ID = 84532 as const

export const TREASURY_ADDRESS = ((import.meta.env.VITE_TREASURY_ADDRESS as string) ||
  '0x5Fca01416F8117f53DDf462Bc03F025983e5D266') as `0x${string}`

export const API_URL = (import.meta.env.VITE_POLYMARKET_API_URL as string) || 'https://api.meycult.com'

export const USDC_ADDRESS = ((import.meta.env.VITE_USDC_ADDRESS as string) ||
  '0x036CbD53842c5426634e7929541eC2318f3dCF7e') as `0x${string}`  // Base Sepolia USDC

export const ERC20_TRANSFER_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const CONTRACTS = {
  [CHAIN_ID]: {
    MEYINF: '0x984cbC98e081f234A2FB250FB090C5690F6A6567',
    MEYFTE: '0x12f73B5878AE512C52f9BE303fd3F9a051F56246',
    QFRAG: '0xA3761E1f50014d5354c2389f3b34B43d776c97A5',
  },
} as const

export function getContract(name: keyof (typeof CONTRACTS)[typeof CHAIN_ID]) {
  return CONTRACTS[CHAIN_ID][name]
}
