import { ethers } from "./vendor/ethers.min.js";

const NATIVE = "0x0000000000000000000000000000000000000000";
const MAX_UINT128 = (1n << 128n) - 1n;
const BPS_DENOMINATOR = 10000n;
const CUSTOM_RPC_STORAGE_PREFIX = "oneplant.customRpcUrl.";
const AVATAR_CANVAS_SIZE = 1024;
const AVATAR_MIN_ZOOM = 0.45;
const AVATAR_MIN_ZOOM_INPUT = "45";
const AVATAR_DEFAULT_ZOOM = 0.8;
const AVATAR_DEFAULT_ZOOM_INPUT = "80";
const AVATAR_DEFAULT_PAN_Y = 15;
const AVATAR_DEFAULT_PAN_Y_INPUT = "15";
const AVATAR_MAX_ZOOM = 1.8;
const AVATAR_PRESETS = {
  core: { sourceRatio: 0.74, centerX: 0.5, centerY: 0.54 },
  card: { sourceRatio: 0.96, centerX: 0.5, centerY: 0.5 },
  specimen: { sourceRatio: 0.9, centerX: 0.5, centerY: 0.51 }
};
const REVERT_ERROR_IFACE = new ethers.Interface([
  "error Error(string)",
  "error Panic(uint256)",
  "error WrappedError(address target,bytes4 selector,bytes reason,bytes details)",
  "error HookCallFailed()"
]);

const CORE_ABI = [
  "function tokensOfOwner(address holder) view returns (uint256[])",
  "function sealedTokensOfOwner(address holder) view returns (uint256[])",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function seal(uint256[] tokenIds)",
  "function unseal(uint256[] tokenIds)",
  "function balanceOf(address tokenOwner) view returns (uint256)"
];

const UP_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)"
];

const PLANTING_SALE_ABI = [
  "function plantingOpen() view returns (bool)",
  "function activePhase() view returns (uint8)",
  "function totalPlantingMinted() view returns (uint256)",
  "function phases(uint8 phaseId) view returns (uint96 priceWei,uint16 cap,uint16 minted)",
  "function phaseRemaining(uint8 phaseId) view returns (uint256)",
  "function freeClaimed(address account) view returns (bool)",
  "function paidMintedByPhase(uint8 phaseId,address account) view returns (uint8)",
  "function freePlanting() payable returns (uint256)",
  "function paidPlanting(uint256 plantNumber) payable returns (uint256[])"
];

const HOOK_ABI = [
  "function quoteNativeTeamFee(uint256 grossNative) pure returns (uint256 teamFeeNative,uint256 netNativeForSwap)",
  "function quoteUPBurnFee(uint256 grossUP) pure returns (uint256 burnFeeUP,uint256 netUP)"
];

const SWAP_HELPER_ABI = [
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              { "internalType": "address", "name": "currency0", "type": "address" },
              { "internalType": "address", "name": "currency1", "type": "address" },
              { "internalType": "uint24", "name": "fee", "type": "uint24" },
              { "internalType": "int24", "name": "tickSpacing", "type": "int24" },
              { "internalType": "address", "name": "hooks", "type": "address" }
            ],
            "internalType": "struct IOnePlantV4PoolManagerSwapLike.PoolKey",
            "name": "poolKey",
            "type": "tuple"
          },
          { "internalType": "bool", "name": "zeroForOne", "type": "bool" },
          { "internalType": "uint128", "name": "amountIn", "type": "uint128" },
          { "internalType": "uint128", "name": "amountOutMinimum", "type": "uint128" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "bytes", "name": "hookData", "type": "bytes" }
        ],
        "internalType": "struct OnePlantV4SwapHelper.ExactInputSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "swapExactInputSingle",
    "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  }
];

const els = {
  tabButtons: Array.from(document.querySelectorAll(".tab-button")),
  homePanel: document.getElementById("homePanel"),
  operationsPanel: document.getElementById("operationsPanel"),
  avatarPanel: document.getElementById("avatarPanel"),
  plantingPanel: document.getElementById("plantingPanel"),
  aboutPanel: document.getElementById("aboutPanel"),
  configPanel: document.getElementById("configPanel"),
  aboutContent: document.getElementById("aboutContent"),
  aboutStatus: document.getElementById("aboutStatus"),
  externalLinkTabButton: document.getElementById("externalLinkTabButton"),
  networkSelect: document.getElementById("networkSelect"),
  switchNetworkButton: document.getElementById("switchNetworkButton"),
  connectButton: document.getElementById("connectButton"),
  refreshButton: document.getElementById("refreshButton"),
  walletMetric: document.getElementById("walletMetric"),
  ethMetric: document.getElementById("ethMetric"),
  upMetric: document.getElementById("upMetric"),
  opMetric: document.getElementById("opMetric"),
  notice: document.getElementById("notice"),
  avatarNotice: document.getElementById("avatarNotice"),
  avatarRefreshButton: document.getElementById("avatarRefreshButton"),
  avatarSubhead: document.getElementById("avatarSubhead"),
  avatarTokenList: document.getElementById("avatarTokenList"),
  avatarSelectedLabel: document.getElementById("avatarSelectedLabel"),
  avatarStatus: document.getElementById("avatarStatus"),
  avatarPreviewShell: document.getElementById("avatarPreviewShell"),
  avatarCanvas: document.getElementById("avatarCanvas"),
  avatarPlaceholder: document.getElementById("avatarPlaceholder"),
  avatarZoomInput: document.getElementById("avatarZoomInput"),
  avatarPanXInput: document.getElementById("avatarPanXInput"),
  avatarPanYInput: document.getElementById("avatarPanYInput"),
  avatarGuideInput: document.getElementById("avatarGuideInput"),
  avatarResetButton: document.getElementById("avatarResetButton"),
  avatarDownloadButton: document.getElementById("avatarDownloadButton"),
  plantingNotice: document.getElementById("plantingNotice"),
  plantingRefreshButton: document.getElementById("plantingRefreshButton"),
  plantingStatusMetric: document.getElementById("plantingStatusMetric"),
  plantingPhaseMetric: document.getElementById("plantingPhaseMetric"),
  plantingPriceMetric: document.getElementById("plantingPriceMetric"),
  plantingRemainingMetric: document.getElementById("plantingRemainingMetric"),
  plantingWalletMetric: document.getElementById("plantingWalletMetric"),
  freePlantingStatus: document.getElementById("freePlantingStatus"),
  paidPlantingStatus: document.getElementById("paidPlantingStatus"),
  freePlantButton: document.getElementById("freePlantButton"),
  plantingNumberInput: document.getElementById("plantingNumberInput"),
  plantingTotalCost: document.getElementById("plantingTotalCost"),
  paidPlantButton: document.getElementById("paidPlantButton"),
  nftSubhead: document.getElementById("nftSubhead"),
  nftGrid: document.getElementById("nftGrid"),
  toggleNftImagesButton: document.getElementById("toggleNftImagesButton"),
  selectVisibleButton: document.getElementById("selectVisibleButton"),
  clearSelectionButton: document.getElementById("clearSelectionButton"),
  selectedTokenLabel: document.getElementById("selectedTokenLabel"),
  selectedTokenBox: document.getElementById("selectedTokenBox"),
  batchSealButton: document.getElementById("batchSealButton"),
  batchUnsealButton: document.getElementById("batchUnsealButton"),
  routeLabel: document.getElementById("routeLabel"),
  amountInLabel: document.getElementById("amountInLabel"),
  amountInInput: document.getElementById("amountInInput"),
  slippageInput: document.getElementById("slippageInput"),
  amountOutMinLabel: document.getElementById("amountOutMinLabel"),
  amountOutMinInput: document.getElementById("amountOutMinInput"),
  quoteStatus: document.getElementById("quoteStatus"),
  swapButton: document.getElementById("swapButton"),
  coreLink: document.getElementById("coreLink"),
  upLink: document.getElementById("upLink"),
  plantingLink: document.getElementById("plantingLink"),
  helperLink: document.getElementById("helperLink"),
  hookLink: document.getElementById("hookLink"),
  lpLockLink: document.getElementById("lpLockLink"),
  configStatus: document.getElementById("configStatus"),
  rpcNetworkMetric: document.getElementById("rpcNetworkMetric"),
  rpcSourceMetric: document.getElementById("rpcSourceMetric"),
  rpcActiveMetric: document.getElementById("rpcActiveMetric"),
  customRpcInput: document.getElementById("customRpcInput"),
  saveRpcButton: document.getElementById("saveRpcButton"),
  testRpcButton: document.getElementById("testRpcButton"),
  clearRpcButton: document.getElementById("clearRpcButton"),
  rpcStatus: document.getElementById("rpcStatus")
};

const state = {
  config: null,
  selectedNetworkKey: "",
  provider: null,
  readProvider: null,
  signer: null,
  account: "",
  chainId: null,
  contracts: {},
  tokens: [],
  selectedTokenIds: new Set(),
  nftImagesPaused: false,
  nftImageLoadId: 0,
  filter: "all",
  swapSide: "buy",
  manualMinOut: false,
  quoteTimer: 0,
  quoteRequestId: 0,
  quotedAmountIn: null,
  quotedAmountOut: null,
  quotedMinOut: null,
  quotedSide: "",
  quotedSlippageBps: 0,
  planting: null,
  avatar: {
    selectedTokenId: "",
    mode: "core",
    zoom: AVATAR_DEFAULT_ZOOM,
    offsetX: 0,
    offsetY: AVATAR_DEFAULT_PAN_Y,
    requestId: 0,
    loading: false,
    metadata: null,
    imageSource: "",
    imageElement: null,
    drag: null
  },
  activeTab: "home",
  guideLoaded: false,
  busy: false,
  walletEventsBound: false
};

main().catch((error) => {
  console.error(error);
  showNotice(errorMessage(error), "error");
});

async function main() {
  state.config = await loadConfig();
  populateNetworks();
  bindUI();
  selectInitialNetwork();
  applyConfiguredLabels();
  applyNetworkUI();
  const requestedTab = new URLSearchParams(window.location.search).get("tab");
  renderEmptyWallet();
  switchTab(isKnownTab(requestedTab) ? requestedTab : "home");
  showNotice("Connect an EVM wallet to load your OP cards.", "info");
}

