import { CheckCircle } from "lucide-react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";

const AboutSection = () => {
  const imageURL = "https://cdn.pixabay.com/photo/2017/02/01/00/42/bus-2028647_1280.png";

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
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
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center lg:space-x-12"
        >
        {/* Image Section */}
          <motion.div
            variants={itemVariants}
            className="lg:w-1/2 mb-12 lg:mb-0"
          >
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
            <img
              src={imageURL}
              alt="Public Transport Bus"
                  className="w-full h-[500px] rounded-2xl shadow-2xl object-cover border-2 border-indigo-500/20"
              loading="lazy"
                />
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="absolute -inset-4 bg-indigo-500/20 rounded-3xl blur-2xl"
            />
          </div>
          </motion.div>

        {/* Text Section */}
          <motion.div
            variants={itemVariants}
            className="lg:w-1/2 space-y-8"
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-white mb-4"
            >
              About Us
            </motion.h2>
            <motion.h3
              variants={itemVariants}
              className="text-3xl font-semibold text-indigo-400 mb-6"
            >
              Welcome to Automated Public Service Vehicle Seat Booking System
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-300 leading-relaxed"
            >
              At Automated Public Service Vehicle Seat Booking System, we are
              revolutionizing the public transportation experience with our
              innovative automated seat booking platform. Our system makes
              traveling convenient, whether you're commuting daily or heading out
              for an adventure.
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-300 leading-relaxed"
            >
              Enjoy real-time seat availability, a secure booking process, and
              reliable service at your fingertips. With our system, forget the
              hassle of crowded buses and last-minute booking stress.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="space-y-4"
            >
              {[
                "Real-time seat availability and booking",
                "Hassle-free and secure online payments",
                "Quick and easy booking process"
              ].map((feature, index) => (
                <motion.p
                  key={index}
                  variants={itemVariants}
                  className="text-lg text-gray-300 flex items-center"
                >
                  <CheckCircle className="mr-3 text-indigo-400" />
                  {feature}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

      {/* Stats Section */}
        <motion.div
        ref={ref}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { label: "Customers", value: 150, suffix: "Satisfied Customers" },
            { label: "Bookings", value: 5000, suffix: "Successful Bookings" },
            { label: "Routes", value: 200, suffix: "Covered Routes" },
            { label: "Vehicles", value: 1000, suffix: "Registered Vehicles" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300"
            >
              <p className="text-lg text-gray-400 mb-2">{stat.label}</p>
              <h4 className="text-3xl font-bold text-indigo-400 mb-2">
            {inView ? (
                  <CountUp start={0} end={stat.value} duration={2} suffix="+" />
            ) : (
              "0+"
            )}
          </h4>
              <p className="text-lg text-gray-400">{stat.suffix}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AboutSection;