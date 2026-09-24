# SafraFlux — project brief

SafraFlux connects agricultural lots to stablecoin receipts and producer allocation statements. Its initial customer hypothesis is the finance team of a coffee cooperative or small exporter whose buyer already has a reason to pay in stablecoins.

A lot may combine several producers' output. Receiving funds does not identify the commercial obligation or explain each producer's share. SafraFlux links a lot to a unique payment reference, checks incoming USDC and calculates separate base-price and quality-premium allocations.

## Implemented prototype

- Multiple public addresses and optional wallet discovery through Solana Wallet Standard/EIP-6963.
- Live native-token/USDC balances on Solana, Base, Ethereum and Arbitrum, plus Solana Devnet.
- Solana Pay requests/QR codes with explicit network labels.
- User-supplied signature verification: finalization, reference in the SPL instruction, recipient ATA, mint and exact credited amount.
- Partial/excess receipts, local duplicate prevention and integer-based allocation.
- CSV statements and JSON export.

The app does not custody funds, send transfers, execute payouts or issue an agricultural token. Records are browser-local. Concurrent organizational use, durable audit trails and authenticated users require a backend not implemented yet.

## Differentiation hypothesis

Agriculture plus blockchain is not new. AgriDex addresses agricultural trade; Request Finance offers broad crypto finance workflows. SafraFlux tests a narrower workflow: lot-level reconciliation and a producer-level breakdown of base proceeds and quality premium.

Blockchain verification does not prove commodity quality, delivery, certification or a buyer's legal identity. These remain external evidence. No token is required to demonstrate the workflow.

## Evidence and limits

The repository includes primary-source research, three product options, competitors and ten officially awarded hackathon references. Tests cover arithmetic and negative verification cases. Read-only RPC checks succeeded during development.

No customers, interviews, partnerships, revenue or commercial pilots are confirmed. No end-to-end payment with a user's wallet has been validated. Fixtures and optional allocation examples are synthetic and labeled.

## Discovery and business

Subscription pricing per organization is a hypothesis. Planned discovery includes 14 interviews with finance teams, producers, buyers, accountants and payment/legal specialists. Initial success requires documented pain, historical samples and two scoped pilot commitments. Market-size/revenue scenarios are not forecasts.

## Hackathon fit and provenance

Solana is the proposed primary ecosystem. Secondary networks support balance reads only. Original work started on September 23, 2026. Dependencies are identified in package.json/package-lock.json; the public history records the work.

Repository: https://github.com/SouBeatrizKaroline/safraflux

This is a preparation brief, not a submitted application or confirmation of eligibility. Recheck the official form and rules before submission.
