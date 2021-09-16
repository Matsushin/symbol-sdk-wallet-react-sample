import {useSymbol} from "../features/symbol/useSymbol";
import {useParams} from "react-router-dom";

// Micro XYM → XYM へ変換
const toXYM = (microXYM: Long) => {
  const decimal = ('000000' + microXYM.mod(1000000).toString()).slice(-6)
    .replace(/0+$/g, '');
  const integer = microXYM.div(1000000).toString();

  return `${integer}${decimal && '.' + decimal}`;
}

const AccountPage: React.FC = () => {
  const { address } = useParams<{address: string}>()
  const { balance } = useSymbol(address)

  return (
    <div>
      <p>Account</p>
      <p>アドレス：{address}</p>
      <p>残高：{toXYM(balance)} XYM</p>
    </div>
  )
}

export default AccountPage