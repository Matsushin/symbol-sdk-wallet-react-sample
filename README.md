## 概要
- 仮想通貨Symbol(XYM)の送金ができるサンプルアプリ

## サンプルアプリURL
- https://matsushin.github.io/symbol-sdk-wallet-react-sample/

## テストネットでのXYM受け取りURL
- http://faucet.testnet.symboldev.network/
  - 例えばサンプルアプリ内でアカウントを発行して上記URLからテスト用のXYMを受け取ることができます

### 機能
- アカウントの作成
- Symbol(XYM)の残高確認
- Symbol(XYM)の送金

### 補足
- **このサンプルアプリではSymbolのテストネットを利用するため、実際の金銭のやりとりが発生することは一切ありません。** あくまでテストです。

### バージョン
- react 17.0.2
- symbol-sdk 1.0.1
- tailwind 2.2.15

## 環境構築
### アプリ初期設定
```
$ yarn install
```

## 起動・終了
### 起動コマンド

以下のコマンドで起動します。

```
$ yarn start
```

### 確認
- フロント側：http://localhost:3000/

### 終了
Ctrl+C

## その他
### テストユーザ
- アドレス TAIB4ZQU45R6DS2YINXCWOMFS4BRZL72DOKI4WI
- 秘密鍵 F8976A41AE9CDBAD2201A4F4ED0BF0F391FA25F0B5C52D069F724BDF02F0CF2A