async function loadConfig() {
  const response = await fetch("./config/oneplant.config.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Config load failed: ${response.status}`);
  return response.json();
}

function bindUI() {
  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.tab === "nftMarket") {
        openConfiguredExternalUrl("nftMarketUrl", "NFT Market", "https://opensea.io/");
        return;
      }
      if (button.dataset.tab === "externalLink") {
        openConfiguredExternalUrl("externalTabUrl", "External link", "https://xxx");
        return;
      }
      switchTab(button.dataset.tab);
    });
  });
  document.querySelectorAll("[data-home-tab]").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.homeTab));
  });

  els.networkSelect.addEventListener("change", async () => {
    state.selectedNetworkKey = els.networkSelect.value;
    state.selectedTokenIds.clear();
    state.manualMinOut = false;
    clearQuoteSnapshot();
    initContracts();
    applyNetworkUI();
    updateUrlNetwork();
    if (state.account) {
      await switchToSelectedNetwork();
      await refreshAll();
      scheduleSwapQuote();
    }
  });

  els.connectButton.addEventListener("click", connectWallet);
  els.switchNetworkButton.addEventListener("click", async () => {
    try {
      setBusy(true, "Switching network...");
      await switchToSelectedNetwork();
      if (state.account) await refreshAll();
      state.manualMinOut = false;
      scheduleSwapQuote();
    } catch (error) {
      showNotice(errorMessage(error), "error");
    } finally {
      setBusy(false);
      applyNetworkUI();
    }
  });
  els.refreshButton.addEventListener("click", refreshAll);
  els.plantingRefreshButton.addEventListener("click", refreshPlanting);
  els.freePlantButton.addEventListener("click", executeFreePlanting);
  els.paidPlantButton.addEventListener("click", executePaidPlanting);
  els.plantingNumberInput.addEventListener("input", updatePlantingControls);
  els.saveRpcButton.addEventListener("click", saveCustomRpc);
  els.testRpcButton.addEventListener("click", testCurrentRpc);
  els.clearRpcButton.addEventListener("click", clearCustomRpc);
  els.toggleNftImagesButton.addEventListener("click", toggleNFTImages);
  els.avatarRefreshButton.addEventListener("click", refreshAvatarInventory);
  els.avatarResetButton.addEventListener("click", resetAvatarCut);
  els.avatarDownloadButton.addEventListener("click", downloadAvatarPNG);
  els.avatarGuideInput.addEventListener("change", updateAvatarGuide);
  els.avatarZoomInput.addEventListener("input", updateAvatarFromControls);
  els.avatarPanXInput.addEventListener("input", updateAvatarFromControls);
  els.avatarPanYInput.addEventListener("input", updateAvatarFromControls);
  els.selectVisibleButton.addEventListener("click", selectVisibleTokens);
  els.clearSelectionButton.addEventListener("click", clearSelection);
  els.batchSealButton.addEventListener("click", () => batchSealOrUnseal("seal"));
  els.batchUnsealButton.addEventListener("click", () => batchSealOrUnseal("unseal"));
  els.swapButton.addEventListener("click", executeSwap);
  els.amountInInput.addEventListener("input", () => {
    state.manualMinOut = false;
    clearQuoteSnapshot();
    scheduleSwapQuote();
  });
  els.slippageInput.addEventListener("input", () => {
    state.manualMinOut = false;
    clearQuoteSnapshot();
    scheduleSwapQuote();
  });
  els.amountOutMinInput.addEventListener("input", () => {
    state.manualMinOut = true;
    clearQuoteSnapshot();
  });

  document.querySelectorAll(".chip").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll(".chip").forEach((item) => item.classList.toggle("active", item === button));
      renderNFTGrid();
    });
  });

  document.querySelectorAll(".swap-panel .segmented button").forEach((button) => {
    button.addEventListener("click", () => {
      state.swapSide = button.dataset.side;
      document.querySelectorAll(".swap-panel .segmented button").forEach((item) => item.classList.toggle("active", item === button));
      state.manualMinOut = false;
      clearQuoteSnapshot();
      applySwapLabels();
      scheduleSwapQuote();
    });
  });

  document.querySelectorAll("[data-avatar-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.avatar.mode = button.dataset.avatarMode || "core";
      document.querySelectorAll("[data-avatar-mode]").forEach((item) => item.classList.toggle("active", item === button));
      drawAvatarCanvas();
    });
  });

  els.nftGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".nft-card");
    if (!card) return;
    toggleTokenSelection(card.dataset.tokenId);
  });
  els.nftGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".nft-card");
    if (!card) return;
    event.preventDefault();
    toggleTokenSelection(card.dataset.tokenId);
  });
  els.avatarTokenList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-avatar-token-id]");
    if (!button) return;
    selectAvatarToken(button.dataset.avatarTokenId);
  });
  els.avatarPreviewShell.addEventListener("pointerdown", startAvatarDrag);
  els.avatarPreviewShell.addEventListener("pointermove", moveAvatarDrag);
  els.avatarPreviewShell.addEventListener("pointerup", endAvatarDrag);
  els.avatarPreviewShell.addEventListener("pointercancel", endAvatarDrag);
}

async function switchTab(tab) {
  state.activeTab = isKnownTab(tab) ? tab : "home";
  const panels = {
    home: els.homePanel,
    operations: els.operationsPanel,
    avatar: els.avatarPanel,
    about: els.aboutPanel,
    config: els.configPanel
  };
  for (const [key, panel] of Object.entries(panels)) {
    const active = key === state.activeTab;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  }
  els.tabButtons.forEach((button) => {
    const active = button.dataset.tab === state.activeTab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  const url = new URL(window.location.href);
  if (state.activeTab !== "home") url.searchParams.set("tab", state.activeTab);
  else url.searchParams.delete("tab");
  window.history.replaceState({}, "", url);
  if (state.activeTab === "about") await loadAboutGuide();
  if (state.activeTab === "config") renderRpcConfig();
  if (state.activeTab === "avatar") await renderAvatarWorkspace();
}

function isKnownTab(tab) {
  return tab === "home" || tab === "operations" || tab === "avatar" || tab === "about" || tab === "config";
}

function openConfiguredExternalUrl(configKey, label, fallbackUrl) {
  const network = selectedNetwork();
  const configuredUrl = network?.[configKey] || state.config.ui?.[configKey] || fallbackUrl;
  try {
    const url = new URL(configuredUrl, window.location.href);
    window.open(url.href, "_blank", "noopener,noreferrer");
  } catch (_) {
    showNotice(`${label} URL is not configured correctly.`, "error");
  }
}

function applyConfiguredLabels() {
  if (els.externalLinkTabButton) {
    const network = selectedNetwork();
    els.externalLinkTabButton.textContent = network?.externalTabLabel || state.config.ui?.externalTabLabel || "External";
  }
}

function customRpcStorageKey(network) {
  return `${CUSTOM_RPC_STORAGE_PREFIX}${network?.key || ""}`;
}

function getCustomRpcUrl(network) {
  if (!network?.key) return "";
  try {
    return localStorage.getItem(customRpcStorageKey(network)) || "";
  } catch (_) {
    return "";
  }
}

function setCustomRpcUrl(network, rpcUrl) {
  if (!network?.key) return;
  try {
    if (rpcUrl) localStorage.setItem(customRpcStorageKey(network), rpcUrl);
    else localStorage.removeItem(customRpcStorageKey(network));
  } catch (_) {
    throw new Error("Browser storage is unavailable for custom RPC settings.");
  }
}

function rpcUrlsForNetwork(network) {
  const custom = getCustomRpcUrl(network);
  if (custom) return [custom];
  return (network?.rpcUrls || []).filter(Boolean);
}

function normalizeRpcInput(value) {
  const raw = String(value || "").trim();
  if (!raw) throw new Error("RPC URL is required.");
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("RPC URL must start with http:// or https://.");
  return url.href;
}

function buildReadProvider(network, urls = rpcUrlsForNetwork(network)) {
  const chainId = Number(network?.chainId || 0);
  if (!chainId) throw new Error("Selected network has no chain ID.");
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  if (!uniqueUrls.length) {
    if (state.provider) return state.provider;
    throw new Error("No read RPC configured.");
  }
  const providers = uniqueUrls.map((url) => new ethers.JsonRpcProvider(url, chainId));
  if (providers.length === 1 || !ethers.FallbackProvider) return providers[0];
  return new ethers.FallbackProvider(
    providers.map((provider, index) => ({ provider, priority: index + 1, weight: 1, stallTimeout: 1200 })),
    chainId,
    { quorum: 1 }
  );
}

async function validateRpcProvider(network, urls) {
  const provider = buildReadProvider(network, urls);
  const [providerNetwork, blockNumber] = await Promise.all([provider.getNetwork(), provider.getBlockNumber()]);
  if (Number(providerNetwork.chainId) !== Number(network.chainId)) {
    throw new Error(`RPC chain ID ${providerNetwork.chainId.toString()} does not match ${network.label} (${network.chainId}).`);
  }
  return { provider, blockNumber };
}

function renderRpcConfig() {
  const network = selectedNetwork();
  const custom = getCustomRpcUrl(network);
  const siteUrls = network?.rpcUrls || [];
  const activeUrls = rpcUrlsForNetwork(network);
  els.rpcNetworkMetric.textContent = network?.label || "-";
  els.rpcSourceMetric.textContent = custom ? "Custom" : "Website config";
  els.rpcActiveMetric.textContent = custom || `${activeUrls.length} website RPC${activeUrls.length === 1 ? "" : "s"}`;
  els.rpcActiveMetric.title = custom || siteUrls.join("\n");
  if (document.activeElement !== els.customRpcInput) els.customRpcInput.value = custom;
  els.rpcStatus.textContent = custom
    ? "Custom RPC is active for this network's website read calls."
    : "Using the website RPC list. Multiple configured URLs are used as a fallback set.";
}

async function saveCustomRpc() {
  const network = selectedNetwork();
  try {
    if (!network) throw new Error("Select a network first.");
    const rpcUrl = normalizeRpcInput(els.customRpcInput.value);
    els.rpcStatus.textContent = "Testing custom RPC...";
    const { blockNumber } = await validateRpcProvider(network, [rpcUrl]);
    setCustomRpcUrl(network, rpcUrl);
    initContracts();
    renderRpcConfig();
    els.rpcStatus.textContent = `Custom RPC saved. Latest block: ${blockNumber}.`;
    showNotice(`${network.label} custom RPC saved.`, "success");
    if (state.account) {
      await refreshAll();
      scheduleSwapQuote();
    }
  } catch (error) {
    els.rpcStatus.textContent = errorMessage(error);
    showNotice(errorMessage(error), "error");
  }
}

async function testCurrentRpc() {
  const network = selectedNetwork();
  try {
    if (!network) throw new Error("Select a network first.");
    const rawInput = els.customRpcInput.value.trim();
    const urls = rawInput ? [normalizeRpcInput(rawInput)] : rpcUrlsForNetwork(network);
    els.rpcStatus.textContent = "Testing RPC...";
    const { blockNumber } = await validateRpcProvider(network, urls);
    els.rpcStatus.textContent = `RPC test passed. Latest block: ${blockNumber}.`;
  } catch (error) {
    els.rpcStatus.textContent = errorMessage(error);
  }
}

async function clearCustomRpc() {
  const network = selectedNetwork();
  try {
    if (!network) throw new Error("Select a network first.");
    setCustomRpcUrl(network, "");
    initContracts();
    renderRpcConfig();
    showNotice(`${network.label} custom RPC cleared. Website RPC fallback restored.`, "success");
    if (state.account) {
      await refreshAll();
      scheduleSwapQuote();
    }
  } catch (error) {
    els.rpcStatus.textContent = errorMessage(error);
  }
}

async function loadAboutGuide() {
  if (state.guideLoaded) return;
  const configuredPath = state.config.ui?.aboutMarkdownPath || "./content/USER_GUIDE.md";
  const paths = [...new Set([configuredPath, "./content/USER_GUIDE.md", "./USER_GUIDE.md"])];
  els.aboutStatus.hidden = false;
  els.aboutStatus.textContent = "Loading guide...";
  let lastError = null;
  for (const path of paths) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) continue;
      const markdown = await response.text();
      els.aboutContent.innerHTML = renderMarkdown(markdown);
      els.aboutStatus.hidden = true;
      state.guideLoaded = true;
      return;
    } catch (error) {
      lastError = error;
    }
  }
  els.aboutStatus.textContent = `Guide could not be loaded${lastError ? `: ${errorMessage(lastError)}` : "."}`;
}

function renderMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listType = "";
  let inCode = false;
  let code = [];

  const closeParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = "";
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
        inCode = false;
      } else {
        closeParagraph();
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(raw);
      continue;
    }
    if (!line) {
      closeParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      closeParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    if (isTableRow(line) && isTableDivider(lines[i + 1]?.trim() || "")) {
      closeParagraph();
      closeList();
      const headers = splitTableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && isTableRow(lines[i].trim())) {
        rows.push(splitTableRow(lines[i].trim()));
        i++;
      }
      i--;
      html.push(renderTable(headers, rows));
      continue;
    }

    const unordered = line.match(/^-\s+(.*)$/);
    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (unordered || ordered) {
      closeParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        html.push(`<${nextType}>`);
        listType = nextType;
      }
      html.push(`<li>${inlineMarkdown((unordered || ordered)[1])}</li>`);
      continue;
    }

    paragraph.push(line);
  }

  if (inCode) html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  closeParagraph();
  closeList();
  return html.join("");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function isTableRow(line) {
  return line.startsWith("|") && line.endsWith("|");
}

function isTableDivider(line) {
  return /^\|[\s:-]+\|/.test(line) && line.replace(/[|\s:-]/g, "") === "";
}

function splitTableRow(line) {
  return line.slice(1, -1).split("|").map((cell) => cell.trim());
}

function renderTable(headers, rows) {
  const head = headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("");
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("");
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function populateNetworks() {
  els.networkSelect.replaceChildren();
  for (const network of visibleNetworks()) {
    const option = document.createElement("option");
    option.value = network.key;
    option.textContent = `${network.label}${isNetworkConfigured(network) ? "" : " (not configured)"}`;
    els.networkSelect.appendChild(option);
  }
}

function selectInitialNetwork() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("network");
  const networks = visibleNetworks();
  const keys = new Set(networks.map((network) => network.key));
  state.selectedNetworkKey = keys.has(requested) ? requested : state.config.defaultNetwork;
  if (!keys.has(state.selectedNetworkKey)) state.selectedNetworkKey = networks[0]?.key || "";
  els.networkSelect.value = state.selectedNetworkKey;
}

function selectedNetwork() {
  return (state.config.networks || []).find((network) => network.key === state.selectedNetworkKey);
}

function visibleNetworks() {
  const networks = state.config.networks || [];
  const visible = [];
  const add = (network) => {
    if (network && !visible.some((item) => item.key === network.key)) visible.push(network);
  };
  const mainnet = networks.find((network) => network.key === "mainnet" || Number(network.chainId) === 1);
  add(mainnet || networks.find((network) => network.key === state.config.defaultNetwork));
  for (const network of networks) {
    const isMainnet = network.key === "mainnet" || Number(network.chainId) === 1;
    if (!isMainnet && isNetworkConfigured(network)) add(network);
  }
  return visible.length ? visible : networks;
}

function isNetworkConfigured(network) {
  if (!network || network.enabled === false) return false;
  const contracts = network.contracts || {};
  const poolKey = network.poolKey || {};
  return [contracts.core, contracts.upToken, contracts.swapHelper, contracts.hook, poolKey.currency0, poolKey.currency1, poolKey.hooks]
    .every((address) => sameAddress(address, NATIVE) || ethers.isAddress(address || ""));
}

function isPlantingConfigured(network) {
  return isNetworkConfigured(network) && ethers.isAddress(network?.contracts?.plantingSale || "");
}

function applyNetworkUI() {
  const network = selectedNetwork();
  const configured = isNetworkConfigured(network);
  const label = network?.label || "Unknown";
  els.configStatus.textContent = configured ? `${label} config loaded` : `${label} is not configured`;
  els.connectButton.disabled = !configured || state.busy;
  els.switchNetworkButton.disabled = !configured || !state.account || state.busy;
  els.refreshButton.disabled = !configured || !state.account || state.busy;
  els.plantingRefreshButton.disabled = !isPlantingConfigured(network) || state.busy;
  els.swapButton.disabled = !configured || !state.account || state.busy;
  updateWalletConnectionUI();
  applyConfiguredLabels();
  updateContractLinks();
  updateNFTImageToggle();
  applySwapLabels();
  updateSelectedTokenBox();
  updateAvatarControls();
  if (state.activeTab === "config") renderRpcConfig();
  if (!configured) {
    showNotice(`${label} has no complete contract configuration yet. Fill site/config/oneplant.config.json before using this network.`, "error");
  }
}

function updateUrlNetwork() {
  const url = new URL(window.location.href);
  url.searchParams.set("network", state.selectedNetworkKey);
  window.history.replaceState({}, "", url);
}

async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error("No injected EVM wallet found.");
    const network = selectedNetwork();
    if (!isNetworkConfigured(network)) throw new Error(`${network?.label || "Selected network"} is not configured.`);
    setBusy(true, "Connecting wallet...");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    state.account = accounts?.[0] || "";
    if (!state.account) throw new Error("No wallet account was returned.");
    updateWalletConnectionUI();
    showNotice(`Wallet connected: ${shortAddress(state.account)}. Checking network...`, "success");
    state.provider = new ethers.BrowserProvider(window.ethereum);
    bindWalletEvents();
    await switchToSelectedNetwork();
    state.signer = await state.provider.getSigner();
    state.account = await state.signer.getAddress();
    initContracts();
    updateWalletConnectionUI();
    showNotice(`Wallet connected: ${shortAddress(state.account)}. Loading balances and OP cards...`, "success");
    await refreshAll({ busyMessage: "", successMessage: "Wallet data loaded." });
    scheduleSwapQuote();
  } catch (error) {
    showNotice(errorMessage(error), "error");
  } finally {
    setBusy(false);
    applyNetworkUI();
  }
}

function bindWalletEvents() {
  if (state.walletEventsBound || !window.ethereum?.on) return;
  state.walletEventsBound = true;
  window.ethereum.on("accountsChanged", async (accounts) => {
    try {
      state.account = accounts?.[0] || "";
      if (!state.account) {
        state.signer = null;
        state.contracts = {};
        renderEmptyWallet();
        updateWalletConnectionUI();
        applyNetworkUI();
        showNotice("Wallet disconnected.", "info");
        return;
      }
      state.provider = new ethers.BrowserProvider(window.ethereum);
      state.signer = await state.provider.getSigner();
      state.account = await state.signer.getAddress();
      initContracts();
      updateWalletConnectionUI();
      showNotice(`Wallet changed to ${shortAddress(state.account)}. Loading wallet data...`, "info");
      await refreshAll({ busyMessage: "", successMessage: "Wallet data loaded." });
      scheduleSwapQuote();
    } catch (error) {
      showNotice(errorMessage(error), "error");
    }
  });
  window.ethereum.on("chainChanged", async () => {
    try {
      if (!state.provider) return;
      showNotice("Network changed. Refreshing wallet data...", "info");
      state.provider = new ethers.BrowserProvider(window.ethereum);
      if (state.account) state.signer = await state.provider.getSigner();
      initContracts();
      await refreshAll({ busyMessage: "", successMessage: "Wallet data loaded." });
      scheduleSwapQuote();
    } catch (error) {
      showNotice(errorMessage(error), "error");
    }
  });
}

async function switchToSelectedNetwork() {
  if (!window.ethereum) throw new Error("No injected EVM wallet found.");
  const network = selectedNetwork();
  if (!isNetworkConfigured(network)) throw new Error(`${network?.label || "Selected network"} is not configured.`);
  const chainIdHex = ethers.toQuantity(BigInt(network.chainId));
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
  } catch (error) {
    if (error?.code !== 4902) throw error;
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: chainIdHex,
        chainName: network.label,
        nativeCurrency: network.nativeCurrency,
        rpcUrls: rpcUrlsForNetwork(network),
        blockExplorerUrls: network.blockExplorerUrls || []
      }]
    });
  }
  state.provider = new ethers.BrowserProvider(window.ethereum);
  const current = await state.provider.getNetwork();
  state.chainId = Number(current.chainId);
  if (state.account) state.signer = await state.provider.getSigner();
  initContracts();
}

