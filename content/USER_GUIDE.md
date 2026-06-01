# OnePlant User Guide

This document is the primary English guide for OnePlant users, frontends, community pages, and operational references. If another public explanation conflicts with this guide, this guide should be treated as the source of truth.

OnePlant production description:

```text
A fully on-chain living plant card, grown by Ethereum blocks and sealed into a rare specimen.
```

In plain terms, OnePlant is an ERC20-backed, fully on-chain SVG plant card NFT system. Each plant can grow with Ethereum blocks, change over time, be sealed into a fixed collectible card, move between holders, disappear through backing rules, and later be reborn through the official pool.

## 1. Core Assets

| Asset | Standard | Name | Symbol | Role |
| --- | --- | --- | --- | --- |
| OnePlant | ERC721 | `OnePlant` | `OP` | The plant NFT, visual identity, living card, and collectible specimen |
| uniPlants | ERC20 | `uniPlants` | `UP` | The liquidity token that backs OP |

The core relationship is simple:

```text
1 OP NFT needs at least 10000 UP as backing.
```

OP answers "which plant is this, what does it look like, and what state is it in." UP answers "what liquidity supports this plant."

## 2. OP and UP Backing

Every active OP needs `10000 UP` behind it.

If a wallet holds 3 OP, the wallet needs at least:

```text
3 * 10000 UP = 30000 UP
```

to fully support those plants.

Holding `10000 UP` does not automatically create 1 OP. New OP can only be created by official mint paths. Normal ERC20 transfers, third party pools, self-custodied UP, and repeated small buys that add up to `10000 UP` do not mint OP.

This rule prevents users from repeatedly moving tokens or splitting trades to refresh NFT appearances for free.

## 3. What Is Backing?

`Backing` means that a wallet has enough UP to support the OP NFTs it holds.

| Wallet state | Meaning |
| --- | --- |
| `10000 UP + 1 OP` | Exactly enough backing |
| `28000 UP + 2 OP` | `20000 UP` backs 2 OP, and `8000 UP` is extra |
| `9999 UP + 1 OP` | Under-backed and not allowed to remain after protocol actions |
| `10000 UP + 0 OP` | All UP is loose UP and will not create OP by itself |

If a wallet no longer has enough UP to support its OP, the protocol restores balance during transfers, sells, or burns. Some actions can fail if sealed OP would become under-backed.

## 4. Loose UP

`Loose UP` means UP that is not needed by any OP in the wallet.

```text
loose UP = wallet UP balance - wallet OP count * 10000 UP
```

If the result is positive, the wallet has extra UP that can move freely. If it is zero, all UP is backing OP. If it is negative, the wallet is under-backed and protocol rules must correct the state.

| Wallet state | Loose UP |
| --- | --- |
| `10000 UP + 1 OP` | `0 UP` |
| `28000 UP + 2 OP` | `8000 UP` |
| `55000 UP + 4 OP` | `15000 UP` |
| `10000 UP + 0 OP` | `10000 UP` |

Loose UP is allowed. Even `10000 loose UP` does not mint a new OP by itself.

## 5. Three Types of UP

| Type | Can it be sold or transferred alone? | Meaning |
| --- | --- | --- |
| Loose UP | Yes | Extra UP that is not backing any OP |
| Unsealed backing UP | Yes, but it can move or burn unsealed OP | UP that backs unsealed OP |
| Sealed backing UP | No | UP locked behind sealed OP |

The most important rule:

```text
The 10000 UP behind a sealed OP cannot be sold or transferred alone.
```

To sell the UP behind a sealed OP, the owner must first unseal that OP.

## 6. Active Supply and Token IDs

The maximum active OP supply is:

```text
10000 active OP
```

`Active` means the OP currently exists and has not been burned. Historical token IDs can exceed 10000 because burned token IDs are retired forever and never reused.

Token IDs have three eras:

| Token ID range | Source | Meaning |
| --- | --- | --- |
| `#1 - #5000` | Official Uniswap v4 pool | Pool Genesis Plants |
| `#5001 - #10000` | PlantingSale | Planting distribution plants |
| `#10001+` | Official Uniswap v4 pool | Reborn Plants |

