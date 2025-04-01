import { useGetBookingVehicleQuery, useArchiveBookingMutation } from "../../../../features/booking/bookingAPI";
import { format } from "date-fns";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PulseLoader } from 'react-spinners';

function AllBookings() {
  const { data: allBookings, error, isLoading, refetch } = useGetBookingVehicleQuery();
  const [archiveBooking] = useArchiveBookingMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("booking_date");
  const [exportFilters, setExportFilters] = useState({
    destination: "all",
    departure: "all",
    date: "",
    status: "all",
    paymentStatus: "all"
  });

  const formatDate = (isoDate: string | number | Date) =>
    format(new Date(isoDate), "MM/dd/yyyy");

  // Get unique destinations and departures for export filters
  const uniqueDestinations = Array.from(new Set(allBookings?.map(booking => booking.destination) || []));
  const uniqueDepartures = Array.from(new Set(allBookings?.map(booking => booking.departure) || []));

  // Filter and sort bookings for display
  const filteredBookings = allBookings
    ?.filter((booking) => {
      const matchesSearch = booking.booking_id.toString().includes(searchQuery);
      const matchesStatus = filterStatus === "all" || booking.booking_status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "booking_date") {
        return new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime();
      } else if (sortBy === "departure_date") {
        return new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime();
      }
      return 0;
    });

  // Filter bookings specifically for export
  const getFilteredBookingsForExport = () => {
    return allBookings?.filter((booking) => {
      const matchesDestination = exportFilters.destination === "all" || booking.destination === exportFilters.destination;
      const matchesDeparture = exportFilters.departure === "all" || booking.departure === exportFilters.departure;
      const matchesDate = !exportFilters.date || formatDate(booking.departure_date) === formatDate(exportFilters.date);
      const matchesStatus = exportFilters.status === "all" || booking.booking_status === exportFilters.status;
      const matchesPaymentStatus = exportFilters.paymentStatus === "all" || booking.payment_status === exportFilters.paymentStatus;
      
      return matchesDestination && matchesDeparture && matchesDate && matchesStatus && matchesPaymentStatus;
    });
  };

  const handleArchiveBooking = async (bookingId: number, userId: number) => {
    if (window.confirm("Are you sure you want to archive this booking?")) {
      try {
        await archiveBooking({ bookingId, userId }).unwrap();
        toast.success(`Booking ${bookingId} archived successfully`);
        refetch();
      } catch (error) {
        toast.error("Failed to archive booking");
        console.error("Error:", error);
      }
    }
  };
  
  // Enhanced Export to PDF with additional filters
  const handleExportToPDF = () => {
    const exportData = getFilteredBookingsForExport();
    
    if (!exportData || exportData.length === 0) {
      toast.warning("No bookings found matching your export filters");
      return;
    }

    const doc = new jsPDF();
    
    // Add title and filter information
    doc.setFontSize(16);
    doc.text("Bookings Report", 14, 20);
    doc.setFontSize(10);
    
    let yPosition = 30;
    if (exportFilters.departure !== "all") {
      doc.text(`Departure: ${exportFilters.departure}`, 14, yPosition);
      yPosition += 7;
    }
    if (exportFilters.destination !== "all") {
      doc.text(`Destination: ${exportFilters.destination}`, 14, yPosition);
      yPosition += 7;
    }
    if (exportFilters.date) {
      doc.text(`Date: ${formatDate(exportFilters.date)}`, 14, yPosition);
      yPosition += 7;
    }
    if (exportFilters.status !== "all") {
      doc.text(`Status: ${exportFilters.status}`, 14, yPosition);
      yPosition += 7;
    }
    if (exportFilters.paymentStatus !== "all") {
      doc.text(`Payment Status: ${exportFilters.paymentStatus}`, 14, yPosition);
      yPosition += 7;
    }

    // Add the table
    autoTable(doc, {
      startY: yPosition + 10,
      head: [
        [
          "Booking ID",
          "User ID",
          "Seats",
          "Route",
          "Departure Date",
          "Status",
          "Payment",
          "Method"
        ],
      ],
      body: exportData.map((booking) => [
        booking.booking_id,
        booking.user_id,
        booking.seat_ids ? String(booking.seat_ids).split(",").join(", ") : "N/A",
        `${booking.departure} → ${booking.destination}`,
        `${formatDate(booking.departure_date)} ${booking.departure_time || ""}`,
        booking.booking_status,
        booking.payment_status,
        booking.payment_method || "N/A"
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 15 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 }
      }
    });

    // Generate filename based on filters
    let filename = "bookings";
    if (exportFilters.departure !== "all") filename += `_${exportFilters.departure}`;
    if (exportFilters.destination !== "all") filename += `_to_${exportFilters.destination}`;
    if (exportFilters.date) filename += `_${formatDate(exportFilters.date).replace(/\//g, '-')}`;
    
    doc.save(`${filename}.pdf`);
  };

  // Modal for export filters
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-2xl font-bold text-center text-gray-900 py-6 bg-gray-100">
          All Bookings
        </h2>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <PulseLoader color="#3B82F6" size={15} margin={4} />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 p-4">
            Error loading bookings: {error.toString()}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Filters and Actions */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search by Booking ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md flex-grow"
                  aria-label="Search bookings"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                  aria-label="Filter by booking status"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                  aria-label="Sort bookings"
                >
                  <option value="booking_date">Sort by Booking Date</option>
                  <option value="departure_date">Sort by Departure Date</option>
                </select>
                <button
                  onClick={() => setShowExportModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  aria-label="Export bookings to PDF"
                >
                  Export to PDF
                </button>
              </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold mb-4">Export Options</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departure
                      </label>
                      <select
                        value={exportFilters.departure}
                        onChange={(e) => setExportFilters({...exportFilters, departure: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        aria-label="Filter by departure location"
                      >
                        <option value="all">All Departures</option>
                        {uniqueDepartures.map((departure) => (
                          <option key={departure} value={departure}>{departure}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destination
                      </label>
                      <select
                        value={exportFilters.destination}
                        onChange={(e) => setExportFilters({...exportFilters, destination: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        aria-label="Filter by destination location"
                      >
                        <option value="all">All Destinations</option>
                        {uniqueDestinations.map((destination) => (
                          <option key={destination} value={destination}>{destination}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departure Date
                      </label>
                      <input
                        type="date"
                        value={exportFilters.date}
                        onChange={(e) => setExportFilters({...exportFilters, date: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        aria-label="Filter by departure date"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Booking Status
                      </label>
                      <select
                        value={exportFilters.status}
                        onChange={(e) => setExportFilters({...exportFilters, status: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        aria-label="Filter by booking status"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                      </label>
                      <select
                        value={exportFilters.paymentStatus}
                        onChange={(e) => setExportFilters({...exportFilters, paymentStatus: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        aria-label="Filter by payment status"
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleExportToPDF();
                        setShowExportModal(false);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">Booking ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">User ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">Seat ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">Departure</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">Destination</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">Departure Date & Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">Booking Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">Payment Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">Payment Method</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">M-Pesa Receipt</th>
                    <th className="px-4 py-3 text-left text-sm font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">{booking.booking_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{booking.user_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {booking.seat_ids ? String(booking.seat_ids).split(",").join(", ") : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{booking.departure}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{booking.destination}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(booking.departure_date)} {booking.departure_time && `at ${booking.departure_time}`}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.booking_status === "confirmed" || booking.booking_status === "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.booking_status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.booking_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.payment_status === "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.payment_status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {booking.payment_method || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {booking.mpesa_receipt_number || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleArchiveBooking(booking.booking_id, booking.user_id)}
                          className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
                        >
                          Archive
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>  
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AllBookings;