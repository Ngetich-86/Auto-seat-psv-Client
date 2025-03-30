import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiDomain } from "../../utils/ApiDomain";

export interface Vehicle {
  vehicle_id: string;
  departure_time: string;
}

export interface Payment {
  amount: number;
  payment_id: number;
  payment_date: string;
  payment_method: string;
  payment_status: string;
  transaction_reference: string;
}

export interface Tbooking {
  booking_id: number;
  user_id: number;
  vehicle_id: string;
  seat_id: number | null;
  booking_date: string;
  vehicle?: Vehicle;
  departure: string;
  departure_time: string;
  destination: string;
  total_price: number;
  departure_date: string;
  estimated_arrival: string;
  mpesa_receipt_number: string;
  payment_method: string;
  price: number;
  booking_status: string;
  is_active: string;
  seat_ids: number;
  payment_status: string;
  payments: Payment[];
  is_archived: boolean; // Add this field
}

interface ArchivedBooking {
  archive_id: number;
  booking_id: number;
  user_id: number;
  vehicle_id: string;
  departure: string;
  destination: string;
  departure_date: string; // or Date
  price: number;
  total_price: number;
  booking_status: string;
  archived_by: number;
  archived_at: string; // or Date
  payment_status: string; // Add payment_status
  archived_by_first_name?: string; // Add first name of the user who archived the booking
}


export enum TagTypes {
  BookingVehicle = "bookingVehicle",
  ArchivedBooking = "archivedBooking", // Add a new tag type for archived bookings
}

// Define the response structure for archived bookings
interface ArchivedBookingsResponse {
  success: boolean;
  data: ArchivedBooking[];
}

export const bookingVehicleAPI = createApi({
  reducerPath: "bookingVehicleAPI",
  baseQuery: fetchBaseQuery({ baseUrl: ApiDomain }),
  tagTypes: [TagTypes.BookingVehicle, TagTypes.ArchivedBooking], // Add the new tag type
  endpoints: (builder) => ({
    getBookingVehicle: builder.query<Tbooking[], void>({
      query: () => "/bookings",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ booking_id }) => ({
                type: TagTypes.BookingVehicle,
                id: booking_id,
              })),
              { type: TagTypes.BookingVehicle, id: "LIST" },
            ]
          : [{ type: TagTypes.BookingVehicle, id: "LIST" }],
    }),

    createBookingVehicle: builder.mutation<Tbooking, Partial<Tbooking>>({
      query: (newBooking) => ({
        url: "/bookings",
        method: "POST",
        body: {
          ...newBooking,
          departure_time: newBooking.vehicle?.departure_time || "",
        },
      }),
      invalidatesTags: [{ type: TagTypes.BookingVehicle, id: "LIST" }],
    }),

    updateBookingVehicle: builder.mutation<Tbooking, Partial<Tbooking & { booking_id: number }>>({
      query: ({ booking_id, ...rest }) => ({
        url: `/bookings/${booking_id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: (_, __, { booking_id }) => [{ type: TagTypes.BookingVehicle, id: booking_id }],
    }),

    
// In the API file (bookingVehicleAPI.ts)
deleteBookingVehicle: builder.mutation<{ success: boolean; booking_id: number }, number>({
  query: (booking_id) => ({
    url: `/bookings/${booking_id}`,
    method: "DELETE", // Use PUT instead of DELETE
    body: { is_deleted: true }, // Mark the booking as deleted
  }),
  invalidatesTags: (_, __, booking_id) => [{ type: TagTypes.BookingVehicle, id: booking_id }],
}),




    deleteAllBookings: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/bookings",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: TagTypes.BookingVehicle, id: "LIST" }],
    }),

    deleteBookingsByUserId: builder.mutation<{ success: boolean; user_id: number }, number>({
      query: (user_id) => ({
        url: `/bookings/user/${user_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, user_id) => [{ type: TagTypes.BookingVehicle, id: user_id }],
    }),

    getUserBooking: builder.query<Tbooking[], number>({
      query: (user_id) => `/bookings/user/${user_id}`,
      providesTags: (_, __, user_id) => [{ type: TagTypes.BookingVehicle, id: user_id }],
    }),

    confirmBooking: builder.mutation<{ success: boolean; booking_id: number }, { booking_id: number }>({
      query: ({ booking_id }) => ({
        url: `/bookings/confirm`,
        method: "POST",
        body: { booking_id },
      }),
    }),

    // ✅ Update archiveBooking endpoint to accept an object
    archiveBooking: builder.mutation<{ success: boolean; booking_id: number }, { bookingId: number; userId: number }>({
      query: ({ bookingId, userId }) => ({
        url: `/bookings/archive/${bookingId}`,
        method: "PUT",
        body: { bookingId, userId }, // Pass userId in the request body
      }),
      invalidatesTags: (_, __, { bookingId }) => [{ type: TagTypes.BookingVehicle, id: bookingId }],
    }),

    // ✅ Add a new endpoint to fetch archived bookings
    getArchivedBookings: builder.query<ArchivedBookingsResponse, void>({
      query: () => "/archived-bookings",
      providesTags: (result) => {
        // If result is not defined, return a default tag
        if (!result || !result.data) {
          return [{ type: TagTypes.ArchivedBooking, id: "LIST" }];
        }
        // If result.data is an array, map over it to provide tags
        return [
          ...result.data.map(({ archive_id }) => ({
            type: TagTypes.ArchivedBooking,
            id: archive_id,
          })),
          { type: TagTypes.ArchivedBooking, id: "LIST" },
        ];
      },
    }),

    // ✅ Add a new endpoint to delete archived bookings by booking_id
 // In the API file (bookingVehicleAPI.ts)
deleteArchivedBooking: builder.mutation<{ success: boolean; booking_id: number }, number>({
  query: (booking_id) => ({
    url: "/archived-bookings/by-booking-id",
    method: "DELETE",
    body: { bookingId: booking_id },
  }),
  invalidatesTags: (_, __, booking_id) => [{ type: TagTypes.ArchivedBooking, id: booking_id }],
}),
  }),
});

export const {
  useGetBookingVehicleQuery,
  useCreateBookingVehicleMutation,
  useUpdateBookingVehicleMutation,
  useDeleteBookingVehicleMutation,
  useDeleteAllBookingsMutation,
  useDeleteBookingsByUserIdMutation,
  useGetUserBookingQuery,
  useConfirmBookingMutation,
  useArchiveBookingMutation,
  useGetArchivedBookingsQuery, // ✅ Add this
  useDeleteArchivedBookingMutation, // ✅ Add this
} = bookingVehicleAPI;