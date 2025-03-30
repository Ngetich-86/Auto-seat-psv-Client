import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetArchivedBookingsQuery,
  useDeleteArchivedBookingMutation,
} from "../../features/booking/bookingAPI"; // Update the import path

// Define the type for an archived booking
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

function Archived() {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetArchivedBookingsQuery();
  const [deleteArchivedBooking] = useDeleteArchivedBookingMutation();

  // Extract archivedBookings from the response
  const archivedBookings = response?.data || [];

  // Delete an archived booking by booking_id
const handleDeleteArchivedBooking = async (bookingId: number) => {
  if (window.confirm("Are you sure you want to delete this archived booking?")) {
    try {
      await deleteArchivedBooking(bookingId).unwrap();
      toast.success("Archived booking deleted successfully.");
      refetch(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete archived booking.");
    }
  }
};


  useEffect(() => {
    if (isError) {
      toast.error("An error occurred while fetching archived bookings.");
    }
  }, [isError]);

  // Function to get status color
  const getStatusColor = (status: string | undefined | null) => {
    if (!status) {
      return "bg-gray-100 text-gray-800"; // Default color for undefined or null status
    }
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-2xl font-bold text-center text-gray-900 py-6 bg-gray-100">
          Archived Bookings
        </h2>

        {isLoading ? (
          <div className="text-center text-yellow-400 py-8">Loading...</div>
        ) : archivedBookings.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No archived bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Archive ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Booking ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">User ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Vehicle ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Departure</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Destination</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Departure Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Total Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Booking Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Payment Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Archived By</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Archived At</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archivedBookings.map((booking: ArchivedBooking) => (
                  <tr key={booking.archive_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.archive_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.booking_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.user_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.vehicle_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.departure}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.destination}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(booking.departure_date).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.price}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.total_price}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          booking.booking_status
                        )}`}
                      >
                        {booking.booking_status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          booking.payment_status
                        )}`}
                      >
                        {booking.payment_status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {booking.archived_by_first_name || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(booking.archived_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteArchivedBooking(booking.booking_id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Archived;