The `#10001+` era is not a third arbitrary mint path. These reborn OP are still created by official Uniswap v4 pool buy swaps after earlier OP have been burned and active capacity becomes available again.

## 7. How New OP Is Created

New OP can only be created by two official paths.

First path:

```text
PlantingSale contract
```

Each successful PlantingSale mint gives the user:

```text
1 OP + 10000 UP
```

Second path:

```text
Official Uniswap v4 pool buy swap
```

When a user buys UP from the official pool, OP minting is based on the net UP received in that single swap after hook-side burn fee. Complete `10000 UP` units can mint OP if release capacity is available.

These actions do not create OP:

- Holding `10000 loose UP`.
- Receiving UP through a normal ERC20 transfer.
- Splitting buys into smaller trades that add up to `10000 UP`.
- Buying UP from a third party pool.
- Sending UP to a skipNFT protocol address.
- Trying to choose visual parameters manually.

## 8. PlantingSale Overview

PlantingSale is the official planting entry point. It distributes:

```text
5000 OP
```

The PlantingSale token ID range is:

```text
#5001 - #10000
```

PlantingSale can only be used after the owner opens planting. Each phase can mint up to `1000 OP`. When one phase sells out, the contract automatically advances to the next active phase. After phase 5 sells out, planting closes.

Each successful mint gives:

```text
1 OP + 10000 UP
```

PlantingSale ETH stays in the contract until the owner withdraws it.

## 9. PlantingSale Phases and Calls

| Phase | Price per OP | Phase supply | User function | Wallet limit |
| --- | --- | --- | --- | --- |
| 1 | `0 ETH` | `1000` | `freePlanting()` | One free OP per wallet |
| 2 | `0.001 ETH` | `1000` | `paidPlanting(plantNumber)` | Up to 3 OP in this phase |
| 3 | `0.003 ETH` | `1000` | `paidPlanting(plantNumber)` | Up to 3 OP in this phase |
| 4 | `0.01 ETH` | `1000` | `paidPlanting(plantNumber)` | Up to 3 OP in this phase |
| 5 | `0.03 ETH` | `1000` | `paidPlanting(plantNumber)` | Up to 3 OP in this phase |

Free phase requirements:

- The caller must be an EOA wallet with no contract code at call time.
- Each wallet can use `freePlanting()` once.
- The wallet must have at least `0.01 ETH`.
- At most 3 free mints are allowed per block.
- Phase 1 supply must still be available.
- Newly born OP starts unsealed.

Paid phase requirements:

- The caller uses `paidPlanting(plantNumber)`.
- `plantNumber` must be `1`, `2`, or `3`.
- Each wallet can mint up to 3 OP per paid phase.
- A wallet can participate in multiple phases if it meets each phase rule.
- Required ETH is `current phase price * plantNumber`.
- Extra ETH is refunded immediately.
- Insufficient ETH reverts the transaction.

Planting calls are intentionally wallet-only. Smart contract wallets, contract callers, and EIP-7702 delegated-code accounts may be rejected by the production PlantingSale checks.

Examples:

| Current phase | Call | ETH to send |
| --- | --- | --- |
| Phase 2 | `paidPlanting(1)` | `0.001 ETH` |
| Phase 3 | `paidPlanting(2)` | `0.006 ETH` |
| Phase 5 | `paidPlanting(3)` | `0.09 ETH` |

## 10. Official Uniswap v4 Pool

The official Uniswap v4 pool is the main post-launch path for new OP.

The official pool works with the OnePlant hook to:

- Support official UP buys and sells.
- Mint OP after qualifying UP buys.
- Maintain OP backing when UP is sold.
- Charge hook fees.
- Burn part of UP.
- Release swap-mint capacity over time.

In Uniswap v4, pool state lives in the shared `PoolManager` rather than in a separate ERC20-like pool contract. The official infrastructure addresses around the pool, such as `PoolManager`, the OnePlant hook, `SwapHelper`, and the configured position manager, are skipNFT addresses. They may hold or move UP as protocol infrastructure, but OP minting and OP transfers to those addresses are blocked.

