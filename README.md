# spider_book

## 使用

- 在以下网站找到想要爬取的小说，从 url 中找到书籍号
  http://www.999txt.cc/
  https://m.zzxx.org/xs/15619/all.html
  如:

```js
let config = {
  id: 89993, // 书籍号
  totalChapterNum: 448, // 爬取章节数  不设置就是全本
};
```

- 运行
  start_999 对应http://www.999txt.cc/
  start_zzxx 对应https://m.zzxx.org/xs/15619/all.html

```cmd
npm run start_999
npm run start_zzxx
```
