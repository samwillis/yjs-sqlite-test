import * as Y from "https://esm.run/yjs@13.5.52";

export function install(db) {
  for (const [name, func] of Object.entries(functions)) {
    db.createFunction({
      name,
      xFunc: func,
      deterministic: true,
    });
  }
}

const functions = {
  /**
   * Create a new Y.Doc and return its initial state as an update.
   * @param {number} pCx
   * @returns {Uint8Array} The initial state of the new Y.Doc as an update.
   */
  y_new_doc(pCx) {
    console.log("y_new_doc");
    const doc = new Y.Doc();
    return Y.encodeStateAsUpdate(doc);
  },

  /**
   * Apply a document update on the document.
   * Note that this feature only merges document updates and doesn't garbage-collect 
   * deleted content.
   * Use y_apply_update_gc to apply an update and garbage-collect deleted content.
   * @param {number} pCx
   * @param {Uint8Array} savedDoc
   * @param {Uint8Array} update
   * @returns {Uint8Array} The new state of the document as an update.
   */
  y_apply_update(pCx, savedDoc, update) {
    console.log("y_apply_update");
    return Y.mergeUpdates([savedDoc, update]);
  },

  /**
   * Apply a document update on the document and garbage-collect deleted content.
   * @param {number} pCx
   * @param {Uint8Array} savedDoc
   * @param {Uint8Array} update
   * @returns {Uint8Array} The new state of the document as an update.
   */
  y_apply_update_gc(pCx, savedDoc, update) {
    console.log("y_apply_update_gc");
    const doc = new Y.Doc();
    Y.applyUpdate(doc, savedDoc);
    Y.applyUpdate(doc, update);
    return Y.encodeStateAsUpdate(doc);
  },

  /**
   * Merge several document updates into a single document update while removing 
   * duplicate information.
   * Note that this feature only merges document updates and doesn't garbage-collect 
   * deleted content.
   * @param {number} pCx
   * @param {Array<Uint8Array>} updates
   * @returns {Uint8Array} The merged update.
   */
  y_merge_updates(pCx, updates) {
    console.log("y_merge_updates");
    return Y.mergeUpdates(updates);
  },

  /**
   * Encode the missing differences to another document as a single update message 
   * that can be applied on the remote document. Specify a target state vector.
   * @param {number} pCx
   * @param {Uint8Array} savedDoc
   * @param {Uint8Array} stateVector
   * @returns {Uint8Array} The new state of the document as an update.
   */
  y_diff_update(pCx, savedDoc, stateVector) {
    console.log("y_diff_update");
    return Y.diffUpdate(savedDoc, stateVector);
  },

  /**
   * Computes the state vector and encodes it into an Uint8Array
   * @param {number} pCx
   * @param {Uint8Array} savedDoc
   * @returns {Uint8Array} The state vector of the document.
   */
  y_encode_state_vector(pCx, savedDoc) {
    console.log("y_encode_state_vector");
    return Y.encodeStateVectorFromUpdate(savedDoc);
  },

  /**
   * Get the map at the given key from the given savedDoc, and return it as JSON.
   * @param {number} pCx
   * @param {Uint8Array} savedDoc
   * @param {string} key
   * @returns {string} The map at the given key from the given savedDoc, as JSON.
   */
  y_get_map_json(pCx, savedDoc, key) {
    console.log('y_get_map_json');
    const doc = new Y.Doc();
    Y.applyUpdate(doc, savedDoc);
    return JSON.stringify(doc.getMap(key).toJSON());
  },

  /**
   * Get the array at the given key from the given savedDoc, and return it as JSON.
   * @param {number} pCx
   * @param {Uint8Array} savedDoc
   * @param {string} key
   * @returns {string} The array at the given key from the given savedDoc, as JSON.
   */
  y_get_array_json(pCx, savedDoc, key) {
    console.log('y_get_array_json');
    const doc = new Y.Doc();
    Y.applyUpdate(doc, savedDoc);
    return JSON.stringify(doc.getArray(key).toJSON());
  },

  /**
   * Get the xmlFragment at the given key from the given savedDoc, and return it as JSON.
   * @param {number} pCx
   * @param {Uint8Array} savedDoc
   * @param {string} key
   * @returns {string} The xmlFragment at the given key from the given savedDoc, as JSON.
   */
  y_get_xml_fragment_json(pCx, savedDoc, key) {
    console.log('y_get_xml_fragment_json');
    const doc = new Y.Doc();
    Y.applyUpdate(doc, savedDoc);
    return JSON.stringify(doc.getXmlFragment(key).toJSON());
  },

  /**
   * Extract all text from the xmlFragment at the given key from the given savedDoc.
   * Useful for full text search.
   * @param {number} pCx
   * @param {Uint8Array} savedDoc
   * @param {string} key
   * @returns {string}
   */
  y_extract_xml_fragment_text(pCx, savedDoc, key) {
    console.log('y_extract_xml_fragment_text');
    const doc = new Y.Doc();
    Y.applyUpdate(doc, savedDoc);
    const xml = doc.getXmlFragment(key);
    // TODO
    return '';
  },

};