The production pool also has two on-chain trust checks:

- The OnePlant hook only accepts the exact official `ETH / UP` PoolKey, including the configured fee, tick spacing, and hook address.
- The OnePlant hook only accepts the official `SwapHelper` as the Uniswap v4 callback swap sender.

This means a direct `PoolManager` caller, contract wallet, EIP-7702-authorized account, custom router, or spoofed `hookData` cannot make a non-official v4 path trigger the official-pool OP mint or official-pool sell burn path. The website and scripts use the official `SwapHelper`; any future router support must be explicitly adapted by official contracts.

UP is still a standard ERC20 token. Anyone can transfer UP or create third-party UP pools. Those routes are not official OnePlant swap-mint routes: they do not mint OP, do not use the timed release schedule, and do not receive the official hook behavior. They are normal ERC20 movements, so if UP leaves a user's wallet and that wallet becomes under-backed, the normal backing cleanup rules can still move or burn that user's unsealed OP.

## 11. Buying UP From the Official Pool

When buying UP from the official pool, OP minting only considers the net UP received in that single transaction.

```text
minted OP = floor(net UP received in this swap / 10000 UP)
```

Examples:

| Net UP received in one swap | OP result |
| --- | --- |
| `9999 UP` | Mint 0 OP |
| `10000 UP` | Mint 1 OP |
| `25000 UP` | Mint 2 OP |
| `5000 UP + 5000 UP` in two swaps | Mint 0 OP |

Repeated small buys do not accumulate OP mint eligibility.

The practical amount of OP that can be minted in one swap is not determined by buy size alone. It depends on:

- Net UP output in this swap.
- The currently released and unused swap-mint capacity.
- Safety limits inside the hook contract.

The current hook default for `maxOPMintsPerSwap` is `50 OP / swap`. Before the hook configuration is frozen, owner can only set it within `50 - 100 OP / swap`.
Even if enough timed release capacity is available, one official-pool buy swap cannot mint more than the current `maxOPMintsPerSwap`. If it tries to exceed that limit, the transaction fails with `ONEPLANT_HOOK: MINT_COUNT_TOO_LARGE`.

If a buy tries to consume more released capacity than is available, the transaction fails.

## 12. Timed Swap-Mint Release

The official pool uses a timed release schedule to avoid all swap-mint capacity being consumed immediately when the pool opens.

From the hook start time:

```text
Initial release: 20 * 10000 UP
Additional release: 10 * 10000 UP per minute
```

Examples:

| Time after start | Cumulative release limit |
| --- | --- |
| Start | `200000 UP` |
| 1 minute | `300000 UP` |
| 2 minutes | `400000 UP` |
| 10 minutes | `1200000 UP` |
| 498 minutes | `50000000 UP` |

Buy swaps consume released capacity based on net UP output, not just the number of OP minted.

`5000 OP` corresponds to `5000 * 10000 UP = 50000000 UP`.
Because the hook releases `20 OP` worth of capacity immediately, the remaining `4980 OP` worth of capacity is released at `10 OP` per minute. From the hook start time, it takes about `498` minutes, or **8 hours and 18 minutes**, to reach the UP capacity corresponding to `5000 OP`.

This release capacity is global. It is not assigned per wallet.
All official-pool buy swaps consume the same shared capacity:

```text
available capacity = cumulative released UP - cumulative consumed UP
```

The consumed amount is the net UP output of the buy swap. A buy that receives less than `10000 UP` after fees does not mint OP, but it still consumes the released capacity for the net UP received.

If a buy tries to consume more released capacity than is currently available, the transaction fails with:

```text
ONEPLANT_HOOK: RELEASE_CAP_EXCEEDED
```

The website attempts to display the revert reason returned by the wallet or RPC provider. In most cases, users should see this message. Some wallets or RPC providers may hide nested Uniswap v4 hook revert data and show a more generic transaction failure instead.

