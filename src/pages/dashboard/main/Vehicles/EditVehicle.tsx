import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateVehicleMutation, Vehicle } from '../../../../features/vehicles/vehicleAPI';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface EditVehicleModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

const EditVehicleSchema = yup.object().shape({
  registration_number: yup.string().required('Registration number is required'),
  vehicle_name: yup.string().required('Vehicle name is required'),
  license_plate: yup.string().required('License plate is required'),
  capacity: yup.number().typeError('Capacity must be a number').nullable(),
  vehicle_type: yup.string().required('Vehicle type is required'),
  current_location: yup.string().required('Current location is required'),
  destination: yup.string().required('Destination is required'),
  departure_time: yup.string().required('Departure time is required'),
  departure: yup.string().required('Departure location is required'),
  cost: yup.number().typeError('Cost must be a number'),
  image_url: yup.mixed().notRequired(), // Optional image
});

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ vehicle, onClose }) => {
  const [updateVehicle, { isLoading }] = useUpdateVehicleMutation();
  const [imagePreview, setImagePreview] = useState<string | null>(vehicle?.image_url || null);
  const [imageError, setImageError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(EditVehicleSchema),
  });

  useEffect(() => {
    if (vehicle) {
      setValue('registration_number', vehicle.registration_number || '');
      setValue('vehicle_name', vehicle.vehicle_name || '');
      setValue('license_plate', vehicle.license_plate || '');
      setValue('capacity', vehicle.capacity || undefined);
      setValue('vehicle_type', vehicle.vehicle_type || '');
      setValue('current_location', vehicle.current_location || '');
      setValue('destination', vehicle.destination || '');
      setValue('departure', vehicle.departure || '');
      setValue('departure_time', vehicle.departure_time || '');
      setValue('cost', vehicle.cost || undefined);
      setImagePreview(vehicle.image_url || null);
    }
  }, [vehicle, setValue]);

  const onSubmit = async (data: any) => {
    try {
      let imageUrl = imagePreview;

      if (data.image_url && data.image_url[0]) {
        const vehicleImage = data.image_url[0];

        // Validate image
        if (vehicleImage.size > 2000000) { // 2MB limit
          setImageError('The file is too large');
          return;
        }

        if (!['image/jpeg', 'image/png', 'image/gif'].includes(vehicleImage.type)) {
          setImageError('Unsupported file format');
          return;
        }

        // Upload image
        const formData = new FormData();
        formData.append('file', vehicleImage);
        formData.append('upload_preset', 'yx7pvzix');

        const response = await axios.post('https://api.cloudinary.com/v1_1/dwsxs74ow/image/upload', formData);
        if (response.status === 200) {
          imageUrl = response.data.secure_url;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      const updatedVehicle = {
        ...vehicle, // Include existing vehicle properties
        ...data,    // Overwrite with new form values
        image_url: imageUrl,
      };

      // Remove created_at and updated_at from payload
      delete updatedVehicle.created_at;
      delete updatedVehicle.updated_at;

      await updateVehicle(updatedVehicle).unwrap();

      // Show success toast
      toast.success('Vehicle updated successfully ✔️', {
        position: 'top-left',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      onClose();
    } catch (error) {
      console.error('Error updating vehicle:', error);

      // Show error toast
      toast.error('Failed to update vehicle ❌', {
        position: 'top-left',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Toast Container */}
      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }} // Ensure it's on top
      />

      {/* Modal Content */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-3/4 lg:w-1/2 max-h-screen overflow-auto">
        <h2 className="text-xl font-bold mb-4">Edit Vehicle</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Fields */}
          {(['registration_number', 'vehicle_name', 'current_location', 'license_plate', 'capacity', 'vehicle_type', 'departure', 'departure_time', 'destination', 'cost'] as const).map((field) => (
            <div key={field} className="form-control lg:mr-8">
              <input
                id={field}
                {...register(field)}
                className="input input-bordered text-color-orange"
                placeholder={field.replace('_', ' ').toUpperCase()}
              />
              {errors[field] && (
                <p className="text-red-500 text-sm">{errors[field]?.message}</p>
              )}
            </div>
          ))}

          {/* Image Input */}
          <div className="form-control lg:mr-8">
            <label className="block mb-1">Vehicle Image</label>
            <input
              id="image_url"
              type="file"
              accept="image/*"
              {...register('image_url')}
              className="input input-bordered"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImagePreview(URL.createObjectURL(file));
                  setImageError(null);
                }
              }}
            />
            {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Vehicle preview"
                className="mt-4 w-full h-40 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-4 space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicleModal;