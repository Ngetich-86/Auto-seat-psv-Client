import { useGetUserBookingQuery, useDeleteBookingVehicleMutation } from "../../../../features/booking/bookingAPI";
import { useSelector } from "react-redux";
import { RootState } from "../../../../app/store";
import { format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import jsPDF from "jspdf"; // Import jsPDF
import { useLocation } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';
import QRCode from 'react-qr-code';
import ReactDOM from 'react-dom';

// Function to load logo image
const loadLogoImage = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL('image/png');
      resolve(base64);
    };
    img.onerror = (error) => {
      console.error('Error loading logo:', error);
      reject(error);
    };
    img.src = 'https://cdn.pixabay.com/photo/2023/01/18/18/07/logo-7833520_1280.png';
  });
};

// Helper function to convert QR code to base64
const getQRCodeBase64 = (value: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const container = document.createElement('div');
      const qrComponent = <QRCode value={value} size={256} />;
      ReactDOM.render(qrComponent, container);
      const svg = container.innerHTML;
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size
      canvas.width = 256;
      canvas.height = 256;

      // Create an image element
      const img = new Image();
      
      // Convert SVG to base64
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        try {
          // Draw the image on canvas
          ctx.drawImage(img, 0, 0, 256, 256);
          // Convert to PNG
          const base64 = canvas.toDataURL('image/png');
          // Clean up
          URL.revokeObjectURL(url);
          resolve(base64);
        } catch (error) {
          console.error('Error in img.onload:', error);
          URL.revokeObjectURL(url);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('Error loading image:', error);
        URL.revokeObjectURL(url);
        reject(error);
      };
      
      img.src = url;
    } catch (error) {
      console.error('Error in getQRCodeBase64:', error);
      reject(error);
    }
  });
};

function MyBookings() {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user);
  const userId = user.user?.user_id ?? 0;

  useEffect(() => {
    // Check if we're coming from a payment redirect
    const fromPayment = new URLSearchParams(location.search).get('fromPayment');
    
    if (fromPayment === 'true') {
      // Remove the query parameter
      window.history.replaceState({}, '', location.pathname);
      // Reload the page
      window.location.reload();
    }
  }, [location]);

  const { data: userBookings, error, isLoading, refetch } = useGetUserBookingQuery(userId);
  const [deleteBooking] = useDeleteBookingVehicleMutation();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState<number | null>(null); // Track which receipt is being downloaded

  const formatDate = (isoDate: string | number | Date | null | undefined) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    return isNaN(date.getTime()) ? "Invalid Date" : format(date, "MM/dd/yyyy");
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
        try {
            setIsDeleting(bookingId);
            await deleteBooking(bookingId).unwrap();
            toast.success("Booking deleted successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to delete booking");
            console.error("Error:", error);
        } finally {
            setIsDeleting(null);
        }
    }
};

  const handleDownloadReceipt = async (booking: any) => {
    setIsDownloading(booking.booking_id);
    try {
      const doc = new jsPDF();

      // Set default font
      doc.setFont("helvetica");
      doc.setFontSize(12);

      // Add company logo
      try {
        const logoBase64 = await loadLogoImage();
        const logoWidth = 30;
        const logoHeight = 30;
        doc.addImage(logoBase64, "PNG", 10, 10, logoWidth, logoHeight);
      } catch (error) {
        console.error('Error adding logo:', error);
      }

      // Add header with gradient background
      doc.setFillColor(59, 130, 246); // Blue color
      doc.rect(0, 0, 210, 40, "F");
      
      // Add header text in white
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("PSV Booking System", 60, 25);
      
      // Reset text color for rest of the document
      doc.setTextColor(0, 0, 0);

      // Add ticket title with underline
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Boarding Ticket", 10, 60);
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(10, 62, 200, 62);

      // Add ticket number with background
      doc.setFillColor(243, 244, 246);
      doc.rect(10, 70, 190, 15, "F");
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Ticket #${booking.booking_id}`, 15, 80);

      // Add passenger information section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Passenger Information", 10, 100);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${user.user?.first_name || "N/A"} ${user.user?.last_name || ""}`, 10, 110);
      doc.text(`Contact: ${user.user?.phone_number || "N/A"}`, 10, 120);

      // Add booking details section
      doc.setFont("helvetica", "bold");
      doc.text("Journey Details", 10, 140);
      doc.setFont("helvetica", "normal");
      doc.text(`Vehicle License Plate: ${booking.vehicle_id}`, 10, 150);
      doc.text(`Seat Numbers: ${booking.seat_ids || "N/A"}`, 10, 160);
      doc.text(`Departure: ${booking.departure}`, 10, 170);
      doc.text(`Destination: ${booking.destination}`, 10, 180);
      doc.text(`Departure Date & Time: ${formatDate(booking.departure_date)} ${booking.departure_time || ""}`, 10, 190);

      // Add payment details section with background
      doc.setFillColor(243, 244, 246);
      doc.rect(10, 200, 190, 40, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Payment Details", 15, 215);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Amount: KSh ${booking.total_price}`, 15, 225);
      doc.text(`Payment Method: ${booking.payment_method || "N/A"}`, 15, 235);
      doc.text(`Payment Status: ${booking.payment_status || "N/A"}`, 15, 245);

      // Generate and add QR code
      const qrData = JSON.stringify({
        bookingId: booking.booking_id,
        passenger: `${user.user?.first_name} ${user.user?.last_name}`,
        vehicleId: booking.vehicle_id,
        seatIds: booking.seat_ids,
        departure: booking.departure,
        destination: booking.destination,
        departureDate: booking.departure_date,
        departureTime: booking.departure_time,
        totalPrice: booking.total_price
      });
      
      try {
        const qrCodeBase64 = await getQRCodeBase64(qrData);
        doc.addImage(qrCodeBase64, "PNG", 150, 70, 40, 40);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }

      // Add rules and instructions section
      doc.setFillColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Important Instructions", 10, 250);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("1. Arrive at the boarding point 20 minutes before departure.", 10, 255);
      doc.text("2. Present this ticket and a valid ID for verification.", 10, 260);
      doc.text("3. No changes to the booking are allowed after confirmation.", 10, 265);
      doc.text("4. Keep this ticket safe until the end of your journey.", 10, 270);

      // Add footer
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 280, 210, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("Contact: +254 700 000 000 | Email: support@psvbookings.com", 10, 285);

      // Save the PDF
      doc.save(`boarding_ticket_${booking.booking_id}.pdf`);
      toast.success("Boarding ticket downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate boarding ticket");
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <PulseLoader color="#3B82F6" size={15} margin={4} />
    </div>
  );
  if (error) return <div className="text-center text-red-500">Error loading bookings: {error.toString()}</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Adjusted container to match footer margins */}
      <div className="container mx-auto px-4 bg-white rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-xl font-bold text-center text-black py-2 rounded-t-sm">
          My Booking History
        </h2>

        {!userBookings || userBookings.length === 0 ? (
          <div className="text-center text-gray-600 py-6">No bookings found</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Booking ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">License Plate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Seat Numbers</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Booking Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Departure Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Total Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Booking Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Payment Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Payment Method</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">M-Pesa Receipt</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userBookings.map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.booking_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.vehicle_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{booking.seat_ids}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(booking.booking_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(booking.departure_date)} {booking.departure_time && `at ${booking.departure_time}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">ksh{booking.total_price}</td>
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
                        {booking.payment_status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {booking.payment_method || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {booking.mpesa_receipt_number || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteBooking(booking.booking_id)}
                          disabled={isDeleting === booking.booking_id}
                          className={`px-3 py-1 rounded-md text-white ${
                            isDeleting === booking.booking_id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          {isDeleting === booking.booking_id ? (
                            <PulseLoader color="#ffffff" size={8} margin={2} />
                          ) : (
                            "Delete"
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(booking)}
                          disabled={
                            isDownloading === booking.booking_id ||
                            booking.payment_status !== "completed"
                          }
                          className={`px-3 py-1 rounded-md text-white ${
                            isDownloading === booking.booking_id ||
                            booking.payment_status !== "completed"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          {isDownloading === booking.booking_id ? (
                            <PulseLoader color="#ffffff" size={8} margin={2} />
                          ) : (
                            "Download Ticket"
                          )}
                        </button>
                      </div>
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

export default MyBookings;