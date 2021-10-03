import {useSymbol} from "../features/symbol/useSymbol";
import {useState} from "react";
import { useHistory } from 'react-router-dom';
import {useToasts} from "react-toast-notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import copy from 'clipboard-copy'
import Long from "long";

// XYM → Micro XYM へ変換
const fromXYM = (xym: string) => {
  const [integer, decimal] = xym.split('.');

  return Long.fromString(integer).mul(1000000).add(
    Long.fromString(decimal ? (decimal + '000000').slice(0, 6) : '0')
  );
}

const TopPage: React.FC = () => {
  const [address, setAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPrivateKey, setNewPrivateKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("")
  const [showModal, setShowModal] = useState(false)
  const { createAccount, sendXym, waitForConfirmTx } = useSymbol()
  const history = useHistory();
  const { addToast } = useToasts()

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => setAddress(event.target.value);
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setSubmitting(true);
    event.preventDefault();
    const regex = /^T[a-zA-Z0-9]{38}$/
    if (!regex.test(address)) {
      setErrorText('形式が正しくありません')
    } else {
      history.push(`/address/${address}`);
    }
    setSubmitting(false);
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const onClickCreateAccount = async () => {
    if (window.confirm('本当にアカウントを作成しますか？アカウント作成時に送金テスト用に10XYM送金されます。')) {
      const account = createAccount()
      const createdAddress = account.address.plain()
      setNewAddress(createdAddress)
      setNewPrivateKey(account.privateKey)
      setShowModal(true)

      try {
        const { signer, signedTx } = await sendXym(
          createdAddress,
          fromXYM('10'),
          '',
          '42FD6538F6DF9B876425BEFB3DF0E0FD8E2D9E8FA4FC87773D6FA603AA803C9E' // テストXYM送金用アカウント秘密鍵
        )

        addToast('トランザクションをアナウンスしました。完了までお待ちください',
          {appearance: 'info', autoDismiss: true});

        await waitForConfirmTx(signer, signedTx);

        addToast('送金完了しました。着金までしばらくお待ちください',
          {appearance: 'success', autoDismiss: true});
      } catch (e) {
        console.error(e);
        addToast(`エラーが発生しました。${e.message}`, {appearance: 'error', autoDismiss: true});
      }
    }
  }

  const copyAddress = async () => {
    await copy(newAddress)
    addToast('アドレスをコピーしました。', { appearance: 'success', autoDismiss: true });
  }

  const copyPrivateKey = async () => {
    await copy(newPrivateKey)
    addToast('秘密鍵をコピーしました。', { appearance: 'success', autoDismiss: true });
  }

  return (
    <div className="m-12">
      <h1 className="font-bold">アドレス入力</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-3" action="#" method="GET">
        <div className="mb-1">
          <label htmlFor="address" className={`text-xs ${ errorText ? 'text-red-700' : 'text-gray-700' }`}>アドレス</label>
        </div>
        <div>
          <input id="address" name="address" type="text"
                 required
                 value={address}
                 onChange={handleAddressChange}
                 className={`appearance-none relative block w-1/3 px-3 py-2 border ${ errorText ? 'border-red-700' : 'border-gray-100 focus:ring-yellow-500 focus:border-yellow-500' } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:z-10 sm:text-sm`}
          />
          <div className="mt-1 text-xs text-red-700">{errorText}</div>
        </div>
        <button
          type="submit"
          className="my-auto text-sm px-8 py-2 px-4 bg-transparent rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 focus:outline-none"
          disabled={submitting}
        >
          次へ
        </button>
      </form>
      <div className="mt-4" >
        <a
          className="my-auto text-yellow-600 hover:text-yellow-400 hover:underline"
          onClick={onClickCreateAccount}
        >
          アカウントを作成する
        </a>
      </div>
      <div
        className={`modal fixed w-full h-full top-0 left-0 flex items-center justify-center${showModal ? '' :' opacity-0 pointer-events-none '}`}>
        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-50" />

        <div className="modal-container bg-white w-11/12 md:max-w-3xl mx-auto rounded shadow-lg z-50 overflow-y-auto">

          <div className="modal-content py-4 text-left px-6">
            <div className="flex justify-between items-center pb-3">
              <p className="text-xl font-bold">
                アカウントを作成しました
                <br />
                <span className="text-sm font-normal">以下の情報を失くさないように保管してください</span>
              </p>
            </div>
            <div className="mt-2 space-y-2" >
              <div className="mb-1">
                <label className="text-xs text-gray-700">アドレス</label>
              </div>
              <p>
                {newAddress}
                <a
                  className="ml-2 my-auto text-yellow-600 hover:text-yellow-400 hover:underline"
                  onClick={copyAddress}
                >
                  <FontAwesomeIcon icon={faCopy} />
                  コピー
                </a>
              </p>
              <div className="mb-1">
                <label className="text-xs text-gray-700">秘密鍵</label>
              </div>
              <p>
                {newPrivateKey}
                <a
                  className="ml-2 my-auto text-yellow-600 hover:text-yellow-400 hover:underline"
                  onClick={copyPrivateKey}
                >
                  <FontAwesomeIcon icon={faCopy} />
                  コピー
                </a>
              </p>
              <button
                type="button"
                onClick={closeModal}
                className="my-auto text-sm px-8 py-2 px-4 bg-transparent rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 focus:outline-none"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopPage