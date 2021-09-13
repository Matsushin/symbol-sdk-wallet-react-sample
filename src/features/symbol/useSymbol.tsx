import {Account, NetworkType} from "symbol-sdk";

export const useSymbol = () => {
  const createAccount = () => {
    const account = Account.generateNewAccount(NetworkType.TEST_NET)
    console.log(account)
    return account
  }

  return {
    createAccount
  }
}