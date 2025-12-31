import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, RadialLinearScale, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    FaUserGraduate, FaIdCard, FaLayerGroup, FaChalkboardTeacher,
    FaMoneyBillWave, FaCalendarAlt, FaBook, FaBullhorn, FaUser,
    FaChartLine, FaHistory, FaCommentDots, FaFilePdf, FaArrowUp, FaArrowDown,
    FaBell, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaCreditCard, FaLock, FaCheck,
    FaChevronRight, FaSignOutAlt, FaHome, FaWallet, FaGraduationCap, FaEnvelopeOpenText
} from 'react-icons/fa';
import oasisLogo from '../assets/oasis_logo.png';

ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement);

const ParentDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState({});
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [marks, setMarks] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [notices, setNotices] = useState([]);
    const [fees, setFees] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');

    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // Fixed initial mismatch
    const [paymentDetails, setPaymentDetails] = useState({ ref: '', bankName: '', remarks: '' });
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [showMobileNav, setShowMobileNav] = useState(false);
    const [viewedMonth, setViewedMonth] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [viewAllNotices, setViewAllNotices] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchProfile();
            fetchChildren();
            fetchMaterials();
            fetchNotices();
            fetchNotifications();
        }
    }, [user]);

    useEffect(() => {
        if (selectedChild) {
            fetchAttendance(selectedChild);
            fetchMarks(selectedChild);
            fetchFees(selectedChild);
            fetchSchedules(selectedChild);
        }
    }, [selectedChild]);

    const fetchSchedules = async (id) => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get(`http://localhost:5002/api/schedule/student/${id}`, { headers });
            setSchedules(res.data);
        } catch (err) {
            console.error('Error fetching schedules:', err);
        }
    };

    const fetchProfile = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get('http://localhost:5002/api/auth/me', { headers });
            setProfile(res.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const fetchChildren = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get('http://localhost:5002/api/users/parent/students', { headers });
            setChildren(res.data);
            if (res.data.length > 0) setSelectedChild(res.data[0]._id);
        } catch (err) {
            console.error('Error fetching children:', err);
            setChildren([]);
        }
    };

    const fetchAttendance = async (id) => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get(`http://localhost:5002/api/attendance/student/${id}`, { headers });
            setAttendance(res.data);
        } catch (err) {
            console.error('Error fetching attendance:', err);
        }
    };

    const fetchMarks = async (id) => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get(`http://localhost:5002/api/marks/student/${id}`, { headers });
            setMarks(res.data);
        } catch (err) {
            console.error('Error fetching marks:', err);
        }
    };

    const fetchFees = async (id) => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get(`http://localhost:5002/api/fees/student/${id}`, { headers });
            setFees(res.data);
        } catch (err) {
            console.error('Error fetching fees:', err);
        }
    };

    const fetchMaterials = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get('http://localhost:5002/api/study-material', { headers });
            setMaterials(res.data);
        } catch (err) {
            console.error('Error fetching materials:', err);
        }
    };

    const fetchNotices = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get('http://localhost:5002/api/notices', { headers });
            setNotices(res.data);
        } catch (err) {
            console.error('Error fetching notices:', err);
        }
    };

    const fetchNotifications = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const res = await axios.get('http://localhost:5002/api/notifications', { headers });
            setNotifications(res.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!paymentAmount || paymentAmount <= 0) return alert('Enter valid amount');

        setPaymentLoading(true);
        const token = sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            if (paymentMethod === 'Razorpay') {
                // Check if Razorpay is loaded
                if (!window.Razorpay) {
                    alert('Razorpay Gateway is not reachable. Please check your internet or disable ad-blockers.');
                    setPaymentLoading(false);
                    return;
                }

                // 1. Create Order on Backend
                try {
                    const orderRes = await axios.post('http://localhost:5002/api/fees/razorpay/order', {
                        amount: paymentAmount
                    }, { headers });

                    const { amount, id: order_id, currency } = orderRes.data;

                    // 2. Initialize Razorpay Checkout
                    const options = {
                        key: 'rzp_test_eYqCAnN83D89mB', // Standard test key placeholder
                        amount: amount,
                        currency: currency,
                        name: "Oasis Institute",
                        description: `Fee Payment for ${currentChild?.name}`,
                        image: oasisLogo,
                        order_id: order_id,
                        handler: async function (response) {
                            try {
                                await axios.post('http://localhost:5002/api/fees/razorpay/verify', {
                                    ...response,
                                    studentId: selectedChild,
                                    amount: paymentAmount
                                }, { headers });

                                alert('Payment Verified and Successful!');
                                setShowPaymentModal(false);
                                setPaymentAmount('');
                                setPaymentDetails({ ref: '', bankName: '', remarks: '' });
                                fetchFees(selectedChild);
                            } catch (err) {
                                console.error('Verification Error:', err);
                                alert('Payment Verification Failed: ' + (err.response?.data?.message || err.message));
                            }
                        },
                        prefill: {
                            name: profile.name,
                            email: profile.email,
                        },
                        theme: {
                            color: "#6366f1",
                        },
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } catch (orderErr) {
                    console.error('Order Creation error:', orderErr);
                    alert('Online Gateways are under maintenance. Please use the "Scannable QR" or "Bank Transfer" option for immediate payment.');
                }
            } else {
                // Manual/Offline Payment Request (UPI QR or Bank)
                await axios.post('http://localhost:5002/api/fees/pay', {
                    studentId: selectedChild,
                    amount: paymentAmount,
                    paymentMethod: paymentMethod,
                    transactionId: paymentDetails.ref,
                    remarks: `${paymentDetails.bankName ? 'Source: ' + paymentDetails.bankName : ''} ${paymentDetails.remarks}`
                }, { headers });

                alert(`${paymentMethod} Transaction Logged Successfully!`);
                setShowPaymentModal(false);
                setPaymentAmount('');
                setPaymentDetails({ ref: '', bankName: '', remarks: '' });
                fetchFees(selectedChild);
            }

        } catch (err) {
            console.error('Payment Error Details:', err.response?.data || err.message);
            alert(`Payment Error: ${err.response?.data?.message || 'Could not connect to financial server'}`);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleDownloadReport = () => {
        window.print();
    };

    const marksData = {
        labels: marks.map(m => m.subjectId?.name || 'Subject'),
        datasets: [{
            label: 'Performance %',
            data: marks.map(m => m.marks),
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            borderColor: '#6366f1',
            borderWidth: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#6366f1',
            pointHoverRadius: 8,
            fill: true,
            tension: 0.45
        }],
    };

    const attendanceChartData = {
        labels: ['Present', 'Absent'],
        datasets: [{
            data: [
                attendance.filter(a => a.status === 'present').length,
                attendance.filter(a => a.status === 'absent').length
            ],
            backgroundColor: ['#10b981', '#f43f5e'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const activeNotices = notices.filter(n => n.targetRoles.includes('parent')).reverse(); // Oldest first, newest last
    const currentChild = children.find(c => c._id === selectedChild);

    const NavItem = ({ label, icon: Icon, active, onClick }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl w-full transition-all duration-300 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
        >
            <div className={`text-lg ${active ? 'text-white' : 'group-hover:text-indigo-600'}`}>
                <Icon />
            </div>
            <span className="font-bold text-sm tracking-tight">{label}</span>
            {active && <FaChevronRight className="ml-auto text-[10px] opacity-40" />}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900 overflow-x-hidden">

            {/* Mobile Sidebar Overlay */}
            {showMobileNav && (
                <div
                    className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setShowMobileNav(false)}
                >
                    <aside
                        className="w-72 bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <img src={oasisLogo} alt="" className="w-6 h-6 object-contain brightness-0 invert" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Oasis</h2>
                        </div>
                        <nav className="p-6 space-y-1">
                            <NavItem label="Overview" icon={FaHome} active={activeTab === 'Overview'} onClick={() => { setActiveTab('Overview'); setShowMobileNav(false); }} />
                            <NavItem label="Payments" icon={FaWallet} active={activeTab === 'Fees'} onClick={() => { setActiveTab('Fees'); setShowMobileNav(false); }} />
                            <NavItem label="Attendance" icon={FaCalendarAlt} active={activeTab === 'Attendance'} onClick={() => { setActiveTab('Attendance'); setShowMobileNav(false); }} />
                            <NavItem label="Academic" icon={FaChartLine} active={activeTab === 'Performance'} onClick={() => { setActiveTab('Performance'); setShowMobileNav(false); }} />
                            <NavItem label="Resources" icon={FaBook} active={activeTab === 'Materials'} onClick={() => { setActiveTab('Materials'); setShowMobileNav(false); }} />
                        </nav>
                        <div className="absolute bottom-0 w-full p-6 border-t border-slate-50">
                            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-500 hover:bg-rose-50 transition-all font-bold text-xs">
                                <FaSignOutAlt /> Logout Session
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Minimalist Sidebar (Desktop) */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col fixed h-full z-40 no-print hidden lg:flex">
                <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                        <img src={oasisLogo} alt="" className="w-6 h-6 object-contain brightness-0 invert" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Oasis</h2>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Parent Portal</span>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-1">
                    <NavItem label="Overview" icon={FaHome} active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
                    <NavItem label="Payments" icon={FaWallet} active={activeTab === 'Fees'} onClick={() => setActiveTab('Fees')} />
                    <NavItem label="Attendance" icon={FaCalendarAlt} active={activeTab === 'Attendance'} onClick={() => setActiveTab('Attendance')} />
                    <NavItem label="Academic" icon={FaChartLine} active={activeTab === 'Performance'} onClick={() => setActiveTab('Performance')} />
                    <NavItem label="Resources" icon={FaBook} active={activeTab === 'Materials'} onClick={() => setActiveTab('Materials')} />
                </nav>

                <div className="p-6 border-t border-slate-50 bg-slate-50/20">
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold text-xs">
                        <FaSignOutAlt className="text-sm opacity-60" /> Logout Session
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 p-4 lg:p-8 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Top Header - Redesigned for Parent Clarity */}
                    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md p-4 rounded-b-[2rem] border-b border-slate-100 shadow-sm no-print">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowMobileNav(true)}
                                    className="lg:hidden w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 transition-all active:scale-90"
                                >
                                    <div className="space-y-1">
                                        <div className="w-5 h-0.5 bg-indigo-600 rounded-full"></div>
                                        <div className="w-3 h-0.5 bg-indigo-600 rounded-full"></div>
                                        <div className="w-5 h-0.5 bg-indigo-600 rounded-full"></div>
                                    </div>
                                </button>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Oasis</h1>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Parent Portal</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-4">
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                >
                                    <FaCreditCard className="text-xs" />
                                    <span>Pay</span>
                                </button>

                                <button onClick={() => setShowNotifications(!showNotifications)} className="relative w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 border border-slate-100">
                                    <FaBell className="text-sm" />
                                    {notifications.some(n => !n.read) && <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-bounce"></span>}
                                </button>

                                <div
                                    onClick={() => setActiveTab('Settings')}
                                    className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 overflow-hidden shrink-0 cursor-pointer shadow-sm hover:ring-4 hover:ring-indigo-50 transition-all"
                                >
                                    <img
                                        src={profile.profilePhoto ? `http://localhost:5002${profile.profilePhoto}` : `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff`}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sub-Header: Student Context Switcher */}
                        <div className="mt-4 flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-inner">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600"><FaUserGraduate className="text-sm" /></div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Student</p>
                                    <p className="text-xs font-black text-slate-800 tracking-tight">{currentChild?.name?.split(' ')[0]}</p>
                                </div>
                            </div>
                            {children.length > 1 && (
                                <select
                                    value={selectedChild}
                                    onChange={(e) => setSelectedChild(e.target.value)}
                                    className="bg-white px-3 py-1.5 rounded-lg text-xs font-black text-indigo-600 border border-slate-200 focus:ring-0 cursor-pointer shadow-sm outline-none"
                                >
                                    {children.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            )}
                        </div>
                    </header>

                    {/* Content Segments */}
                    {
                        activeTab === 'Overview' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Top Compact Section: Profile & Mini Chart */}
                                <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-12 lg:col-span-5 bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                        <div className="relative z-10 flex flex-row items-center gap-5">
                                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/10 p-1 shrink-0 backdrop-blur-md border border-white/20">
                                                <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
                                                    {currentChild?.userId?.profilePhoto ? (
                                                        <img src={`http://localhost:5002${currentChild.userId.profilePhoto}`} className="w-full h-full object-cover" alt="" />
                                                    ) : <FaUserGraduate className="text-3xl text-indigo-600" />}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.3em] mb-1">Student Profile</p>
                                                <h2 className="text-xl md:text-3xl font-black tracking-tight leading-none mb-2">{currentChild?.name}</h2>
                                                <p className="text-[9px] font-black text-indigo-100/60 uppercase tracking-widest">{currentChild?.classId?.name} • {currentChild?.batchId?.name}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between bg-black/10 backdrop-blur-md p-3 rounded-xl border border-white/5">
                                            <div className="flex gap-4">
                                                <div>
                                                    <p className="text-[7px] font-bold text-indigo-300 uppercase tracking-widest">ID Roll</p>
                                                    <p className="font-black text-sm">#{currentChild?.rollNo || '00'}</p>
                                                </div>
                                                <div className="w-px h-6 bg-white/10 mx-1"></div>
                                                <div>
                                                    <p className="text-[7px] font-bold text-indigo-300 uppercase tracking-widest">Portal Access</p>
                                                    <p className="font-black text-sm uppercase">L-1 Secured</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setActiveTab('Settings')} className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:scale-105 transition-all shadow-lg active:scale-95">View Profile</button>
                                        </div>
                                    </div>

                                    {/* Row 2: Stats Grid - Repositioned for Priority */}
                                    <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Attendance', value: `${attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0}%`, icon: <FaCalendarAlt />, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
                                            { label: 'Avg Grade', value: `${marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.marks, 0) / marks.length) : 0}%`, icon: <FaChartLine />, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
                                            { label: 'Pending Fee', value: `₹${fees.pendingFees || 0}`, icon: <FaWallet />, color: 'bg-rose-50 text-rose-600', border: 'border-rose-100' },
                                            { label: 'Live Alerts', value: activeNotices.length, icon: <FaBullhorn />, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100', onClick: () => setShowNotifications(true) }
                                        ].map((stat, i) => (
                                            <div
                                                key={i}
                                                onClick={stat.onClick}
                                                className={`bg-white p-4 rounded-2xl border ${stat.border} shadow-sm flex flex-col items-start gap-3 transition-all active:scale-95 ${stat.onClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                                            >
                                                <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center text-sm shrink-0`}>
                                                    {stat.icon}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                                                    <h3 className="text-xl font-black text-slate-800 leading-none">{stat.value}</h3>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Row 3: Academic Pulse - Compact for Mobile */}
                                    <div className="col-span-12 bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center min-h-[180px]">
                                        <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-sm"><FaChartLine /></div>
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Academic Pulse</h3>
                                            </div>
                                            <span className="text-[8px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-full">Live Analytics</span>
                                        </div>

                                        {marks.length > 0 ? (
                                            <div className="h-[100px]">
                                                <Line
                                                    data={marksData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: { legend: { display: false } },
                                                        scales: { y: { display: false, beginAtZero: true, max: 100 }, x: { display: false } },
                                                        elements: { point: { radius: 2 }, line: { tension: 0.4, borderWidth: 2 } }
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-slate-400 font-bold uppercase text-center py-4">Waiting for first assessment report...</p>
                                        )}
                                    </div>

                                    {/* Row 4: Notice & Fee Side-by-Side (Stacked on mobile) */}
                                    <div className="col-span-12 grid grid-cols-12 gap-6">
                                        {/* Recent Notices */}
                                        <div className="col-span-12 lg:col-span-7 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Departmental Notices</h3>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Live</span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {activeNotices.length > 0 ? activeNotices.slice(0, viewAllNotices ? undefined : 3).map((n, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => setSelectedNotice(n)}
                                                        className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 group cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                                                    >
                                                        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-indigo-500 shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all"><FaInfoCircle /></div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-1">{n.title}</h4>
                                                            {n.createdAt && (
                                                                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                                                                    {new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </p>
                                                            )}
                                                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Click to read full notice →
                                                            </p>
                                                        </div>
                                                        <FaChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors self-center" />
                                                    </div>
                                                )) : (
                                                    <p className="text-center py-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">No active circulars</p>
                                                )}
                                                {activeNotices.length > 3 && !viewAllNotices && (
                                                    <button
                                                        onClick={() => setViewAllNotices(true)}
                                                        className="w-full py-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-dashed border-indigo-100 rounded-xl hover:bg-indigo-50 transition-all"
                                                    >
                                                        View All {activeNotices.length} Alerts
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Fee Portal Column */}
                                        <div className="col-span-12 lg:col-span-5 bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12"></div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-center mb-6">
                                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Financial Portal</p>
                                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400"><FaWallet /></div>
                                                </div>
                                                <div className="mb-6">
                                                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">Outstanding Balance</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-black text-slate-600">₹</span>
                                                        <h4 className="text-3xl font-black text-white tracking-tighter tabular-nums">{fees.pendingFees || 0}</h4>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setShowPaymentModal(true)}
                                                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-500 transition-all active:scale-95"
                                                >Initialize Payment</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full Width Detailed Chart at Bottom */}
                                    <div className="col-span-12 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Full Academic Analysis</h3>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Comprehensive Performance Timeline</p>
                                            </div>
                                            <button onClick={() => setActiveTab('Performance')} className="px-5 py-2.5 rounded-xl border border-slate-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-slate-50 transition-all">Detailed Analytics</button>
                                        </div>
                                        <div className="h-[250px]">
                                            <Line
                                                data={marksData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: { legend: { display: false } },
                                                    scales: { y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    {activeTab === 'Fees' && (
                        <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="col-span-12 lg:col-span-5 space-y-6">
                                <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[350px] md:min-h-[400px]">
                                    <div>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-inner"><FaWallet /></div>
                                            <div>
                                                <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Fee Summary</h2>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Billing Cycle</p>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end border-b border-slate-50 pb-6">
                                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Total Course Fee</p>
                                                <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">₹{fees.totalFees || 0}</p>
                                            </div>
                                            <div className="flex justify-between items-end border-b border-slate-50 pb-6">
                                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-emerald-500">Amount Paid</p>
                                                <p className="text-xl md:text-2xl font-black text-emerald-600 tracking-tighter">₹{fees.paidFees || 0}</p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-rose-500">Remaining Balance</p>
                                                <h4 className="text-3xl md:text-5xl font-black text-rose-500 tracking-tighter">₹{fees.pendingFees || 0}</h4>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="w-full py-5 md:py-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all mt-10"
                                    >Authorize Transaction</button>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-7">
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
                                    <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/10">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-3"><FaHistory className="text-indigo-400" /> Transaction Ledger</h3>
                                        <button onClick={handleDownloadReport} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 px-6 py-2 rounded-xl bg-white shadow-sm hover:bg-indigo-50 transition-all w-full sm:w-auto">Export Report</button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-8 space-y-3">
                                        {fees.payments?.length > 0 ? [...fees.payments].reverse().map((p, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-50 hover:border-indigo-100 transition-all group">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><FaCheckCircle /></div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{p.mode || 'Terminal Payment'}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(p.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-slate-800 tracking-tighter">₹{p.amount}</p>
                                                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Success</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-20 opacity-20">
                                                <FaEnvelopeOpenText className="text-6xl mx-auto mb-4" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No previous entries found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Attendance' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
                            {/* Next Day Schedule at Top */}
                            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden max-w-5xl mx-auto w-full">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                <div className="relative z-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                                        <div>
                                            <h3 className="text-xl font-black tracking-tight uppercase">Chronos / Academic Roadmap</h3>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Instructional sessions for the upcoming cycle</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white/5 p-2 pr-4 rounded-2xl border border-white/5">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg"><FaCalendarAlt /></div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none">Status</p>
                                                <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Live Tracking</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(() => {
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            const tomDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
                                            const tomSchedule = schedules.filter(s => s.day === tomDay);

                                            if (tomSchedule.length === 0) return (
                                                <div className="col-span-full py-10 text-center opacity-30 border-2 border-dashed border-white/10 rounded-2xl">
                                                    <FaCheckCircle className="text-2xl mx-auto mb-2" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">No active sessions scheduled for {tomDay}</p>
                                                </div>
                                            );

                                            return tomSchedule.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((s, i) => (
                                                <div key={i} className="group relative p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-default">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight line-clamp-1">{s.subjectId?.name}</h4>
                                                            <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">Fac. {s.teacherId?.name || 'Academic'}</p>
                                                        </div>
                                                        <span className="text-[8px] font-black tabular-nums bg-indigo-500/30 px-2 py-0.5 rounded text-indigo-200 border border-indigo-500/20">{s.startTime}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex -space-x-1.5">
                                                            {[1, 2].map(j => <div key={j} className="w-5 h-5 rounded-full border border-slate-900 bg-slate-800 overflow-hidden"><img src={`https://ui-avatars.com/api/?name=S${j}&background=random&color=fff`} className="w-full h-full object-cover" /></div>)}
                                                            <div className="w-5 h-5 rounded-full border border-slate-900 bg-indigo-600 flex items-center justify-center text-[7px] font-black">+</div>
                                                        </div>
                                                        <button className="text-[8px] font-black uppercase text-indigo-400 opacity-60 hover:opacity-100 transition-opacity">Details</button>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Heatmap / Calendar */}
                            <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
                                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600 font-black text-[10px] uppercase tracking-tighter">
                                                {viewedMonth.toLocaleDateString('en-US', { month: 'short' })}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800 tracking-tight capitalize">{viewedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                                                <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Attendance Heatmap</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setViewedMonth(new Date(viewedMonth.setMonth(viewedMonth.getMonth() - 1)))} className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400"><FaChevronRight className="rotate-180" /></button>
                                            <button onClick={() => setViewedMonth(new Date())} className="px-5 py-2 rounded-lg bg-white border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-800 hover:bg-slate-50">Today</button>
                                            <button onClick={() => setViewedMonth(new Date(viewedMonth.setMonth(viewedMonth.getMonth() + 1)))} className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400"><FaChevronRight /></button>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 overflow-x-auto">
                                        <div className="max-w-2xl mx-auto">
                                            {/* Weekday Labels */}
                                            <div className="grid grid-cols-7 gap-1 mb-2">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                    <div key={day} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest py-1">{day}</div>
                                                ))}
                                            </div>

                                            {/* Date Grid */}
                                            <div className="grid grid-cols-7 gap-2">
                                                {(() => {
                                                    const firstDay = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), 1);
                                                    const startDay = (firstDay.getDay() + 6) % 7; // Adjust Sunday to be index 6
                                                    const daysInMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 0).getDate();

                                                    const days = [];
                                                    // Empty slots before month start
                                                    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} className="aspect-square opacity-0"></div>);

                                                    // Actual dates
                                                    for (let d = 1; d <= daysInMonth; d++) {
                                                        const dateObj = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), d);
                                                        const dateStr = dateObj.toISOString().split('T')[0];
                                                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                                                        const isSunday = dateObj.getDay() === 0;

                                                        const dayAttendance = attendance.filter(a => new Date(a.date).toISOString().split('T')[0] === dateStr);
                                                        const hasAbsent = dayAttendance.some(a => a.status === 'absent');
                                                        const hasPresent = dayAttendance.some(a => a.status === 'present');

                                                        let bgColor = "hover:bg-slate-100";
                                                        let textColor = "text-slate-700";
                                                        let indicator = null;

                                                        if (hasPresent) {
                                                            bgColor = "bg-emerald-50 hover:bg-emerald-100 border border-emerald-100";
                                                            textColor = "text-emerald-700";
                                                            indicator = <div className="w-1 h-1 bg-emerald-500 rounded-full mt-0.5"></div>;
                                                        } else if (hasAbsent) {
                                                            bgColor = "bg-rose-50 hover:bg-rose-100 border border-rose-100";
                                                            textColor = "text-rose-700";
                                                            indicator = <div className="w-1 h-1 bg-rose-500 rounded-full mt-0.5"></div>;
                                                        } else {
                                                            // No entry. If past date and not Sunday, show as missing (red)
                                                            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                                                            const hasClass = schedules.some(s => s.day === dayOfWeek);

                                                            if (dateObj < new Date() && !isSunday && hasClass) {
                                                                bgColor = "bg-rose-50/50 hover:bg-rose-100/50 grayscale opacity-60";
                                                                textColor = "text-rose-400";
                                                            } else if (isSunday) {
                                                                textColor = "text-slate-300";
                                                                bgColor = "bg-slate-50/30 opacity-40 cursor-not-allowed";
                                                            }
                                                        }

                                                        days.push(
                                                            <button
                                                                key={d}
                                                                onClick={() => setSelectedDate(dateObj)}
                                                                className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all group relative overflow-hidden ${bgColor} ${isToday ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}`}
                                                            >
                                                                {isToday && <div className="absolute top-0 right-0 p-1"><div className="w-1 h-1 bg-indigo-500 rounded-full"></div></div>}
                                                                <span className={`text-sm font-black tabular-nums transition-transform group-hover:scale-110 ${textColor}`}>{d}</span>
                                                                {indicator}
                                                            </button>
                                                        );
                                                    }
                                                    return days;
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-center gap-6">
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div><span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Present</span></div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div><span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Missed</span></div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div><span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Off-cycle</span></div>
                                    </div>
                                </div>

                                {/* Selected Day Details Panel */}
                                {selectedDate && (
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl animate-in slide-in-from-bottom-6 duration-500">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Timeline: {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</h3>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Micro-detail Chronology</p>
                                            </div>
                                            <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-slate-800"><FaTimesCircle className="text-xl" /></button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {(() => {
                                                const dateStr = selectedDate.toISOString().split('T')[0];
                                                const dayLog = attendance.filter(a => new Date(a.date).toISOString().split('T')[0] === dateStr);
                                                const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
                                                const daySchedule = schedules.filter(s => s.day === dayOfWeek);

                                                if (daySchedule.length === 0 && dayLog.length === 0) return (
                                                    <div className="col-span-full py-20 text-center opacity-20 italic font-medium">No recorded curriculum activity for this date.</div>
                                                );

                                                return daySchedule.map((s, i) => {
                                                    const att = dayLog.find(al => al.subjectId?._id === s.subjectId?._id);
                                                    return (
                                                        <div key={i} className="flex flex-col gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-all">
                                                            <div className="flex justify-between items-start">
                                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-500 text-lg"><FaChalkboardTeacher /></div>
                                                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${att ? (att.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200') : 'bg-slate-200 text-slate-400 border-slate-300 opacity-50'}`}>
                                                                    {att ? att.status : 'Not Marked'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{s.subjectId?.name}</h4>
                                                                <p className="text-[10px] font-bold text-slate-400">Class Block: {s.startTime} - {s.endTime}</p>
                                                            </div>
                                                            <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{s.teacherId?.name || 'Authorized Faculty'}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Academic / Performance Tab */}
                    {activeTab === 'Performance' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="flex flex-col lg:flex-row justify-between items-start md:items-end gap-6 mb-12">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Academic Transcript</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-Assessment Scoring Analysis</p>
                                    </div>
                                    <button onClick={handleDownloadReport} className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all no-print">Export Transcript</button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                                <th className="pb-6 px-4">Subject Faculty</th>
                                                <th className="pb-6 px-4">Cycle</th>
                                                <th className="pb-6 px-4 text-center">Score Index</th>
                                                <th className="pb-6 px-4">Analysis / Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {marks.length > 0 ? marks.map((m, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                                                    <td className="py-8 px-4 font-black text-lg text-slate-800 uppercase tracking-tight">{m.subjectId?.name}</td>
                                                    <td className="py-8 px-4">
                                                        <span className="px-4 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tighter border border-slate-200">{m.examId?.name || 'Unit Assessment'}</span>
                                                    </td>
                                                    <td className="py-8 px-4">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className={`text-2xl font-black tabular-nums ${m.marks > 80 ? 'text-emerald-500' : m.marks > 50 ? 'text-indigo-500' : 'text-rose-500'}`}>{m.marks}%</span>
                                                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className={`h-full ${m.marks > 80 ? 'bg-emerald-500' : m.marks > 50 ? 'bg-indigo-500' : 'bg-rose-500'}`} style={{ width: `${m.marks}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-8 px-4 max-w-sm">
                                                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-4">{m.remarks || 'Standard academic performance maintained throughout this evaluation cycle.'}</p>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="py-20 text-center text-slate-400">No assessment records detected in the terminal.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )
                    }

                    {/* Resources / Materials Tab */}
                    {
                        activeTab === 'Materials' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                {materials.length > 0 ? materials.map((m, idx) => (
                                    <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-2xl transition-all duration-500">
                                        <div className="space-y-8">
                                            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><FaBook /></div>
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight line-clamp-2 uppercase">{m.title}</h3>
                                                <p className="text-xs text-slate-400 font-bold leading-relaxed line-clamp-3">Curated department resource for the 2024 academic cycle. Access restricted to authorized portal users.</p>
                                            </div>
                                        </div>
                                        <a
                                            href={`http://localhost:5002/${m.fileUrl}`}
                                            download
                                            className="mt-10 flex items-center justify-center gap-3 w-full py-5 bg-slate-50 border border-slate-100 rounded-2xl text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-bold"
                                        >
                                            <FaFilePdf className="text-lg" /> Access Data Stream
                                        </a>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-32 text-center opacity-30">
                                        <FaFilePdf className="text-8xl mx-auto mb-6" />
                                        <p className="text-xs font-black uppercase tracking-widest">Repository is currently empty</p>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {/* Profile / Settings Tab */}
                    {
                        activeTab === 'Settings' && (
                            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                                    <div className="h-40 bg-indigo-600 relative">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                        <div className="absolute -bottom-16 left-12">
                                            <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                                                <div className="w-full h-full rounded-[2rem] bg-indigo-50 overflow-hidden flex items-center justify-center">
                                                    {profile.profilePhoto ? (
                                                        <img src={`http://localhost:5002${profile.profilePhoto}`} className="w-full h-full object-cover" />
                                                    ) : <FaUser className="text-5xl text-indigo-200" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-24 p-6 md:p-12">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 mb-12">
                                            <div>
                                                <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">{profile.name}</h2>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <p className="text-[10px] md:text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">Authorized Parent Profile</p>
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                                    <FaCheckCircle className="text-sm" /> Verified
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-6">
                                                <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                                        <FaIdCard className="text-indigo-400" /> Essential Details
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Registered Email</p>
                                                            <p className="text-base font-bold text-slate-700">{profile.email}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mobile Contact</p>
                                                            <p className="text-base font-bold text-slate-700">{profile.phone || '+91 XXXX-XXXXXX'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Residential Locale</p>
                                                            <p className="text-base font-bold text-slate-700">{profile.address || 'Standard Residency'}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unique Portal ID</p>
                                                            <p className="text-base font-bold text-indigo-600 tabular-nums">#PRS-{profile._id?.slice(-6).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-xl shadow-indigo-100 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-6">Security Clearance</p>
                                                    <div className="space-y-6 relative z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl backdrop-blur-md border border-white/10"><FaLock /></div>
                                                            <div>
                                                                <p className="text-[8px] font-black text-indigo-200 uppercase">Access Tier</p>
                                                                <p className="text-sm font-black">L-3 Parent Admin</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={logout} className="w-full py-4 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all shadow-lg active:scale-95">Terminate Session</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center max-w-2xl mx-auto">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-sm"><FaInfoCircle /></div>
                                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">Account Modifications</h4>
                                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Security protocols require administrative verification for profile changes. To update your authenticated contact details or address, please visit the central office with valid identification.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            </main>

            {/* Notification Drawer - Combined Notices & Notifications */}
            {
                showNotifications && (
                    <div onClick={() => setShowNotifications(false)} className="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-sm">
                        <div onClick={e => e.stopPropagation()} className="absolute right-0 top-0 h-full w-full max-w-[400px] bg-white shadow-2xl border-l border-slate-100 animate-in slide-in-from-right duration-300 flex flex-col">
                            <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">All Alerts</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Notices & Updates</p>
                                </div>
                                <button onClick={() => setShowNotifications(false)} className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center"><FaTimesCircle /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                                {/* Broadcast Notices Section */}
                                {activeNotices.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <FaBullhorn className="text-amber-500 text-sm" />
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Broadcast Notices</h4>
                                            <span className="ml-auto w-5 h-5 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-[9px] font-black">{activeNotices.length}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {activeNotices.map((n, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        setSelectedNotice(n);
                                                        setShowNotifications(false);
                                                    }}
                                                    className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50 hover:shadow-md transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className="w-2 h-2 bg-amber-500 rounded-full shrink-0"></div>
                                                            <p className="font-black text-sm text-slate-900 tracking-tight flex-1">{n.title}</p>
                                                        </div>
                                                        <FaChevronRight className="text-xs text-slate-300 group-hover:text-amber-500 transition-colors shrink-0" />
                                                    </div>
                                                    {n.createdAt && (
                                                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-2 ml-5 font-bold">
                                                            {new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    )}
                                                    <div className="mt-3 ml-5">
                                                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                                                            Tap to view details →
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Personal Notifications Section */}
                                {notifications.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <FaBell className="text-indigo-500 text-sm" />
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Updates</h4>
                                            <span className="ml-auto w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[9px] font-black">{notifications.filter(n => !n.read).length || notifications.length}</span>
                                        </div>
                                        <div className="space-y-3">
                                            {notifications.map(n => (
                                                <div key={n._id} className={`p-4 rounded-xl border ${!n.read ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                                    <p className="font-bold text-xs text-slate-900 mb-1">{n.title}</p>
                                                    <p className="text-[10px] text-slate-500 leading-relaxed">{n.message}</p>
                                                    {n.createdAt && (
                                                        <p className="text-[8px] text-slate-400 uppercase tracking-widest mt-2 font-bold">
                                                            {new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {activeNotices.length === 0 && notifications.length === 0 && (
                                    <div className="text-center py-20 opacity-30">
                                        <FaBell className="text-6xl mx-auto mb-4 text-slate-300" />
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">No alerts at this time</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Payment Modal Overlay */}
            {
                showPaymentModal && (
                    <div
                        onClick={() => !paymentLoading && setShowPaymentModal(false)}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100"
                        >
                            <div className="p-6 md:p-8 pb-4 flex justify-between items-center bg-white border-b border-slate-50">
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Financial Authorization</h2>
                                <button onClick={() => setShowPaymentModal(false)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center"><FaTimesCircle className="text-xl" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-6 custom-scrollbar">
                                <form onSubmit={handlePayment} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Configure Amount (INR)</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                className="w-full pl-12 pr-6 py-5 bg-slate-50 rounded-2xl border-none font-black text-2xl text-slate-800 shadow-inner focus:ring-2 focus:ring-indigo-100 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Payment Protocol</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'Razorpay', label: 'Online Portal', icon: <FaCreditCard /> },
                                                { id: 'UPI', label: 'Scannable QR', icon: <FaLayerGroup /> },
                                                { id: 'Bank', label: 'Bank Transfer', icon: <FaHistory /> }
                                            ].map(method => (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => setPaymentMethod(method.id)}
                                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-sm' : 'border-slate-50 hover:border-slate-100 text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <span className="text-xl">{method.icon}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-tighter">{method.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {paymentMethod === 'UPI' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center gap-4 shadow-inner">
                                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">Scan with any Payment App</p>
                                                <div className="w-48 h-48 bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-center">
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=oasis@upi&pn=Oasis%20Institute&am=${paymentAmount}&cu=INR&tn=Fee%20Payment`)}`}
                                                        className="w-full h-full"
                                                        alt="UPI QR Code"
                                                    />
                                                </div>
                                                <div className="flex gap-2 w-full mt-2">
                                                    <a
                                                        href={`upi://pay?pa=oasis@upi&pn=Oasis%20Institute&am=${paymentAmount}&cu=INR&tn=Fee%20Payment`}
                                                        className="flex-1 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest text-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                                    >
                                                        Open UPI App
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Confirmation</p>
                                                <input
                                                    type="text"
                                                    placeholder="Enter Payment App Used (e.g. PhonePe)"
                                                    value={paymentDetails.bankName}
                                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                                                    className="w-full px-5 py-3.5 bg-slate-50 rounded-xl border-none text-[11px] font-bold text-slate-700 shadow-sm"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Reference ID (Optional)"
                                                    value={paymentDetails.ref}
                                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, ref: e.target.value })}
                                                    className="w-full px-5 py-3.5 bg-slate-50 rounded-xl border-none text-[11px] font-bold text-slate-700 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {['Bank', 'UPI'].includes(paymentMethod) && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Verification Artifacts</p>
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        placeholder={paymentMethod === 'UPI' ? "Your UPI ID (e.g. user@okaxis)" : "Reference Number / TXN ID"}
                                                        value={paymentDetails.ref}
                                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, ref: e.target.value })}
                                                        className="w-full px-5 py-3.5 bg-white rounded-xl border-none text-[11px] font-bold text-slate-700 shadow-sm placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder={paymentMethod === 'UPI' ? "App Name (PhonePe/GPay)" : "Your Bank Name"}
                                                        value={paymentDetails.bankName}
                                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                                                        className="w-full px-5 py-3.5 bg-white rounded-xl border-none text-[11px] font-bold text-slate-700 shadow-sm placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                                    />
                                                    <textarea
                                                        placeholder="Confirmation Remarks"
                                                        value={paymentDetails.remarks}
                                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, remarks: e.target.value })}
                                                        className="w-full px-5 py-3 bg-white rounded-xl border-none text-[11px] font-bold text-slate-700 shadow-sm placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 transition-all h-20 resize-none"
                                                    />
                                                </div>
                                            </div>
                                            {paymentMethod === 'Bank' && (
                                                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center gap-4">
                                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-indigo-400"><FaIdCard /></div>
                                                    <div className="flex-1">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Institute A/C</p>
                                                        <p className="text-[10px] font-bold tabular-nums">9182391293 | ICIC0001234</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={paymentLoading}
                                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 disabled:opacity-30 transition-all active:scale-95"
                                        >
                                            {paymentLoading ? 'Authenticating...' : (paymentMethod === 'Razorpay' ? 'Launch Secure Portal' : 'Notify Accounts Dept')}
                                        </button>

                                        {!paymentLoading && (
                                            <button
                                                type="button"
                                                onClick={() => setShowPaymentModal(false)}
                                                className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
                                            >
                                                Return to Dashboard
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-widest italic pt-2">Encrypted Secure Payment Gateway</p>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Notice Detail Modal */}
            {
                selectedNotice && (
                    <div
                        onClick={() => setSelectedNotice(null)}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-6 duration-500"
                        >
                            <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div className="relative z-10 flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white text-xl shrink-0 shadow-lg">
                                            <FaBullhorn />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Broadcast Notice</span>
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{selectedNotice.title}</h2>
                                            {selectedNotice.createdAt && (
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                                                    Published: {new Date(selectedNotice.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedNotice(null)}
                                        className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm text-slate-400 hover:text-slate-800 hover:bg-white transition-all flex items-center justify-center shrink-0"
                                    >
                                        <FaTimesCircle className="text-xl" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 md:p-10 max-h-[60vh] overflow-y-auto">
                                {/* Message Content */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <FaEnvelopeOpenText className="text-amber-500" />
                                        Notice Details
                                    </h3>
                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                        <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {selectedNotice.message || selectedNotice.content || selectedNotice.description || 'No message content available.'}
                                        </p>
                                    </div>
                                </div>

                                {selectedNotice.targetRoles && selectedNotice.targetRoles.length > 0 && (
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Intended Recipients</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNotice.targetRoles.map((role, i) => (
                                                <span key={i} className="px-3 py-1 bg-white border border-indigo-200 rounded-lg text-[10px] font-bold text-indigo-600 uppercase tracking-tight">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50">
                                <button
                                    onClick={() => setSelectedNotice(null)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95"
                                >
                                    Close Notice
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div>
    );
};

export default ParentDashboard;
