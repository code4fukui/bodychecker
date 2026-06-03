# BodyChecker / MC780A.js

TANITA MC-780A のシリアル出力を Web Serial API で受信し、測定値の表示、保存、CSV入出力、QR共有を行うWebアプリです。

## ファイル

- `index.html`: ChromeでUSBシリアル接続して測定値を表示する管理画面
- `user.html`: QRコードから受け取った測定データを日付ごとに記録する利用者向け画面
- `MC780A.js`: MC-780Aのシリアル出力/SD CSVをパースするESモジュール
- `MC780A.test.js`: パーサのDenoテスト
- `MC780A.example.js`: パーサ利用例

## 起動

ESモジュールとWeb Serialを使うため、HTTPサーバー経由で開きます。

```sh
python3 -m http.server 8000
```

Chromeで開きます。

```text
http://localhost:8000/index.html
```

Web Serial APIはChrome系ブラウザで動作します。USBシリアル機器へのアクセスは、HTTPSまたはlocalhost上でユーザー操作から許可する必要があります。

## 測定する

1. MC-780AをUSBシリアルとしてPCに接続します。
2. Chromeで `index.html` を開きます。
3. 必要に応じて `baud` を選びます。通常は `9600` です。
4. `接続` を押して、表示されたUSBシリアルポートを選択します。
5. MC-780Aで測定します。
6. 受信した測定値が画面に表示されます。

表示される主な項目:

- 体重
- 体脂肪率
- 筋肉量
- 脂肪量
- BMI
- 内臓脂肪レベル
- 体水分率
- 基礎代謝量
- SMI
- 部位別の脂肪率、筋肉量、脂肪スコア、筋肉スコア

### 項目の説明

#### 筋肉スコア

筋肉スコアは、MC-780A が出す「筋肉量評価」の値で、-4 から +4 の9段階で、同じ性別・体格などの基準に対して、その部位や全身の筋肉量が少ないか多いかを示します。

- 0: 標準付近
- +1 から +4: 筋肉量が多め
- -1 から -4: 筋肉量が少なめ

#### SMI

SMI は Skeletal Muscle Mass Index、日本語だとだいたい 骨格筋量指数 です。

MC-780A の文脈では、四肢の骨格筋量を身長の二乗で割った値です。

SMI = 四肢骨格筋量 kg / 身長 m^2

つまり BMI が「体重 / 身長²」なのに対して、SMI は「腕・脚の筋肉量 / 身長²」を見ます。

SMI は筋肉量低下、サルコペニア評価などでよく使われる指標です。

## 基準値との差分

MC-780Aの出力に標準値が含まれる場合、以下の差分を表示します。

- 体重: 標準体重との差
- 体脂肪率: 標準体脂肪率との差
- 筋肉量: 標準筋肉量との差

SMIと内臓脂肪レベルは目安レンジとの差を表示します。

- SMI: 男性 `7.0`、女性 `5.7` を低筋量目安として表示
- 内臓脂肪レベル: `12` を健康範囲上限として表示

## 保存履歴

通常モードでは、受信した測定データは自動でブラウザのIndexedDBに保存されます。

保存先:

- DB名: `mc780a-monitor`
- Store名: `measurements`

右側の `保存履歴` から過去の測定を選択すると、そのデータを個別に再表示できます。

`クリア` は画面表示と受信カウントを初期化します。IndexedDBに保存済みの履歴は削除しません。

## プライバシーモード

`プライバシーモード` をONにすると、以後の測定データをIndexedDBに保存しません。

このモードでできること:

- 受信した最新データを画面表示する
- 最新データをQRコード化する

このモードでしないこと:

- 保存履歴への追加
- CSV出力対象への追加
- IndexedDBへの保存

画面に値を出したくない場合は、測定後に `QR表示` をONにしてください。QRモード中は測定値、履歴、全項目、受信ログを隠し、大きなQRコードだけを表示します。

## QR表示

`QR表示` はトグル式です。

- OFF: 測定値を表示
- ON: 測定値欄の代わりに大きなQRコードを表示

QRコードには、以下のURLに続く測定データが入ります。

```text
https://code4fukui.github.io/bodychecker/user.html?
```

QRに含めるデータは、利用者が記録・閲覧するためのサマリです。シリアルの生データ全体やIndexedDB全体は含めません。

## user.html

`user.html` はQRコードから受け取ったデータを表示し、ブラウザの `localStorage` に保存します。

使い方:

1. `index.html` で測定します。
2. 必要に応じて `プライバシーモード` をONにします。
3. `QR表示` をONにします。
4. 利用者のスマートフォンでQRコードを読み取ります。
5. `user.html` が開き、測定データが日付ごとに記録されます。

同じ測定データを再度読み込んだ場合は、重複登録しません。

## CSV出力

`CSV出力` を押すと、IndexedDBに保存済みの測定データをCSVとしてダウンロードします。

CSV列:

```text
savedAt,measuredAt,subjectId,model,weightKg,bodyFatPercent,recordJson
```

`recordJson` にはパース済み測定データ全体がJSON文字列として入ります。

## CSV読込

`CSV読込` を押して、`CSV出力` で保存したCSVを選択すると、IndexedDBに追加インポートします。

注意:

- 既存データは削除しません。
- 読み込んだデータは保存履歴に追加されます。
- 同一データの重複チェックは行いません。

## MC780A.jsの使い方

```js
import { MC780A } from "./MC780A.js";

const record = MC780A.parse(serialText, { format: "serial" });
console.log(record.fields.weightKg);
console.log(record.fields.bodyFatPercent);
```

主なAPI:

- `MC780A.parse(input, options)`: 自動判定または指定形式でパース
- `parseSerial(input)`: シリアル出力をパース
- `parseSDCSV(input)`: SDカードCSVをパース

## テスト

```sh
deno test MC780A.test.js
```

## 注意

- Web Serialは対応ブラウザが限られます。Chrome系ブラウザを使ってください。
- QRコードに含まれるURLは、読み取った人がアクセスできる形式の測定データを含みます。QRコードの取り扱いには注意してください。
- プライバシーモードは新しく受信する測定データを保存しない機能です。既に保存済みのIndexedDBデータは削除しません。
