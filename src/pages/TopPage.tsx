import {useSymbol} from "../features/symbol/useSymbol";
import { useToasts } from "react-toast-notifications";
import {useState} from "react";
import { useHistory } from 'react-router-dom';

const TopPage: React.FC = () => {
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { createAccount } = useSymbol()
  const { addToast } = useToasts()
  const history = useHistory();

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => setAddress(event.target.value);
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setSubmitting(true);
    event.preventDefault();
    setSubmitting(false);
    history.push(`/address/${address}`);
  }

  const onClickCreateAccount = () => {
    if (window.confirm('本当にアカウントを作成しますか？')) {
      const account = createAccount()
      addToast('アカウントを作成しました',
        {appearance: 'info', autoDismiss: true});
      console.log(account)

      // TODO: このタイミングで100XYM付与したい
    }
  }
  return (
    <div className="m-12">
      <h1 className="font-bold">アドレス入力</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-3" action="#" method="GET">
        <div className="mb-1">
          <label htmlFor="address" className="text-xs text-gray-700">アドレス</label>
        </div>
        <input id="address" name="address" type="text"
               required
               value={address}
               onChange={handleAddressChange}
               className="appearance-none relative block w-full px-3 py-2 border border-gray-100 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
        />
        <button
          type="submit"
          className="my-auto px-4 bg-transparent p-3 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400 focus:outline-none"
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
    </div>
  )
}

export default TopPage