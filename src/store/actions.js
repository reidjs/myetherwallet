import { overide, WalletWrapper } from '@/wallets';
import Web3 from 'web3';

const addNotification = function({ commit, state }, val) {
  const newNotif = {};
  Object.keys(state.notifications).forEach(item => {
    newNotif[item] = state.notifications[item];
  });

  if (!Array.isArray(newNotif[val[0]])) newNotif[val[0]] = [];

  newNotif[val[0]].push({
    title: val[2],
    read: false,
    timestamp: new Date(),
    body: val[1].message ? val[1].message : val[1],
    expanded: false
  });
  commit('ADD_NOTIFICATION', newNotif);
};

const addCustomPath = function({ commit, state }, val) {
  const newPaths = { ...state.customPaths };
  newPaths[val.dpath] = { label: val.label, dpath: val.dpath };
  commit('ADD_CUSTOM_PATH', newPaths);
};

const checkIfOnline = function({ commit }) {
  commit('CHECK_IF_ONLINE');
};

const clearWallet = function({ commit, state }) {
  if (state.wallet.identifier === 'MEWconnect') {
    state.wallet.wallet.mewConnectDisconnect();
  }
  commit('CLEAR_WALLET');
};

const createAndSignTx = function({ commit }, val) {
  commit('CREATE_AND_SIGN_TX', val);
};

const decryptWallet = function({ commit }, wallet) {
  const wrappedWallet = new WalletWrapper(wallet);
  const web3Instance = new Web3(
    new Web3.providers.HttpProvider(
      'https://mainnet.infura.io/d4n94gUUYv9NWJnUPDdL'
    )
  );
  // const _web3 = state.web3;
  overide(web3Instance, wrappedWallet, this._vm.$eventHub);
  commit('DECRYPT_WALLET', wrappedWallet);
  commit('SET_WEB3_INSTANCE', web3Instance);
};

const setAccountBalance = function({ commit }, balance) {
  commit('SET_ACCOUNT_BALANCE', +balance);
};

const setGasPrice = function({ commit }, gasPrice) {
  commit('SET_GAS_PRICE', gasPrice);
};

const setState = function({ commit }, stateObj) {
  commit('INIT_STATES', stateObj);
};

const setWeb3Instance = function({ commit, state }, web3) {
  // console.log('web3.eth', web3.eth);
  if (web3.eth === undefined) {
    // eslint-disable-next-line
    // const web3Instance = new web3(new web3.providers.HttpProvider(state.network.url));
    const web3Instance = new web3(
      new web3.providers.HttpProvider(
        'https://mainnet.infura.io/d4n94gUUYv9NWJnUPDdL'
      )
    );
    // console.log('web3Instance', web3Instance);
    commit(
      'SET_WEB3_INSTANCE',
      overide(web3Instance, state.wallet, this._vm.$eventHub)
    );
  } else {
    commit(
      'SET_WEB3_INSTANCE',
      overide(web3, state.wallet, this._vm.$eventHub)
    );
  }
};

const switchNetwork = function({ commit }, networkObj) {
  // check if wallet is hardware.  if true, check if it supports this network. if not, do nothing
  commit('SWITCH_NETWORK', networkObj);
};

const updateNotification = function({ commit, state }, val) {
  // address, index, object
  const newNotif = {};
  Object.keys(state.notifications).forEach(item => {
    newNotif[item] = state.notifications[item];
  });

  newNotif[val[0]][val[1]] = val[2];
  commit('UPDATE_NOTIFICATION', newNotif);
};

const updatePageState = function({ commit }, arr) {
  commit('CHANGE_PAGE_STATE', arr);
};

export default {
  addNotification,
  addCustomPath,
  checkIfOnline,
  clearWallet,
  createAndSignTx,
  decryptWallet,
  setAccountBalance,
  setGasPrice,
  setState,
  setWeb3Instance,
  switchNetwork,
  updateNotification,
  updatePageState
};
