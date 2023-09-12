import { CANTO_MAINNET_EVM, CANTO_TESTNET_EVM } from "@/config/networks";
import {
  BridgeHookInputParams,
  BridgeHookReturn,
  BridgeHookState,
  BridgeHookTxParams,
  BridgeTransactionParams,
  HookSetterParam,
} from "./interfaces/hookParams";
import BRIDGE_OUT_TOKENS from "@/config/jsons/bridgeOutTokens.json";
import { useEffect, useState } from "react";
import useAutoSelect from "../helpers/useAutoSelect";
import {
  NEW_ERROR,
  NO_ERROR,
  ReturnWithError,
  errMsg,
} from "@/config/interfaces/errors";
import { BaseNetwork, CosmosNetwork } from "@/config/interfaces/networks";
import { BridgeOutToken } from "./interfaces/tokens";
import { BridgingMethod } from "./interfaces/bridgeMethods";
import {
  MAIN_BRIDGE_OUT_NETWORKS,
  TEST_BRIDGE_NETWORKS,
} from "./config/networks";
import {
  NewTransactionFlow,
  Transaction,
} from "@/config/interfaces/transactions";
import useTokenBalances from "../helpers/useTokenBalances";
import { bridgeOutTx } from "./transactions/bridge";
import { isERC20TokenList } from "@/utils/tokens/tokens.utils";
import { isBridgeOutToken } from "@/utils/tokens/bridgeTokens.utils";
import { convertToBigNumber, formatBalance } from "@/utils/tokenBalances.utils";
import { isValidEthAddress } from "@/utils/address.utils";
import { isCosmosNetwork } from "@/utils/networks.utils";
import { TransactionFlowType } from "@/config/transactions/txMap";

