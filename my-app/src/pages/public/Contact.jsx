import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaQuestionCircle, FaChevronDown, FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', course: '' });
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5002/api/leads', form);
      alert('Your enquiry has been received. Our team will contact you shortly.');
      setForm({ name: '', email: '', phone: '', message: '', course: '' });
    } catch (error) {
      alert('Something went wrong. Please call us directly.');
    }
  };

  const contactCards = [
    { icon: <FaPhoneAlt />, title: 'Call Us', details: ['+91-0612-250XXXX', '+91-98765 43210'], color: 'bg-blue-500' },
    { icon: <FaEnvelope />, title: 'Email Us', details: ['info@oasisjeeclasses.com', 'admissions@oasis.com'], color: 'bg-purple-500' },
    { icon: <FaMapMarkerAlt />, title: 'Visit Us', details: ['Above Corporation Bank, Saguna More, Patna - 800001'], color: 'bg-emerald-500' }
  ];

  const faqs = [
    { q: "How can I book a free demo class?", a: "You can book a demo by filling out the form on this page or calling our admissions desk directly. Demo classes are held every weekend." },
    { q: "What is the scholarship process?", a: "We conduct the Oasis Talent Search Exam (OTSE) twice a year. Students can get up to 100% scholarship based on their performance." },
    { q: "Do you provide hostel facilities?", a: "Yes, we have tie-ups with premium hostels near our campus that provide a safe and study-focused environment for outstation students." },
    { q: "What is the average batch size?", a: "To ensure individual attention, we maintain a strict limit of 30-35 students per batch." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-28 bg-[#0f172a] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Connect</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have questions? We're here to help you navigate your path to the IITs. Reach out via form, phone, or visit our campus.
          </p>
        </div>
      </section>

      {/* Contact Cards & Form */}
      <section className="py-24 relative -mt-16 z-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">

            {/* Left: Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              {contactCards.map((card, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 group hover:border-indigo-100 transition-all duration-300">
                  <div className={`w-14 h-14 ${card.color} text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>
                  {card.details.map((detail, dIdx) => (
                    <p key={dIdx} className="text-gray-600 mb-1">{detail}</p>
                  ))}
                </div>
              ))}

              <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 opacity-10 text-9xl -mr-10 -mb-10"><FaWhatsapp /></div>
                <h3 className="text-2xl font-bold mb-4">Quick WhatsApp</h3>
                <p className="text-blue-100 mb-6">Message us for immediate assistance regarding admissions.</p>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-bold transition-all shadow-lg">
                  <FaWhatsapp className="text-xl" /> Chat Now
                </a>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 border border-gray-100 h-full">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Admission Enquiry</h2>
                <p className="text-gray-500 mb-10 text-lg">Send us a message and our counselor will call you back within 24 hours.</p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter 10 digit number"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Select Course</label>
                    <select
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                    >
                      <option value="">Choose your goal</option>
                      <option value="JEE Foundation">JEE Foundation (9th/10th)</option>
                      <option value="JEE Main">JEE Main (11th/12th)</option>
                      <option value="JEE Advanced">JEE Advanced</option>
                      <option value="Repeater">Repeater Batch</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">How can we help you?</label>
                    <textarea
                      placeholder="Type your message here..."
                      rows="4"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <FaPaperPlane /> Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map & FAQs */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Map */}
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                <FaMapMarkerAlt className="text-indigo-600" /> Find Us on Map
              </h2>
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-50 h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115132.861072441!2d85.0730018441406!3d25.608175600000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed58376999b793%3A0xc3f92d43e579294!2sSaguna%20More%2C%20Danapur%20Nizamat%2C%20Patna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Oasis Location"
                ></iframe>
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                <FaQuestionCircle className="text-indigo-600" /> Common Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    <button
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-white transition-colors"
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    >
                      <span className="font-bold text-gray-800 text-lg">{faq.q}</span>
                      <FaChevronDown className={`text-indigo-500 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`transition-all duration-300 overflow-hidden ${activeFaq === idx ? 'max-h-40 p-6 pt-0 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 p-8 bg-indigo-50 rounded-3xl border border-indigo-100">
                <h4 className="font-bold text-indigo-900 mb-2">Still have questions?</h4>
                <p className="text-indigo-700 mb-4">Our education consultants are ready to walk you through the details of our programs.</p>
                <button className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline underline-offset-4">
                  Request a callback
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;