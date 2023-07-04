import Knex from "knex";
import * as pm2 from "pm2";
import { Version } from "./types/version";
import { debounce } from "lodash";

const knex = Knex({
  client: "sqlite3", // or 'better-sqlite3'
  connection: {
    filename: "./mydb.sqlite",
  },
});

async function initDB() {
  return await knex.migrate.latest();
}

async function watchDB(fn: () => void) {
  await initDB();
  const initialVersion = await knex<Version>("versions").first();
  let latestVersion = initialVersion?.latest_version;
  setInterval(async () => {
    const version = await knex<Version>("versions").first();
    if (version && latestVersion !== version.latest_version) {
      latestVersion = version.latest_version;
      fn && (await fn());
    }
  }, 1000);
}

function start(options: pm2.StartOptions): Promise<pm2.Proc> {
  return new Promise((resolve, reject) => {
    pm2.start(options, function (err, apps) {
      if (err) {
        reject(err);
      } else {
        resolve(apps);
      }
    });
  });
}

function reload(name: string) {
  return new Promise((resolve, reject) => {
    pm2.reload(name, function (err, _) {
      if (err) {
        reject(err);
      } else {
        resolve("success");
      }
    });
  });
}

pm2.connect(async (err) => {
  if (err) {
    console.error(err);
    process.exit(2);
  }
  const appOption = {
    name: "test",
    script: "../server.js",
    instances: 2,
    exec_mode: "cluster",
  };
  await start(appOption);
  console.log(`app ${appOption.name} started`);

  const reloadApp = (function () {
    let loading = false;
    return debounce(async () => {
      if (loading) {
        return;
      }
      loading = true;
      await reload(appOption.name);
      console.log(`app ${appOption.name} reloaded`);
      loading = false;
    }, 2000);
  })();

  watchDB(async () => {
    console.log(`version changed, reload ${appOption.name} app...`);
    reloadApp();
  });
});
