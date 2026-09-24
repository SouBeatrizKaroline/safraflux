import {
  isAddress,
  getAddressDecoder,
  getAddressEncoder,
  getProgramDerivedAddress,
} from "@solana/addresses";
import { getWallets } from "@wallet-standard/app";
import { receiptFromTransaction, TOKEN_PROGRAM } from "./domain.js";

export const CHAINS = {
  "solana-mainnet": {
    name: "Solana",
    family: "solana",
    rpc: "https://api.mainnet-beta.solana.com",
    symbol: "SOL",
    decimals: 9,
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    explorer: "https://explorer.solana.com",
  },
  "solana-devnet": {
    name: "Solana Devnet",
    family: "solana",
    rpc: "https://api.devnet.solana.com",
    symbol: "SOL de teste",
    decimals: 9,
    mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    explorer: "https://explorer.solana.com",
    test: true,
  },
  base: {
    name: "Base",
    family: "evm",
    rpc: "https://mainnet.base.org",
    chainId: "0x2105",
    symbol: "ETH",
    decimals: 18,
    mint: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    explorer: "https://basescan.org",
  },
  ethereum: {
    name: "Ethereum",
    family: "evm",
    rpc: "https://ethereum-rpc.publicnode.com",
    chainId: "0x1",
    symbol: "ETH",
    decimals: 18,
    mint: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    explorer: "https://etherscan.io",
  },
  arbitrum: {
    name: "Arbitrum",
    family: "evm",
    rpc: "https://arb1.arbitrum.io/rpc",
    chainId: "0xa4b1",
    symbol: "ETH",
    decimals: 18,
    mint: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    explorer: "https://arbiscan.io",
  },
};

const GENESIS = {
  "solana-mainnet": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  "solana-devnet": "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG",
};
async function assertSolanaNetwork(endpoint, chain) {
  if ((await rpc(endpoint, "getGenesisHash")) !== GENESIS[chain])
    throw new Error("O RPC respondeu por uma rede Solana diferente.");
}

export function validateAddress(chain, address) {
  if (!CHAINS[chain]) throw new Error("Rede não suportada.");
  const value = address.trim();
  if (CHAINS[chain].family === "solana") {
    if (!isAddress(value)) throw new Error("Endereço Solana inválido.");
    return value;
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(value))
    throw new Error(
      "Endereço EVM inválido: use 0x seguido de 40 caracteres hexadecimais.",
    );
  return value.toLowerCase();
}

export async function rpc(endpoint, method, params = []) {
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(18000),
  });
  if (!r.ok)
    throw new Error(
      `Consulta indisponível (HTTP ${r.status}). Tente outro RPC em Configurações.`,
    );
  const data = await r.json();
  if (data.error)
    throw new Error(
      "O RPC recusou a consulta. Verifique a rede e o limite do provedor.",
    );
  if (!("result" in data)) throw new Error("Resposta incompleta do RPC.");
  return data.result;
}

export async function balances(wallet, endpoints = {}) {
  const chain = CHAINS[wallet.chain],
    endpoint = endpoints[wallet.chain] || chain.rpc;
  const address = validateAddress(wallet.chain, wallet.address);
  if (chain.family === "solana") {
    await assertSolanaNetwork(endpoint, wallet.chain);
    const [native, tokens] = await Promise.all([
      rpc(endpoint, "getBalance", [address, { commitment: "finalized" }]),
      rpc(endpoint, "getTokenAccountsByOwner", [
        address,
        { mint: chain.mint },
        { encoding: "jsonParsed", commitment: "finalized" },
      ]),
    ]);
    if (!Number.isSafeInteger(native.value))
      throw new Error(
        "Saldo nativo excede a precisão suportada pelo RPC JSON.",
      );
    const usdc = tokens.value.reduce(
      (sum, t) => sum + BigInt(t.account.data.parsed.info.tokenAmount.amount),
      0n,
    );
    return {
      native: String(native.value),
      usdc: String(usdc),
      at: new Date().toISOString(),
    };
  }
  const chainId = await rpc(endpoint, "eth_chainId");
  if (chainId.toLowerCase() !== chain.chainId)
    throw new Error("O RPC respondeu por uma rede diferente.");
  const [native, usdc] = await Promise.all([
    rpc(endpoint, "eth_getBalance", [address, "latest"]),
    rpc(endpoint, "eth_call", [
      {
        to: chain.mint,
        data: "0x70a08231" + address.slice(2).padStart(64, "0"),
      },
      "latest",
    ]),
  ]);
  return {
    native: BigInt(native).toString(),
    usdc: BigInt(usdc).toString(),
    at: new Date().toISOString(),
  };
}

