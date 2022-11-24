import jsonServer from "json-server";
const server = jsonServer.create();
const jsonRouter = jsonServer.router("./data/db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonRouter);

server.listen(3000, () => {
  console.log("JSON Server is running");
});