function initContracts() {
  const network = selectedNetwork();
  if (!isNetworkConfigured(network)) return;
  const { core, upToken, plantingSale, swapHelper, hook } = network.contracts;
  const readProvider = buildReadProvider(network);
  state.readProvider = readProvider;
  state.contracts.coreRead = new ethers.Contract(core, CORE_ABI, readProvider);
  state.contracts.upRead = new ethers.Contract(upToken, UP_ABI, readProvider);
  state.contracts.hookRead = new ethers.Contract(hook, HOOK_ABI, readProvider);
  state.contracts.swapRead = new ethers.Contract(swapHelper, SWAP_HELPER_ABI, readProvider);
  if (ethers.isAddress(plantingSale || "")) {
    state.contracts.plantingRead = new ethers.Contract(plantingSale, PLANTING_SALE_ABI, readProvider);
  } else {
    delete state.contracts.plantingRead;
  }
  if (state.signer) {
    state.contracts.coreWrite = new ethers.Contract(core, CORE_ABI, state.signer);
    state.contracts.upWrite = new ethers.Contract(upToken, UP_ABI, state.signer);
    state.contracts.swapWrite = new ethers.Contract(swapHelper, SWAP_HELPER_ABI, state.signer);
    if (ethers.isAddress(plantingSale || "")) {
      state.contracts.plantingWrite = new ethers.Contract(plantingSale, PLANTING_SALE_ABI, state.signer);
    } else {
      delete state.contracts.plantingWrite;
    }
  }
}

async function refreshAll(options = {}) {
  if (!state.account) {
    renderEmptyWallet();
    return;
  }
  const busyMessage = options.busyMessage ?? "Refreshing...";
  const successMessage = options.successMessage ?? "Wallet state refreshed.";
  const network = selectedNetwork();
  if (!isNetworkConfigured(network)) return;
  try {
    setBusy(true, busyMessage);
    await ensureWalletOnSelectedNetwork();
    initContracts();
    await refreshBalances();
    await refreshNFTs();
    if (successMessage) showNotice(successMessage, "success");
  } catch (error) {
    showNotice(errorMessage(error), "error");
  } finally {
    setBusy(false);
    applyNetworkUI();
  }
}

async function ensureWalletOnSelectedNetwork() {
  if (!state.provider) state.provider = new ethers.BrowserProvider(window.ethereum);
  const current = await state.provider.getNetwork();
  state.chainId = Number(current.chainId);
  const network = selectedNetwork();
  if (state.chainId !== Number(network.chainId)) {
    throw new Error(`Wallet is on chain ${state.chainId}. Switch to ${network.label}.`);
  }
}

async function refreshBalances() {
  const readProvider = state.readProvider || state.provider;
  const [ethBalance, upBalance, tokenIds] = await Promise.all([
    readProvider.getBalance(state.account),
    state.contracts.upRead.balanceOf(state.account),
    state.contracts.coreRead.tokensOfOwner(state.account)
  ]);
  els.walletMetric.textContent = shortAddress(state.account);
  els.ethMetric.textContent = `${trimNumber(ethers.formatEther(ethBalance), 5)} ETH`;
  els.upMetric.textContent = `${trimNumber(ethers.formatUnits(upBalance, 18), 4)} UP`;
  els.opMetric.textContent = `${tokenIds.length}`;
}

async function refreshPlanting() {
  const network = selectedNetwork();
  if (!isPlantingConfigured(network)) {
    state.planting = null;
    renderPlantingUnavailable(`${network?.label || "Selected network"} has no PlantingSale configured.`);
    return;
  }
  try {
    let sale;
    if (state.account) {
      await ensureWalletOnSelectedNetwork();
      initContracts();
      sale = state.contracts.plantingRead;
    } else {
      const readProvider = buildReadProvider(network);
      sale = new ethers.Contract(network.contracts.plantingSale, PLANTING_SALE_ABI, readProvider);
    }
    if (!sale) throw new Error("PlantingSale contract is not available.");
    const [open, phaseIdRaw, totalMinted] = await Promise.all([
      sale.plantingOpen(),
      sale.activePhase(),
      sale.totalPlantingMinted()
    ]);
    const phaseId = Number(phaseIdRaw);
    const [phase, remainingRaw, freeClaimed, paidMintedRaw] = await Promise.all([
      sale.phases(phaseId),
      sale.phaseRemaining(phaseId),
      state.account ? sale.freeClaimed(state.account) : false,
      state.account && phaseId >= 2 ? sale.paidMintedByPhase(phaseId, state.account) : 0
    ]);
    const priceWei = BigInt(phase.priceWei ?? phase[0]);
    const cap = Number(phase.cap ?? phase[1]);
    const minted = Number(phase.minted ?? phase[2]);
    const remaining = BigInt(remainingRaw);
    const paidMinted = Number(paidMintedRaw);
    const paidAvailable = phaseId >= 2 ? Math.max(0, Math.min(3 - paidMinted, Number(remaining))) : 0;
    state.planting = { open, phaseId, priceWei, cap, minted, remaining, totalMinted: BigInt(totalMinted), freeClaimed, paidMinted, paidAvailable };
    renderPlantingState();
  } catch (error) {
    state.planting = null;
    renderPlantingUnavailable(`Planting status unavailable: ${errorMessage(error)}`);
  }
}

function renderPlantingUnavailable(message) {
  els.plantingStatusMetric.textContent = "-";
  els.plantingPhaseMetric.textContent = "-";
  els.plantingPriceMetric.textContent = "-";
  els.plantingRemainingMetric.textContent = "-";
  els.plantingWalletMetric.textContent = "-";
  els.freePlantingStatus.textContent = message;
  els.paidPlantingStatus.textContent = message;
  els.plantingTotalCost.textContent = "-";
  els.freePlantButton.disabled = true;
  els.paidPlantButton.disabled = true;
  els.plantingNumberInput.disabled = true;
}

function renderPlantingState() {
  const p = state.planting;
  if (!p) return;
  els.plantingStatusMetric.textContent = p.open ? "Open" : "Closed";
  els.plantingPhaseMetric.textContent = `Phase ${p.phaseId}`;
  els.plantingPriceMetric.textContent = p.priceWei === 0n ? "Free" : `${trimNumber(ethers.formatEther(p.priceWei), 5)} ETH`;
  els.plantingRemainingMetric.textContent = `${p.remaining.toString()} / ${p.cap}`;
  els.plantingWalletMetric.textContent = !state.account ? "Connect wallet" : p.phaseId === 1
    ? (p.freeClaimed ? "Claimed" : "1 available")
    : `${p.paidAvailable} available`;
  updatePlantingControls();
}

function updatePlantingControls() {
  const p = state.planting;
  if (!p) {
    renderPlantingUnavailable("Refresh planting status.");
    return;
  }
  const soldOut = p.remaining === 0n;
  const canFree = Boolean(state.account && p.open && p.phaseId === 1 && !p.freeClaimed && !soldOut && !state.busy);
  els.freePlantingStatus.textContent = !state.account
    ? "Connect wallet to check eligibility."
    : p.phaseId === 1
    ? (p.freeClaimed ? "Free planting already claimed by this wallet." : "Phase 1 is free for eligible wallets.")
    : "Free planting is only available in Phase 1.";
  els.freePlantButton.disabled = !canFree;

  const maxPaid = p.phaseId >= 2 && p.open ? p.paidAvailable : 0;
  const plantNumber = parsePlantNumberInput();
  const validPaidNumber = plantNumber >= 1 && plantNumber <= maxPaid;
  const totalCost = p.priceWei * BigInt(Math.max(plantNumber, 0));
  els.plantingNumberInput.disabled = state.busy || maxPaid === 0;
  els.plantingNumberInput.max = String(Math.max(maxPaid, 1));
  els.plantingTotalCost.textContent = p.phaseId >= 2 ? `${trimNumber(ethers.formatEther(totalCost), 5)} ETH` : "-";
  els.paidPlantingStatus.textContent = !state.account
    ? "Connect wallet to check your phase limit."
    : p.phaseId >= 2
    ? `You have minted ${p.paidMinted} of 3 in Phase ${p.phaseId}.`
    : "Paid planting starts in Phase 2.";
  els.paidPlantButton.disabled = state.busy || !state.account || !p.open || p.phaseId < 2 || maxPaid === 0 || !validPaidNumber;
}

async function executeFreePlanting() {
  try {
    const network = selectedNetwork();
    if (!isPlantingConfigured(network)) throw new Error("PlantingSale is not configured.");
    if (!state.account) throw new Error("Connect wallet first.");
    setBusy(true, "Sending free planting transaction...");
    await ensureWalletOnSelectedNetwork();
    initContracts();
    const tx = await state.contracts.plantingWrite.freePlanting();
    showPlantingNotice(`Free planting sent: ${txLink(tx.hash)}`, "info");
    await tx.wait();
    showPlantingNotice("Free planting complete.", "success");
    await delay(Number(state.config.ui?.pollAfterTxMs || 2500));
    await refreshAll();
  } catch (error) {
    showPlantingNotice(errorMessage(error), "error");
  } finally {
    setBusy(false);
    applyNetworkUI();
  }
}

async function executePaidPlanting() {
  try {
    const network = selectedNetwork();
    if (!isPlantingConfigured(network)) throw new Error("PlantingSale is not configured.");
    if (!state.account) throw new Error("Connect wallet first.");
    const p = state.planting;
    if (!p || p.phaseId < 2) throw new Error("No active paid planting phase.");
    const plantNumber = parsePlantNumberInput();
    if (plantNumber < 1 || plantNumber > p.paidAvailable) throw new Error("plant number exceeds your current phase limit.");
    const cost = p.priceWei * BigInt(plantNumber);
    setBusy(true, "Sending paid planting transaction...");
    await ensureWalletOnSelectedNetwork();
    initContracts();
    const tx = await state.contracts.plantingWrite.paidPlanting(plantNumber, { value: cost });
    showPlantingNotice(`Paid planting sent: ${txLink(tx.hash)}`, "info");
    await tx.wait();
    showPlantingNotice("Paid planting complete.", "success");
    await delay(Number(state.config.ui?.pollAfterTxMs || 2500));
    await refreshAll();
  } catch (error) {
    showPlantingNotice(errorMessage(error), "error");
  } finally {
    setBusy(false);
    applyNetworkUI();
  }
}

