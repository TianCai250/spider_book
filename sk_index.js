const request = require("request");
const fs = require("fs");
const cheerio = require("cheerio");

// 输入配置
let config = {
  id: 537884, // 书籍号
  chapterId: 448, // 开始章节
  totalChapterNum: 0, // 总章节数 不设置就是全本
};

// 爬取内容
let book = {
  title: "", // 书名
  menu: [], // 章节目录
  content: [], // 内容 {id: 1, chapter: '第一章', text: '...'}
};

// 获取具体内容
const get = () => {
  request(
    `https://sk.3qxsw.org${book.menu[config.chapterId - 1]}`,
    function (error, response, body) {
      try {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(body);
          // 获取章节标题
          const chapterTitle = $(".nav_name h1").text();
          // 获取章节内容
          const content = $("#novelcontent")
            .html()
            .split('<p align="center">')[0]
            .replace(/<p>/g, "")
            .replace(/<\/p>/g, "\r\n");
          book.content.push({
            id: config.chapterId,
            chapter: chapterTitle,
            text: content,
          });
          const nextEl = $(Array.from($(".page_chapter ul li .p4"))[0]);
          config.chapterId++;
          if (nextEl.text().indexOf("下一页") > -1) {
            // 如果存在下一页
            getNext(nextEl[0].attribs.href);
          } else {
            // 下一章
            console.log(`第${config.chapterId - 1}结束`);
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
              ws.on("error", () => console.log("写入错误！"));
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  );
};

// 下一页
const getNext = (href) => {
  request(`https://sk.3qxsw.org${href}`, function (error, response, body) {
    try {
      const $ = cheerio.load(body);
      // 获取章节内容
      const content = $("#novelcontent")
        .html()
        .split('<p align="center">')[0]
        .replace(/<p>/g, "")
        .replace(/<\/p>/g, "\r\n");
      book.content[book.content.length - 1].text += content;
      const nextEl = $(Array.from($(".page_chapter ul li .p4"))[0]);
      if (nextEl.text().indexOf("下一页") > -1) {
        // 如果存在下一页
        setTimeout(() => {
          getNext(nextEl[0].attribs.href);
        }, 1000);
      } else {
        console.log(`第${config.chapterId - 1}结束`);
        if (config.chapterId <= (config.totalChapterNum || book.menu.length)) {
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
          ws.on("error", () => console.log("写入错误！"));
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
};

// 目录页链接列表
let menuHrefList = [];
// 获取目录页链接列表
const getMenuPage = () => {
  request(
    `https://sk.3qxsw.org/xiaoshuo/${config.id}/#all`,
    function (error, response, body) {
      try {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(body);
          // 获取书籍名称
          book.title = $(".nav_name h1").text();
          // 获取目录链接
          menuHrefList = Array.from($("#indexselect option"))
            .slice(0, Array.from($("#indexselect option")).length / 2)
            .map((item) => item.attribs.value);
          getMenu();
        }
      } catch (err) {
        console.log(err);
      }
    }
  );
};

// 目录链接索引号
let menuIndex = 0;
// 根据目录页链接获取目录
const getMenu = () => {
  request(
    `https://sk.3qxsw.org${menuHrefList[menuIndex]}`,
    function (error, response, body) {
      try {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(body);
          // 获取目录列表
          book.menu = [
            ...book.menu,
            ...Array.from($(".info_chapters ul.p2:nth-of-type(2) li a")).map(
              (item) => item.attribs.href
            ),
          ];
          console.log(`获得目录数：${book.menu.length}`);
          if (menuIndex < menuHrefList.length - 1) {
            menuIndex++;
            setTimeout(getMenu, 1000);
          } else {
            console.log("开始获取具体内容...");
            // 爬取书籍
            get();
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  );
};

getMenuPage();
