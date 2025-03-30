import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiDomain } from "../../utils/ApiDomain";
import { TUser, TSAuth } from "../../types/types"; // Assuming TSAuth is defined in your types
import { RootState } from "../../app/store";

// API Slice
export const usersAPI = createApi({
    reducerPath: 'usersAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: ApiDomain,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        // Existing endpoints
        getUsers: builder.query<TUser[], void>({
            query: () => 'users',
            providesTags: ['Users'],
        }),
        createUser: builder.mutation<TUser, Partial<TUser>>({
            query: (newUser) => ({
                url: 'register',
                method: 'POST',
                body: newUser,
            }),
            invalidatesTags: ['Users'],
        }),
        verifyUser: builder.mutation<{ success: boolean; message: string }, { token: string }>({
            query: ({ token }) => ({
                url: `verify/${token}`,
                method: 'GET',
            }),
        }),
        updateUser: builder.mutation<TUser, Partial<TUser & { id: number }>>({
            query: ({ id, ...rest }) => ({
                url: `users/${id}`,
                method: 'PUT',
                body: rest,
            }),
            invalidatesTags: ['Users'],
        }),
        deleteUser: builder.mutation<{ success: boolean; id: number }, number>({
            query: (id) => ({
                url: `users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),
        getUserById: builder.query<TUser, number>({
            query: (id) => `users/${id}`,
            transformResponse: (response: { message: string; data: TUser }) => response.data,
        }),
        resetPassword: builder.mutation<{ success: boolean }, { email: string }>({
            query: ({ email }) => ({
                url: 'forgot-password',
                method: 'POST',
                body: { email },
            }),
        }),
        changePassword: builder.mutation<{ success: boolean }, { email: string; password: string }>({
            query: ({ email, password }) => ({
                url: 'change-password',
                method: 'POST',
                body: { email, password },
            }),
        }),

        // New endpoints for additional functionality
        getAllUsers: builder.query<{ data: (TUser & { auth: TSAuth })[] }, void>({
            query: () => 'v2/users',
            providesTags: ['Users'],
            transformResponse: (response: { data: (TUser & { auth: TSAuth })[] }) => response,
        }),


        getUserByIdV2: builder.query<TUser & { auth: TSAuth }, number>({
            query: (userId) => `v2/users/${userId}`,
            transformResponse: (response: { success: boolean; data: TUser & { auth: TSAuth } }) => response.data,
        }),
        searchUsers: builder.query<(TUser & { auth: TSAuth })[], string>({
            query: (query) => ({
                url: 'v2/users/search',
                params: { query },
            }),
            providesTags: ['Users'],
        }),
        filterUsers: builder.query<(TUser & { auth: TSAuth })[], Record<string, string>>({
            query: (filters) => ({
                url: 'v2/users/filter',
                params: filters,
            }),
            providesTags: ['Users'],
        }),
        activateAccount: builder.mutation<{ success: boolean; message: string }, { email: string; code: string }>({
            query: ({ email, code }) => ({
                url: 'activate-account',
                method: 'POST',
                body: { email, code },
            }),
        }),
        resendActivationCode: builder.mutation<{ success: boolean; message: string }, { email: string }>({
            query: ({ email }) => ({
                url: 'resend-activation-code',
                method: 'POST',
                body: { email },
            }),
        }),
        updateUserV2: builder.mutation<TUser, { userId: number; userData: Partial<TUser> }>({
            query: ({ userId, userData }) => ({
                url: `v2/users/${userId}`,
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['Users'],
        }),
        deleteUserV2: builder.mutation<{ success: boolean; userId: number }, number>({
            query: (userId) => ({
                url: `v2/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useGetUsersQuery,
    useCreateUserMutation,
    useVerifyUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useGetUserByIdQuery,
    useResetPasswordMutation,
    useChangePasswordMutation,
    useGetAllUsersQuery,
    useGetUserByIdV2Query,
    useSearchUsersQuery,
    useFilterUsersQuery,
    useUpdateUserV2Mutation,
    useDeleteUserV2Mutation,
    useActivateAccountMutation,
    useResendActivationCodeMutation,
} = usersAPI;



// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { ApiDomain } from "../../utils/ApiDomain";
// import { TUser } from "../../types/types";
// import { RootState } from "../../app/store";

// // API Slice
// export const usersAPI = createApi({
//     reducerPath: 'usersAPI',
//     baseQuery: fetchBaseQuery({
//         baseUrl: ApiDomain,
//         prepareHeaders: (headers, { getState }) => {
//             const token = (getState() as RootState).user.token;
//             if (token) {
//                 headers.set('Authorization', token);
//             }
//             headers.set('Content-Type', 'application/json');
//             return headers;
//         },
//     }),
//     tagTypes: ['Users'],
//     endpoints: (builder) => ({
//         getUsers: builder.query<TUser[], void>({
//             query: () => 'users',
//             providesTags: ['Users'],
//         }),
//         createUser: builder.mutation<TUser, Partial<TUser>>({
//             query: (newUser) => ({
//                 url: 'register',
//                 method: 'POST',
//                 body: newUser,
//             }),
//             invalidatesTags: ['Users'],
//         }),
//         //  Extracts token from URL and triggers verification process
//         verifyUser: builder.mutation<{ success: boolean; message: string }, { token: string }>({
//             query: ({ token }) => ({
//                 url: `verify/${token}`,
//                 method: 'GET',
//             }),
//         }),        
        
//         updateUser: builder.mutation<TUser, Partial<TUser & { id: number }>>({
//             query: ({ id, ...rest }) => ({
//                 url: `users/${id}`,
//                 method: 'PUT',
//                 body: rest,
//             }),
//             invalidatesTags: ['Users'],
//         }),
//         deleteUser: builder.mutation<{ success: boolean; id: number }, number>({
//             query: (id) => ({
//                 url: `users/${id}`,
//                 method: 'DELETE',
//             }),
//             invalidatesTags: ['Users'],
//         }),
//         getUserById: builder.query<TUser, number>({
//             query: (id) => `users/${id}`,
//             transformResponse: (response: { message: string; data: TUser }) => response.data, // ✅ Extracts 'data'
//         }),
//         resetPassword: builder.mutation<{ success: boolean }, { email: string }>({
//             query: ({ email }) => ({
//                 url: 'forgot-password',
//                 method: 'POST',
//                 body: { email },
//             }),
//         }),
//         changePassword: builder.mutation<{ success: boolean }, { email: string; password: string }>({
//             query: ({ email, password }) => ({
//                 url: 'change-password',
//                 method: 'POST',
//                 body: { email, password },
//             }),
//         }),
//     }),
// });
