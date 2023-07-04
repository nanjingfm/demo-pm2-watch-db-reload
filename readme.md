# 场景

本 demo 用来模拟一个服务，该服务会定时从数据库中读取版本号，如果版本号发生变化，则会重启服务。

# 操作步骤

使用 pm2 启动服务

```shell
cd pm2
yarn install
yarn start
```

使用 curl 请求测试服务，观察后面服务重启时是否可以做到 0 停机：

```shell
for i in {1..10000}; do echo ${i};curl http://localhost:8080; sleep 0.2; done
```

观察 pm2 服务日志：

```shell
pm2 logs | grep -v from_server
```

修改数据库中的版本号，观察服务是否可以重启：

```sql
sqlite3 pm2/mydb.sqlite
update versions set latest_version = latest_version +1 where id=1;
```
