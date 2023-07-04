const http = require("http");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const server = http.createServer((req, res) => {
  console.log("from_server", new Date());
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Hello, World!");
  res.end();
});

async function main() {
  console.log("开始等待5秒钟...");
  await sleep(5000);
  console.log("等待结束！");
  server.listen(8080, () => {
    console.log("Server is running on port 8080");
  });
}

main();
