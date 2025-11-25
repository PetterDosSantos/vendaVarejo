import { CreateNewCustomerData, CreateNewCustomerVariables, GetProductsByCategoryData, GetProductsByCategoryVariables, UpdateProductStockData, UpdateProductStockVariables, GetSalesForUserData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewCustomer(options?: useDataConnectMutationOptions<CreateNewCustomerData, FirebaseError, CreateNewCustomerVariables>): UseDataConnectMutationResult<CreateNewCustomerData, CreateNewCustomerVariables>;
export function useCreateNewCustomer(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewCustomerData, FirebaseError, CreateNewCustomerVariables>): UseDataConnectMutationResult<CreateNewCustomerData, CreateNewCustomerVariables>;

export function useGetProductsByCategory(vars?: GetProductsByCategoryVariables, options?: useDataConnectQueryOptions<GetProductsByCategoryData>): UseDataConnectQueryResult<GetProductsByCategoryData, GetProductsByCategoryVariables>;
export function useGetProductsByCategory(dc: DataConnect, vars?: GetProductsByCategoryVariables, options?: useDataConnectQueryOptions<GetProductsByCategoryData>): UseDataConnectQueryResult<GetProductsByCategoryData, GetProductsByCategoryVariables>;

export function useUpdateProductStock(options?: useDataConnectMutationOptions<UpdateProductStockData, FirebaseError, UpdateProductStockVariables>): UseDataConnectMutationResult<UpdateProductStockData, UpdateProductStockVariables>;
export function useUpdateProductStock(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateProductStockData, FirebaseError, UpdateProductStockVariables>): UseDataConnectMutationResult<UpdateProductStockData, UpdateProductStockVariables>;

export function useGetSalesForUser(options?: useDataConnectQueryOptions<GetSalesForUserData>): UseDataConnectQueryResult<GetSalesForUserData, undefined>;
export function useGetSalesForUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetSalesForUserData>): UseDataConnectQueryResult<GetSalesForUserData, undefined>;
