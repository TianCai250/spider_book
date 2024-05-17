//声明需要的模块
let request = require("request");
let fs = require("fs");
// 输入配置
let config = {
  id: 89993, // 书籍号
  totalChapterNum: 400, // 总章节数 不设置就是全本
};
// 爬取内容
let book = {
  title: "", // 书名
  content: [], // 内容 {id: 1, chapter: '第一章', text: '...'}
};

// 章节目录
let menu = [];
// 当前章节
let chapterId = 1;
// 当前章节的总页数
let totalPage = 0;
// 当前章节的页码
let page = 1;
//写入流
let ws;

let get = () => {
  //发起请求
  request(
    `http://www.999txt.cc/readbook/${config.id}/${
      menu[chapterId - 1]
    }_${page}.html`,
    function (error, response, body) {
      try {
        if (!error && response.statusCode == 200) {
          if (book.title === "") {
            //获取书籍名称
            let titleRegex = new RegExp(
              `<a href="\/txt\/${config.id}.html">([\\s\\S]*)<\/a>`,
              "i"
            );
            book.title = body
              .match(titleRegex)[0]
              .split("</a>")[0]
              .replace(`<a href="/txt/${config.id}.html">`, "");
            console.log("title:", book.title);
          }

          // 获取章节标题
          let chapter = body
            .match(/<h1 class="pt10">([\s\S]*)<\/h1>/i)[0]
            .split("</h1>")[0]
            .replace('<h1 class="pt10">', "");
          let pageInfo = chapter
            .split("（")[1]
            .replace("）", "")
            .split("/")
            .map((item) => Number(item));
          page = pageInfo[0];
          totalPage = pageInfo[1];
          // 截取书籍具体内容
          let text = body
            .match(/<div class="readcontent" id="rtext">([\s\S]*)<\/div>/i)[0]
            .split("</div>")[0]
            .replace('<div class="readcontent" id="rtext">', "")
            .split("<a style")[0]
            .replace(/<p>/g, "")
            .replace(/<\/p>/g, "\r\n");
          if (page === 1) {
            book.content.push({
              id: chapterId,
              chapter: chapter.split("（")[0],
              text: text,
            });
          } else {
            book.content[book.content.length - 1].text =
              book.content[book.content.length - 1].text + text;
          }

          if (page === totalPage) {
            // 下一章
            chapterId++;
            page = 1;
            totalPage = 0;
            console.log(`第${chapterId - 1}结束`);
          } else {
            page++;
          }

          // 总共几章就填几
          if (chapterId <= config.totalChapterNum || menu.length) {
            // 一秒爬一次
            setTimeout(get, 1000);
          } else {
            ws = fs.createWriteStream("./books/" + book.title + ".txt");
            ws.write(book.title + "\r\n\r\n\r\n", "utf8");
            book.content.forEach((item) => {
              ws.write(item.chapter + "\r\n\r\n", "utf8");
              ws.write(item.text + "\r\n\r\n\r\n", "utf8");
            });
            ws.end();
            console.log(" 正在写入...");
            ws.on("finish", () => console.log("写入完成！"));
            ws.on("error", () => console.log("写入错误！"));
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
    `http://www.999txt.cc/txt/${config.id}.html`,
    function (error, response, body) {
      try {
        if (!error && response.statusCode == 200) {
          // 爬取目录
          let regex = new RegExp(
            `<dd><a href="\/readbook\/${config.id}([\\s\\S]*)<\/a><\/dd>`,
            "i"
          );
          menu = body
            .match(
              /<div id="list-chapterAll" style="display:block;">([\s\S]*)<\/div>/i
            )[0]
            .match(regex)[0]
            .split("</a></dd>")
            .map(
              (item) =>
                item
                  .replace(`<dd><a href="/readbook/${config.id}/`, "")
                  .split(".html")[0]
            )
            .map((item) => item.replace(/[\r\n\t ]/g, ""));
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
