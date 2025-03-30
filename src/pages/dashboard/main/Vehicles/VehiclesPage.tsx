import React, { useState } from 'react';
import { useFetchCarSpecsQuery, Vehicle } from '../../../../features/vehicles/vehicleAPI';
import CreateVehicleModal from './CreateVehicleForm';
import EditVehicleModal from './EditVehicle';
import DeleteVehicleModal from './DeleteVehicle';
import { SyncLoader } from 'react-spinners';

const VehiclesPage: React.FC = () => {
  const { data: vehicles, isLoading, error } = useFetchCarSpecsQuery();
  const [selectedResource, setSelectedResource] = useState<Vehicle | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // State for filters
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedLicensePlate, setSelectedLicensePlate] = useState<string>('');
  const [selectedRegistrationNumber, setSelectedRegistrationNumber] = useState<string>('');

  // Function to filter vehicles based on selected filters
  const filteredVehicles = vehicles?.filter((vehicle) => {
    // Filter by price range
    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split('-').map(Number);
      if (vehicle.cost < min || vehicle.cost > max) return false;
    }

    // Filter by license plate
    if (selectedLicensePlate && vehicle.license_plate !== selectedLicensePlate) return false;

    // Filter by registration number
    if (selectedRegistrationNumber && vehicle.registration_number !== selectedRegistrationNumber) return false;

    return true;
  });

  // Get unique license plates and registration numbers for dropdowns
  const uniqueLicensePlates = [...new Set(vehicles?.map((vehicle) => vehicle.license_plate))];
  const uniqueRegistrationNumbers = [...new Set(vehicles?.map((vehicle) => vehicle.registration_number))];

  // Handler for price range selection
  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPriceRange(e.target.value);
    setSelectedLicensePlate(''); // Clear license plate filter
    setSelectedRegistrationNumber(''); // Clear registration number filter
  };

  // Handler for license plate selection
  const handleLicensePlateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLicensePlate(e.target.value);
    setSelectedPriceRange(''); // Clear price range filter
    setSelectedRegistrationNumber(''); // Clear registration number filter
  };

  // Handler for registration number selection
  const handleRegistrationNumberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegistrationNumber(e.target.value);
    setSelectedPriceRange(''); // Clear price range filter
    setSelectedLicensePlate(''); // Clear license plate filter
  };

  const openCreateModal = () => setCreateModalOpen(true);
  const closeCreateModal = () => setCreateModalOpen(false);

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedResource(vehicle);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setSelectedResource(vehicle);
    setDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <SyncLoader color="#37B7C3" size={20} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-red-500">Error loading resources: {error.toString()}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Vehicles</h1>
          <button
            onClick={openCreateModal}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            Create Vehicle
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Price Range Dropdown */}
          <div>
            <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700">
              Price Range
            </label>
            <select
              id="priceRange"
              value={selectedPriceRange}
              onChange={handlePriceRangeChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Prices</option>
              <option value="1000-2000">1000 - 2000</option>
              <option value="2000-3000">2000 - 3000</option>
              <option value="3000-4000">3000 - 4000</option>
              <option value="4000-5000">4000 - 5000</option>
            </select>
          </div>

          {/* License Plate Dropdown */}
          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
              License Plate
            </label>
            <select
              id="licensePlate"
              value={selectedLicensePlate}
              onChange={handleLicensePlateChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All License Plates</option>
              {uniqueLicensePlates.map((plate) => (
                <option key={plate} value={plate}>
                  {plate}
                </option>
              ))}
            </select>
          </div>

          {/* Registration Number Dropdown */}
          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <select
              id="registrationNumber"
              value={selectedRegistrationNumber}
              onChange={handleRegistrationNumberChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Registration Numbers</option>
              {uniqueRegistrationNumbers.map((regNumber) => (
                <option key={regNumber} value={regNumber}>
                  {regNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles?.map((vehicle: Vehicle) => (
            <div
              key={vehicle.registration_number}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Card Content */}
              <div className="flex">
                {/* Left Side: Text Details */}
                <div className="flex-1 p-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">{vehicle.vehicle_name}</h2>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Registration:</span> {vehicle.registration_number}</p>
                    <p><span className="font-medium">Capacity:</span> {vehicle.capacity}</p>
                    <p><span className="font-medium">Location:</span> {vehicle.current_location}</p>
                    <p><span className="font-medium">Cost:</span> ksh {vehicle.cost}</p>
                    <p><span className="font-medium">License Plate:</span> {vehicle.license_plate}</p>
                    <p><span className="font-medium">Type:</span> {vehicle.vehicle_type}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleEditClick(vehicle)}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(vehicle)}
                      className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Right Side: Image */}
                <div className="w-1/3 flex-shrink-0">
                  <img
                    src={vehicle.image_url}
                    alt={vehicle.vehicle_name}
                    className="w-full h-full object-cover rounded-r-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && <CreateVehicleModal onClose={closeCreateModal} />}

      {isEditModalOpen && selectedResource && (
        <EditVehicleModal
          vehicle={selectedResource}
          onClose={() => setEditModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && selectedResource && (
        <DeleteVehicleModal
          registration_number={selectedResource.registration_number}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default VehiclesPage;