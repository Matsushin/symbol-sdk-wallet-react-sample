import {useSymbol} from "../features/symbol/useSymbol";
import { useToasts } from "react-toast-notifications";

const TopPage: React.FC = () => {
  const { createAccount } = useSymbol()
  const { addToast } = useToasts()
  const onClickCreateAccount = () => {
    const account = createAccount()
    addToast('アカウントを作成しました',
      {appearance: 'info', autoDismiss: true});
    console.log(account)
  }
  return (
    <div>
      <p>Top</p>
      <button
        type="button"
        className="my-auto ml-4 px-4 bg-transparent p-3 rounded-lg bg-red-500 text-white hover:bg-red-400 focus:outline-none"
        onClick={onClickCreateAccount}
      >
        アカウントを作成する
      </button>
    </div>
  )
}

export default TopPage