function parsePlantNumberInput() {
  const raw = String(els.plantingNumberInput.value || "").trim();
  if (!/^\d+$/.test(raw)) return 0;
  return Number(raw);
}

async function refreshNFTs() {
  await refreshTokenInventory();
  if (!state.nftImagesPaused) startNFTImageLoad();
}

async function refreshTokenInventory() {
  state.nftImageLoadId += 1;
  const [ids, sealedIds] = await Promise.all([
    state.contracts.coreRead.tokensOfOwner(state.account),
    state.contracts.coreRead.sealedTokensOfOwner(state.account)
  ]);
  const sealedSet = new Set(sealedIds.map((id) => id.toString()));
  const previous = new Map(state.tokens.map((item) => [item.tokenId, item]));
  state.tokens = ids.map((id) => {
    const tokenId = id.toString();
    const existing = previous.get(tokenId);
    const base = {
      tokenId,
      isSealed: sealedSet.has(tokenId),
      imageLoading: false,
      error: ""
    };
    if (state.nftImagesPaused && existing) {
      return { ...base, image: existing.image, metadata: existing.metadata };
    }
    return base;
  });
  const currentIds = new Set(ids.map((id) => id.toString()));
  state.selectedTokenIds = new Set([...state.selectedTokenIds].filter((tokenId) => currentIds.has(tokenId)));
  if (state.avatar.selectedTokenId && !currentIds.has(state.avatar.selectedTokenId)) clearAvatarSelection();
  renderNFTGrid();
  updateSelectedTokenBox();
  updateNFTSubhead();
  renderAvatarTokenList();
  updateAvatarControls();
}

function startNFTImageLoad() {
  loadNFTImagesForCurrentTokens().catch((error) => {
    showNotice(errorMessage(error), "error");
  });
}

async function loadNFTImagesForCurrentTokens() {
  const loadId = ++state.nftImageLoadId;
  const maxImages = Number(state.config.ui?.maxTokenImages || 80);
  for (let i = 0; i < state.tokens.length && i < maxImages; i++) {
    if (state.nftImagesPaused || loadId !== state.nftImageLoadId) return;
    const item = state.tokens[i];
    if (!item || item.image || item.imageLoading) continue;
    try {
      item.imageLoading = true;
      renderNFTGrid();
      const tokenUri = await state.contracts.coreRead.tokenURI(item.tokenId);
      if (state.nftImagesPaused || loadId !== state.nftImageLoadId) {
        item.imageLoading = false;
        renderNFTGrid();
        updateNFTSubhead();
        return;
      }
      item.metadata = parseTokenURI(tokenUri);
      item.image = metadataImageSource(item.metadata);
      item.imageLoading = false;
    } catch (error) {
      item.imageLoading = false;
      item.error = errorMessage(error);
    }
    renderNFTGrid();
    updateSelectedTokenBox();
  }
  updateNFTSubhead();
}

function renderNFTGrid() {
  const visible = visibleTokens();

  if (!state.account) {
    renderEmptyWallet();
    return;
  }
  if (state.tokens.length === 0) {
    els.nftGrid.innerHTML = `<div class="empty-state">No OP in this wallet.</div>`;
    updateSelectedTokenBox();
    return;
  }
  if (visible.length === 0) {
    els.nftGrid.innerHTML = `<div class="empty-state">No cards in this filter.</div>`;
    updateSelectedTokenBox();
    return;
  }

  els.nftGrid.innerHTML = visible.map(renderNFTCard).join("");
  updateSelectedTokenBox();
}

function renderNFTCard(item) {
  const selected = state.selectedTokenIds.has(item.tokenId);
  const sealed = item.isSealed === true;
  const stateBadge = sealed ? "Sealed" : "Unsealed";
  const art = item.image
    ? `<img src="${escapeAttr(item.image)}" loading="lazy" alt="OnePlant #${item.tokenId}">`
    : `<span>${nftArtStatus(item)}</span>`;
  const error = item.error ? `<div class="badge">${escapeHtml(item.error.slice(0, 44))}</div>` : "";
  return `
    <article class="nft-card ${selected ? "selected" : ""}" data-token-id="${item.tokenId}" role="button" tabindex="0" aria-pressed="${selected ? "true" : "false"}">
      <div class="nft-art">
        ${art}
        <span class="selection-mark">${selected ? "Selected" : "Select"}</span>
      </div>
      <div class="nft-meta">
        <div class="nft-title">
          <span>OP #${item.tokenId}</span>
          <span class="badge ${sealed ? "sealed" : ""}">${stateBadge}</span>
        </div>
        ${error}
      </div>
    </article>
  `;
}

function nftArtStatus(item) {
  if (state.nftImagesPaused) return "NFT Paused";
  if (item.imageLoading) return "Loading NFT";
  return "NFT Pending";
}

function toggleNFTImages() {
  state.nftImagesPaused = !state.nftImagesPaused;
  updateNFTImageToggle();
  updateNFTSubhead();
  renderNFTGrid();
  if (state.nftImagesPaused) {
    state.nftImageLoadId += 1;
    state.tokens = state.tokens.map((item) => ({ ...item, imageLoading: false }));
    renderNFTGrid();
    updateNFTSubhead();
    showNotice("NFT loading paused.", "info");
    return;
  }
  showNotice("NFT loading resumed.", "info");
  startNFTImageLoad();
}

function updateNFTImageToggle() {
  if (!els.toggleNftImagesButton) return;
  els.toggleNftImagesButton.textContent = state.nftImagesPaused ? "Load NFT" : "Pause NFT";
  els.toggleNftImagesButton.setAttribute("aria-pressed", state.nftImagesPaused ? "true" : "false");
  els.toggleNftImagesButton.classList.toggle("active", state.nftImagesPaused);
}

function updateNFTSubhead() {
  const sealed = state.tokens.filter((item) => item.isSealed).length;
  const loadedImages = state.tokens.filter((item) => item.image).length;
  const previewLabel = `preview${loadedImages === 1 ? "" : "s"}`;
  const suffix = state.nftImagesPaused ? ` NFT loading paused, ${loadedImages} ${previewLabel}.` : ` ${loadedImages} NFT ${previewLabel}.`;
  els.nftSubhead.textContent = `${state.tokens.length} OP loaded, ${sealed} sealed.${suffix}`;
}

function renderEmptyWallet() {
  els.walletMetric.textContent = state.account ? shortAddress(state.account) : "Not connected";
  els.ethMetric.textContent = "-";
  els.upMetric.textContent = "-";
  els.opMetric.textContent = "-";
  els.nftSubhead.textContent = state.account ? "Refresh to load OP cards." : "Connect wallet to load OP cards.";
  els.nftGrid.innerHTML = `<div class="empty-state">${state.account ? "No OP loaded." : "No wallet connected."}</div>`;
  state.tokens = [];
  state.selectedTokenIds.clear();
  clearAvatarSelection();
  updateNFTImageToggle();
  updateWalletConnectionUI();
  updateSelectedTokenBox();
  updatePlantingControls();
  renderAvatarTokenList();
  updateAvatarControls();
}

function visibleTokens() {
  return state.tokens.filter((item) => {
    if (state.filter === "sealed") return item.isSealed === true;
    if (state.filter === "unsealed") return item.isSealed === false;
    return true;
  });
}

function toggleTokenSelection(tokenId) {
  if (!tokenId) return;
  if (state.selectedTokenIds.has(tokenId)) state.selectedTokenIds.delete(tokenId);
  else state.selectedTokenIds.add(tokenId);
  renderNFTGrid();
}

function selectVisibleTokens() {
  for (const item of visibleTokens()) state.selectedTokenIds.add(item.tokenId);
  renderNFTGrid();
}

function clearSelection() {
  state.selectedTokenIds.clear();
  renderNFTGrid();
}

function updateSelectedTokenBox() {
  const selected = state.tokens.filter((token) => state.selectedTokenIds.has(token.tokenId));
  const sealed = selected.filter((token) => token.isSealed);
  const unsealed = selected.filter((token) => !token.isSealed);
  if (!selected.length) {
    els.selectedTokenLabel.textContent = "No OP selected";
    els.selectedTokenBox.innerHTML = `<span>Choose one or more cards from your wallet.</span>`;
    els.selectVisibleButton.disabled = state.busy || !state.account || visibleTokens().length === 0;
    els.clearSelectionButton.disabled = true;
    els.batchSealButton.disabled = true;
    els.batchUnsealButton.disabled = true;
    return;
  }
  const previewIds = selected.slice(0, 8).map((token) => `#${token.tokenId}`).join(", ");
  const overflow = selected.length > 8 ? `, and ${selected.length - 8} more` : "";
  els.selectedTokenLabel.textContent = `${selected.length} OP selected`;
  els.selectedTokenBox.innerHTML = `
    <strong>${selected.length} selected - ${sealed.length} sealed, ${unsealed.length} unsealed</strong>
    <span>${previewIds}${overflow}</span>
  `;
  els.selectVisibleButton.disabled = state.busy || !state.account || visibleTokens().length === 0;
  els.clearSelectionButton.disabled = state.busy;
  els.batchSealButton.disabled = state.busy || !state.account || unsealed.length === 0;
  els.batchUnsealButton.disabled = state.busy || !state.account || sealed.length === 0;
}

async function renderAvatarWorkspace() {
  renderAvatarTokenList();
  updateAvatarControls();
  updateAvatarGuide();
  if (state.account && state.contracts.coreRead && state.tokens.length === 0) {
    await refreshAvatarInventory();
    return;
  }
  drawAvatarCanvas();
}

async function refreshAvatarInventory() {
  if (!state.account) {
    showAvatarNotice("Connect wallet to load your OP cards.", "info");
    renderAvatarTokenList();
    updateAvatarControls();
    return;
  }
  try {
    els.avatarRefreshButton.disabled = true;
    setAvatarStatus("Loading OP list...");
    await ensureWalletOnSelectedNetwork();
    initContracts();
    await refreshTokenInventory();
    showAvatarNotice("OP list refreshed.", "success");
  } catch (error) {
    showAvatarNotice(errorMessage(error), "error");
  } finally {
    updateAvatarControls();
  }
}

