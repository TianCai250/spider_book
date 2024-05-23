# spider_book

## 使用

- 在以下网站找到想要爬取的小说，从 url 中找到书籍号
  http://www.999txt.cc/
  https://m.zzxx.org/xs/15619/all.html
  https://sk.3qxsw.org/xiaoshuo/537884/91681146_2.html
  如:

```js
let config = {
  id: 89993, // 书籍号
  chapterId: 1, // 开始章节
  totalChapterNum: 448, // 爬取章节数  不设置就是全本（最好别太多，可能会退出）
};
```

- 运行
  start_999 对应http://www.999txt.cc/
  start_zzxx 对应https://m.zzxx.org/xs/15619/all.html
  start_sk 对应https://sk.3qxsw.org/xiaoshuo/537884/91681146_2.html

```cmd
npm run start_999
npm run start_zzxx
npm run start_sk
```
