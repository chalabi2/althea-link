import { CosmosNetwork, EVMNetwork } from "@/config/interfaces";
import {
  checkCosmosAddress,
  getCosmosAddressLink,
  getCosmosTransactionLink,
  getEthAddressLink,
  getEthTransactionLink,
} from "../helpers";

const cantoTestnetBlockExplorerEVM = "https://testnet.tuber.build";

const cantoMainBlockExplorerCosmos = "https://www.mintscan.io/canto";
const cantoMainBlockExplorerEVM = "https://tuber.build";

// canto will have an EVM and COSMOS chain data
const cantoMainnetBaseInfo = {
  name: "Althea",
  icon: "/althea.png",
  isTestChain: false,
  rpcUrl: "https://nodes.chandrastation.com/testnet/evm/althea/",
  nativeCurrency: {
    name: "Althea",
    baseName: "aaltg",
    symbol: "ALTG",
    decimals: 18,
  },
};

export const CANTO_MAINNET_EVM: EVMNetwork = {
  ...cantoMainnetBaseInfo,
  id: "althea-mainnet",
  chainId: 417834,
  blockExplorer: {
    url: cantoMainBlockExplorerEVM,
    getAddressLink: getEthAddressLink(cantoMainBlockExplorerEVM),
    getTransactionLink: getEthTransactionLink(cantoMainBlockExplorerEVM),
  },
  multicall3Address: "0xe9cBc7b381aA17C7574671e445830E3b90648368",
};

export const CANTO_MAINNET_COSMOS: CosmosNetwork = {
  ...cantoMainnetBaseInfo,
  id: "althea-mainnet",
  chainId: "althea_417834-3",
  restEndpoint: "https://nodes.chandrastation.com/testnet/api/althea/",
  addressPrefix: "althea",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  blockExplorer: {
    url: cantoMainBlockExplorerCosmos,
    getAddressLink: getCosmosAddressLink(cantoMainBlockExplorerCosmos),
    getTransactionLink: getCosmosTransactionLink(cantoMainBlockExplorerCosmos),
  },
};

// Testnet
const cantoTestnetBaseInfo = {
  name: "Canto Testnet",
  icon: "/icons/canto.svg",
  isTestChain: true,
  rpcUrl: "https://canto-testnet.plexnode.wtf",
  nativeCurrency: {
    name: "Canto",
    baseName: "acanto",
    symbol: "CANTO",
    decimals: 18,
  },
};
export const CANTO_TESTNET_EVM: EVMNetwork = {
  ...cantoMainnetBaseInfo,
  id: "althea-mainnet",
  chainId: 417834,
  blockExplorer: {
    url: cantoMainBlockExplorerEVM,
    getAddressLink: getEthAddressLink(cantoMainBlockExplorerEVM),
    getTransactionLink: getEthTransactionLink(cantoMainBlockExplorerEVM),
  },
  multicall3Address: "0xe9cBc7b381aA17C7574671e445830E3b90648368",
};

export const CANTO_TESTNET_COSMOS: CosmosNetwork = {
  ...cantoMainnetBaseInfo,
  id: "althea-mainnet",
  chainId: "althea_417834-3",
  restEndpoint: "https://nodes.chandrastation.com/testnet/api/althea/",
  addressPrefix: "althea",
  checkAddress: function (address) {
    return checkCosmosAddress(this.addressPrefix)(address);
  },
  blockExplorer: {
    url: cantoMainBlockExplorerCosmos,
    getAddressLink: getCosmosAddressLink(cantoMainBlockExplorerCosmos),
    getTransactionLink: getCosmosTransactionLink(cantoMainBlockExplorerCosmos),
  },
};
