// import Navbar from "../../components/Navbar/Navbar";
// import { Outlet } from "react-router-dom";
// import Drawer from "./aside/Drawer";
// import ProtectedRoute from "../../pages/auth/Protectedroute";
// import { useState } from "react";
// import { FaBars, FaTimes } from 'react-icons/fa';

// const Dashboard = () => {
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <ProtectedRoute>
//         <div className="pt-16">
//           {/* Mobile Toggle Button */}
//           <button
//             onClick={() => setIsDrawerOpen(!isDrawerOpen)}
//             className="fixed top-20 left-4 z-50 block lg:hidden bg-blue-950 text-white p-2 rounded-md transition-all duration-300"
//           >
//             {isDrawerOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
//           </button>

//           <div className="flex flex-row min-h-[calc(100vh-4rem)]">
//             {/* Sidebar - fixed on both mobile and desktop */}
//             <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] z-40">
//               <div 
//                 className={`w-64 h-full bg-blue-950 transform transition-transform duration-300 ${
//                   isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
//                 } lg:translate-x-0`}
//               >
//                 <Drawer onToggle={() => setIsDrawerOpen(!isDrawerOpen)} />
//               </div>
//             </div>
            
//             {/* Overlay for mobile */}
//             {isDrawerOpen && (
//               <div 
//                 className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
//                 onClick={() => setIsDrawerOpen(false)}
//               />
//             )}
            
//             {/* Main content area - adjusted margin for fixed drawer */}
//             <div className="flex-1 min-w-0 w-full lg:ml-64">
//               <div className="p-2 sm:p-3 lg:p-4">
//                 <div className="bg-white rounded-lg shadow-sm">
//                   <div className="overflow-hidden">
//                     <div className="p-2 sm:p-3 lg:p-4">
//                       <div className="overflow-x-auto">
//                         <div className="min-w-max">
//                           <Outlet />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </ProtectedRoute>
//     </div>
//   );
// };

// export default Dashboard;

import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Drawer from "./aside/Drawer";
import ProtectedRoute from "../../pages/auth/Protectedroute";
import { useState } from "react";
import { FaBars, FaTimes } from 'react-icons/fa';

const Dashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col">
      {/* Navbar (fixed at top) */}
      <Navbar />

      <ProtectedRoute>
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="fixed top-20 left-4 z-50 block lg:hidden bg-indigo-600/90 text-white p-2 rounded-lg transition-all duration-300 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
        >
          {isDrawerOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Main Content Wrapper */}
        <div className="flex flex-1 pt-16">
          {/* Fixed Sidebar (Desktop) */}
          <div className="hidden lg:block fixed w-64 z-40">
            <div className="h-[calc(100vh-4rem)] bg-[#1E293B] border-r border-indigo-500/20 shadow-xl">
              <Drawer onToggle={() => setIsDrawerOpen(false)} />
            </div>
          </div>

          {/* Mobile Sidebar (Overlay) */}
          <div
            className={`lg:hidden fixed w-64 h-[calc(100vh-4rem)] bg-[#1E293B] border-r border-indigo-500/20 shadow-xl z-40 transform transition-transform duration-300 ${
              isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Drawer onToggle={() => setIsDrawerOpen(false)} />
          </div>

          {/* Overlay for Mobile */}
          {isDrawerOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
              onClick={() => setIsDrawerOpen(false)}
            />
          )}

          {/* Scrollable Content Area */}
          <div className="flex-1 lg:ml-64 overflow-y-auto">
            <div className="p-4 min-h-[calc(100vh-8rem)] pb-16">
              <div className="bg-[#1E293B] rounded-2xl shadow-2xl border border-indigo-500/20">
                <div className="p-8">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer - Now properly aligned */}
        <div className="lg:ml-64 w-full lg:w-[calc(100%-16rem)] bg-[#1E293B] border-t border-indigo-500/20 shadow-lg relative z-10">
          <Footer />
        </div>
      </ProtectedRoute>
    </div>
  );
};

export default Dashboard;