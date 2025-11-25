const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'vendavarejo',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createNewCustomerRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewCustomer', inputVars);
}
createNewCustomerRef.operationName = 'CreateNewCustomer';
exports.createNewCustomerRef = createNewCustomerRef;

exports.createNewCustomer = function createNewCustomer(dcOrVars, vars) {
  return executeMutation(createNewCustomerRef(dcOrVars, vars));
};

const getProductsByCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetProductsByCategory', inputVars);
}
getProductsByCategoryRef.operationName = 'GetProductsByCategory';
exports.getProductsByCategoryRef = getProductsByCategoryRef;

exports.getProductsByCategory = function getProductsByCategory(dcOrVars, vars) {
  return executeQuery(getProductsByCategoryRef(dcOrVars, vars));
};

const updateProductStockRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateProductStock', inputVars);
}
updateProductStockRef.operationName = 'UpdateProductStock';
exports.updateProductStockRef = updateProductStockRef;

exports.updateProductStock = function updateProductStock(dcOrVars, vars) {
  return executeMutation(updateProductStockRef(dcOrVars, vars));
};

const getSalesForUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSalesForUser');
}
getSalesForUserRef.operationName = 'GetSalesForUser';
exports.getSalesForUserRef = getSalesForUserRef;

exports.getSalesForUser = function getSalesForUser(dc) {
  return executeQuery(getSalesForUserRef(dc));
};
