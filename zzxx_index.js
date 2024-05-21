//声明需要的模块
let request = require("request");
let fs = require("fs");
// 输入配置
let config = {
  id: 15619, // 书籍号
  chapterId: 1, // 开始章节
  totalChapterNum: 2, // 总章节数 不设置就是全本
};
// 爬取内容
let book = {
  title: "", // 书名
  menu: [], // 章节目录
  content: [], // 内容 {id: 1, chapter: '第一章', text: '...'}
};

let get = () => {
  //发起请求
  request(
    `https://m.zzxx.org/xs/${config.id}/${
      book.menu[config.chapterId - 1]
    }.html`,
    function (error, response, body) {
      try {
        if (!error && response.statusCode == 200) {
          if (book.title === "") {
            //获取书籍名称
            book.title = body
              .split("info.book_name = '")[1]
              .split("info.author = ")[0]
              .replace("';", "")
              .replace("\n", "");

            console.log("title:", book.title);
          }
          // 获取章节标题
          let chapter = body
            .match(/<h1 class="title">([\s\S]*)<\/h1>/i)[0]
            .split("</h1>")[0]
            .replace('<h1 class="title">', "");

          // 截取书籍具体内容
          let text = body
            .match(/<div id="text">([\s\S]*)<\/div>/i)[0]
            .split("</p>")[0]
            .replace('<div id="text"><p>', "")
            .replace(/<br>/g, "\r\n");

          book.content.push({
            id: config.chapterId,
            chapter: chapter,
            text: text,
          });

          config.chapterId++;
          console.log(`第${config.chapterId - 1}结束`);

          // 总共几章就填几
          if (
            config.chapterId <= (config.totalChapterNum || book.menu.length)
          ) {
            // 一秒爬一次
            setTimeout(get, 1000);
          } else {
            let ws = fs.createWriteStream("./books/" + book.title + ".txt");
            ws.write(book.title + "\r\n\r\n\r\n", "utf8");
            book.content.forEach((item) => {
              ws.write(item.chapter + "\r\n\r\n", "utf8");
              ws.write(item.text + "\r\n\r\n\r\n", "utf8");
            });
            ws.end();
            console.log(" 正在写入...");
            ws.on("finish", () => console.log("写入完成！"));
            ws.on("error", (error) => console.log("写入错误！", error));
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  );
};

// 获取目录
const getMenu = () => {
  request(
    `https://m.zzxx.org/xs/${config.id}/all.html`,
    function (error, response, body) {
      try {
        if (!error && response.statusCode == 200) {
          // 爬取目录
          book.menu = body
            .match(/<ul class="chapter">([\s\S]*)<\/ul>/i)[0]
            .match(
              new RegExp(`<a href="\/xs\/${config.id}\/([\\s\\S]*)<\/a>`, "i")
            )[0]
            .split(`<li><a href="\/xs\/${config.id}\/`)
            .map((item) => item.split(".html")[0])
            .map((item) => item.replace(`<a href="\/xs\/${config.id}\/`, ""));
          // 爬取书籍
          get();
        }
      } catch (err) {
        console.log(err);
      }
    }
  );
};

getMenu();
