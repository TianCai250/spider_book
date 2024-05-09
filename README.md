# spider_book

## 使用

- 在该网站找到想要爬取的小说:http://www.999txt.cc/,配上链接上的书籍id和章节id
  如:

```js
let config = {
  id: 89993, // 书籍号
  chapterId: 53729272, // 起始章节id
  totalChapterNum: 448, // 总章节数
};
```

- 运行

```cmd
npm start
```
