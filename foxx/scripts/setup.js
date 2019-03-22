'use strict';

const db = require('@arangodb').db;
const collectionName = 'myFoxxCollection';

if (!module.context.collection(collectionName)) {
	db._createDocumentCollection(module.context.collectionName(collectionName));
}