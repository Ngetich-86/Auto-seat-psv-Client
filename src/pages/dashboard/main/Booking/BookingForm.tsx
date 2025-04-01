import React, { useState } from "react";
import { useFetchCarSpecsQuery, Vehicle } from "../../../../features/vehicles/vehicleAPI";
import MapSeatModal from "./MapSeat";
import { PulseLoader } from 'react-spinners';

const BookingForm: React.FC = () => {
  const [vehicleType, setVehicleType] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [departure, setDeparture] = useState<string>("");
  const [departureTime, setDepartureTime] = useState<string>("");
  const [costRange, setCostRange] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isMapSeatModalOpen, setIsMapSeatModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const vehiclesPerPage = 6; // 3x2 layout

  const { data: vehicles, isLoading, isError, refetch } = useFetchCarSpecsQuery();

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const uniqueVehicles = vehicles
    ? Array.from(new Map(vehicles.map(vehicle => [vehicle.registration_number, vehicle])).values())
    : [];

  const filteredVehicles = uniqueVehicles.filter((vehicle) => {
    return (
      (vehicleType ? vehicle.vehicle_type === vehicleType : true) &&
      (departure ? vehicle.departure === departure : true) &&
      (destination ? vehicle.destination === destination : true) &&
      (departureTime ? vehicle.departure_time === departureTime : true) &&
      (costRange ? vehicle.cost >= Number(costRange.split('-')[0]) && vehicle.cost <= Number(costRange.split('-')[1]) : true)
    );
  });

  // Calculate total pages
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);
  // Get vehicles for the current page
  const displayedVehicles = filteredVehicles.slice(
    currentPage * vehiclesPerPage,
    (currentPage + 1) * vehiclesPerPage
  );

  const handleMapSeatModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsMapSeatModalOpen(true);
  };

  // Handler for departure time selection
  const handleDepartureTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartureTime(e.target.value);
    setVehicleType(""); // Clear vehicle type filter
    setDestination(""); // Clear destination filter
    setDeparture(""); // Clear departure filter
    setCostRange(""); // Clear cost range filter
  };

  // Handler for cost range selection
  const handleCostRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCostRange(e.target.value);
    setVehicleType(""); // Clear vehicle type filter
    setDestination(""); // Clear destination filter
    setDeparture(""); // Clear departure filter
    setDepartureTime(""); // Clear departure time filter
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <PulseLoader color="#3B82F6" size={15} margin={4} />
    </div>
  );
  if (isError) return <p className="text-center text-red-500">Failed to load vehicles. Please try again later.</p>;

  return (
    <div className="overflow-x-auto bg-[#0F172A] min-h-screen">
      <h1 className="text-2xl font-bold text-white text-center p-4">Book Your Journey</h1>

      {/* Filters Section */}
      <div className="w-full max-w-5xl mx-auto mb-4 p-4">
        <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-[#1E293B] p-6 rounded-2xl shadow-xl border border-indigo-500/20">
          <div>
            <label htmlFor="departure" className="block text-sm font-medium text-indigo-200 mb-2">Departure:</label>
            <select id="departure" value={departure} onChange={(e) => setDeparture(e.target.value)}
              className="select w-full bg-[#0F172A] text-white border-indigo-500/20 focus:border-indigo-500">
              <option value="">Select Departure</option>
              {Array.from(new Set(uniqueVehicles.map(vehicle => vehicle.departure))).map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-indigo-200 mb-2">Destination:</label>
            <select id="destination" value={destination} onChange={(e) => setDestination(e.target.value)}
              className="select w-full bg-[#0F172A] text-white border-indigo-500/20 focus:border-indigo-500">
              <option value="">Select Destination</option>
              {Array.from(new Set(uniqueVehicles.map(vehicle => vehicle.destination))).map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-indigo-200 mb-2">Vehicle Type:</label>
            <select id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}
              className="select w-full bg-[#0F172A] text-white border-indigo-500/20 focus:border-indigo-500">
              <option value="">Select Vehicle Type</option>
              {Array.from(new Set(uniqueVehicles.map(vehicle => vehicle.vehicle_type))).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="departureTime" className="block text-sm font-medium text-indigo-200 mb-2">Departure Time:</label>
            <select id="departureTime" value={departureTime} onChange={handleDepartureTimeChange}
              className="select w-full bg-[#0F172A] text-white border-indigo-500/20 focus:border-indigo-500">
              <option value="">Select Departure Time</option>
              {Array.from(new Set(uniqueVehicles.map(vehicle => vehicle.departure_time))).map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="costRange" className="block text-sm font-medium text-indigo-200 mb-2">Cost Range:</label>
            <select id="costRange" value={costRange} onChange={handleCostRangeChange}
              className="select w-full bg-[#0F172A] text-white border-indigo-500/20 focus:border-indigo-500">
              <option value="">All Prices</option>
              <option value="1000-2000">1000 - 2000</option>
              <option value="2000-3000">2000 - 3000</option>
              <option value="3000-4000">3000 - 4000</option>
              <option value="4000-5000">4000 - 5000</option>
            </select>
          </div>
        </form>
      </div>

      {/* Vehicle List */}
      <div className="space-y-4 p-4">
        {filteredVehicles.length ? (
          <div className="flex flex-col items-center w-full px-4">
            {/* Pagination Arrows */}
            <div className="flex justify-between items-center w-full max-w-5xl px-4 mb-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="px-4 py-2 text-white bg-indigo-600 font-bold rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                &larr;
              </button>
              <p className="text-indigo-200 text-sm">
                Page {currentPage + 1} of {totalPages}
              </p>
              <button
                onClick={nextPage}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 text-white bg-indigo-600 font-bold rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                &rarr;
              </button>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
              {displayedVehicles.map((vehicle, index) => {
                const remainingSeats = Math.max((vehicle.capacity - 1) - (Number(vehicle.booked_Seats) || 0), 0);

                return (
                  <div
                    key={`${vehicle.registration_number}-${index}`}
                    className={`card bg-[#1E293B] shadow-xl rounded-2xl p-4 transform transition-all duration-300 hover:scale-105 border border-indigo-500/20 ${
                      selectedVehicle?.registration_number === vehicle.registration_number
                        ? "border-2 border-indigo-500"
                        : ""
                    }`}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <img 
                      src={vehicle.image_url} 
                      alt={vehicle.vehicle_name} 
                      className="w-full h-40 sm:h-32 lg:h-24 object-cover rounded-xl" 
                    />
                    <div className="mt-4 space-y-2">
                      <h3 className="text-lg font-semibold text-white">{vehicle.vehicle_name}</h3>
                      <p className="text-indigo-200 text-sm">{vehicle.vehicle_type} | {vehicle.capacity} Seats</p>
                      <p className="text-indigo-200 text-sm">Booked: {vehicle.booked_Seats || 0} | Remaining: {remainingSeats}</p>
                      <p className="text-indigo-200 text-sm">Reg No: {vehicle.registration_number}</p>
                      <p className="text-indigo-200 text-sm">License: {vehicle.license_plate}</p>
                      <p className="text-indigo-200 text-sm">From: {vehicle.departure} → To: {vehicle.destination}</p>
                      <p className="text-indigo-200 text-sm font-semibold">
                        Departure Time: {vehicle.departure_time || "Not Available"}
                      </p>
                      <p className="text-indigo-200 text-sm font-semibold">Cost: {vehicle.cost}</p>
                      
                      {/* Availability Tag */}
                      <div className={`text-sm font-bold ${
                        remainingSeats > 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {remainingSeats > 0 ? "Available" : "Unavailable"}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleMapSeatModal(vehicle)}
                        className={`btn w-full ${
                          remainingSeats > 0 
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white" 
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        } border-none text-sm px-4 py-2 mt-2 rounded-lg transition-colors`}
                        disabled={remainingSeats === 0}
                      >
                        {remainingSeats > 0 ? "Select Seat" : "Fully Booked"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-indigo-200">No vehicles match your search.</p>
        )}
      </div>

      {/* Modal */}
      {isMapSeatModalOpen && selectedVehicle && (
        <MapSeatModal
          vehicle={selectedVehicle}
          onClose={() => setIsMapSeatModalOpen(false)}
          refetchVehicles={refetch}
        />
      )}
    </div>
  );
};

export default BookingForm;