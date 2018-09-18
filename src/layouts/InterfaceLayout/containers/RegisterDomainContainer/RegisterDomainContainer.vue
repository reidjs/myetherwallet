<template>
  <div class="register-domain-container">
    <back-button :reset-view="resetView"/>
    <ens-bid
      v-show="uiState === 'nameAvailableAuctionNotStarted'"
      :cancel="cancel"
      :bid-amount="bidAmount"
      :bid-mask="bidMask"
      :secret-phrase="secretPhrase"
      :create-bid="createBid"
      :ens-name="domainName"/>
    <initial-state
      v-show="uiState === 'initial'"
      :domain-buy-button-click="domainBuyButtonClick"
      :check-domain="checkDomain"
      :loading="loading"
      @domainNameChange="updateDomainName"
    />
    <name-forbidden
      v-show="uiState === 'nameForbidden'"
      :domain-name="domainName"
    />
    <already-owned
      v-show="uiState === 'nameOwned'"
      :name-hash="nameHash"
      :label-hash="labelHash"
      :owner="owner"
      :resolver-address="resolverAddress"
      :deed-owner="deedOwner"
      :domain-name="domainName"
      :cancel="cancel"
    />
  </div>
</template>

<script>
import BackButton from '../../components/BackButton';
import EnsBid from './components/EnsBid';
import NameForbidden from './components/NameForbidden';
import InitialState from './components/InitialState';
import AlreadyOwned from './components/AlreadyOwned';
import EnsAbi from '@/helpers/ensAbi';
import RegistrarAbi from '@/helpers/registrarAbi';
import Misc from '@/helpers/misc';

export default {
  components: {
    'back-button': BackButton,
    'ens-bid': EnsBid,
    'initial-state': InitialState,
    'name-forbidden': NameForbidden,
    'already-owned': AlreadyOwned
  },
  props: {
    resetView: {
      type: Function,
      default: function() {}
    }
  },
  data() {
    return {
      domainName: '',
      loading: false,
      uiState: 'initial',
      bidAmount: 0,
      bidMask: 0,
      nameHash: '',
      labelHash: '',
      owner: '',
      resolverAddress: '',
      deedOwner: '',
      secretPhrase: ''
    };
  },
  methods: {
    async forEth() {
      const web3 = this.$store.state.web3;
      const ensContract = new web3.eth.Contract(
        EnsAbi,
        '0x314159265dd8dbb310642f98f50c066173c1259b'
      );

      this.labelHash = web3.utils.sha3(this.domainName);

      const ownerAddress = await ensContract.methods
        .owner(Misc.nameHash('eth', web3))
        .call();

      const auctionRegistrarContract = new web3.eth.Contract(
        RegistrarAbi,
        ownerAddress
      );
      const domainStatus = await auctionRegistrarContract.methods
        .entries(this.labelHash)
        .call();

      this.processResult(domainStatus);
    },
    async checkDomain() {
      const network = this.$store.state.network;
      this.loading = true;
      switch (network.type.name) {
        case 'ETH':
          await this.forEth();
          break;
        default:
          console.log('Lmao');
      }
    },
    processResult(res) {
      switch (res[0]) {
        case '0':
          this.loading = false;
          this.uiState = 'nameAvailableAuctionNotStarted';
          break;
        case '1':
          this.loading = false;
          console.log('Name is available and the auction has been started');
          break;
        case '2':
          this.getMoreInfo(res[1]);
          break;
        case '3':
          this.loading = false;
          this.uiState = 'nameIsForbidden';
          break;
        case '4':
          this.loading = false;
          console.log('Name is currently in the ‘reveal’ stage of the auction');
          break;
      }
    },
    cancel() {
      this.uiState = 'initial';
      this.clearInputs();
    },
    updateDomainName(value) {
      this.domainName = value;
    },
    async getMoreInfo(deedOwner) {
      const owner = await this.$store.state.ens.owner(this.domainName + '.eth');
      const resolverAddress = await this.$store.state.ens
        .resolver(this.domainName + '.eth')
        .resolverAddress();
      this.nameHash = Misc.nameHash(
        this.domainName + '.eth',
        this.$store.state.web3
      );

      this.deedOwner = deedOwner;
      this.owner = owner;
      this.resolverAddress = resolverAddress;
      this.uiState = 'nameOwned';
      this.loading = false;
    },
    createBid() {
      console.log('Lmao');
    },
    clearInputs() {
      this.domainName = '';
      this.loading = false;
      this.uiState = 'initial';
      this.bidAmount = 0;
      this.bidMask = 0;
      this.nameHash = '';
      this.labelHash = '';
      this.owner = '';
      this.resolverAddress = '';
      this.deedOwner = '';
      this.secretPhrase = '';
    },
    domainBuyButtonClick() {}
  }
};
</script>

<style lang="scss" scoped>
@import 'RegisterDomainContainer.scss';
</style>