export default function useBridgeOut(
  props: BridgeHookInputParams
): BridgeHookReturn {
  // initial state with props
  const initialState = (testnet: boolean): BridgeHookState => ({
    // all options
    availableTokens: BRIDGE_OUT_TOKENS.chainTokenList[
      testnet ? "canto-testnet" : "canto-mainnet"
    ] as BridgeOutToken[],
    availableNetworks: [],
    availableMethods: [],
    // default selections
    fromNetwork: testnet ? CANTO_TESTNET_EVM : CANTO_MAINNET_EVM,
    toNetwork: null,
    selectedToken: null,
    selectedMethod: null,
    // user addresses
    connectedEthAddress: null,
    connectedCosmosAddress: null,
    userInputCosmosAddress: null,
  });

  // state of the entire hook that will be exposed
  const [state, setState] = useState<BridgeHookState>(
    initialState(props.testnet ?? false)
  );

  ///
  /// internal hooks
  ///

  // if the user switches to testnet, we need to reset the state
  useEffect(() => {
    // don't reset connected addresses, just selections
    setState((prevState) => ({
      ...initialState(props.testnet ?? false),
      ...{
        connectedEthAddress: prevState.connectedEthAddress,
        connectedCosmosAddress: prevState.connectedCosmosAddress,
        userInputCosmosAddress: null,
      },
    }));
  }, [props.testnet]);

  // contains object mapping of the token balances
  const userTokenBalances = useTokenBalances(
    state.fromNetwork?.chainId,
    isERC20TokenList(state.availableTokens) ? state.availableTokens : [],
    state.connectedEthAddress,
    null
  );

  // will autoselect the first available token if there are any
  useAutoSelect(state.availableTokens, setToken);
  // will autoselect the first available network if there are any
  useAutoSelect(state.availableNetworks, setNetwork);
  // will autoselect the first available method if there are any
  useAutoSelect(state.availableMethods, setMethod);

  ///
  /// internal functions
  ///

  function getNetwork(id: string): ReturnWithError<BaseNetwork> {
    const network = state.availableNetworks.find(
      (network) => network.id === id
    );
    return network
      ? NO_ERROR(network)
      : NEW_ERROR("useBridgeOut::getNetwork: network not found:" + id);
  }
  function getToken(id: string): ReturnWithError<BridgeOutToken> {
    const token = state.availableTokens.find((token) => token.id === id);
    if (!isBridgeOutToken(token)) {
      throw new Error("useBridgeOut::getToken: invalid token type: " + id);
    }
    // check if we have a balance for the token
    const balance = userTokenBalances[token.id];
    if (balance !== undefined) {
      return NO_ERROR({ ...token, balance });
    }
    return NO_ERROR(token);
  }

  ///
  /// internal setter functions
  ///

  // sets selected token and loads the available networks it can be bridge to
  function setToken(id: string): void {
    //make sure new token was actually selected
    if (state.selectedToken?.id === id) return;

    const { data: token, error: tokenError } = getToken(id);
    if (tokenError) {
      throw new Error("useBridgeOut::setToken::" + tokenError.message);
    }
    // get the supoprted networks from the token
    const supportedNetworkIds = token.bridgeMethods.map((method: any) => {
      return method.chainId;
    });
    if (supportedNetworkIds.length === 0) {
      throw new Error(
        "useBridgeOut::setToken: no supported networks for token: " + id
      );
    }
    // get the networks from the ids
    const supportedNetworks = (
      props.testnet ? TEST_BRIDGE_NETWORKS : MAIN_BRIDGE_OUT_NETWORKS
    ).filter((network) => supportedNetworkIds.includes(network.id));
    if (supportedNetworks.length === 0) {
      throw new Error(
        "useBridgeOut::setToken: found no supported networks from ids"
      );
    }
    // set the token state, and reset the network and method states
    setState((prevState) => ({
      ...prevState,
      selectedToken: token,
      availableNetworks: supportedNetworks,
      toNetwork: null,
      availableMethods: [],
      selectedMethod: null,
    }));
  }

  // sets selected network and loads the available methods for bridging
  function setNetwork(id: string): void {
    //make sure new network was actually selected
    if (state.toNetwork?.id === id) return;

    const { data: network, error: networkError } = getNetwork(id);
    if (networkError) {
      throw new Error("useBridgeOut::setNetwork: invalid network id: " + id);
    }
    if (!state.selectedToken) {
      throw new Error(
        "useBridgeOut::setNetwork: must select token before network"
      );
    }
    // get the supported methods from the token and network combination
    const supportedMethods = (
      state.selectedToken.bridgeMethods as {
        chainId: string;
        methods: BridgingMethod[];
      }[]
    ).find((method: any) => method.chainId === network.id)?.methods;
    if (!supportedMethods) {
      throw new Error(
        "useBridgeOut::setNetwork: no supported methods for network: " + id
      );
    }
    setState((prevState) => ({
      ...prevState,
      toNetwork: network,
      availableMethods: supportedMethods,
      // reset method selection
      selectedMethod: null,
    }));
  }

  // sets selected bridging method only it actually exists on the token
  function setMethod(selectMethod: string): void {
    const method = selectMethod as BridgingMethod;
    //make sure new method was actually selected
    if (method === state.selectedMethod) return;

    if (!state.availableMethods.includes(method)) {
      throw new Error("setMethod: Invalid method: " + method);
    }
    setState((prevState) => ({
      ...prevState,
      selectedMethod: method,
    }));
  }

  // user address setters
  // pass in address of eth signer for transactions
  function setConnectedEthAddress(address: string): void {
    // check if valid address
    setState((prevState) => ({
      ...prevState,
      connectedEthAddress: isValidEthAddress(address) ? address : null,
    }));
  }
  // make sure this is called from the parent whenever cosmos network is selected
  function setConnectedCosmosAddress(address: string): void {
    // no need to connect to keplr for bridging out
    return;
  }
  // make sure this is called from the parent whenever cosmos address is changed
  function setUserInputCosmosAddress(address: string): void {
    // no need to check validity, this will be done inside any cosmos function
    setState((prevState) => ({
      ...prevState,
      userInputCosmosAddress: address,
    }));
  }

  ///
  /// external functions
  ///

  // get the sender based on current tx state
  function getSender(): string | null {
    if (!state.selectedMethod) return null;
    switch (state.selectedMethod) {
      case BridgingMethod.IBC:
      case BridgingMethod.LAYER_ZERO:
        return state.connectedEthAddress;
      case BridgingMethod.GRAVITY_BRIDGE:
        // method does not exist yet for bridge out
        return null;
      default:
        return null;
    }
  }
  // get the receiver based on current tx state
  function getReceiver(): string | null {
    if (!state.selectedMethod) return null;
    switch (state.selectedMethod) {
      case BridgingMethod.IBC:
        return state.userInputCosmosAddress;
      case BridgingMethod.LAYER_ZERO:
        return state.connectedEthAddress;
      case BridgingMethod.GRAVITY_BRIDGE:
        // method does not exist yet for bridge out
        return null;
      default:
        return null;
    }
  }

  // this function is exposed to the parent component to set the state
  function generalSetter(paramName: HookSetterParam, id: string): void {
    // checks will be done internally
    switch (paramName) {
      case "network":
        return setNetwork(id);
      case "token":
        return setToken(id);
      case "method":
        return setMethod(id);
      case "ethAddress":
        return setConnectedEthAddress(id);
      case "cosmosAddress":
        return setConnectedCosmosAddress(id);
      case "inputCosmosAddress":
        return setUserInputCosmosAddress(id);
      default:
        throw new Error(
          "useBridgeIn::generalSetter: invalid param: " + paramName
        );
    }
  }

  // will tell the parent if bridging params look good to bridge
  function canBridge(params: BridgeHookTxParams): ReturnWithError<boolean> {
    // check if we can create valid params
    const { data: txParams, error: txParamsError } =
      createBridgeTxParams(params);
    if (txParamsError) {
      return NEW_ERROR("useBridgeOut::canBridge::" + errMsg(txParamsError));
    }
    // make sure balance exists for token
    const balance = userTokenBalances[txParams.token.data.id];
    if (balance === undefined) {
      return NEW_ERROR(
        "useBridgeOut::canBridge: balance undefined for token: " +
          txParams.token.data.id
      );
    }
    // make sure amount it less than or equal to the token balance
    const { data: userAmount, error: bigNumberError } = convertToBigNumber(
      params.amount
    );
    if (bigNumberError) {
      return NEW_ERROR("useBridgeOut::canBridge::" + bigNumberError.message);
    }
    // token balance is already formatted with decimals
    const { data: tokenAmount, error: tokenBigNumberError } =
      convertToBigNumber(balance);
    if (tokenBigNumberError) {
      return NEW_ERROR(
        "useBridgeOut::canBridge::" + tokenBigNumberError.message
      );
    }

    // final check if ibc transfer (check input address)
    if (state.selectedMethod === BridgingMethod.IBC) {
      if (
        !isCosmosNetwork(state.toNetwork as CosmosNetwork) ||
        !(state.toNetwork as CosmosNetwork).checkAddress(
          state.userInputCosmosAddress ?? ""
        )
      ) {
        return NEW_ERROR(
          "useBridgeOut::canBridge: input cosmos address doesn't match network" +
            state.userInputCosmosAddress +
            "->" +
            state.toNetwork?.name
        );
      }
    }

    return NO_ERROR(userAmount.lte(tokenAmount) && userAmount.gt(0));
  }

  function createNewBridgeFlow(
    params: BridgeHookTxParams
  ): ReturnWithError<NewTransactionFlow> {
    // see if we can create valid params
    const { data: txParams, error: txParamsError } =
      createBridgeTxParams(params);
    if (txParamsError) {
      return NEW_ERROR(
        "useBridgeOut::createNewBridgeFlow::" + errMsg(txParamsError)
      );
    }
    return NO_ERROR({
      title: `Bridge out ${formatBalance(
        params.amount,
        txParams.token.data.decimals
      )} ${txParams.token.data.symbol} `,
      icon: txParams.token.data.icon,
      txType: TransactionFlowType.BRIDGE_OUT,
      params: txParams,
    });
  }

  function createBridgeTxParams(
    params: BridgeHookTxParams
  ): ReturnWithError<BridgeTransactionParams> {
    // check basic parameters to make sure they exist
    if (!state.selectedToken) {
      return NEW_ERROR("useBridgeOut::createBridgeTxParams: no token selected");
    }
    if (!state.toNetwork || !state.fromNetwork) {
      return NEW_ERROR(
        "useBridgeOut::createBridgeTxParams: no network selected"
      );
    }
    if (!state.selectedMethod) {
      return NEW_ERROR("useBridgeOut::createBridgeTxParams: method undefined");
    }
    // check sender and receiver
    const sender = getSender();
    if (!sender) {
      return NEW_ERROR("useBridgeOut::createBridgeTxParams: sender undefined");
    }
    const receiver = getReceiver();
    if (!receiver) {
      return NEW_ERROR(
        "useBridgeOut::createBridgeTxParams: receiver undefined"
      );
    }
    return NO_ERROR({
      from: {
        network: state.fromNetwork,
        account: sender,
      },
      to: {
        network: state.toNetwork,
        account: receiver,
      },
      token: {
        data: state.selectedToken,
        amount: params.amount,
      },
      method: state.selectedMethod,
    });
  }
  return {
    direction: "out",
    testnet: props.testnet ?? false,
    allOptions: {
      tokens: state.availableTokens.map((token) => {
        const balance = userTokenBalances[token.id];
        return balance !== undefined ? { ...token, balance } : token;
      }),
      networks: state.availableNetworks,
      methods: state.availableMethods,
    },
    selections: {
      toNetwork: state.toNetwork,
      fromNetwork: state.fromNetwork,
      token: state.selectedToken ? getToken(state.selectedToken.id).data : null,
      method: state.selectedMethod,
    },
    addresses: {
      getSender,
      getReceiver,
    },
    setState: generalSetter,
    bridge: {
      createNewBridgeFlow,
      canBridge,
    },
  };
}
