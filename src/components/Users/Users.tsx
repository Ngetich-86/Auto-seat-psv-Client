import { useState } from "react";
import {
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserV2Mutation,
  useDeleteUserV2Mutation,
} from "../../features/users/usersAPI";
import { TUser, TSAuth } from "../../types/types";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from 'react-spinners';
import { ApiDomain } from "../../utils/ApiDomain";
import axios from "axios";

function Users() {
  const { data: usersResponse, error, isLoading, refetch } = useGetAllUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUserV2] = useUpdateUserV2Mutation();
  const [deleteUserV2] = useDeleteUserV2Mutation();
  const users = usersResponse?.data || [];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(TUser & { auth: TSAuth }) | null>(null);
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: "user",
    password: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      role: "user",
      password: "",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: TUser & { auth: TSAuth }) => {
    setSelectedUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number || "",
      role: user.role,
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const handleAddUser = async () => {
    try {
      await createUser(formData).unwrap();
      toast.success("User added successfully");
      setIsAddModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to add user");
      console.error("Error:", error);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
  
    setLoadingStates((prev) => ({ ...prev, [selectedUser.user_id]: true }));
  
    try {
      // Update profile data (excluding password)
      const payload = {
        userId: selectedUser.user_id,
        userData: {
          ...formData,
          password: undefined, // Exclude password from the main update payload
        },
      };
  
      await updateUserV2(payload).unwrap();
  
      // If password is provided, update it separately
      if (formData.password) {
        await axios.put(`${ApiDomain}v2/users/${selectedUser.user_id}/password`, { password: formData.password });
      }
  
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to update user");
      console.error("Error:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [selectedUser.user_id]: false }));
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setLoadingStates((prev) => ({ ...prev, [userId]: true }));

      try {
        await deleteUserV2(userId).unwrap();
        toast.success("User deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete user");
        console.error("Error:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, [userId]: false }));
      }
    }
  };

  const filteredUsers = users
    .filter((user: TUser & { auth: TSAuth }) => {
      const matchesSearch =
        user.user_id.toString().includes(searchQuery.toLowerCase()) ||
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = filterRole === "all" || user.role === filterRole;

      return matchesSearch && matchesRole;
    })
    .sort((a: TUser & { auth: TSAuth }, b: TUser & { auth: TSAuth }) => a.user_id - b.user_id);

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-2xl font-bold text-center text-gray-900 py-6 bg-gray-100">
          Manage Users
        </h2>

        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by ID, name, or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border border-gray-300 rounded-md flex-grow"
              aria-label="Search users"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
              aria-label="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={openAddModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Add User
            </button>
          </div>
        </div>

        {isLoading && <div className="text-center text-yellow-400 py-8">Loading...</div>}

        {error && (
          <div className="text-center text-red-500 py-8">
            {(error as { data?: { message: string } })?.data?.message || "An error occurred. Please try again."}
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-400 py-8">No users found</div>
        )}

        {filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">User Id</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">First Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Last Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user: TUser & { auth: TSAuth }) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{user.user_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{user.first_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{user.last_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{user.phone_number || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{user.role}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => openEditModal(user)}
                        disabled={loadingStates[user.user_id]}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors mr-2"
                      >
                        {loadingStates[user.user_id] ? <ClipLoader size={20} color="#ffffff" /> : "Edit"}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        disabled={loadingStates[user.user_id]}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                      >
                        {loadingStates[user.user_id] ? <ClipLoader size={20} color="#ffffff" /> : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-bold mb-4">Add User</h3>
              <form>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="First Name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="Last Name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="Email"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="Phone Number"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="Role"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="Password"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddUser}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-bold mb-4">Edit User</h3>
              <form>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="First Name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="Last Name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="Email"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="Phone Number"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="Role"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password (leave blank to keep current)"
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                    aria-label="Password"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditUser}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;