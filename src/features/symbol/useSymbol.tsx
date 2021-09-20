import {
  Account,
  Address,
  Deadline,
  Mosaic,
  NetworkType, PlainMessage,
  RepositoryFactoryHttp, SignedTransaction, Transaction,
  TransferTransaction,
  UInt64
} from "symbol-sdk";
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

  const createTransferTx = async (recipientAddr: string, amount: Long, message: string) => {
    const { networkType, epochAdjustment, networkCurrencyMosaicId, transactionFees } = await getNetwork();

    return TransferTransaction.create(
      // トランザクションの有効期限。期限までにブロックチェーンで承認されなければ破棄される（＝失敗する）。
      // ここでは何も時間を指定してないので、デフォルトの2時間。
      Deadline.create(epochAdjustment),
      // 受取人のアドレス
      Address.createFromRawAddress(recipientAddr),
      // 送金するモザイクと金額（ここではネイティブ通貨の XYM を送ります）
      [new Mosaic(networkCurrencyMosaicId, UInt64.fromNumericString(amount.toString()))],
      // トランザクションに好きなメッセージを添付できます。
      PlainMessage.create(message),
      // Mainnet なのか Testnet なのか
      networkType)
      // 手数料率の「最大値」を設定。ここではノードから提示される平均的な処理速度の手数料率を使用する。
      // 手数料は `手数料率ｘトランザクションサイズ` で決まりますが、トランザクションを実行するまで厳密には決まりません。
      // ここで設定するのは支払いを許容する最大の手数料で、最終的に支払う手数料は必ずこれ以下になります。
      .setMaxFee(transactionFees.averageFeeMultiplier);
  }

  const getAccount = async (signerPrivateKey: string) => {
    const { networkType } = await getNetwork();
    return Account.createFromPrivateKey(signerPrivateKey, networkType);
  }

  const signTx = async (tx: Transaction, signer: Account) => {
    const { networkGenerationHash } = await getNetwork();

    // networkGenerationHash を指定する事で、そのネットワークでのみ通用するトランザクションになります。
    // つまり間違ったネットワークでアナウンスしておかしなことにならない様にできます。
    return signer.sign(tx, networkGenerationHash);
  }

  const sendXym = async (recipient: string, amount: Long, message: string, privateKey: string) => {
    const tx = await createTransferTx(recipient, amount, message);
    const signer = await getAccount(privateKey);
    const signedTx = await signTx(tx, signer);
    await announceTx(signedTx);
  }

  const announceTx = async (signedTx: SignedTransaction) => {
    const { repositoryFactory } = await getNetwork();

    // アナウンスしたら直ぐに Promise が解決されます。トランザクションの承認までは待ちません。
    return repositoryFactory
      .createTransactionRepository()
      .announce(signedTx)
      .toPromise();
  }

  return {
    createAccount,
    getAccountBalance,
    balance,
    sendXym
  }
}