function renderAvatarTokenList() {
  if (!els.avatarTokenList) return;
  if (!state.account) {
    els.avatarTokenList.innerHTML = `<div class="empty-state">No wallet connected.</div>`;
    return;
  }
  if (!state.tokens.length) {
    els.avatarTokenList.innerHTML = `<div class="empty-state">No OP loaded.</div>`;
    return;
  }
  els.avatarTokenList.innerHTML = state.tokens.map((item) => {
    const selected = item.tokenId === state.avatar.selectedTokenId;
    const sealed = item.isSealed === true;
    return `
      <button class="avatar-token-row ${selected ? "selected" : ""}" data-avatar-token-id="${item.tokenId}" type="button" aria-pressed="${selected ? "true" : "false"}">
        <span>OP #${escapeHtml(item.tokenId)}</span>
        <span class="badge ${sealed ? "sealed" : ""}">${sealed ? "Sealed" : "Unsealed"}</span>
      </button>
    `;
  }).join("");
}

async function selectAvatarToken(tokenId) {
  const item = state.tokens.find((token) => token.tokenId === tokenId);
  if (!item) return;
  const requestId = ++state.avatar.requestId;
  state.avatar.selectedTokenId = tokenId;
  state.avatar.loading = true;
  state.avatar.metadata = null;
  state.avatar.imageSource = "";
  state.avatar.imageElement = null;
  renderAvatarTokenList();
  updateAvatarControls();
  drawAvatarCanvas();
  setAvatarStatus(`Loading OP #${tokenId}...`);

  try {
    let metadata = item.metadata;
    if (!metadata || !metadataImageSource(metadata)) {
      const tokenUri = await state.contracts.coreRead.tokenURI(tokenId);
      metadata = parseTokenURI(tokenUri);
    }
    const imageSource = metadataImageSource(metadata);
    if (!imageSource) throw new Error("Selected OP metadata has no SVG image.");
    const avatarImageSource = cleanAvatarImageSource(imageSource);
    const imageElement = await loadImageElement(avatarImageSource);
    if (requestId !== state.avatar.requestId) return;
    item.metadata = metadata;
    if (!state.nftImagesPaused) item.image = imageSource;
    state.avatar.loading = false;
    state.avatar.metadata = metadata;
    state.avatar.imageSource = avatarImageSource;
    state.avatar.imageElement = imageElement;
    renderNFTGrid();
    renderAvatarTokenList();
    updateAvatarControls();
    drawAvatarCanvas();
    const permanence = item.isSealed
      ? "Sealed avatar source is fixed."
      : "Unsealed source can keep evolving; seal first for a permanent avatar.";
    setAvatarStatus(`OP #${tokenId} ready. ${permanence}`);
  } catch (error) {
    if (requestId !== state.avatar.requestId) return;
    state.avatar.loading = false;
    state.avatar.imageElement = null;
    updateAvatarControls();
    drawAvatarCanvas();
    setAvatarStatus("Avatar image failed to load.");
    showAvatarNotice(errorMessage(error), "error");
  }
}

function clearAvatarSelection() {
  state.avatar.requestId += 1;
  state.avatar.selectedTokenId = "";
  state.avatar.loading = false;
  state.avatar.metadata = null;
  state.avatar.imageSource = "";
  state.avatar.imageElement = null;
  state.avatar.drag = null;
  resetAvatarViewValues();
  drawAvatarCanvas();
}

function updateAvatarControls() {
  if (!els.avatarSubhead) return;
  const selected = avatarSelectedToken();
  const loadedLabel = state.tokens.length === 1 ? "OP card" : "OP cards";
  els.avatarSubhead.textContent = state.account
    ? `${state.tokens.length} ${loadedLabel} available.`
    : "Connect wallet to load OP cards.";
  els.avatarRefreshButton.disabled = state.busy || !state.account || !isNetworkConfigured(selectedNetwork());
  els.avatarDownloadButton.disabled = !state.avatar.imageElement || state.avatar.loading;
  els.avatarSelectedLabel.textContent = selected ? `OP #${selected.tokenId}` : "No OP selected";
  els.avatarPreviewShell.classList.toggle("is-loading", state.avatar.loading);
  els.avatarPreviewShell.classList.toggle("has-image", Boolean(state.avatar.imageElement));
  els.avatarPlaceholder.hidden = Boolean(state.avatar.imageElement);
  if (!selected && !state.avatar.loading) setAvatarStatus(state.account ? "Choose one card to create a PNG avatar." : "Connect wallet to begin.");
}

function updateAvatarFromControls() {
  state.avatar.zoom = clampNumber(Number(els.avatarZoomInput.value) / 100, AVATAR_MIN_ZOOM, AVATAR_MAX_ZOOM);
  state.avatar.offsetX = clampNumber(Number(els.avatarPanXInput.value), -35, 35);
  state.avatar.offsetY = clampNumber(Number(els.avatarPanYInput.value), -35, 35);
  drawAvatarCanvas();
}

function resetAvatarCut() {
  resetAvatarViewValues();
  drawAvatarCanvas();
}

function resetAvatarViewValues() {
  state.avatar.zoom = AVATAR_DEFAULT_ZOOM;
  state.avatar.offsetX = 0;
  state.avatar.offsetY = AVATAR_DEFAULT_PAN_Y;
  if (els.avatarZoomInput) els.avatarZoomInput.value = AVATAR_DEFAULT_ZOOM_INPUT;
  if (els.avatarPanXInput) els.avatarPanXInput.value = "0";
  if (els.avatarPanYInput) els.avatarPanYInput.value = AVATAR_DEFAULT_PAN_Y_INPUT;
}

function updateAvatarGuide() {
  if (!els.avatarPreviewShell || !els.avatarGuideInput) return;
  els.avatarPreviewShell.classList.toggle("guide-on", els.avatarGuideInput.checked);
}

function drawAvatarCanvas() {
  if (!els.avatarCanvas) return;
  const canvas = els.avatarCanvas;
  const ctx = canvas.getContext("2d");
  canvas.width = AVATAR_CANVAS_SIZE;
  canvas.height = AVATAR_CANVAS_SIZE;
  ctx.clearRect(0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE);
  const image = state.avatar.imageElement;
  if (!image) {
    ctx.fillStyle = "#eef3ef";
    ctx.fillRect(0, 0, AVATAR_CANVAS_SIZE, AVATAR_CANVAS_SIZE);
    updateAvatarControls();
    return;
  }

  const preset = AVATAR_PRESETS[state.avatar.mode] || AVATAR_PRESETS.core;
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const base = Math.min(width, height);
  const zoom = clampNumber(state.avatar.zoom || 1, AVATAR_MIN_ZOOM, AVATAR_MAX_ZOOM);
  const sourceSize = clampNumber(base * preset.sourceRatio / zoom, base * 0.38, Math.max(width, height));
  const panReach = sourceSize * 0.55;
  const centerX = width * preset.centerX + (state.avatar.offsetX / 100) * panReach;
  const centerY = height * preset.centerY + (state.avatar.offsetY / 100) * panReach;

  drawAvatarBackdrop(ctx, image, width, height);
  drawVirtualAvatarSource(ctx, image, width, height, centerX, centerY, sourceSize);
  drawAvatarVignette(ctx);
  if (state.avatar.mode === "specimen") drawSpecimenAvatarOverlay(ctx);
  updateAvatarControls();
}

