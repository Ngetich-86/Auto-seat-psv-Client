import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RootState } from '../../../../app/store';
import { useSelector } from 'react-redux';
import { Vehicle } from '../../../../features/vehicles/vehicleAPI';
import { useCreateBookingVehicleMutation, useUpdateBookingVehicleMutation } from '../../../../features/booking/bookingAPI';
import MpesaPaymentModal from './MpesaModal';
import { ClipLoader } from 'react-spinners';

interface MapSeatModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  refetchVehicles: () => void;
}

interface BookingData {
  booking_date: string;
  departure_date: string;
}

const schema = yup.object().shape({
  booking_date: yup
    .string()
    .required("Booking date is required"),
  departure_date: yup
    .string()
    .required("Departure date is required")
    .test("is-valid-date", "Departure date cannot be before the booking date", (value, context) => {
      const bookingDate = new Date(context.parent.booking_date);
      const departureDate = new Date(value);
      return departureDate >= bookingDate;
    }),
});

const MapSeatModal: React.FC<MapSeatModalProps> = ({ vehicle, onClose, refetchVehicles }) => {
  const user = useSelector((state: RootState) => state.user);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [confirmedSeats, setConfirmedSeats] = useState<string[]>([]);

  const navigate = useNavigate();
  const [createBooking] = useCreateBookingVehicleMutation();
  const [updateBookingVehicle] = useUpdateBookingVehicleMutation(); 

  const handleBookingSuccess = () => {
    if (refetchVehicles) {
      refetchVehicles();
    }
  };

  const externalData = {
    user_id: user.user?.user_id,
    vehicle_id: vehicle.registration_number,
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingData>({
    resolver: yupResolver(schema),
    defaultValues: {
      booking_date: new Date().toISOString().split('T')[0], // Set default to current date
    }
  });

  useEffect(() => {
    // Set booking date to current date and make it read-only
    setValue("booking_date", new Date().toISOString().split('T')[0]);
  }, [setValue]);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const response = await fetch(`https://automatedseatservation-amhqc6atf9bxfzgq.southafricanorth-01.azurewebsites.net/booked-seats?vehicle_id=${vehicle.registration_number}`);
        const data = await response.json();
        setBookedSeats(data.booked_seats || []);
      } catch (error) {
        console.error("Error fetching booked seats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookedSeats();
  }, [vehicle.registration_number]);

  const onSubmit: SubmitHandler<BookingData> = async (formData) => {
    if (isSubmitting) return;
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat.');
      return;
    }

    const departureTime = vehicle.departure_time || "00:00";

    const parseDate = (date: string | Date): string | null => {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.error(`Invalid date: ${date}`);
        return null;
      }
      return parsedDate.toISOString();
    };

    const bookingDateString = parseDate(formData.booking_date);
    const departureDateString = parseDate(formData.departure_date);

    if (!bookingDateString || !departureDateString) {
      toast.error('Invalid date format. Please enter valid dates.');
      return;
    }

    const total_price = parseFloat((selectedSeats.length * vehicle.cost).toFixed(2));

    const dataToSubmit = {
      ...externalData,
      ...formData,
      booking_date: bookingDateString,
      departure_date: departureDateString,
      departure_time: departureTime,
      seat_numbers: selectedSeats,
      departure: vehicle.departure,
      destination: vehicle.destination,
      price: vehicle.cost,
      total_price: total_price,
    };

    console.log("Data to submit:", dataToSubmit);
    try {
      setIsSubmitting(true);
      const response = await createBooking(dataToSubmit).unwrap();
      toast.success(`Booking created successfully for seat(s): ${selectedSeats.join(', ')}`);
      handleBookingSuccess();
      setBookingId(response.booking_id);
      setShowPaymentModal(true);
    } catch (err) {
      toast.error('Error creating booking');
      console.error('Error creating booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setConfirmedSeats(selectedSeats);
    await refetchBookedSeats();
    toast.success('Payment successful! Redirecting to bookings...');
    setTimeout(() => navigate('/dashboard/my_bookings'), 2000);
  };

  const refetchBookedSeats = async () => {
    try {
      const response = await fetch(`https://automatedseatservation-amhqc6atf9bxfzgq.southafricanorth-01.azurewebsites.net/booked-seats?vehicle_id=${vehicle.registration_number}`);
      const data = await response.json();
      setBookedSeats(data.booked_seats || []);
    } catch (error) {
      console.error("Error fetching booked seats:", error);
    }
  };

  const handleSeatClick = (seat: string) => {
    if (bookedSeats.includes(seat) || confirmedSeats.includes(seat)) return;
    setSelectedSeats((prevSelected) =>
      prevSelected.includes(seat)
        ? prevSelected.filter((selected) => selected !== seat)
        : [...prevSelected, seat]
    );
  };

  const handlePaymentFailure = async () => {
    if (bookingId) {
      try {
        await updateBookingVehicle({
          booking_id: bookingId,
          booking_status: "pending", // ✅ Align with backend logic
        }).unwrap();
        toast.error('Payment failed. Booking status set to pending.');
        setSelectedSeats([]);
      } catch (err) {
        toast.error('Failed to update booking status after payment failure.');
        console.error('Error updating booking status:', err);
      }
    }
    setShowPaymentModal(false);
  };

  const calculateRemainingSeats = () => {
    const bookedSeatsCount = bookedSeats.length;
    const selectedSeatsCount = selectedSeats.length;
    return vehicle.capacity - bookedSeatsCount - selectedSeatsCount - 1;
  };

  const remainingSeats = calculateRemainingSeats();
  const totalAmount = selectedSeats.length * vehicle.cost;

  const seats = Array.from({ length: vehicle.capacity }, (_, i) => `S${i + 1}`);
  const seatRows = [];
  for (let i = 0; i < seats.length; i += 4) {
    seatRows.push(seats.slice(i, i + 4));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Toaster />
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Select Seats</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <ClipLoader color="#3B82F6" size={50} />
          </div>
        ) : (
          <>
            {/* 🚗 Car-Shaped Seat Layout */}
            <div className="relative flex flex-col items-center bg-gray-300 p-4 rounded-lg shadow-lg border-4 border-gray-800 max-w-xs mx-auto">
              {/* 🚖 Car Roof */}
              <div className="w-32 h-6 bg-gray-700 rounded-t-lg"></div>

              {/* 🚗 Driver's Section with Steering Wheel */}
              <div className="w-full flex justify-center mb-2 relative">
                <div className="relative flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white mb-1 relative">
                    <span className="text-2xl" role="img" aria-label="steering wheel">🎡</span>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs">
                      Driver
                    </div>
                  </div>
                  <button
                    className="p-2 w-10 h-10 rounded-lg border bg-gray-800 text-white font-semibold flex items-center justify-center"
                    disabled
                  >
                    S1
                  </button>
                </div>
              </div>

              {/* Passenger Seats - Arranged Like a Car Interior */}
              <div className="w-full bg-gray-400 rounded-lg p-2">
                {Array.from({ length: Math.ceil((vehicle.capacity - 1) / 4) }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex justify-between w-full px-4 my-1">
                    {/* 🚗 Left Section (Window & Aisle Seats) */}
                    <div className="flex space-x-2">
                      {Array.from({ length: 2 }, (_, colIndex) => {
                        const seatIndex = rowIndex * 4 + colIndex + 1;
                        const seatNumber = `S${seatIndex + 1}`;

                        if (seatIndex >= vehicle.capacity) return null;

                        return (
                          <button
                            key={seatNumber}
                            className={`p-2 w-10 h-10 rounded-lg border font-semibold transition ${
                              bookedSeats.includes(seatNumber) || confirmedSeats.includes(seatNumber)
                                ? 'bg-red-500'
                                : selectedSeats.includes(seatNumber)
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                            onClick={() => handleSeatClick(seatNumber)}
                            disabled={bookedSeats.includes(seatNumber) || confirmedSeats.includes(seatNumber)}
                          >
                            {seatNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* 🚗 Right Section (Window & Aisle Seats) */}
                    <div className="flex space-x-2">
                      {Array.from({ length: 2 }, (_, colIndex) => {
                        const seatIndex = rowIndex * 4 + colIndex + 3;
                        const seatNumber = `S${seatIndex + 1}`;

                        if (seatIndex >= vehicle.capacity) return null;

                        return (
                          <button
                            key={seatNumber}
                            className={`p-2 w-10 h-10 rounded-lg border font-semibold transition ${
                              bookedSeats.includes(seatNumber) || confirmedSeats.includes(seatNumber)
                                ? 'bg-red-500'
                                : selectedSeats.includes(seatNumber)
                                ? 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                            onClick={() => handleSeatClick(seatNumber)}
                            disabled={bookedSeats.includes(seatNumber) || confirmedSeats.includes(seatNumber)}
                          >
                            {seatNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Tags */}
            <div className="mt-4 flex justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Selected</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="mb-4">
                <label htmlFor="booking_date" className="block mb-1 text-gray-500">Booking Date</label>
                <input
                  type="date"
                  id="booking_date"
                  {...register("booking_date")}
                  className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                  readOnly
                />
                {errors.booking_date && (
                  <p className="text-red-500 text-sm">{errors.booking_date.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="departure_date" className="block mb-1">Departure Date</label>
                <input
                  type="date"
                  id="departure_date"
                  {...register("departure_date")}
                  className="w-full p-2 border rounded"
                />
                {errors.departure_date && (
                  <p className="text-red-500 text-sm">{errors.departure_date.message}</p>
                )}
              </div>

              <div className="mt-4 text-center">
                <p className="text-lg font-semibold">Remaining Seats: <span className="text-blue-500">{remainingSeats}</span></p>
                <p className="text-lg font-semibold">Total Amount: <span className="text-blue-500">KSh {totalAmount.toFixed(2)}</span></p>
                <p className="text-lg font-semibold">Departure Time: <span className="text-blue-500">{vehicle.departure_time || "Not specified"}</span></p>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-800">Cancel</button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedSeats.length === 0}
                  className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
                    isSubmitting || selectedSeats.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <ClipLoader color="#ffffff" size={24} />
                  ) : (
                    'Book Selected Seats'
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {showPaymentModal && bookingId && (
          <MpesaPaymentModal
            bookingId={bookingId}
            amount={totalAmount}
            onClose={() => setShowPaymentModal(false)}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailure={handlePaymentFailure}
          />
        )}
      </div>
    </div>
  );
};

export default MapSeatModal;