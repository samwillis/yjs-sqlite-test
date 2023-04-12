# Test combining [yjs](https://github.com/yjs/yjs) and [sqlite wasm](https://sqlite.org/wasm/doc/trunk/index.md)

This is a test project to combine yjs and sqlite wasm, it lets you store yjs documents 
in a sqlite database, update them in place and query the content. Perfect for building 
a local first web app.

Demo: http://samwillis.co.uk/yjs-sqlite-test/

The current version uses javascript version of yjs, but it could be built with 
[y-crdt](https://github.com/y-crdt/y-crdt) the rust port and compiled into the sqlLite 
wasm module. This would be more efficient.

## A few things you can do

- Create a new document via sql:

```sql
INSERT INTO docs (id, doc) VALUES ('doc1', y_new_doc());
```

- Update a document via sql, passing the update as a parameter:

```sql
UPDATE docs SET doc = y_apply_update(doc, ?) WHERE id = 'doc1';
```

- Get the state vector of a document via sql:

```sql
SELECT y_encode_state_vector(doc) FROM docs WHERE id = 'doc1';
```

- Query the content of a document via sql:

```sql
SELECT doc FROM docs WHERE y_get_map_json(doc, 'myMap') ->> '$.aMapKey' = 'a value';
```

- Index the content of a document by creating a virtual column:
  
```sql
ALTER TABLE docs ADD COLUMN aMapKey INTEGER GENERATED ALWAYS AS (y_get_map_json(doc, 'myMap') ->> '$.aMapKey') VIRTUAL;
CREATE INDEX docs_aMapKey ON docs (aMapKey);
SELECT doc FROM docs WHERE aMapKey = 'a value';
```

## How to use

Somthing a little like this:

```js
import * as yjsSQLite from "./yjsSQLite.js";

const db = new sqlite3.oo1.DB("/mydb.sqlite3", "ct");
yjsSQLite.install(db);
```

Now you have a bunch of `y_...` functions available in your database:

- `y_new_doc()`
  Create a new Y.Doc and return its initial state as an update

- `y_apply_update(savedDoc, update)`
  Apply a document update to the document

- `y_merge_updates(updates)`
  Merge several document updates into a single document

- `y_diff_update(savedDoc, stateVector)`
  Encode the missing differences to another document as a single update message 
  that can be applied on the remote document. Specify a target state vector.

- `y_encode_state_vector(savedDoc)`
  Computes the state vector and encodes it into an Uint8Array

- `y_get_map_json(savedDoc, key)`
  Get the map at the given key from the given savedDoc, and return it as JSON.
  JSON is then queryable via the SQLite JSON operators.

- `y_get_array_json(savedDoc, key)`
  As above but for a top level array.

- `y_get_xml_fragment_json(savedDoc, key)`
  As above but for a top level xml fragment.
