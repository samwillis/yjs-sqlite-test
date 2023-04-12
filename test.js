import * as yjsSQLite from "./yjsSQLite.js";
import * as Y from "https://esm.run/yjs@13.5.52";

export const test = function (sqlite3, log) {
  const capi = sqlite3.capi /*C-style API*/,
    oo = sqlite3.oo1; /*high-level OO API*/
  log("sqlite3 version", capi.sqlite3_libversion(), capi.sqlite3_sourceid());
  const db = new oo.DB("/mydb.sqlite3", "ct");
  log("transient db =", db.filename);
  try {

    yjsSQLite.install(db);

    log("Create a table...");
    db.exec("CREATE TABLE IF NOT EXISTS docs (id INTEGER PRIMARY KEY, doc BLOB)");

    log("Create and insert new yJS document");
    let doc = new Y.Doc();
    let map = doc.getMap("myMap");
    map.set("foo", "bar");
    db.exec({
      sql: "insert into docs (id, doc) values (?, ?);",
      bind: [1, Y.encodeStateAsUpdate(doc)],
    });
    doc = null;
    map = null;

    function getAndLogDoc(info) {
      log(info);
      db.exec({
        sql: "select doc from docs where id = ?;",
        bind: [1],
        callback: function (row) {
          doc = new Y.Doc();
          Y.applyUpdate(doc, row[0]);
          log('Value of "foo":', doc.getMap("myMap").get("foo"));
        },
      });
    }
    getAndLogDoc("Get yJS document");

    log("Update yJS document");
    map = doc.getMap("myMap");
    map.set("foo", "bar2");
    db.exec({
      sql: "update docs set doc = ? where id = ?;",
      bind: [Y.encodeStateAsUpdate(doc), 1],
    });
    doc = null;
    map = null;

    getAndLogDoc("Get Updated yJS document");

    log("Update yJS document using y_apply_update with whole doc");
    map = doc.getMap("myMap");
    map.set("foo", "bar3");
    db.exec({
      sql: "update docs set doc = y_apply_update(doc, ?) where id = ?;",
      bind: [Y.encodeStateAsUpdate(doc), 1],
    });
    doc = null;
    map = null;

    getAndLogDoc("Get Updated yJS document");

    log("Get current state vector form database using y_encode_state_vector");
    let stateVector;
    db.exec({
      sql: "select y_encode_state_vector(doc) from docs where id = ?;",
      bind: [1],
      callback: function (row) {
        log("State vector:", row[0]);
        stateVector = row[0];
      },
    });

    log("Update yJS document using y_apply_update with diff");
    map = doc.getMap("myMap");
    map.set("foo", "bar4");
    let update = Y.encodeStateAsUpdate(doc, stateVector);
    db.exec({
      sql: "update docs set doc = y_apply_update(doc, ?) where id = ?;",
      bind: [update, 1],
    });
    doc = null;
    map = null;

    getAndLogDoc("Get Updated yJS document");

    log("Get value of 'foo' directly from database");
    db.exec({
      sql: "select y_get_map_json(doc, 'myMap') ->> '$.foo' from docs where id = ?;",
      bind: [1],
      callback: function (row) {
        log("Value of 'foo':", row[0]);
      },
    });

    log("Add a bunch of documents");
    for (let i = 1; i <= 100; i++) {
      doc = new Y.Doc();
      map = doc.getMap("myMap");
      map.set("foo", "bar" + i);
      map.set("num", Math.floor(Math.random() * 100));
      db.exec({
        sql: "insert into docs (doc) values (?);",
        bind: [Y.encodeStateAsUpdate(doc)],
      });
      doc = null;
      map = null;
    }

    log("Count all documents with 'num' below 50");
    db.exec({
      sql: "select count(*) from docs where y_get_map_json(doc, 'myMap') ->> '$.num' < 50;",
      callback: function (row) {
        log("Count:", row[0]);
      },
    });


    log("Create an index on the 'num' field by adding a virtual column");
    db.exec("alter table docs add column num integer generated always as (y_get_map_json(doc, 'myMap') ->> '$.num') virtual;");
    db.exec("create index docs_num on docs (num);");

    log("Count all documents with 'num' below 50");
    db.exec({
      sql: "select count(*) from docs where num < 50;",
      callback: function (row) {
        log("Count:", row[0]);
      },
    });

    log("Count AGAIN all documents with 'num' below 50");
    db.exec({
      sql: "select count(*) from docs where num < 50;",
      callback: function (row) {
        log("Count:", row[0]);
      },
    });
    

  } finally {
    db.close();
  }

  log("That's all, folks!");
};