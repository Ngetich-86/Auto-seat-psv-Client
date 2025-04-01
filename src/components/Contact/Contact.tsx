import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import { FaEnvelope, FaUser, FaPaperPlane } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { ApiDomain } from "../../utils/ApiDomain";
import { RootState } from "../../app/store";

const Contact = () => {
  const navigate = useNavigate();
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const storedData = JSON.parse(localStorage.getItem("user") || "null");
  const storedUser = storedData?.user || storedData;
  const user = reduxUser?.user_id ? reduxUser : storedUser?.user_id ? storedUser : null;

  const [fullName, setFullName] = useState(user ? `${user.first_name} ${user.last_name}` : "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("user") || "null");
    const storedUser = storedData?.user || storedData;

    if (reduxUser?.user_id) {
      setFullName(`${reduxUser.first_name} ${reduxUser.last_name}`);
      setEmail(reduxUser.email);
    } else if (storedUser?.user_id) {
      setFullName(`${storedUser.first_name} ${storedUser.last_name}`);
      setEmail(storedUser.email);
    } else {
      setFullName("");
      setEmail("");
    }
  }, [reduxUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.warning("You must be logged in to send a message!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${ApiDomain}contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ full_name: fullName, email, subject, message }),
      });

      if (!response.ok) throw new Error("Failed to submit message");

      toast.success("Message sent successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error("Error sending message. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

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
      <ToastContainer />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Contact Us</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-indigo-500/20"
          >
            {/* Full Name Display */}
            <motion.div
              variants={itemVariants}
              className="mb-6"
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                <p className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-indigo-500/20 rounded-lg text-gray-300">
                  {fullName || "Loading..."}
                </p>
              </div>
            </motion.div>

            {/* Email Display */}
            <motion.div
              variants={itemVariants}
              className="mb-6"
            >
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                <p className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-indigo-500/20 rounded-lg text-gray-300">
                  {email || "Loading..."}
                </p>
              </div>
            </motion.div>

            {/* Subject Field */}
            <motion.div
              variants={itemVariants}
              className="mb-6"
            >
              <label htmlFor="subject" className="block text-gray-300 text-sm font-medium mb-2">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-indigo-500/20 rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </motion.div>

            {/* Message Field */}
            <motion.div
              variants={itemVariants}
              className="mb-6"
            >
              <label htmlFor="message" className="block text-gray-300 text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 bg-slate-700 border border-indigo-500/20 rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 resize-none"
              ></textarea>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FaPaperPlane />
                  Send Message
                </>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;