The release schedule is not a final supply cap. After the capacity corresponding to `5000 OP` has been released, the release limit keeps increasing by `10 * 10000 UP` per minute. Whether later buys can mint new OP depends on the Core contract's Pool/Reborn/active supply rules: after `#1 - #5000` are used, new `#10001+` Reborn OP require previously burned OP to free active capacity.

## 13. Selling UP to the Official Pool

Selling UP is not simply "burn 1 OP for every 10000 UP sold."

The real rule is whether the wallet still has enough UP after the sell to back the OP that remains.

Sell flow:

1. Calculate the wallet's UP balance after the gross UP sell amount.
2. Check whether the remaining UP can still cover all sealed OP.
3. If sealed OP cannot be covered, the transaction fails.
4. If sealed OP is safe, check whether the remaining UP can support all OP.
5. If backing is short, burn the highest token ID unsealed OP until backing is restored.
6. If only loose UP was sold, no OP is burned.

A wallet with no OP and only loose UP can sell its loose UP. A wallet with sealed OP cannot sell the `10000 UP` backing those sealed OP unless it unseals them first.

## 14. Official Pool Fees

The official pool uses hook fees:

| Fee | Rate | Main collection side | Purpose |
| --- | --- | --- | --- |
| Team and maintenance fee | `0.25%` | Mostly ETH or quote token | Development and operations |
| UP burn fee | `0.25%` | Mostly UP | Burn UP |
| Total hook fee | `0.5%` | Path dependent | Protocol fee |

LP fees are separate and are not included in the `0.5%` hook fee above.

Buy path:

- The user buys UP with ETH.
- The hook collects `0.25%` team fee from ETH input.
- The hook burns `0.25%` from UP output.
- Net UP reaches the user.
- If net UP contains complete `10000 UP` units, OP can be minted.

Sell path:

- The user sells UP.
- The hook checks OP backing using the gross UP sell amount.
- If backing is short, the highest token ID unsealed OP are burned as needed.
- The hook burns `0.25%` UP.
- The hook collects `0.25%` team fee from ETH output.
- Net ETH reaches the user.

UP burn fees reduce UP total supply. Over time, this can reduce the maximum active OP that the available UP supply can support.

### Official LP Position Lock

The official Uniswap v4 liquidity position is represented by a UNI-V4-POSM ERC721 NFT. To increase public trust, the project can transfer that LP NFT into `OnePlantV4LPPositionLocker`.

The locker is deliberately simple:

- It only accepts NFTs from the configured Uniswap v4 PositionManager.
- The initial lock length is fixed when the locker is deployed and is used as the default.
- Owner can also specify a per-position lock duration with `lockWithParams({ tokenId, lockSeconds })`.
- Direct `safeTransferFrom` deposits can pass ABI-encoded `uint256 lockSeconds` in the transfer `data`.
- Owner can extend an active lock with `extendLockSeconds(tokenId, additionalSeconds)`.
- Owner cannot reduce the lock time.
- There is no early withdrawal or emergency unlock function.
- After `unlockTime`, owner can withdraw the LP NFT and then remove liquidity through the PositionManager.

Users can verify the lock directly on-chain by checking the locker address, `positionManager`, `initialLockSeconds`, `lockInfo(tokenId)`, `remainingLockSeconds(tokenId)`, and `lockedTokenIds()`. The real unlock moment is `lockInfo(tokenId).unlockTime`, not a promise written on a website.

## 15. Normal UP Transfers

Normal ERC20 transfers are different from official pool swaps.

Key rule:

```text
Normal UP transfer can move existing unsealed OP or burn existing unsealed OP, but it never mints new OP.
```

If the sender remains fully backed after transferring UP, no OP changes. If the sender becomes under-backed, the protocol tries to handle the highest token ID unsealed OP:

- If the receiver has enough UP to take it, that unsealed OP can move to the receiver.
- If the receiver cannot support it, that unsealed OP can be burned.
- Sealed OP is not passively moved by normal UP transfers.
- Sealed OP is not passively burned by normal UP transfers.
- If only sealed OP remain and backing would be insufficient, the transfer fails.

Receiving `10000 UP` through a normal transfer never mints new OP.

## 16. Direct OP Transfers

Direct ERC721 OP transfer moves the plant itself.

