// import { Link, useNavigate } from 'react-router-dom';
// import { RootState } from '../../app/store';
// import { useSelector } from 'react-redux';
// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { FaBus, FaUser, FaCheck } from 'react-icons/fa';
// import { useInView } from 'react-intersection-observer';
// import './Hero.scss';

// const Hero = () => {
//     const user = useSelector((state: RootState) => state.user);
//     const name = user.user?.first_name;
//     const navigate = useNavigate();
//     const [currentStep] = useState(0); 
//     const { ref } = useInView({
//         triggerOnce: true,
//     });

//     const containerVariants = {
//         hidden: { opacity: 0 },
//         visible: {
//             opacity: 1,
//             transition: {
//                 staggerChildren: 0.2
//             }
//         }
//     };

//     const itemVariants = {
//         hidden: { opacity: 0, y: 20 },
//         visible: {
//             opacity: 1,
//             y: 0,
//             transition: {
//                 duration: 0.5,
//                 ease: "easeOut"
//             }
//         }
//     };

//     const bookingSteps = [
//         { icon: <FaUser />, text: "Select Your Seat" },
//         { icon: <FaCheck />, text: "Confirm Booking" },
//         { icon: <FaBus />, text: "Ready to Travel" }
//     ];

//     return (
//         <div className="relative min-h-screen bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 hero-bg flex justify-center items-center overflow-hidden">
//             {/* Animated Background Overlay */}
//             <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 1 }}
//                 className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm"
//             >
//                 {/* Animated Gradient Orbs */}
//                 <motion.div
//                     animate={{
//                         scale: [1, 1.2, 1],
//                         opacity: [0.3, 0.5, 0.3],
//                     }}
//                     transition={{
//                         duration: 8,
//                         repeat: Infinity,
//                         repeatType: "reverse",
//                     }}
//                     className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
//                 />
//                 <motion.div
//                     animate={{
//                         scale: [1, 1.1, 1],
//                         opacity: [0.3, 0.5, 0.3],
//                     }}
//                     transition={{
//                         duration: 6,
//                         repeat: Infinity,
//                         repeatType: "reverse",
//                     }}
//                     className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"
//                 />
//             </motion.div>

//             {/* Content */}
//             <motion.div
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="visible"
//                 className="relative z-10 text-center text-neutral-content max-w-6xl mx-auto px-4"
//             >
//                 <motion.div
//                     variants={itemVariants}
//                     className="flex flex-col justify-center items-center"
//                 >
//                     {/* Heading */}
//                     <motion.h1
//                         variants={itemVariants}
//                         className="mb-6 mt-4 text-3xl lg:text-5xl font-bold text-white text-shadow-lg"
//                     >
//                         Welcome to{' '}
//                         <span className="text-webcolor">
//                             Automated Public Service Vehicle 
//                         </span>
//                         <br />
//                         <span className="text-webcolor">
//                             Seat Booking System
//                         </span>
//                         {name && (
//                             <motion.span
//                                 initial={{ opacity: 0, scale: 0.8 }}
//                                 animate={{ opacity: 1, scale: 1 }}
//                                 transition={{ delay: 0.5 }}
//                                 className="block text-xl mt-2"
//                             >
//                                 {name}!
//                             </motion.span>
//                         )}
//                     </motion.h1>

//                     {/* Description */}
//                     <motion.p
//                         variants={itemVariants}
//                         className="mt-4 mb-6 text-lg lg:text-xl text-white max-w-2xl px-4"
//                     >
//                         Book affordable and convenient PSV seats effortlessly
//                         with our automated reservation system. Experience secure
//                         payments, real-time availability, and hassle-free travel
//                         planning at your fingertips.
//                     </motion.p>

//                     {/* Booking Process Visualization */}
//                     <motion.div
//                         variants={itemVariants}
//                         className="w-full max-w-md mb-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
//                     >
//                         <div className="flex justify-between items-center mb-4">
//                             {bookingSteps.map((step, index) => (
//                                 <motion.div
//                                     key={index}
//                                     initial={{ opacity: 0, y: 20 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     transition={{ delay: index * 0.2 }}
//                                     className={`flex flex-col items-center ${
//                                         index === currentStep ? 'text-white' : 'text-white/50'
//                                     }`}
//                                 >
//                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
//                                         ${index === currentStep ? 'bg-indigo-500' : 'bg-white/20'}`}>
//                                         {step.icon}
//                                     </div>
//                                     <span className="text-sm">{step.text}</span>
//                                 </motion.div>
//                             ))}
//                         </div>
//                         <motion.div
//                             initial={{ width: 0 }}
//                             animate={{ width: `${((currentStep + 1) / bookingSteps.length) * 100}%` }}
//                             transition={{ duration: 0.5 }}
//                             className="h-1 bg-indigo-500 rounded-full"
//                         />
//                     </motion.div>

//                     {/* Book Now Button */}
//                     <motion.div
//                         variants={itemVariants}
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         className="mt-4"
//                     >
//                         <button
//                             onClick={() => {
//                                 if (user?.user?.user_id) {
//                                     navigate('/dashboard/booking_form');
//                                 } else {
//                                     alert("You must log in first to book a seat!");
//                                     navigate('/login');
//                                 }
//                             }}
//                             className="px-8 py-3 rounded-full text-lg lg:text-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
//                         >
//                             <FaBus className="text-xl" />
//                             Book Now
//                         </button>
//                     </motion.div>

