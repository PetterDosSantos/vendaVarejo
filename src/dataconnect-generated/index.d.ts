import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateNewCustomerData {
  customer_insert: Customer_Key;
}

export interface CreateNewCustomerVariables {
  firstName: string;
  lastName: string;
  email?: string | null;
}

export interface Customer_Key {
  id: UUIDString;
  __typename?: 'Customer_Key';
}

export interface GetProductsByCategoryData {
  products: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
  } & Product_Key)[];
}

export interface GetProductsByCategoryVariables {
  category?: string | null;
}

export interface GetSalesForUserData {
  sales: ({
    id: UUIDString;
    saleDate: TimestampString;
    totalAmount: number;
    paymentMethod?: string | null;
  } & Sale_Key)[];
}

export interface Product_Key {
  id: UUIDString;
  __typename?: 'Product_Key';
}

export interface SaleItem_Key {
  id: UUIDString;
  __typename?: 'SaleItem_Key';
}

export interface Sale_Key {
  id: UUIDString;
  __typename?: 'Sale_Key';
}

export interface UpdateProductStockData {
  product_update?: Product_Key | null;
}

export interface UpdateProductStockVariables {
  id: UUIDString;
  stockQuantity: number;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewCustomerRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewCustomerVariables): MutationRef<CreateNewCustomerData, CreateNewCustomerVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewCustomerVariables): MutationRef<CreateNewCustomerData, CreateNewCustomerVariables>;
  operationName: string;
}
export const createNewCustomerRef: CreateNewCustomerRef;

export function createNewCustomer(vars: CreateNewCustomerVariables): MutationPromise<CreateNewCustomerData, CreateNewCustomerVariables>;
export function createNewCustomer(dc: DataConnect, vars: CreateNewCustomerVariables): MutationPromise<CreateNewCustomerData, CreateNewCustomerVariables>;

interface GetProductsByCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetProductsByCategoryVariables): QueryRef<GetProductsByCategoryData, GetProductsByCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: GetProductsByCategoryVariables): QueryRef<GetProductsByCategoryData, GetProductsByCategoryVariables>;
  operationName: string;
}
export const getProductsByCategoryRef: GetProductsByCategoryRef;

export function getProductsByCategory(vars?: GetProductsByCategoryVariables): QueryPromise<GetProductsByCategoryData, GetProductsByCategoryVariables>;
export function getProductsByCategory(dc: DataConnect, vars?: GetProductsByCategoryVariables): QueryPromise<GetProductsByCategoryData, GetProductsByCategoryVariables>;

interface UpdateProductStockRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProductStockVariables): MutationRef<UpdateProductStockData, UpdateProductStockVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProductStockVariables): MutationRef<UpdateProductStockData, UpdateProductStockVariables>;
  operationName: string;
}
export const updateProductStockRef: UpdateProductStockRef;

export function updateProductStock(vars: UpdateProductStockVariables): MutationPromise<UpdateProductStockData, UpdateProductStockVariables>;
export function updateProductStock(dc: DataConnect, vars: UpdateProductStockVariables): MutationPromise<UpdateProductStockData, UpdateProductStockVariables>;

interface GetSalesForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetSalesForUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetSalesForUserData, undefined>;
  operationName: string;
}
export const getSalesForUserRef: GetSalesForUserRef;

export function getSalesForUser(): QueryPromise<GetSalesForUserData, undefined>;
export function getSalesForUser(dc: DataConnect): QueryPromise<GetSalesForUserData, undefined>;

