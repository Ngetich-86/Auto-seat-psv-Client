import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface MpesaPaymentModalProps {
  bookingId: number;
  amount: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
  onPaymentFailure: () => void;
}

const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  bookingId,
  amount,
  onClose,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const navigate = useNavigate();
  const pollTimerRef = useRef<number | null>(null);
  const maxPollAttempts = 40;
  const [pollAttempts, setPollAttempts] = useState(0);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length !== 12 || !phoneNumber.startsWith("254")) {
      toast.error("Please enter a valid phone number starting with 254.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
  
    setIsSubmitting(true);
    setIsPolling(false);
    setPollAttempts(0);
    toast.info("Initiating payment...", {
      position: "top-right",
      autoClose: 3000,
    });
  
    try {
      // const response = await fetch("https://backenc-automated-psvbs-deployment.onrender.com/mpesa/stkpush", {
        const response = await fetch("https://automatedseatservation-amhqc6atf9bxfzgq.southafricanorth-01.azurewebsites.net/mpesa/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          amount,
          booking_id: bookingId,
        }),
      });
  
      const data = await response.json();
  
      // Handle immediate M-Pesa errors
      if (data.error || data.errorCode || (data.ResponseCode && data.ResponseCode !== "0")) {
        let errorMessage = data.error || "Payment failed";
        
        // Specific error messages for common M-Pesa errors
        if (data.errorCode === "1") errorMessage = "Insufficient funds in your M-Pesa account";
        if (data.errorCode === "2001") errorMessage = "Wrong PIN entered. Please try again";
        if (data.ResponseCode === "1032") errorMessage = "Request cancelled by user";
        if (data.ResponseCode === "1037") errorMessage = "Timeout while waiting for PIN";
        
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
        onPaymentFailure();
        setIsSubmitting(false);
        return;
      }
  
      if (response.ok && data.data && data.data.CheckoutRequestID) {
        toast.success("Payment initiated. Complete payment on your phone.", {
          position: "top-right",
          autoClose: 3000,
        });
        const checkoutRequestID = data.data.CheckoutRequestID;
        setIsPolling(true);
        pollPaymentStatus(checkoutRequestID);
      } else {
        toast.error(data.error || "Failed to initiate payment. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
        onPaymentFailure();
        navigate("/dashboard/my_bookings");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("An error occurred while initiating payment.", {
        position: "top-right",
        autoClose: 3000,
      });
      onPaymentFailure();
      navigate("/dashboard/my_bookings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestID: string, retries = 3) => {
    try {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }

      if (pollAttempts >= maxPollAttempts) {
        toast.error("Payment confirmation timed out. Check your M-Pesa app.", {
          position: "top-right",
          autoClose: 5000,
        });
        setIsPolling(false);
        onPaymentFailure();
        navigate("/dashboard/my_bookings");
        return;
      }

      // const statusResponse = await fetch(
      //   `https://backenc-automated-psvbs-deployment.onrender.com/payment-status?checkout_request_id=${checkoutRequestID}`
      // );
      const statusResponse = await fetch(
        `https://automatedseatservation-amhqc6atf9bxfzgq.southafricanorth-01.azurewebsites.net/payment-status?checkout_request_id=${checkoutRequestID}`
      );

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        console.error("Status check error:", errorData);

        if (retries > 0) {
          setPollAttempts((prev) => prev + 1);
          pollTimerRef.current = window.setTimeout(() => pollPaymentStatus(checkoutRequestID, retries - 1), 3000);
          return;
        }

        if (statusResponse.status === 404) {
          toast.error("Payment not found. It may have been cancelled.", {
            position: "top-right",
            autoClose: 5000,
          });
          setIsPolling(false);
          onPaymentFailure();
          navigate("/dashboard/my_bookings");
          return;
        }

        toast.error("Error checking payment status.", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsPolling(false);
        onPaymentFailure();
        navigate("/dashboard/my_bookings");
        return;
      }

      const statusData = await statusResponse.json();
      console.log("Payment status:", statusData);

      if (statusData.payment_status === "completed") {
        toast.success("Payment confirmed successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setIsPolling(false);
        onPaymentSuccess();
        navigate("/dashboard/my_bookings");
      } else if (statusData.payment_status === "failed") {
        toast.error("Payment failed. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        });
        setIsPolling(false);
        onPaymentFailure();
        navigate("/dashboard/my_bookings");
      } else {
        setPollAttempts((prev) => prev + 1);
        pollTimerRef.current = window.setTimeout(() => pollPaymentStatus(checkoutRequestID), 3000);
      }
    } catch (error) {
      console.error("Error polling payment status:", error);

      if (retries > 0) {
        setPollAttempts((prev) => prev + 1);
        pollTimerRef.current = window.setTimeout(() => pollPaymentStatus(checkoutRequestID, retries - 1), 3000);
        return;
      }

      toast.error("Error confirming payment.", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsPolling(false);
      onPaymentFailure();
      navigate("/dashboard/my_bookings");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <ToastContainer />
      <div className="bg-[#1E293B] p-6 rounded-2xl shadow-2xl w-full md:w-1/3 border border-indigo-500/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">M-Pesa Payment</h2>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white transition-colors"
            disabled={isSubmitting || isPolling}
          >
            ✕
          </button>
        </div>

        {isPolling && (
          <div className="mb-6 bg-indigo-900/30 p-4 rounded-xl border border-indigo-500/20">
            <p className="text-indigo-200">
              Waiting for payment confirmation... ({pollAttempts}/{maxPollAttempts})
            </p>
            <p className="text-sm text-indigo-300 mt-2">
              Please complete the payment on your phone
            </p>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="phoneNumber" className="block mb-2 text-indigo-200">
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full py-2 px-3 rounded-lg bg-[#0F172A] text-indigo-200 border border-indigo-500/20 focus:border-indigo-500 placeholder-indigo-400/50"
            placeholder="254XXXXXXXXX"
            disabled={isPolling}
          />
        </div>

        <div className="mb-6 p-4 bg-[#0F172A] rounded-xl border border-indigo-500/20">
          <p className="text-lg font-semibold text-indigo-200">Amount: <span className="text-indigo-400">KSh {amount.toFixed(2)}</span></p>
          <p className="text-lg font-semibold text-indigo-200 mt-2">Booking ID: <span className="text-indigo-400">{bookingId}</span></p>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-indigo-200 hover:text-white transition-colors"
            disabled={isSubmitting || isPolling}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePayment}
            className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${
              isSubmitting || isPolling 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
            disabled={isSubmitting || isPolling}
          >
            {isSubmitting ? "Processing..." : isPolling ? "Waiting..." : "Pay via M-Pesa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MpesaPaymentModal;