//                     {/* Links */}
//                     <motion.div
//                         variants={itemVariants}
//                         className="mt-8 flex justify-center gap-6"
//                     >
//                         {/* About Us Link */}
//                         <motion.div
//                             whileHover={{
//                                 scale: 1.1,
//                                 color: '#818cf8',
//                             }}
//                             transition={{ duration: 0.3 }}
//                         >
//                             <Link
//                                 to="/about"
//                                 className="text-white text-lg transition-colors duration-300"
//                             >
//                                 About Us
//                             </Link>
//                         </motion.div>

//                         {/* Contact Link */}
//                         <motion.div
//                             whileHover={{
//                                 scale: 1.1,
//                                 color: '#818cf8',
//                             }}
//                             transition={{ duration: 0.3 }}
//                         >
//                             <Link
//                                 to="/Contact"
//                                 className="text-white text-lg transition-colors duration-300"
//                             >
//                                 Contact
//                             </Link>
//                         </motion.div>
//                     </motion.div>
//                 </motion.div>
//             </motion.div>

//             {/* Animated Background Elements */}
//             <motion.div
//                 animate={{
//                     y: [0, -20, 0],
//                 }}
//                 transition={{
//                     duration: 4,
//                     repeat: Infinity,
//                     repeatType: "reverse",
//                 }}
//                 className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"
//             />
//         </div>
//     );
// };

// export default Hero;

import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../app/store';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBus, FaUser, FaCheck } from 'react-icons/fa';
import './Hero.scss';

const Hero = () => {
    const user = useSelector((state: RootState) => state.user);
    const name = user.user?.first_name;
    const navigate = useNavigate();
    const [currentStep] = useState(0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const bookingSteps = [
        { icon: <FaUser />, text: "Select Your Seat" },
        { icon: <FaCheck />, text: "Confirm Booking" },
        { icon: <FaBus />, text: "Ready to Travel" }
    ];

    return (
        <div className="relative min-h-screen bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 hero-bg flex justify-center items-center overflow-hidden">
            {/* Animated Background Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm"
            >
                {/* Animated Gradient Orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"
                />
            </motion.div>

            {/* Content */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 text-center text-neutral-content max-w-6xl mx-auto px-4"
            >
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col justify-center items-center"
                >
                    {/* Heading */}
                    <motion.h1
                        variants={itemVariants}
                        className="mb-6 mt-4 text-3xl lg:text-5xl font-bold text-white text-shadow-lg"
                    >
                        Welcome to{' '}
                        <span className="text-webcolor">
                            Automated Public Service Vehicle 
                        </span>
                        <br />
                        <span className="text-webcolor">
                            Seat Booking System
                        </span>
                        {name && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="block text-xl mt-2"
                            >
                                {name}!
                            </motion.span>
                        )}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        variants={itemVariants}
                        className="mt-4 mb-6 text-lg lg:text-xl text-white max-w-2xl px-4"
                    >
                        Book affordable and convenient PSV seats effortlessly
                        with our automated reservation system. Experience secure
                        payments, real-time availability, and hassle-free travel
                        planning at your fingertips.
                    </motion.p>

                    {/* Booking Process Visualization */}
                    <motion.div
                        variants={itemVariants}
                        className="w-full max-w-md mb-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                    >
                        <div className="flex justify-between items-center mb-4">
                            {bookingSteps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                    className={`flex flex-col items-center ${
                                        index === currentStep ? 'text-white' : 'text-white/50'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                                        ${index === currentStep ? 'bg-indigo-500' : 'bg-white/20'}`}>
                                        {step.icon}
                                    </div>
                                    <span className="text-sm">{step.text}</span>
                                </motion.div>
                            ))}
                        </div>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / bookingSteps.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-1 bg-indigo-500 rounded-full"
                        />
                    </motion.div>

                    {/* Book Now Button */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4"
                    >
                        <button
                            onClick={() => {
                                if (user?.user?.user_id) {
                                    navigate('/dashboard/booking_form');
                                } else {
                                    alert("You must log in first to book a seat!");
                                    navigate('/login');
                                }
                            }}
                            className="px-8 py-3 rounded-full text-lg lg:text-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
                        >
                            <FaBus className="text-xl" />
                            Book Now
                        </button>
                    </motion.div>

                    {/* Links */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-8 flex justify-center gap-6"
                    >
                        {/* About Us Link */}
                        <motion.div
                            whileHover={{
                                scale: 1.1,
                                color: '#818cf8',
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <Link
                                to="/about"
                                className="text-white text-lg transition-colors duration-300"
                            >
                                About Us
                            </Link>
                        </motion.div>

                        {/* Contact Link */}
                        <motion.div
                            whileHover={{
                                scale: 1.1,
                                color: '#818cf8',
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <Link
                                to="/Contact"
                                className="text-white text-lg transition-colors duration-300"
                            >
                                Contact
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Animated Background Elements */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
                className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"
            />
        </div>
    );
};

export default Hero;