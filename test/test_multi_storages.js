/**
 * Test for Issue 17: multiple concurrent IndexedDB open requests test
 *
 * 1. Before running this test, clear offline data in the browser so that
 * testing db are not already exist.
 * 2. configure firefox to ask the user before letting your domain use offline storage
 */


ydn.db.conn.IndexedDb.DEBUG = true;


var schema1 = {version: 1, stores: [{name: 'st1', keyPath: 'id'}]};
var schema2 = {version: 1, stores: [{name: 'st2', keyPath: 'id'}]};
var db1 = new ydn.db.Storage('db1', schema1);
var db2 = new ydn.db.Storage('db2', schema2);

db1.put('st1', {id: 1, value: 'test 1'});
db2.put('st2', {id: 1, value: 'test 2'});

db1.get('st1', 1).addCallback(function(x) {
  console.log('got from db1');
  console.log(x);
});

db2.get('st2', 1).addCallback(function(x) {
  console.log('got from db2');
  console.log(x);
});