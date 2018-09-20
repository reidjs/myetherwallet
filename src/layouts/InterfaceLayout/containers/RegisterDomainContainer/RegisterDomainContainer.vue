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
      :domain-name="domainName"
      @updateSecretPhrase="updateSecretPhrase"
    />
    <initial-state
      v-show="uiState === 'initial'"
      :domain-buy-button-click="domainBuyButtonClick"
      :check-domain="checkDomain"
      :domain-name="domainName"
      :loading="loading"
      @domainNameChange="updateDomainName"
    />
    <name-forbidden
      v-show="uiState === 'nameIsForbidden'"
      :cancel="cancel"
      domain-name="hellothere!"
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
import RegistrarAbi from '@/helpers/registrarAbi';
import { Wordlist, Misc } from '@/helpers';

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
      bidAmount: 0.01,
      bidMask: 0.02,
      nameHash: '',
      labelHash: '',
      owner: '',
      resolverAddress: '',
      deedOwner: '',
      secretPhrase: '',
      ensContractMethods: function() {}
    };
  },
  methods: {
    async checkDomain() {
      const network = this.$store.state.network;
      const web3 = this.$store.state.web3;
      const ensContract = new web3.eth.Contract(
        network.type.ensAbi,
        network.type.ensResolver
      );

      this.loading = true;
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
        .call()
        .then(res => {
          return res;
        })
        .catch(err => {
          console.log(err);
        });

      this.processResult(domainStatus);
    },
    processResult(res) {
      switch (res[0]) {
        case '0':
          this.loading = false;
          this.generateKeyPhrase();
          this.uiState = 'nameAvailableAuctionNotStarted';
          break;
        case '1':
          this.loading = false;
          console.log('Name is available and the auction has been started');
          break;
        case '2':
          this.loading = false;
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
      let owner;
      let resolverAddress;
      try {
        owner = await this.$store.state.ens.owner(this.domainName + '.eth');
      } catch (e) {
        owner = '0x';
      }

      try {
        resolverAddress = await this.$store.state.ens
          .resolver(this.domainName + '.eth')
          .resolverAddress();
      } catch (e) {
        resolverAddress = '0x';
      }

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
      this.loading = false;
    },
    clearInputs() {
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
      this.domainName = '';
    },
    domainBuyButtonClick() {},
    updateSecretPhrase(e) {
      this.secretPhrase = e;
    },
    generateKeyPhrase() {
      const wordsArray = [];
      const min = 0;
      const max = Wordlist.length;

      for (let i = 0; i < 3; i++) {
        wordsArray.push(
          Wordlist[Math.floor(Math.random() * (max - min + 1)) + min]
        );
      }

      this.secretPhrase = wordsArray.join(' ');
    }
  }
};
</script>

<style lang="scss" scoped>
@import 'RegisterDomainContainer.scss';
</style>