export function createReference() {
  return getAddressDecoder().decode(crypto.getRandomValues(new Uint8Array(32)));
}

export async function associatedTokenAddress(owner, mint) {
  const encoder = getAddressEncoder();
  const [ata] = await getProgramDerivedAddress({
    programAddress: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    seeds: [
      encoder.encode(owner),
      encoder.encode(TOKEN_PROGRAM),
      encoder.encode(mint),
    ],
  });
  return ata;
}

export function paymentURI(invoice) {
  const chain = CHAINS[invoice.chain];
  if (!chain || chain.family !== "solana")
    throw new Error("Cobrança disponível apenas na Solana.");
  const q = new URLSearchParams({
    amount: invoice.amount,
    "spl-token": chain.mint,
    reference: invoice.reference,
    label: "SafraFlux",
    message: `Pagamento do lote ${invoice.lot}`,
  });
  return `solana:${invoice.recipient}?${q}`;
}

export async function verifyReceipt(invoice, signature, endpoints = {}) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(signature))
    throw new Error("Assinatura Solana inválida.");
  const chain = CHAINS[invoice.chain];
  const endpoint = endpoints[invoice.chain] || chain.rpc;
  await assertSolanaNetwork(endpoint, invoice.chain);
  const status = await rpc(endpoint, "getSignatureStatuses", [
    [signature],
    { searchTransactionHistory: true },
  ]);
  if (
    status.value[0]?.confirmationStatus !== "finalized" ||
    status.value[0]?.err
  )
    throw new Error(
      "A transação ainda não está finalizada com sucesso nesta rede.",
    );
  const tx = await rpc(endpoint, "getTransaction", [
    signature,
    {
      encoding: "json",
      commitment: "finalized",
      maxSupportedTransactionVersion: 0,
    },
  ]);
  const ata = await associatedTokenAddress(invoice.recipient, chain.mint);
  return receiptFromTransaction(tx, invoice, signature, chain.mint, ata);
}

export function solanaWallets() {
  return getWallets()
    .get()
    .filter(
      (w) =>
        w.features["standard:connect"] &&
        w.chains.some((c) => c.startsWith("solana:")),
    );
}

export async function connectSolana(wallet, chain) {
  const { accounts } = await wallet.features["standard:connect"].connect();
  const network =
    chain === "solana-devnet" ? "solana:devnet" : "solana:mainnet";
  const account = accounts.find((a) => a.chains.includes(network));
  if (!account)
    throw new Error(
      "Esta carteira não disponibilizou uma conta para a rede selecionada.",
    );
  return { address: account.address, name: wallet.name };
}

export const evmProviders = new Map();
if (typeof window !== "undefined") {
  window.addEventListener("eip6963:announceProvider", (event) => {
    const { info, provider } = event.detail || {};
    if (info?.uuid && provider?.request)
      evmProviders.set(info.uuid, { info, provider });
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));
}

export async function connectEVM(provider, chain) {
  const chainId = await provider.request({ method: "eth_chainId" });
  if (chainId.toLowerCase() !== CHAINS[chain].chainId)
    throw new Error(
      `Selecione a rede ${CHAINS[chain].name} na carteira e tente novamente.`,
    );
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts?.length) throw new Error("Nenhuma conta autorizada.");
  return accounts[0];
}

export function explorerTx(chain, signature) {
  return `${CHAINS[chain].explorer}/tx/${encodeURIComponent(signature)}${CHAINS[chain].test ? "?cluster=devnet" : ""}`;
}
