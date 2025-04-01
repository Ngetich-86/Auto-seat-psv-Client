// import "./Testimonial.scss";
// import { motion } from "framer-motion";
// import { useInView } from "react-intersection-observer";

// const testimonials = [
//   {
//     id: 1,
//     image: "https://randomuser.me/api/portraits/men/10.jpg",
//     name: "Gideon Ngetich",
//     text: "The Automated Seat Reservation System has completely transformed how we book seats for lectures and events. It's fast, reliable, and eliminates the hassle of manual reservations.",
//   },
//   {
//     id: 2,
//     image: "https://randomuser.me/api/portraits/men/21.jpg",
//     name: "Hillary Kiplangat",
//     text: "A seamless experience! I no longer have to rush early to secure a seat. The system is easy to use and ensures fair access to available spots.",
//   },
//   {
//     id: 3,
//     image: "https://randomuser.me/api/portraits/men/3.jpg",
//     name: "Emmanuel Kiptoo",
//     text: "This system has significantly reduced congestion and confusion in seating arrangements. Booking a seat takes just a few seconds, making life much easier for students.",
//   },
//   {
//     id: 4,
//     image: "https://randomuser.me/api/portraits/men/4.jpg",
//     name: "Kigathi Dennis",
//     text: "I appreciate how well this system integrates with our institution's schedule. It ensures that no seats go to waste and helps in effective space management.",
//   },
//   {
//     id: 5,
//     image: "https://randomuser.me/api/portraits/men/5.jpg",
//     name: "Dr. Malanga Kenedy",
//     text: "As an educator, this platform has made organizing classes much more efficient. It ensures every student has an assigned seat, minimizing disruptions and improving attendance tracking.",
//   },
//   {
//     id: 6,
//     image: "https://randomuser.me/api/portraits/men/6.jpg",
//     name: "Brian Kemboi",
//     text: "This reservation system has made my daily routine much smoother. No more last-minute seat hunting—everything is organized and stress-free!",
//   },
//   {
//     id: 7,
//     image: "https://randomuser.me/api/portraits/men/7.jpg",
//     name: "Allano Kurunye",
//     text: "I love how user-friendly this system is. It's straightforward, efficient, and a game-changer for managing large student populations in lecture halls.",
//   },
//   {
//     id: 8,
//     image: "https://randomuser.me/api/portraits/women/8.jpg",
//     name: "Serah Wanjiru",
//     text: "The best part about this system is its reliability. I can book my seat in advance and focus on my studies without worrying about getting a place.",
//   },
// ];

// const Testimonial = () => {
//   const { ref, inView } = useInView({
//     triggerOnce: true,
//     threshold: 0.1,
//   });

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.2
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.5,
//         ease: "easeOut"
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-900 py-16">
//       <div className="container mx-auto px-4">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//           className="text-center mb-16"
//         >
//           <h2 className="text-4xl font-bold text-white mb-4">Our Testimonials</h2>
//           <p className="text-lg text-gray-400 max-w-2xl mx-auto">
//             Hear what our users have to say about their experience with our Automated Seat Booking System
//           </p>
//         </motion.div>

//         <motion.div
//           ref={ref}
//           variants={containerVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
//         >
//           {testimonials.map((testimonial) => (
//             <motion.div
//               key={testimonial.id}
//               variants={itemVariants}
//               className="relative bg-slate-800 rounded-2xl p-6 shadow-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300"
//             >
//               {/* Quote Icon */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.5 }}
//                 whileInView={{ opacity: 0.3, scale: 1 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.5 }}
//                 className="absolute -top-4 left-4 text-7xl text-indigo-500 font-serif leading-none"
//               >
//                 "
//               </motion.div>

//               {/* Content */}
//               <div className="relative z-10">
//                 <motion.div
//                   whileHover={{ scale: 1.05 }}
//                   transition={{ duration: 0.2 }}
//                   className="flex items-center mb-4"
//                 >
//                   <img
//                     src={testimonial.image}
//                     alt={testimonial.name}
//                     className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/20"
//                   />
//                   <h5 className="ml-4 text-lg font-semibold text-white">{testimonial.name}</h5>
//                 </motion.div>

//                 <motion.p
//                   initial={{ opacity: 0 }}
//                   whileInView={{ opacity: 1 }}
//                   viewport={{ once: true }}
//                   transition={{ duration: 0.5, delay: 0.2 }}
//                   className="text-gray-300 leading-relaxed"
//                 >
//                   {testimonial.text}
//                 </motion.p>
//               </div>

//               {/* Bottom Quote Icon */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.5 }}
//                 whileInView={{ opacity: 0.3, scale: 1 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.5 }}
//                 className="absolute -bottom-4 right-4 text-7xl text-indigo-500 font-serif leading-none"
//               >
//                 "
//               </motion.div>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Testimonial;

import "./Testimonial.scss";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const testimonials = [
  {
    id: 1,
    image: "https://randomuser.me/api/portraits/men/10.jpg",
    name: "Gideon Ngetich",
    text: "The Automated Seat Reservation System has completely transformed how we book seats for lectures and events. It's fast, reliable, and eliminates the hassle of manual reservations.",
  },
  {
    id: 2,
    image: "https://randomuser.me/api/portraits/men/21.jpg",
    name: "Hillary Kiplangat",
    text: "A seamless experience! I no longer have to rush early to secure a seat. The system is easy to use and ensures fair access to available spots.",
  },
  {
    id: 3,
    image: "https://randomuser.me/api/portraits/men/3.jpg",
    name: "Emmanuel Kiptoo",
    text: "This system has significantly reduced congestion and confusion in seating arrangements. Booking a seat takes just a few seconds, making life much easier for students.",
  },
  {
    id: 4,
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Kigathi Dennis",
    text: "I appreciate how well this system integrates with our institution's schedule. It ensures that no seats go to waste and helps in effective space management.",
  },
  {
    id: 5,
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    name: "Dr. Malanga Kenedy",
    text: "As an educator, this platform has made organizing classes much more efficient. It ensures every student has an assigned seat, minimizing disruptions and improving attendance tracking.",
  },
  {
    id: 6,
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    name: "Brian Kemboi",
    text: "This reservation system has made my daily routine much smoother. No more last-minute seat hunting—everything is organized and stress-free!",
  },
  {
    id: 7,
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Allano Kurunye",
    text: "I love how user-friendly this system is. It's straightforward, efficient, and a game-changer for managing large student populations in lecture halls.",
  },
  {
    id: 8,
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Serah Wanjiru",
    text: "The best part about this system is its reliability. I can book my seat in advance and focus on my studies without worrying about getting a place.",
  },
];

const Testimonial = () => {
  const { ref } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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

  return (
    <div className="min-h-screen bg-slate-900 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Our Testimonials</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Hear what our users have to say about their experience with our Automated Seat Booking System
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              className="relative bg-slate-800 rounded-2xl p-6 shadow-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300"
            >
              {/* Quote Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 0.3, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="absolute -top-4 left-4 text-7xl text-indigo-500 font-serif leading-none"
              >
                "
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center mb-4"
                >
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/20"
                  />
                  <h5 className="ml-4 text-lg font-semibold text-white">{testimonial.name}</h5>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-gray-300 leading-relaxed"
                >
                  {testimonial.text}
                </motion.p>
              </div>

              {/* Bottom Quote Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 0.3, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="absolute -bottom-4 right-4 text-7xl text-indigo-500 font-serif leading-none"
              >
                "
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Testimonial;
