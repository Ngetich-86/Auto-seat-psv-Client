import "./Testimonial.scss";

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
  return (
    <>
      <h1 className="text-center font-bold">Our Testimonials</h1>
      <div className="testimonial-container">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="testimonial relative">
            <div className="absolute -top-4 left-4 text-7xl text-blue-500 opacity-30 font-serif leading-none">"</div>
            
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="testimonial-img relative z-10"
            />
            <h5 className="relative z-10">{testimonial.name}</h5>
            <p className="relative z-10">{testimonial.text}</p>
            
            <div className="absolute -bottom-8 right-4 text-7xl text-blue-500 opacity-30 font-serif leading-none">"</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Testimonial;
