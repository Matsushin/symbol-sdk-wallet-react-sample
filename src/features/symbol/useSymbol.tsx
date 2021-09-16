import {Account, Address, NetworkType, RepositoryFactoryHttp} from "symbol-sdk";
import Long from "long";
import assert from "assert";
import {useMemo, useState} from "react";

const getNetwork = async () => {
  assert(process.env.REACT_APP_NODE_URL);
  const nodeUrl = process.env.REACT_APP_NODE_URL;

  // ブロックチェーン上の各種データにアクセスするための「リポジトリ」のファクトリ
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl,  {
    // ブラウザ環境の WebSocket API を注入
    websocketInjected: WebSocket,
    // ノードURL から WebSocket URL を生成
    websocketUrl: nodeUrl.replace('http', 'ws') + '/ws',
  });
  // ネットワークタイプ（Mainnet なのか Testnet なのか）
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  // ブロックチェーンの初期ブロックが生成されたときの時間（Unixtime秒）。トランザクションの期限を設定するときに使用する。
  const epochAdjustment = await repositoryFactory.getEpochAdjustment().toPromise();
  // ブロックチェーンの初期ブロックのハッシュ値。トランザクションに署名するときに使用する。
  const networkGenerationHash = await repositoryFactory.getGenerationHash().toPromise();
  // ネットワーク通貨のモザイクIDを取得（XYMのモザイクID）
  const networkCurrencyMosaicId = (await repositoryFactory.getCurrencies().toPromise()).currency.mosaicId;
  assert(networkCurrencyMosaicId);
  // 各種ネットワークパラメータを取得できるリポジトリ
  const networkHttp = repositoryFactory.createNetworkRepository();
  // 現在のトランザクション手数料の係数を取得（ノードによって、ネットワークの状況によって変化する参考値）
  const transactionFees = await networkHttp.getTransactionFees().toPromise();

  // TODO: 物によっては呼び出す度にノードへのアクセスが発生するため、以下の戻り値はキャッシュしたほうがいいでしょう。
  return {
    repositoryFactory,
    epochAdjustment,
    networkGenerationHash,
    networkCurrencyMosaicId,
    transactionFees,
    networkType,
  };
}

const getAccountBalance = async (address: string) => {
  const { repositoryFactory, networkCurrencyMosaicId } = await getNetwork();

  return repositoryFactory.createAccountRepository()
    .getAccountInfo(Address.createFromRawAddress(address))
    .toPromise()
    .then((accountInfo) => {
      // XYM だけを合計する（配列にはモザイクがユニークで現れるが、一応 reduce で合計）
      return accountInfo.mosaics
        .filter((mosaic) => mosaic.id.equals(networkCurrencyMosaicId))
        .reduce((acc, curr) => acc.add(Long.fromString(curr.amount.toString())), Long.ZERO);
    });
}

export const useSymbol = (address?: string) => {
  const [balance, setBalance] = useState(Long.ZERO);

  useMemo(() => {
    if (!address) return
    getAccountBalance(address)
      .then((balance) => {
        setBalance(balance);
      })
      .catch(console.error);
  }, [address])

  const createAccount = () => {
    const account = Account.generateNewAccount(NetworkType.TEST_NET)
    console.log(account)
    return account
  }

  return {
    createAccount,
    balance
  }
}