function drawAvatarBackdrop(ctx, image, width, height) {
  const size = AVATAR_CANVAS_SIZE;
  ctx.save();
  ctx.fillStyle = "#eef3ef";
  ctx.fillRect(0, 0, size, size);
  const scale = Math.max(size / width, size / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  ctx.globalAlpha = 0.42;
  ctx.filter = "blur(22px) saturate(0.9)";
  ctx.drawImage(image, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(238,243,239,0.18)";
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
}

function drawVirtualAvatarSource(ctx, image, width, height, centerX, centerY, sourceSize) {
  const size = AVATAR_CANVAS_SIZE;
  const left = centerX - sourceSize / 2;
  const top = centerY - sourceSize / 2;
  const right = left + sourceSize;
  const bottom = top + sourceSize;
  const ix0 = clampNumber(left, 0, width);
  const iy0 = clampNumber(top, 0, height);
  const ix1 = clampNumber(right, 0, width);
  const iy1 = clampNumber(bottom, 0, height);
  const sourceWidth = ix1 - ix0;
  const sourceHeight = iy1 - iy0;
  if (sourceWidth <= 0 || sourceHeight <= 0) return;
  const dx = ((ix0 - left) / sourceSize) * size;
  const dy = ((iy0 - top) / sourceSize) * size;
  const dw = (sourceWidth / sourceSize) * size;
  const dh = (sourceHeight / sourceSize) * size;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, ix0, iy0, sourceWidth, sourceHeight, dx, dy, dw, dh);
}

function drawAvatarVignette(ctx) {
  const size = AVATAR_CANVAS_SIZE;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.22, size / 2, size / 2, size * 0.72);
  gradient.addColorStop(0, "rgba(255,255,255,0)");
  gradient.addColorStop(0.7, "rgba(0,0,0,0.03)");
  gradient.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

function drawSpecimenAvatarOverlay(ctx) {
  const size = AVATAR_CANVAS_SIZE;
  const selected = avatarSelectedToken();
  const sealed = selected?.isSealed === true;
  ctx.save();
  ctx.lineWidth = 10;
  ctx.strokeStyle = sealed ? "rgba(215,255,233,0.72)" : "rgba(247,213,141,0.58)";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.438, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = sealed ? "rgba(72,214,157,0.46)" : "rgba(141,113,61,0.42)";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.465, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function startAvatarDrag(event) {
  if (!state.avatar.imageElement) return;
  state.avatar.drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: state.avatar.offsetX,
    offsetY: state.avatar.offsetY
  };
  els.avatarPreviewShell.setPointerCapture?.(event.pointerId);
}

function moveAvatarDrag(event) {
  const drag = state.avatar.drag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const rect = els.avatarPreviewShell.getBoundingClientRect();
  const deltaX = ((event.clientX - drag.startX) / Math.max(1, rect.width)) * 90;
  const deltaY = ((event.clientY - drag.startY) / Math.max(1, rect.height)) * 90;
  state.avatar.offsetX = clampNumber(drag.offsetX - deltaX, -35, 35);
  state.avatar.offsetY = clampNumber(drag.offsetY - deltaY, -35, 35);
  els.avatarPanXInput.value = String(Math.round(state.avatar.offsetX));
  els.avatarPanYInput.value = String(Math.round(state.avatar.offsetY));
  drawAvatarCanvas();
}

function endAvatarDrag(event) {
  if (state.avatar.drag?.pointerId === event.pointerId) state.avatar.drag = null;
}

function downloadAvatarPNG() {
  if (!state.avatar.imageElement) return;
  drawAvatarCanvas();
  const selected = avatarSelectedToken();
  const tokenId = selected?.tokenId || "oneplant";
  const status = selected?.isSealed ? "sealed" : "unsealed";
  els.avatarCanvas.toBlob((blob) => {
    if (!blob) {
      showAvatarNotice("PNG export failed.", "error");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `oneplant-avatar-op-${tokenId}-${status}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function avatarSelectedToken() {
  return state.tokens.find((token) => token.tokenId === state.avatar.selectedTokenId) || null;
}

function setAvatarStatus(message) {
  if (els.avatarStatus) els.avatarStatus.textContent = message;
}

function showAvatarNotice(message, type = "info") {
  els.avatarNotice.hidden = false;
  els.avatarNotice.className = `notice ${type === "error" ? "error" : type === "success" ? "success" : ""}`;
  els.avatarNotice.innerHTML = message;
}

function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Avatar image failed to load."));
    image.decoding = "async";
    image.src = source;
  });
}

async function batchSealOrUnseal(mode) {
  const isSeal = mode === "seal";
  const selected = state.tokens.filter((token) => state.selectedTokenIds.has(token.tokenId));
  const targets = selected.filter((token) => isSeal ? !token.isSealed : token.isSealed);
  if (!targets.length) {
    showNotice(`No selected ${isSeal ? "unsealed" : "sealed"} OP cards are ready.`, "error");
    return;
  }
  if (targets.length > 1) {
    const approved = window.confirm(`${isSeal ? "Seal" : "Unseal"} ${targets.length} OP cards in one transaction?`);
    if (!approved) return;
  }
  try {
    setBusy(true, `${isSeal ? "Sealing" : "Unsealing"} ${targets.length} OP card${targets.length === 1 ? "" : "s"}...`);
    await ensureWalletOnSelectedNetwork();
    initContracts();
    const tokenIds = targets.map((item) => BigInt(item.tokenId));
    const tx = isSeal
      ? await state.contracts.coreWrite.seal(tokenIds)
      : await state.contracts.coreWrite.unseal(tokenIds);
    showNotice(`${isSeal ? "Seal" : "Unseal"} transaction sent: ${txLink(tx.hash)}`, "info");
    await tx.wait();
    showNotice(`${isSeal ? "Sealed" : "Unsealed"} ${targets.length} OP card${targets.length === 1 ? "" : "s"}.`, "success");
    await delay(Number(state.config.ui?.pollAfterTxMs || 2500));
    await refreshAll();
  } catch (error) {
    showNotice(errorMessage(error), "error");
  } finally {
    setBusy(false);
    applyNetworkUI();
    updateSelectedTokenBox();
  }
}

function applySwapLabels() {
  const buy = state.swapSide === "buy";
  els.routeLabel.textContent = buy ? "Swap Buy >= 10,000 UP to get OP NFT" : "UP -> ETH";
  els.amountInLabel.textContent = buy ? "ETH in" : "UP in";
  els.amountOutMinLabel.textContent = buy ? "Min UP out" : "Min ETH out";
  els.amountInInput.placeholder = buy ? "0.001" : "10000";
  els.amountOutMinInput.placeholder = "Auto";
  if (!els.amountInInput.value.trim()) els.quoteStatus.textContent = "Enter an amount to quote.";
}

function scheduleSwapQuote() {
  window.clearTimeout(state.quoteTimer);
  state.quoteTimer = window.setTimeout(updateSwapQuote, 450);
}

async function updateSwapQuote() {
  const requestId = ++state.quoteRequestId;
  try {
    const network = selectedNetwork();
    if (!isNetworkConfigured(network)) {
      clearQuoteSnapshot();
      if (!state.manualMinOut) els.amountOutMinInput.value = "";
      setQuoteStatus("Network is not configured.");
      return;
    }
    if (!state.account || !state.signer || !state.contracts.swapWrite) {
      clearQuoteSnapshot();
      if (!state.manualMinOut) els.amountOutMinInput.value = "";
      setQuoteStatus("Connect wallet to quote.");
      return;
    }
    const rawAmount = els.amountInInput.value.trim();
    if (!rawAmount) {
      clearQuoteSnapshot();
      if (!state.manualMinOut) els.amountOutMinInput.value = "";
      setQuoteStatus("Enter an amount to quote.");
      return;
    }
    await ensureWalletOnSelectedNetwork();
    initContracts();

    const amountIn = parseInputAmount(rawAmount, "amount in");
    const { quoteOut, minOut, slippageBps } = await computeQuotedMinimum(network, amountIn);
    if (requestId !== state.quoteRequestId) return;

    const outputSymbol = state.swapSide === "buy" ? "UP" : "ETH";
    if (!state.manualMinOut) els.amountOutMinInput.value = formatExactUnits(minOut, 18);
    setQuoteStatus(`Quote ${formatDisplayUnits(quoteOut, 6)} ${outputSymbol}; min uses ${formatBpsAsPercent(slippageBps)}% slippage.`);
  } catch (error) {
    if (requestId !== state.quoteRequestId) return;
    const message = errorMessage(error);
    const sellNeedsApproval = state.swapSide === "sell" && /TRANSFER_FROM_FAILED|allowance|insufficient allowance/i.test(message);
    clearQuoteSnapshot();
    if (!state.manualMinOut) els.amountOutMinInput.value = "";
    setQuoteStatus(sellNeedsApproval ? "Sell quote needs UP approval. Swap will ask for approval first." : `Quote unavailable: ${message}`);
  }
}

async function computeQuotedMinimum(network, amountIn) {
  const slippageBps = parseSlippageBps(els.slippageInput.value || "0");
  const quoteOut = await quoteSwapAmountOut(network, amountIn);
  const minOut = quoteOut * (BPS_DENOMINATOR - BigInt(slippageBps)) / BPS_DENOMINATOR;
  if (quoteOut <= 0n || minOut <= 0n) throw new Error("Quote returned zero output.");
  state.quotedAmountIn = amountIn;
  state.quotedAmountOut = quoteOut;
  state.quotedMinOut = minOut;
  state.quotedSide = state.swapSide;
  state.quotedSlippageBps = slippageBps;
  return { quoteOut, minOut, slippageBps };
}

function clearQuoteSnapshot() {
  state.quotedAmountIn = null;
  state.quotedAmountOut = null;
  state.quotedMinOut = null;
  state.quotedSide = "";
  state.quotedSlippageBps = 0;
}

async function quoteSwapAmountOut(network, amountIn) {
  const direction = resolveDirection(state.swapSide, network.poolKey, network.contracts.upToken);
  const params = {
    poolKey: normalizePoolKey(network.poolKey),
    zeroForOne: direction.zeroForOne,
    amountIn,
    amountOutMinimum: 0n,
    recipient: state.account,
    hookData: "0x"
  };
  const overrides = state.swapSide === "buy" ? { value: amountIn, from: state.account } : { from: state.account };
  const swapContract = state.contracts.swapRead || state.contracts.swapWrite;
  return swapContract.swapExactInputSingle.staticCall(params, overrides);
}

function setQuoteStatus(message) {
  els.quoteStatus.textContent = message;
}

async function executeSwap() {
  try {
    const network = selectedNetwork();
    if (!isNetworkConfigured(network)) throw new Error(`${network?.label || "Selected network"} is not configured.`);
    if (!state.account) throw new Error("Connect wallet first.");
    await ensureWalletOnSelectedNetwork();
    initContracts();

    const amountIn = parseInputAmount(els.amountInInput.value, "amount in");
    setBusy(true, state.swapSide === "buy" ? "Preparing buy quote..." : "Preparing sell quote...");
    if (state.swapSide === "sell") {
      const allowance = await state.contracts.upRead.allowance(state.account, network.contracts.swapHelper);
      if (allowance < amountIn) {
        showNotice("Approving UP for SwapHelper...", "info");
        const approveTx = await state.contracts.upWrite.approve(network.contracts.swapHelper, amountIn);
        showNotice(`Approval sent: ${txLink(approveTx.hash)}`, "info");
        await approveTx.wait();
      }
    }

    let amountOutMinimum;
    if (state.manualMinOut) {
      amountOutMinimum = parseMinimumOutputAmount(els.amountOutMinInput.value);
      setQuoteStatus("Using manual minimum output.");
    } else {
      const { quoteOut, minOut, slippageBps } = await computeQuotedMinimum(network, amountIn);
      amountOutMinimum = minOut;
      const outputSymbol = state.swapSide === "buy" ? "UP" : "ETH";
      els.amountOutMinInput.value = formatExactUnits(minOut, 18);
      setQuoteStatus(`Quote ${formatDisplayUnits(quoteOut, 6)} ${outputSymbol}; min uses ${formatBpsAsPercent(slippageBps)}% slippage.`);
    }

    const direction = resolveDirection(state.swapSide, network.poolKey, network.contracts.upToken);
    const params = {
      poolKey: normalizePoolKey(network.poolKey),
      zeroForOne: direction.zeroForOne,
      amountIn,
      amountOutMinimum,
      recipient: state.account,
      hookData: "0x"
    };

    setBusy(true, state.swapSide === "buy" ? "Buying UP..." : "Selling UP...");
    const overrides = state.swapSide === "buy" ? { value: amountIn } : {};
    const tx = await state.contracts.swapWrite.swapExactInputSingle(params, overrides);
    showNotice(`Swap sent: ${txLink(tx.hash)}`, "info");
    await tx.wait();
    showNotice("Swap complete.", "success");
    await delay(Number(state.config.ui?.pollAfterTxMs || 2500));
    await refreshAll();
    state.manualMinOut = false;
    scheduleSwapQuote();
  } catch (error) {
    showNotice(errorMessage(error), "error");
  } finally {
    setBusy(false);
    applyNetworkUI();
  }
}

function resolveDirection(side, poolKey, upToken) {
  const currency0 = poolKey.currency0;
  const currency1 = poolKey.currency1;
  if (side === "buy") {
    if (sameAddress(currency0, NATIVE) && sameAddress(currency1, upToken)) return { zeroForOne: true };
    if (sameAddress(currency1, NATIVE) && sameAddress(currency0, upToken)) return { zeroForOne: false };
  } else {
    if (sameAddress(currency0, upToken) && sameAddress(currency1, NATIVE)) return { zeroForOne: true };
    if (sameAddress(currency1, upToken) && sameAddress(currency0, NATIVE)) return { zeroForOne: false };
  }
  throw new Error("Configured pool must be the OnePlant native ETH / UP pool.");
}

function normalizePoolKey(poolKey) {
  return {
    currency0: ethers.getAddress(poolKey.currency0),
    currency1: ethers.getAddress(poolKey.currency1),
    fee: Number(poolKey.fee),
    tickSpacing: Number(poolKey.tickSpacing),
    hooks: ethers.getAddress(poolKey.hooks)
  };
}

function parseInputAmount(value, label) {
  const normalized = String(value || "").trim().replace(/,/g, "");
  if (!normalized) throw new Error(`${label} is required.`);
  const parsed = ethers.parseUnits(normalized, 18);
  if (parsed <= 0n && label !== "minimum output") throw new Error(`${label} must be greater than zero.`);
  if (parsed > MAX_UINT128) throw new Error(`${label} exceeds uint128.`);
  return parsed;
}

function parseMinimumOutputAmount(value) {
  const parsed = parseInputAmount(value, "minimum output");
  if (parsed <= 0n) throw new Error("minimum output must be greater than zero.");
  return parsed;
}

function parseSlippageBps(value) {
  const normalized = String(value || "0").trim().replace("%", "");
  if (!/^\d+(\.\d+)?$/.test(normalized)) throw new Error("slippage must be a number.");
  const [whole, fraction = ""] = normalized.split(".");
  let bps = Number(whole) * 100;
  const padded = fraction.padEnd(3, "0");
  bps += Number(padded.slice(0, 2) || "0");
  if (Number(padded[2] || "0") >= 5) bps += 1;
  if (!Number.isSafeInteger(bps) || bps < 0 || bps > 5000) throw new Error("slippage must be between 0% and 50%.");
  return bps;
}

function parseTokenURI(uri) {
  if (!uri) return null;
  if (uri.startsWith("data:application/json;base64,")) {
    const raw = uri.slice("data:application/json;base64,".length);
    return JSON.parse(decodeBase64(raw));
  }
  if (uri.startsWith("data:application/json;utf8,") || uri.startsWith("data:application/json;charset=utf-8,")) {
    const raw = uri.slice(uri.indexOf(",") + 1);
    return JSON.parse(decodeURIComponent(raw));
  }
  return null;
}

function metadataImageSource(metadata) {
  const image = metadata?.image || "";
  if (image) return image;
  const rawSvg = metadata?.image_data || metadata?.imageData || "";
  if (String(rawSvg).trim().startsWith("<svg")) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}`;
  }
  return "";
}

function cleanAvatarImageSource(source) {
  const svg = decodeSvgImageSource(source);
  if (!svg) return source;
  const cleanSvg = svg
    .replace(/<g\b(?=[^>]*class=["'][^"']*\bstandard-label\b[^"']*["'])[^>]*>[\s\S]*?<\/g>/g, "")
    .replace(/<g\b(?=[^>]*class=["'][^"']*\btypography-v\d+\b[^"']*["'])[^>]*>[\s\S]*?<\/g>/g, "");
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
}

function decodeSvgImageSource(source) {
  const value = String(source || "").trim();
  if (value.startsWith("<svg")) return value;
  if (value.startsWith("data:image/svg+xml;base64,")) {
    return decodeBase64(value.slice("data:image/svg+xml;base64,".length));
  }
  if (value.startsWith("data:image/svg+xml")) {
    const raw = value.slice(value.indexOf(",") + 1);
    try {
      return decodeURIComponent(raw);
    } catch (_) {
      return raw;
    }
  }
  return "";
}

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function updateContractLinks() {
  const network = selectedNetwork();
  setAddressLink(els.coreLink, network, network?.contracts?.core, "OP");
  setAddressLink(els.upLink, network, network?.contracts?.upToken, "UP");
  setAddressLink(els.plantingLink, network, network?.contracts?.plantingSale, "Planting");
  setAddressLink(els.helperLink, network, network?.contracts?.swapHelper, "SwapHelper");
  setAddressLink(els.lpLockLink, network, network?.contracts?.lpPositionLocker, "LP Lock");
  setAddressLink(els.hookLink, network, network?.contracts?.hook, "HOOK");
}

function setAddressLink(element, network, address, label) {
  const explorer = network?.blockExplorerUrls?.[0];
  if (explorer && ethers.isAddress(address || "")) {
    element.href = `${explorer.replace(/\/$/, "")}/address/${address}`;
    element.textContent = label;
    element.removeAttribute("aria-disabled");
  } else {
    element.href = "#";
    element.textContent = `${label} -`;
    element.setAttribute("aria-disabled", "true");
  }
}

function txLink(hash) {
  const explorer = selectedNetwork()?.blockExplorerUrls?.[0];
  if (!explorer) return hash;
  const url = `${explorer.replace(/\/$/, "")}/tx/${hash}`;
  return `<a href="${url}" target="_blank" rel="noreferrer">${hash.slice(0, 10)}...</a>`;
}

function setBusy(busy, message = "") {
  state.busy = busy;
  els.connectButton.disabled = busy || !isNetworkConfigured(selectedNetwork());
  els.switchNetworkButton.disabled = busy || !state.account;
  els.refreshButton.disabled = busy || !state.account;
  els.swapButton.disabled = busy || !state.account || !isNetworkConfigured(selectedNetwork());
  updateWalletConnectionUI();
  updateSelectedTokenBox();
  updatePlantingControls();
  if (message) showNotice(message, "info");
}

function updateWalletConnectionUI() {
  const connected = Boolean(state.account);
  els.connectButton.classList.toggle("connected", connected);
  els.connectButton.textContent = connected ? `Connected ${shortAddress(state.account)}` : "Connect Wallet";
  els.connectButton.title = connected ? `Wallet connected: ${state.account}` : "Connect wallet";
  els.connectButton.setAttribute("aria-label", connected ? `Wallet connected: ${state.account}` : "Connect wallet");
}

function showNotice(message, type = "info") {
  els.notice.hidden = false;
  els.notice.className = `notice ${type === "error" ? "error" : type === "success" ? "success" : ""}`;
  els.notice.innerHTML = message;
}

function showPlantingNotice(message, type = "info") {
  els.plantingNotice.hidden = false;
  els.plantingNotice.className = `notice ${type === "error" ? "error" : type === "success" ? "success" : ""}`;
  els.plantingNotice.innerHTML = message;
}

function errorMessage(error) {
  const decoded = decodeRevertMessage(error);
  if (decoded) return humanizeRevertMessage(decoded);
  const raw = error?.reason || error?.shortMessage || error?.info?.error?.message || error?.data?.message || error?.message || String(error);
  return humanizeRevertMessage(raw.replace(/^execution reverted:?\s*/i, "").replace(/^Error:\s*/i, ""));
}

function decodeRevertMessage(error) {
  for (const data of collectRevertData(error)) {
    const decoded = decodeRevertData(data);
    if (decoded) return decoded;
  }
  return "";
}

function collectRevertData(value, out = [], seen = new Set()) {
  if (value == null) return out;
  if (typeof value === "string") {
    const matches = value.match(/0x[0-9a-fA-F]{8,}/g) || [];
    out.push(...matches);
    return out;
  }
  if (typeof value !== "object" || seen.has(value)) return out;
  seen.add(value);
  for (const key of ["data", "error", "info", "revert", "body"]) collectRevertData(value[key], out, seen);
  if (typeof value.message === "string") {
    const matches = value.message.match(/0x[0-9a-fA-F]{8,}/g) || [];
    out.push(...matches);
  }
  return out;
}

function decodeRevertData(data, depth = 0) {
  if (!/^0x[0-9a-fA-F]{8,}$/.test(data) || depth > 4) return "";
  try {
    const parsed = REVERT_ERROR_IFACE.parseError(data);
    if (!parsed) return "";
    if (parsed.name === "Error") return String(parsed.args[0] || "");
    if (parsed.name === "Panic") return `EVM panic ${parsed.args[0].toString()}`;
    if (parsed.name === "WrappedError") {
      const reason = decodeRevertData(parsed.args.reason, depth + 1);
      if (reason) return reason;
      const details = decodeRevertData(parsed.args.details, depth + 1);
      return details || `Wrapped hook error ${parsed.args.selector}`;
    }
    return parsed.name;
  } catch (_) {
    return "";
  }
}

function humanizeRevertMessage(message) {
  if (message === "ONEPLANT_HOOK: RELEASE_CAP_EXCEEDED") {
    return `${message} - this buy exceeds the current timed swap-mint release capacity. Try a smaller ETH amount or wait for more UP capacity to release.`;
  }
  if (message === "ONEPLANT_HOOK: MINT_COUNT_TOO_LARGE") {
    return `${message} - this buy would mint more OP than the per-swap safety limit. Split it into smaller swaps.`;
  }
  return message;
}

function sameAddress(a, b) {
  return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}

function shortAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "-";
}

function trimNumber(value, decimals) {
  const [whole, fraction = ""] = String(value).split(".");
  const trimmed = fraction.slice(0, decimals).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function formatExactUnits(value, decimals) {
  const formatted = ethers.formatUnits(value, decimals);
  return formatted.includes(".") ? formatted.replace(/0+$/, "").replace(/\.$/, "") : formatted;
}

function formatDisplayUnits(value, decimals) {
  return trimNumber(ethers.formatUnits(value, 18), decimals);
}

function formatBpsAsPercent(bps) {
  const whole = Math.floor(bps / 100);
  const fraction = String(bps % 100).padStart(2, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
