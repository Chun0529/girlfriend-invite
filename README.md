# 要不要做我女朋友？

一個粉嫩、可愛、浪漫的單頁表白。沒有登入、沒有後端，打開就能玩。

公開網址：<https://mok0.syses.net/>

現有的約會邀請站 [date-invite](https://chun0529.github.io/date-invite/) 是另一個專案，互不覆蓋。

## 兩步

1. 「好哦 ♥」留下，「No 👋」會逃跑，每逃一次前者就變大一點。
2. 讀一封情書。可用 WhatsApp 回覆，或按「再看一次」。

## 客製名字與通知

編輯 `js/config.js`：

```js
window.INVITE_CONFIG = {
  you: "你",
  me: "我",
  notifyEmail: "johnmak05290529@gmail.com",
  web3formsKey: "你的 Web3Forms Access Key",
  whatsapp: "85264891242",
};
```

對方點「好哦」時，會寄一封信到綁定該 Access Key 的 Gmail。Access Key 本來就可以放在前端。「再看一次」不會重複寄信。

WhatsApp 是對方手機上的捷徑，不是自動傳訊。

第一次收到信時，請到 Gmail 或垃圾郵件匣確認 Web3Forms 的驗證信。

## 本機預覽

```bash
python -m http.server 4173
```

然後前往 <http://localhost:4173>
