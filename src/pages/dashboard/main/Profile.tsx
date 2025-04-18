import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import userIcon from "../../../assets/usericon.png";
import { MdCheckCircle, MdHelp, MdEmail, MdPhone, MdEdit } from "react-icons/md";
import { RootState } from "../../../app/store";
import { useSelector } from "react-redux";
import { usersAPI } from "../../../features/users/usersAPI";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { ApiDomain } from "../../../utils/ApiDomain";

type UserFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password?: string;
  confirm_password?: string;
  image_url?: string;
  user_type?: string;
};

const schema = yup.object().shape({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  phone_number: yup.string().required("Phone number is required"),
  password: yup.string()
    .optional()
    .transform(value => value === "" ? undefined : value)
    .test("password", "Password must be at least 6 characters", value => {
      if (!value) return true;
      return value.length >= 6;
    }),
  confirm_password: yup.string()
    .optional()
    .transform(value => value === "" ? undefined : value)
    .test("passwords-match", "Passwords must match", function(value) {
      return !this.parent.password || value === this.parent.password;
    })
});

const Profile = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [updateUser] = usersAPI.useUpdateUserMutation();

  const user = useSelector((state: RootState) => state.user);
  const id = user.user?.user_id;
  const user_id = id ? id : 0;
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: userData, isLoading, error, refetch } = usersAPI.useGetUserByIdQuery(user_id, {
    pollingInterval: 6000,
    skip: !user_id,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (userData) {
      reset({
        first_name: userData.first_name ?? "",
        last_name: userData.last_name ?? "",
        email: userData.email ?? "",
        phone_number: userData.phone_number ?? "",
        image_url: userData.image_url ?? "",
      });
    }
  }, [userData, reset]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const onSubmit: SubmitHandler<UserFormData> = async (formData) => {
    try {
      setIsUpdating(true);
  
      let imageUrl = formData.image_url || "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "yx7pvzix");
  
        const response = await axios.post("https://api.cloudinary.com/v1_1/dwsxs74ow/image/upload", formData);
  
        if (response.status === 200) {
          imageUrl = response.data.secure_url;
        } else {
          throw new Error("Failed to upload image");
        }
      }
  
      // Create update payload without password
      const updatePayload = {
        id: user_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        image_url: imageUrl,
      };
  
      // Update profile data
      await updateUser(updatePayload).unwrap();
  
      // Only update password if both password fields are filled
      if (formData.password && formData.confirm_password) {
        try {
          await axios.put(`${ApiDomain}v2/users/${user_id}/password`, { 
            password: formData.password 
          });
          toast.success("Profile and password updated successfully!");
        } catch (passwordError) {
          toast.error("Profile updated but password update failed.");
          console.error("Password update error:", passwordError);
        }
      } else {
        toast.success("Profile updated successfully!");
      }
  
      setIsEditMode(false);
      refetch();
    } catch (err) {
      console.error("Error updating user", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };


  if (!user_id) {
    return <div>Error: User ID is missing!</div>;
  }

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error loading user data.</div>;
  }

  if (!userData) {
    return <div>No user data available.</div>;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-5">
        {/* Profile Container */}
        <div className={`w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 flex transition-all duration-300 min-h-[500px] max-h-[600px] ${isEditMode ? "flex-row" : "flex-col items-center"}`}>
          {/* Profile Display Section */}
          <div className={`p-6 transition-all duration-300 flex flex-col items-center text-center ${isEditMode ? "w-1/2 border-r" : "w-full"}`}>
            {/* Image Section */}
            <div className="w-full flex justify-center mb-3 mt-15">
              <div className="relative flex justify-center">
                <img
                  src={userData?.image_url || userIcon}
                  className="rounded-full h-32 w-32 object-cover border-4 border-gray-300"
                  alt="User Avatar"
                />
                {userData.is_verified ? (
                  <MdCheckCircle className="absolute bottom-0 right-0 text-green-500 w-8 h-8" title="Verified" />
                ) : (
                  <MdHelp className="absolute bottom-0 right-0 text-gray-500 w-8 h-8" title="Not Verified" />
                )}
              </div>
            </div>

            {/* Text Section */}
            <div className="w-full flex flex-col items-center text-center space-y-4">
              <h1 className="text-3xl font-bold">{userData?.first_name} {userData?.last_name}</h1>
              <div className="text-gray-600 text-lg mt-2 ">
                <div className="flex items-center">
                  <MdEmail className="text-gray-500 mr-2" />
                  <span>{userData?.email}</span>
                </div>
                <div className="flex items-center mt-1">
                  <MdPhone className="text-gray-500 mr-2" />
                  <span>{userData?.phone_number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button (Only when NOT editing) */}
          {!isEditMode && (
            <div className="flex justify-center mt-3 space-x-4">
              <button
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
                onClick={() => setIsEditMode(true)}
              >
                <MdEdit className="mr-2 " /> Edit Profile
              </button>
            </div>
          )}

          {/* Edit Form Section */}
          {isEditMode && (
            <div className="w-1/2 p-6 transition-all duration-300 border-l">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <label className="text-gray-700 font-medium">First Name</label>
                  <input type="text" {...register("first_name")} className="input border-gray-300 w-full p-2 rounded-md" placeholder="First Name" />
                  {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}

                  {/* Last Name */}
                  <label className="text-gray-700 font-medium">Last Name</label>
                  <input type="text" {...register("last_name")} className="input border-gray-300 w-full p-2 rounded-md" placeholder="Last Name" />
                  {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}

                  {/* Email */}
                  <label className="text-gray-700 font-medium">Email</label>
                  <input type="email" {...register("email")} className="input border-gray-300 w-full p-2 rounded-md" placeholder="Email" />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

                  {/* Phone Number */}
                  <label className="text-gray-700 font-medium">Phone Number</label>
                  <input type="text" {...register("phone_number")} className="input border-gray-300 w-full p-2 rounded-md" placeholder="Phone Number" />
                  {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number.message}</p>}

                  {/* Password */}
                  <label className="text-gray-700 font-medium">
                    Password (Optional)
                    <span className="text-sm text-gray-500 ml-1">Leave blank to keep current password</span>
                  </label>
                  <input 
                    type="password" 
                    {...register("password")} 
                    className="input border-gray-300 w-full p-2 rounded-md" 
                    placeholder="New Password (Optional)" 
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

                  {/* Confirm Password */}
                  <label className="text-gray-700 font-medium">
                    Confirm Password
                    <span className="text-sm text-gray-500 ml-1">(If changing password)</span>
                  </label>
                  <input 
                    type="password" 
                    {...register("confirm_password")} 
                    className="input border-gray-300 w-full p-2 rounded-md" 
                    placeholder="Confirm New Password (Optional)" 
                  />
                  {errors.confirm_password && <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>}
                </div>

                <div className="form-control mt-4">
                  <label className="text-gray-700 font-medium">Profile Image</label>
                  <input type="file" className="file-input file-input-bordered" title="Upload Profile Image" placeholder="Upload an image" onChange={handleImageUpload} />
                </div>

                <div className="flex justify-between mt-6">
                  <button type="button" className="btn bg-gray-500 text-white" onClick={() => setIsEditMode(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn bg-blue-500 text-white" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Profile;