When an owner transfers OP directly:

```text
the OP + 10000 UP move together
```

This is true whether the OP is sealed or unsealed. It prevents OP from becoming an empty NFT without UP backing.

## 17. skipNFT Addresses

Some protocol addresses must not receive or generate OP. These are skipNFT addresses.

Typical skipNFT addresses include:

- Uniswap v4 `PoolManager`.
- The OnePlant official v4 hook.
- The OnePlant `SwapHelper`.
- The configured Uniswap v4 position manager.
- Any future protocol address explicitly configured by the owner.

If the owner later sets `setSkipNFT(target, true)`, the target address must currently hold `0 OP`. Existing OP are not silently removed, burned, or stranded by becoming skipNFT.

OP cannot be directly transferred to a skipNFT address, and new OP cannot be minted to a skipNFT address.

After the official protocol addresses are confirmed, owner can call `freezeSkipNFT()` to freeze the skipNFT list. Once frozen, skipNFT addresses cannot be added, removed, or changed.

## 18. Growth Cycle

Unsealed OnePlant NFTs are living plants. Their visible stage advances with Ethereum blocks.

Production speed:

```text
6 blocks = 1 Growth Progress
```

Stages range from:

```text
Stage 1/1 through Stage 12/100
```

At about 6 blocks per progress point, a full visual lifecycle is roughly one day. The exact wall-clock time depends on Ethereum block timing.

If a plant remains unsealed, it does not stop and it does not automatically become sealed. After one full lifecycle, it moves from `Stage 12/100` back to `Stage 1/1` and begins the next cycle.

The next cycle is a deterministic replay of the same plant's lifecycle, not a new random plant. The OP keeps the same `seedHash`, genus, epithet, mutation, palette, cycle phase, and other visual identity values. The current renderer does not use a separate "cycle number" as an additional randomness input.

That means the same OP at the same sealed state and the same `Stage / Growth Progress` should follow the same visual path across cycles. For example, the first cycle's `Stage 3/56` and the second cycle's `Stage 3/56` are expected to render the same stage form for that OP, not a newly randomized variation.

The loop is therefore not "a different plant every 24 hours." It is the same plant repeatedly growing, maturing, archiving, and returning to origin. Differences mainly come from different OP seed identities, and from different stages within the same OP.

## 19. Sealed and Unsealed

Every newly born OP starts unsealed.

Unsealed OP:

- Continues to grow with blocks.
- Can be affected by UP backing cleanup.
- Can be burned if the owner sells or transfers too much backing UP.
- Does not show the sealed border.

Sealed OP:

- Freezes its current visual state.
- Shows the sealed card border.
- Locks its `10000 UP` backing.
- Cannot be passively burned by UP sells or normal UP transfers.
- Can still be transferred or sold as an ERC721 NFT, with its `10000 UP` backing moving together.

## 20. How to Seal

The current OP owner can call:

```solidity
seal(uint256[] tokenIds)
```

`tokenIds` is the list of OP token IDs to seal. To seal one plant, pass a one-item array such as `seal([123])`. To seal multiple plants, pass a larger array such as `seal([123, 456, 789])`.

Every OP in the list must be owned by the caller and must currently be unsealed. If any token ID is not owned by the caller, or is already sealed, the whole transaction reverts instead of partially sealing the list.

After sealing:

- The plant appearance is frozen at that moment.
- Stage and Growth Progress are fixed at that moment.
- The SVG gains the sealed border.
- The metadata `Sealed` trait becomes `True`.
- The `10000 UP` behind the OP is locked.
- The OP can still be transferred or sold as an NFT.

Seal is useful for two reasons:

1. It preserves the plant's best moment as a fixed collectible card.
2. It protects the OP from passive burn during UP backing cleanup.

You can seal at any point in the lifecycle. There is no requirement to wait until maturity.

## 21. Can You Unseal?

Yes. The current owner can call:

```solidity
unseal(uint256[] tokenIds)
```

`tokenIds` is the list of OP token IDs to unseal. To unseal one plant, pass a one-item array such as `unseal([123])`. To unseal multiple plants, pass a larger array such as `unseal([123, 456, 789])`.

Every OP in the list must be owned by the caller and must currently be sealed. If any token ID is not owned by the caller, or is not sealed, the whole transaction reverts.

After unsealing:

- The sealed border disappears.
- The `Sealed` trait becomes `False`.
- The plant resumes growth from the saved point.
- Blocks that passed while sealed do not make the plant jump forward.

Example:

If OP is sealed at `Stage 1/5` and unsealed after 6000 blocks, it does not suddenly jump far ahead. It continues from around `Stage 1/5`.

## 22. Visual Generation and Randomness

Users cannot manually choose visual parameters in production.

Users cannot choose:

- Genus.
- Epithet.
- Mutation.
- Palette.
- Cycle phase.
- Phenotype.
- Render seed.
- Any other visual parameter.

PlantingSale and official Uniswap v4 swap both call the production Core contract. Core creates a `seedHash`, and visual identity is derived from that `seedHash`.

The production `seedHash` mixes protocol and transaction data such as:

- Core contract address.
- Operator address.
- Recipient address.
- Token ID.
- Historical mint counter.
- Path mint counter.
- Mint index inside the transaction.
- Mint path such as planting, pool swap, or reborn swap.
- Chain ID.
- `block.prevrandao`.
- Previous block hash.

This is same-transaction pseudo-randomness, not VRF. Its goal is to prevent normal external users from directly controlling all plant parameters. It does not claim full resistance against block proposers or stronger adversaries.

## 23. Visual Identity Parameters

From `seedHash`, the contracts derive:

| Parameter | Meaning |
| --- | --- |
| `renderSeed` | Rendering random seed |
| `genusIndex` | Genus index |
| `epithetIndex` | Epithet index |
| `mutationClassId` | Mutation class |
| `paletteId` | Color palette |
| `cyclePhaseId` | Cycle phase |
| `layoutModeId` | Layout mode, production uses standard NFT layout |

The current visual system includes:

- `78` Genus values.
- `101` Epithet values.
- `8` Mutation classes.
- Multiple palettes.
- Multiple cycle phases.
- Stage-driven plant morphology.
- Sealed card border.
- Complete on-chain SVG rendering.

Mutation target distribution:

| Mutation | Probability |
| --- | --- |
| Natural | `30%` |
| Each of the other 7 mutation classes | `10%` each |

Palette tone target distribution:

| Tone | Probability |
| --- | --- |
| Middle tone | `70%` |
| Bright tone | `15%` |
| Dark tone | `15%` |

This keeps most plants in a stable collectible range while preserving rarer bright and dark styles.

## 24. Metadata and SVG

`tokenURI(tokenId)` returns complete NFT metadata in one call.

The metadata includes:

- NFT name.
- Project description.
- Complete SVG image.
- Traits and attributes.
- Stage.
- Sealed state.
- Species.
- Mutation.
- Palette.
- Cycle phase.
- Other visual attributes.

The SVG is generated on-chain and does not depend on an external image server.

Production metadata description:

```text
A fully on-chain living plant card, grown by Ethereum blocks and sealed into a rare specimen.
```

## 25. Reading NFT State and Stage

Recommended read interface:

```solidity
renderContext(tokenId)
```

This returns the main rendering state, including:

| Field | Meaning |
| --- | --- |
| `macroStage` | Current Macro Stage, `1 - 12` |
| `growthProgress` | Current Growth Progress, `1 - 100` |
| `isSealed` | Whether the OP is sealed |
| `visualStateNonce` | Visual state counter after seal or unseal |
| `blocksPerGrowthProgressSnapshot` | Growth speed recorded for this plant |
| `seedHash` and `renderSeed` | Visual generation seeds |
| `identity` | Genus, epithet, mutation, palette, cycle phase, and related visual identity |

Other useful read functions:

```solidity
effectiveGrowth(tokenId)
tokenState(tokenId)
tokensOfOwner(holder)
sealedTokensOfOwner(holder)
unsealedTokensOfOwner(holder)
tokenURI(tokenId)
```

