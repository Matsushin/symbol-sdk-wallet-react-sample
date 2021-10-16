import {useSymbol} from "../features/symbol/useSymbol";
import {useParams} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import {useToasts} from "react-toast-notifications";
import Long from "long";

const AccountPage: React.FC = () => {
  const { address } = useParams<{address: string}>()
  const { sendXym, getAccountBalance, waitForConfirmTx, fromXYM, toXYM } = useSymbol()
  const [balance, setBalance] = useState(Long.ZERO)
  const { addToast } = useToasts()
  const [submitting, setSubmitting] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAamount] = useState("");
  const [message, setMessage] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [errorRecipientText, setErrorRecipientText] = useState("")
  const [errorAmountText, setErrorAmountText] = useState("")
  const [errorPrivateKeyText, setErrorPrivateKeyText] = useState("")

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => setRecipient(event.target.value);
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => setAamount(event.target.value);
  const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(event.target.value);
  const handlePrivateKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => setPrivateKey(event.target.value);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setSubmitting(true);
    event.preventDefault();

    if (!validate()) {
      setSubmitting(false);
      return
    }

    try {
      const { signer, signedTx } = await sendXym(recipient, fromXYM(amount), message, privateKey)

      addToast('トランザクションをアナウンスしました。完了までお待ちください',
        {appearance: 'info', autoDismiss: true});

      await waitForConfirmTx(signer, signedTx);

      addToast('送金完了しました',
        {appearance: 'success', autoDismiss: true});
      updateBalance();
    } catch (e) {
      console.error(e);
      addToast(`エラーが発生しました。${e.message}`, {appearance: 'error', autoDismiss: true});
    }
    setSubmitting(false);
  }

  const validate = () => {
    const recipientRegex = /^T[a-zA-Z0-9]{38}$/
    if (!recipientRegex.test(recipient)) {
      setErrorRecipientText('形式が正しくありません')
    }

    const amountRegex = /^([1-9]\d*|0)(\.\d+)?$/
    if (!amountRegex.test(amount)) {
      setErrorAmountText('形式が正しくありません')
    }

    const privateKeyRegex = /^[a-fA-F0-9]{64}$/
    if (!privateKeyRegex.test(privateKey)) {
      setErrorPrivateKeyText('形式が正しくありません')
    }
    return (errorRecipientText === "" && errorAmountText === "" && errorPrivateKeyText === "")
  }

  const updateBalance = useCallback(() => {
    getAccountBalance(address)
      .then((b) => {
        setBalance(b);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    updateBalance();
  }, [updateBalance]);

  return (
    <div>
      <div className="px-6 py-2 text-sm shadow-outline">
        <p><span className="text-gray-600">アドレス： </span>{address}</p>
        <p><span className="text-gray-600">XYM残高： </span>{toXYM(balance)}</p>
      </div>
      <div className="bg-gray-100 h-full">
        <div className="p-4">
          <div className="p-8 bg-white shadow-sm w-3/5">
            <h1 className="font-bold">送金</h1>
            <form onSubmit={onSubmit} className="mt-8 space-y-3" action="#" method="GET">
              <div className="mt-2 mb-1">
                <label htmlFor="recipient" className={`text-xs ${ errorRecipientText ? 'text-red-700' : 'text-gray-700' }`}>宛先</label>
              </div>
              <div>
                <input id="recipient" name="recipient" type="text"
                       required
                       value={recipient}
                       onChange={handleRecipientChange}
                       placeholder="送金したい相手のアドレスを入力してください"
                       className={`appearance-none relative block w-3/5 px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none ${ errorRecipientText ? 'border-red-700' : 'border-gray-100 focus:ring-yellow-500 focus:border-yellow-500' } focus:z-10 sm:text-sm`}
                />
                <div className="mt-1 text-xs text-red-700">{errorRecipientText}</div>
              </div>
              <div className="mt-2 mb-1">
                <label htmlFor="amount" className={`text-xs ${ errorAmountText ? 'text-red-700' : 'text-gray-700' }`}>金額</label>
              </div>
              <div>
                <input id="amount" name="amount" type="number"
                       required
                       value={amount}
                       onChange={handleAmountChange}
                       className={`appearance-none w-1/5 relative block px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none ${ errorAmountText ? 'border-red-700' : 'border-gray-100 focus:ring-yellow-500 focus:border-yellow-500' } focus:z-10 sm:text-sm`}
                />
                <div className="mt-1 text-xs text-red-700">{errorAmountText}</div>
              </div>
              <div className="mt-2 mb-1">
                <label htmlFor="recipient" className="text-xs text-gray-700">メッセージ</label>
              </div>
              <textarea id="message" name="message"
                     value={message}
                     onChange={handleMessageChange}
                     rows={4}
                     className="appearance-none relative block w-4/5 px-3 py-2 border border-gray-100 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              />
              <div className="mt-2 mb-1">
                <label htmlFor="privateKey" className={`text-xs ${ errorPrivateKeyText ? 'text-red-700' : 'text-gray-700' }`}>秘密鍵</label>
              </div>
              <div>
                <input id="privateKey" name="privateKey" type="text"
                       required
                       value={privateKey}
                       onChange={handlePrivateKeyChange}
                       placeholder="自身のアカウントの秘密鍵を入力してください"
                       className={`appearance-none relative block w-4/5 px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none ${ errorPrivateKeyText ? 'border-red-700' : 'border-gray-100 focus:ring-yellow-500 focus:border-yellow-500' } focus:z-10 sm:text-sm`}
                />
                <div className="mt-1 text-xs text-red-700">{errorPrivateKeyText}</div>
              </div>
              <button
                type="submit"
                className="text-sm px-8 py-2 bg-transparent rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 focus:outline-none"
                disabled={submitting}
              >
                送金
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage