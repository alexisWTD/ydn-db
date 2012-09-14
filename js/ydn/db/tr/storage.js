/**
 * @license Copyright 2012 YDN Authors. All Rights Reserved.
 */
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Wrappers for the all implemented Storage mechanisms.
 *
 * On application use, this is preferable over concrete storage implementation.
 * This wrapper has two purpose:
 * 1) select suitable supported storage mechanism and 2) deferred execute when
 * the database is not initialized. Database is initialized when dbname, version
 * and schema are set.
 *
 * Often, dbname involve login user identification and it is not available at
 * the time of application start up. Additionally schema may be prepared by
 * multiple module. This top level wrapper provide these use cases.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */

goog.provide('ydn.db.tr.Storage');
goog.require('ydn.db.core.Storage');
goog.require('ydn.db.tr.ITxStorage');
goog.require('ydn.db.tr.IStorage');
goog.require('ydn.db.tr.TxStorage');



/**
 * Create a suitable storage mechanism from indexdb, to websql to
 * localStorage.
 *
 * If database name and schema are provided, this will immediately initialize
 * the database and ready to use. However if any of these two are missing,
 * the database is not initialize until they are set by calling
 * {@link #setName} and {@link #setSchema}.
 * @see goog.db Google Closure Library DB module.
 * @param {string=} opt_dbname database name.
 * @param {!ydn.db.DatabaseSchema=} opt_schema database schema
 * or its configuration in JSON format. If not provided, default empty schema
 * is used.
 * schema used in chronical order.
 * @param {!Object=} opt_options options.
 * @implements {ydn.db.tr.IStorage}
 * @extends{ydn.db.core.Storage}
 * @constructor
 */
ydn.db.tr.Storage = function(opt_dbname, opt_schema, opt_options) {
  goog.base(this, opt_dbname, opt_schema, opt_options);
  this.ptx_no_ = 0;
};
goog.inherits(ydn.db.tr.Storage, ydn.db.core.Storage);
//
//
///**
// * @override
// */
//ydn.db.tr.Storage.prototype.createDbInstance = function(db_type, db_name, config) {
//  //noinspection JSValidateTypes
//  if (db_type == ydn.db.adapter.IndexedDb.TYPE) {
//    return new ydn.db.tr.IndexedDb(db_name, config);
//  } else if (db_type == ydn.db.adapter.WebSql.TYPE) {
//    return new ydn.db.tr.WebSql(db_name, config);
//  } else if (db_type == ydn.db.adapter.LocalStorage.TYPE) {
//    return new ydn.db.tr.LocalStorage(db_name, config);
//  } else if (db_type == ydn.db.adapter.SessionStorage.TYPE) {
//    return new ydn.db.tr.SessionStorage(db_name, config);
//  } else if (db_type == ydn.db.adapter.SimpleStorage.TYPE)  {
//    return new ydn.db.tr.SimpleStorage(db_name, config);
//  }
//  return null;
//};


/**
 *
 * @type {number}
 * @private
 */
ydn.db.tr.Storage.prototype.ptx_no_ = 0;


/**
 * @protected
 * @return {!ydn.db.tr.TxStorage}
 */
ydn.db.tr.Storage.prototype.newTxInstance = function() {
  return new ydn.db.tr.TxStorage(this, this.ptx_no_++);
};


ydn.db.tr.Storage.prototype.newTransaction = function(transaction_process, names, mode, completed_handler) {

  ydn.db.tr.Storage.superClass_.transaction.call(this,
    transaction_process, names, mode, completed_handler);
};


/**
 * Run a transaction.
 * @export
 * @param {Function} trFn function that invoke in the transaction.
 * @param {!Array.<string>} store_names list of keys or
 * store name involved in the transaction.
 * @param {ydn.db.TransactionMode=} opt_mode mode, default to 'readonly'.
 * @param {function(ydn.db.TransactionEventTypes, *)=} oncompleted
 * @param {...} opt_args
 * @override
 */
ydn.db.tr.Storage.prototype.transaction = function (trFn, store_names, opt_mode,
                                                    oncompleted, opt_args) {

  var tx_queue = this.newTxInstance();
  tx_queue.transaction(trFn, store_names, opt_mode,
    oncompleted, opt_args);

};