`effectiveGrowth(tokenId)` returns the current `(macroStage, growthProgress)`. `tokenState(tokenId)` returns the raw stored lifecycle state. The holder list functions return all OP held by a wallet, only sealed OP, or only unsealed OP.

## 26. NFT Marketplace Royalty

OP supports the ERC2981 NFT royalty interface.

Default royalty:

```text
1%
```

This is marketplace-readable metadata. It is not a mandatory on-chain sales tax. Whether it is honored depends on the marketplace.

Production royalty can only be lowered, not raised.

## 27. Protocol Configuration and Owner Powers

Production contracts use the name `owner` for privileged configuration.

Owner powers are meant for deployment, configuration, connection fixes, and long-term freezing:

- Open or close PlantingSale.
- Withdraw ETH from PlantingSale.
- Configure Core, Metadata, Renderer, UP Token, Hook, and related connections.
- Configure skipNFT addresses, but only if the target currently holds `0 OP`.
- Configure Uniswap v4 hook release start, team treasury, Core address, official SwapHelper, and `maxOPMintsPerSwap` within the allowed `50 - 100 OP / swap` range before hook configuration is frozen.
- Freeze renderer modules, metadata, hook configuration, UP/Core links, and the skipNFT list where supported.
- Transfer ownership.
- Renounce ownership.
- Lower or disable NFT royalty.

Production Core does not expose local testing functions such as `mintWithIdentity`. Users cannot specify visual parameters in production.

The official Hook's PoolKey parameters, including fee, tick spacing, UP token, and hook address, are immutable in that deployed Hook. Changing the official pool parameters would require deploying a new compatible hook/pool/helper stack, not simply changing an owner setting.

After the system is stable, key configuration can be frozen and ownership can be transferred or renounced according to the final security and governance plan.

## 28. Normal UP Transfer Examples

### Example 1: Small transfer moves an unsealed OP

Initial state:

| User | Balance |
| --- | --- |
| A | `10000 UP + 1 unsealed OP` |
| B | `9999 UP + 0 OP` |

A transfers:

```text
1 UP to B
```

Final state:

| User | Balance |
| --- | --- |
| A | `9999 UP + 0 OP` |
| B | `10000 UP + 1 unsealed OP` |

A no longer has enough backing. B can support one OP, so A's highest token ID unsealed OP moves to B.

### Example 2: Small transfer burns an unsealed OP

Initial state:

| User | Balance |
| --- | --- |
| A | `10000 UP + 1 unsealed OP` |
| B | `0 UP + 0 OP` |

A transfers:

```text
1 UP to B
```

Final state:

| User | Balance |
| --- | --- |
| A | `9999 UP + 0 OP` |
| B | `1 UP + 0 OP` |

B cannot support an OP, so A's unsealed OP is burned.

### Example 3: Receiver reaches 10000 UP but gets no new OP

Initial state:

| User | Balance |
| --- | --- |
| A | `28000 UP + 2 unsealed OP` |
| B | `9000 UP + 0 OP` |

A transfers:

```text
1000 UP to B
```

Final state:

| User | Balance |
| --- | --- |
| A | `27000 UP + 2 unsealed OP` |
| B | `10000 UP + 0 OP` |

B now has `10000 loose UP`, but normal transfer never mints new OP.

### Example 4: Large transfer only carries complete OP units

Initial state:

| User | Balance |
| --- | --- |
| A | `50000 UP + 5 unsealed OP` |
| B | `0 UP + 0 OP` |

A transfers:

```text
25000 UP to B
```

This contains two complete `10000 UP` units plus `5000 UP`. At most 2 unsealed OP can move with the transfer. If A becomes under-backed after that, another unsealed OP can be burned.

## 29. Official Pool Sell Examples

### Example 1: Only loose UP, no OP

A user has:

```text
12000 UP + 0 OP
```

The user can sell `12000 UP`. No OP is burned because the wallet has no OP.

### Example 2: Selling loose UP does not affect OP

A user has:

```text
55000 UP + 1 unsealed OP
```

The first `10000 UP` backs the OP. The remaining `45000 UP` is loose UP.

If the user sells:

```text
43000 UP
```

