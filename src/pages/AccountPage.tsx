import {useSymbol} from "../features/symbol/useSymbol";
import {useParams} from "react-router-dom";
import {useState} from "react";
import {useToasts} from "react-toast-notifications";
import {from} from "rxjs/dist/types";
import Long from "long";

// Micro XYM → XYM へ変換
const toXYM = (microXYM: Long) => {
  const decimal = ('000000' + microXYM.mod(1000000).toString()).slice(-6)
    .replace(/0+$/g, '');
  const integer = microXYM.div(1000000).toString();

  return `${integer}${decimal && '.' + decimal}`;
}

// XYM → Micro XYM へ変換
const fromXYM = (xym: string) => {
  const [integer, decimal] = xym.split('.');

  return Long.fromString(integer).mul(1000000).add(
    Long.fromString(decimal ? (decimal + '000000').slice(0, 6) : '0')
  );
}

const AccountPage: React.FC = () => {
  const { address } = useParams<{address: string}>()
  const { balance, sendXym, getAccountBalance } = useSymbol(address)
  const { addToast } = useToasts()
  const [submitting, setSubmitting] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAamount] = useState("");
  const [message, setMessage] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const handleRecipientChange = (event: React.ChangeEvent<HTMLInputElement>) => setRecipient(event.target.value);
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => setAamount(event.target.value);
  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => setMessage(event.target.value);
  const handlePrivateKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => setPrivateKey(event.target.value);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setSubmitting(true);
    event.preventDefault();
    try {
      await sendXym(recipient, fromXYM(amount), message, privateKey)

      addToast('トランザクションをアナウンスしました！完了までお待ちください。',
        {appearance: 'info', autoDismiss: true});

      //await waitForConfirmTx(signer, signedTx);

      // addToast('送金完了しました！',
      //   {appearance: 'success', autoDismiss: true});
      // reset();
      // updateBalance();
      // updateTxs();
      setSubmitting(false);
      //getAccountBalance(address)
    } catch (e) {
      console.error(e);
      addToast('エラーが発生しました。', {appearance: 'error', autoDismiss: true});
    }

  }

  return (
    <div>
      <div className="px-6 py-2 text-sm shadow-outline">
        <p><span className="text-gray-600">アドレス： </span>{address}</p>
        <p><span className="text-gray-600">XYM残高： </span>{toXYM(balance)}</p>
      </div>
      <div className="bg-gray-100 h-screen">
        <div className="p-4">
          <div className="p-8 bg-white shadow-sm">
            <h1 className="font-bold">送金</h1>
            <form onSubmit={onSubmit} className="mt-8 space-y-3" action="#" method="GET">
              <div className="mt-2 mb-1">
                <label htmlFor="recipient" className="text-xs text-gray-700">宛先</label>
              </div>
              <input id="recipient" name="recipient" type="text"
                     required
                     value={recipient}
                     onChange={handleRecipientChange}
                     className="appearance-none relative block w-full px-3 py-2 border border-gray-100 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              />
              <div className="mt-2 mb-1">
                <label htmlFor="amount" className="text-xs text-gray-700">金額</label>
              </div>
              <input id="amount" name="amount" type="number"
                     required
                     value={amount}
                     onChange={handleAmountChange}
                     className="appearance-none relative block px-3 py-2 border border-gray-100 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              />
              <div className="mt-2 mb-1">
                <label htmlFor="recipient" className="text-xs text-gray-700">メッセージ</label>
              </div>
              <input id="message" name="message" type="text"
                     value={message}
                     onChange={handleMessageChange}
                     className="appearance-none relative block w-full px-3 py-2 border border-gray-100 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              />
              <div className="mt-2 mb-1">
                <label htmlFor="privateKey" className="text-xs text-gray-700">プライベートキー</label>
              </div>
              <input id="privateKey" name="privateKey" type="text"
                     required
                     value={privateKey}
                     onChange={handlePrivateKeyChange}
                     className="appearance-none relative block w-full px-3 py-2 border border-gray-100 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
              />
              <button
                type="submit"
                className="my-auto px-4 bg-transparent p-3 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 focus:outline-none"
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