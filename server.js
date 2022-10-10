const Hapi = require("@hapi/hapi");
const { nanoid } = require("nanoid");
const routes = require("./routes");
(async () => {
  const server = Hapi.server({
    host: "localhost",
    port: 8000,
  });
  server.route(routes);
  await server.start();
  console.log(`server started on: ${server.info.uri}`);
})();