the wallet still has:

```text
12000 UP + 1 unsealed OP
```

The remaining UP is enough to support 1 OP, so no OP is burned.

### Example 3: Selling too much burns unsealed OP

A user has:

```text
12000 UP + 1 unsealed OP
```

If the user sells:

```text
12000 UP
```

the wallet has no UP left to support the OP. The unsealed OP is burned.

### Example 4: Sealed OP backing cannot be sold

A user has:

```text
55000 UP + 4 unsealed OP + 1 sealed OP
```

The sealed OP must keep:

```text
10000 UP
```

If the user sells:

```text
33000 UP
```

the wallet has `22000 UP` left. `10000 UP` must support the sealed OP, and the remaining `12000 UP` can support only 1 unsealed OP. The system burns 3 highest token ID unsealed OP.

Final state:

```text
22000 UP + 1 unsealed OP + 1 sealed OP
```

### Example 5: Selling more burns all unsealed OP

Initial state:

```text
55000 UP + 4 unsealed OP + 1 sealed OP
```

If the user sells:

```text
43000 UP
```

the wallet has `12000 UP` left. That is enough to support the sealed OP only. All 4 unsealed OP are burned.

Final state:

```text
12000 UP + 1 sealed OP
```

### Example 6: Selling sealed backing fails

Initial state:

```text
55000 UP + 4 unsealed OP + 1 sealed OP
```

If the user tries to sell:

```text
53000 UP
```

the wallet would have only `2000 UP` left, which cannot support the sealed OP. The transaction fails.

## 30. Direct Sealed OP Transfer Example

A has:

```text
10000 UP + 1 sealed OP
```

A transfers the sealed OP directly to B.

Final state:

```text
A: 0 UP + 0 OP
B: 10000 UP + 1 sealed OP
```

The sealed status remains unchanged and `10000 UP` moves with the NFT.

## 31. FAQ

### Does holding 10000 UP automatically create OP?

No. New OP only comes from official PlantingSale or qualifying official Uniswap v4 pool buy swaps.

### Does receiving 10000 UP by transfer create OP?

No. Normal ERC20 transfer can move existing unsealed OP or burn existing unsealed OP, but it never mints new OP.

### Do repeated small official buys add up to mint OP?

No. Official pool minting only considers the net UP received in a single swap.

### Can users choose plant visuals?

No. Production users cannot choose genus, epithet, mutation, palette, cycle phase, or other visual parameters.

### Can sealed OP be burned by selling UP?

No. Sealed OP locks its `10000 UP` backing. If a user tries to sell too much UP and sealed backing would become insufficient, the transaction fails.

### Why seal a plant?

Seal preserves a favorite visual moment and turns the living plant into a fixed on-chain specimen card with a border. It also protects that OP from passive backing cleanup burns.

### Can sealed OP still trade as NFT?

Yes. A sealed OP remains an ERC721 NFT. When transferred directly, its `10000 UP` backing moves with it.

### Does unseal catch up skipped blocks?

No. Unseal resumes from the saved stage and progress. It does not fast-forward through the sealed period.

### Are burned token IDs reused?

No. Burned token IDs are permanently retired. Reborn OP still come from official Uniswap v4 pool buy swaps and use token IDs starting at `#10001`.

### Is UP deflationary?

Yes. The official hook can burn UP fees, reducing total supply over time.

### Is OnePlant pixel art?

No. OnePlant SVG is produced by layered on-chain computation, including background, habitat, morphology, growth stage, mutation, palette, cycle phase, and sealed card frame logic.

### What if an NFT marketplace shows stale art?

Dynamic NFTs can be cached by marketplaces. On-chain `tokenURI(tokenId)` and `renderContext(tokenId)` are the source of truth. Refreshing marketplace metadata should update the display.

## 32. One-Sentence Summary

OnePlant is a fully on-chain plant card ecosystem where `10000 UP` backs each `OP`, OP grows with Ethereum blocks, users can seal their favorite moment into a rare specimen card, official PlantingSale and Uniswap v4 pool rules control new births, and backing plus burn logic lets plants disappear and be reborn.
