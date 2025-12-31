import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    FaUserGraduate, FaChalkboardTeacher, FaMoneyBillWave, FaBullhorn,
    FaChartLine, FaRegClock, FaSignOutAlt, FaChevronRight, FaTimesCircle,
    FaCalendarAlt, FaBook, FaFilePdf, FaArrowUp, FaArrowDown, FaCheckCircle,
    FaTasks, FaSearch, FaWallet, FaLock, FaBell
} from 'react-icons/fa';
import oasisFullLogo from '../assets/oasis_full_logo.png';
import receiptBanner from '../assets/receipt_banner.png';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ArcElement);

const ParentDashboard = () => {
    const { user, logout, loading: authLoading } = useContext(AuthContext);
    const [profile, setProfile] = useState({});
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [marks, setMarks] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [notices, setNotices] = useState([]);
    const [fees, setFees] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [activeTab, setActiveTab] = useState('Overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [paymentLoading, setPaymentLoading] = useState(false);

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
        }
    }, [selectedChild]);

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
            await axios.post('http://localhost:5002/api/fees/pay', {
                studentId: selectedChild,
                amount: paymentAmount,
                paymentMethod
            }, { headers });

            alert('Payment Successful!');
            setShowPaymentModal(false);
            setPaymentAmount('');
            fetchFees(selectedChild);
        } catch (err) {
            alert('Payment Failed');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        try {
            await axios.patch('http://localhost:5002/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Error marking notifications as read:', err);
        }
    };

    const toggleNotifications = (e) => {
        e.stopPropagation();
        setIsNotificationsOpen(!isNotificationsOpen);
    };

    // Close notifications when clicking outside
    useEffect(() => {
        const closeNotifications = () => setIsNotificationsOpen(false);
        if (isNotificationsOpen) {
            window.addEventListener('click', closeNotifications);
        }
        return () => window.removeEventListener('click', closeNotifications);
    }, [isNotificationsOpen]);


    const handleDownloadReceipt = (payment) => {
        const receiptContent = `
            <html>
            <head>
                <title>Fee Receipt - ${payment.transactionId || 'N/A'}</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 40px; }
                    .receipt-box { border: 2px dashed #333; padding: 20px; max-width: 600px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .details { margin-bottom: 20px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div className="receipt-box">
                    <div className="header">
                        <img src="${window.location.origin}${receiptBanner}" alt="Oasis Header" style="width: 100%; max-height: 150px; object-fit: contain; margin-bottom: 20px;" />
                        <h2>OASIS JEE CLASSES</h2>
                        <p>Official Payment Receipt</p>
                    </div>
                    <div className="details">
                        <div className="row"><span>Date:</span> <span>${new Date(payment.date).toLocaleDateString()}</span></div>
                        <div className="row"><span>Receipt No:</span> <span>${payment.transactionId || payment._id.slice(-8).toUpperCase()}</span></div>
                        <div className="row"><span>Student Name:</span> <span>${currentChild?.name || 'Student'}</span></div>
                        <div className="row"><span>Class:</span> <span>${currentChild?.classId?.name || 'N/A'}</span></div>
                        <hr/>
                        <div className="row"><span>Amount Paid:</span> <span>₹${payment.amount}</span></div>
                    </div>
                    <div className="footer">
                        <button onclick="window.print()">PRINT RECEIPT</button>
                    </div>
                </div>
            </body>
            </html>
        `;
        const win = window.open('', '', 'width=800,height=600');
        win.document.write(receiptContent);
        win.document.close();
    };

    // Derived Data
    const currentChild = children.find(c => c._id === selectedChild);
    const pendingFees = fees.pendingFees || 0;
    const activeNoticesCount = notices.filter(n => n.targetRoles.includes('parent')).length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const totalDays = attendance.length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    const avgMarks = marks.length > 0 ? Math.round(marks.reduce((a, b) => a + b.marks, 0) / marks.length) : 0;

    // Filtered Attendance for Tab
    const filteredAttendance = selectedSubject === 'All'
        ? attendance
        : attendance.filter(a => a.subjectId?.name === selectedSubject);

    // Filtered Stats
    const filteredPresent = filteredAttendance.filter(a => a.status === 'present').length;
    const filteredTotal = filteredAttendance.length;
    const filteredPercentage = filteredTotal > 0 ? Math.round((filteredPresent / filteredTotal) * 100) : 0;
    const subjects = ['All', ...new Set(attendance.map(a => a.subjectId?.name).filter(Boolean))];

    // Charts with TEAL Theme
    const performanceData = {
        labels: marks.map(m => m.subjectId?.name || m.examId?.name || 'Test'),
        datasets: [{
            label: 'Marks %',
            data: marks.map(m => m.marks),
            fill: true,
            borderColor: '#14b8a6', // Teal-500
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            tension: 0.4
        }]
    };

    const attendanceData = {
        labels: ['Present', 'Absent'],
        datasets: [{
            data: [presentDays, totalDays - presentDays],
            backgroundColor: ['#10b981', '#f43f5e'], // Emerald-500, Rose-500
            borderWidth: 0,
        }]
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-[#F8FAFC] dark:bg-gray-950 overflow-hidden relative font-sans transition-colors duration-300">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar - Teal/Emerald Gradient for Parent Identity */}
            <aside className={`w-72 bg-gradient-to-b from-teal-950 via-teal-900 to-emerald-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white flex-shrink-0 flex flex-col shadow-2xl z-30 fixed h-full transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
                <div className="p-6 flex items-center justify-between border-b border-teal-800/50 dark:border-gray-800">
                    <div className="w-full flex justify-center">
                        <img src={oasisFullLogo} alt="Oasis Logo" className="h-16 object-contain brightness-110 drop-shadow-lg" />
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-teal-300 hover:text-white absolute right-4 top-6">
                        <FaTimesCircle className="text-2xl" />
                    </button>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {[
                        { id: 'Overview', icon: FaChartLine, label: 'Overview' },
                        { id: 'Fees', icon: FaMoneyBillWave, label: 'Fee Payment' },
                        { id: 'Attendance', icon: FaCalendarAlt, label: 'Attendance' },
                        { id: 'Performance', icon: FaUserGraduate, label: 'Performance' },
                        { id: 'Materials', icon: FaBook, label: 'Study Materials' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-sm ${activeTab === item.id
                                ? 'bg-teal-500 text-white shadow-teal-900/50 shadow-lg translate-x-1'
                                : 'hover:bg-teal-800/50 hover:text-white'
                                }`}
                        >
                            <item.icon className={activeTab === item.id ? 'text-white' : 'text-teal-400'} />
                            {item.label}
                            {activeTab === item.id && <FaChevronRight className="ml-auto text-[10px]" />}
                        </button>
                    ))}
                </nav>

                <div className="p-6 mt-auto">
                    <div className="bg-teal-800/40 p-5 rounded-3xl border border-teal-700/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-teal-400/20 flex items-center justify-center text-teal-300">
                                <FaRegClock />
                            </div>
                            <div className="text-[11px] font-bold text-teal-200">Session Active</div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-900/40"
                        >
                            <FaSignOutAlt /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden w-full bg-[#F8FAFC] dark:bg-gray-950 transition-colors duration-300">
                {/* Header */}
                <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 lg:px-10 shadow-sm z-10 w-full transition-colors duration-300">
                    <div className="flex items-center gap-6 flex-1 max-w-2xl text-gray-400">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 bg-gray-50 rounded-xl text-indigo-600"
                        >
                            <FaTasks className="text-xl" />
                        </button>
                        {children.length > 1 && (
                            <select
                                value={selectedChild}
                                onChange={(e) => setSelectedChild(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 font-bold text-sm text-indigo-600 dark:text-indigo-400 focus:ring-0 cursor-pointer outline-none transition-colors"
                            >
                                {children.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        )}
                        {!children.length && <span className="text-sm font-bold text-gray-400">No Student Linked</span>}
                    </div>
                    <div className="flex items-center gap-8">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={toggleNotifications}
                                className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors relative focus:outline-none"
                            >
                                <FaBell className="text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 text-xl transition-colors" />
                                {notifications.some(n => !n.read) && (
                                    <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {isNotificationsOpen && (
                                <div
                                    className="absolute right-0 mt-4 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
                                        {notifications.some(n => !n.read) && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md transition-colors"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-[22rem] overflow-y-auto custom-scrollbar">
                                        {notifications.length > 0 ? (
                                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                                {notifications.map(n => (
                                                    <div
                                                        key={n._id}
                                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!n.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                                            <div>
                                                                <p className={`text-sm font-semibold mb-1 ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                                    {n.title}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
                                                                    {n.message}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2 font-medium">
                                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                                    <FaBell className="text-gray-400 dark:text-gray-600 text-lg" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-200">No Notifications</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">You're all caught up!</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                                        <button onClick={() => setIsNotificationsOpen(false)} className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 uppercase tracking-wide">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dotted border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-all group">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm group-hover:scale-105 transition-transform">
                                {profile.name?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none mb-1">{profile.name || 'Parent'}</p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Guardian</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 scroll-smooth">
                    {activeTab === 'Overview' && (
                        <>
                            {/* Welcome Banner - Parent Teal Style */}
                            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 p-10 shadow-2xl shadow-teal-200/50 mb-10 text-white">
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-yellow-500/20 blur-3xl rounded-full pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Parent Console</span>
                                            <span className="text-teal-100 text-xs font-bold">{new Date().toDateString()}</span>
                                        </div>
                                        <h1 className="text-4xl md:text-5xl font-[900] tracking-tight mb-2 leading-tight">
                                            Namaste, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-100">{profile.name?.split(' ')[0]}</span> 👋
                                        </h1>
                                        <p className="text-teal-50 font-medium max-w-lg text-sm leading-relaxed opacity-90">
                                            You are viewing progress for <span className="font-black text-white underline decoration-yellow-400 decoration-2 underline-offset-4">{currentChild?.name || 'Student'}</span>.
                                            <br />
                                            Attendance is <span className="font-black text-white">{attendancePercentage}%</span> and academic performance is <span className="font-black text-emerald-200">{avgMarks > 0 ? 'Optimal' : 'Tracking'}</span>.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setActiveTab('Fees')} className="bg-white text-teal-700 px-6 py-3 rounded-2xl font-black text-xs shadow-lg hover:bg-teal-50 transition-all flex items-center gap-2 group">
                                            <FaMoneyBillWave className="group-hover:rotate-12 transition-transform" /> PAY FEES
                                        </button>
                                        <button onClick={() => window.print()} className="bg-teal-900/30 text-white border border-white/20 px-6 py-3 rounded-2xl font-black text-xs hover:bg-teal-900/50 transition-all backdrop-blur-md">
                                            D'LOAD REPORT
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards - Admin Style */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Attendance', value: `${attendancePercentage}%`, trend: 'Last 30 Days', icon: FaCalendarAlt, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
                                    { label: 'Avg Assessment', value: `${avgMarks}%`, trend: 'Academics', icon: FaChartLine, color: 'indigo', gradient: 'from-indigo-500 to-blue-500' },
                                    { label: 'Outstanding Due', value: `₹${pendingFees.toLocaleString()}`, trend: 'Important', icon: FaWallet, color: 'rose', gradient: 'from-rose-500 to-pink-500' },
                                    { label: 'Notices', value: activeNoticesCount, trend: 'Updates', icon: FaBullhorn, color: 'orange', gradient: 'from-orange-500 to-amber-500' },
                                ].map((stat, i) => (
                                    <div key={i} className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl">
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 ease-out`}></div>
                                        <div className="flex items-center justify-between mb-8 relative">
                                            <div className={`w-14 h-14 bg-${stat.color}-50 rounded-2xl flex items-center justify-center text-${stat.color}-600 text-xl shadow-inner`}>
                                                <stat.icon />
                                            </div>
                                            <span className={`text-${stat.color}-600 text-[10px] font-black bg-${stat.color}-50 px-3 py-1.5 rounded-full border border-${stat.color}-100`}>
                                                {stat.trend}
                                            </span>
                                        </div>

                                        <h3 className="text-4xl font-[900] text-slate-800 dark:text-white mb-2 relative tracking-tight">{stat.value}</h3>
                                        <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest relative">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Charts Grid - Admin Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-xl group">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Performance Matrix</h2>
                                            <p className="text-gray-400 dark:text-gray-500 font-bold text-sm">Subject-wise progression</p>
                                        </div>
                                    </div>
                                    <div className="h-[350px]">
                                        <Line data={performanceData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }} />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-xl flex flex-col items-center justify-center text-center">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 self-start">Attendance</h2>
                                    <div className="w-64 h-64 mb-8">
                                        <Doughnut data={attendanceData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div>
                                            <p className="text-2xl font-black text-emerald-500">{presentDays} Days</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Present</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-rose-500">{totalDays - presentDays} Days</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Absent</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* FEES TAB */}
                    {activeTab === 'Fees' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-700 shadow-sm">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Fee Structure</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                                        <p className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase">Total Fee</p>
                                        <p className="text-3xl font-black text-gray-900 dark:text-white">₹{fees.totalFees}</p>
                                    </div>
                                    <div className="p-6 bg-emerald-50 rounded-2xl">
                                        <p className="text-xs font-bold text-emerald-600 uppercase">Paid Amount</p>
                                        <p className="text-3xl font-black text-emerald-700">₹{fees.paidFees}</p>
                                    </div>
                                    <div className="p-6 bg-rose-50 rounded-2xl">
                                        <p className="text-xs font-bold text-rose-600 uppercase">Pending Due</p>
                                        <p className="text-3xl font-black text-rose-700">₹{fees.pendingFees}</p>
                                    </div>
                                </div>

                                {fees.pendingFees > 0 && (
                                    <div className="mb-8">
                                        <button
                                            onClick={() => setShowPaymentModal(true)}
                                            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                                        >
                                            <FaWallet /> Pay Now
                                        </button>
                                    </div>
                                )}

                                <div className="mt-10">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    <th className="pb-3 pl-4">Date</th>
                                                    <th className="pb-3">Transaction ID</th>
                                                    <th className="pb-3">Mode</th>
                                                    <th className="pb-3">Amount</th>
                                                    <th className="pb-3">Receipt</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                                {fees.payments?.map(p => (
                                                    <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                        <td className="py-4 pl-4 font-medium text-gray-700 dark:text-gray-300">{new Date(p.date).toLocaleDateString()}</td>
                                                        <td className="py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{p.transactionId || 'N/A'}</td>
                                                        <td className="py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">{p.mode}</td>
                                                        <td className="py-4 font-bold text-gray-900 dark:text-white">₹{p.amount}</td>
                                                        <td className="py-4">
                                                            <button onClick={() => handleDownloadReceipt(p)} className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
                                                                <FaFilePdf /> Receipt
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ATTENDANCE TAB */}
                    {activeTab === 'Attendance' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Attendance Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Classes</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{filteredTotal}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Present</p>
                                    <p className="text-3xl font-black text-emerald-500">{filteredPresent}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Absent</p>
                                    <p className="text-3xl font-black text-rose-500">{filteredTotal - filteredPresent}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Attendance %</p>
                                    <p className={`text-3xl font-black ${filteredPercentage >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{filteredPercentage}%</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Attendance Log</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Filter by:</span>
                                        <select
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                            className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-2 font-bold text-sm text-indigo-600 dark:text-indigo-400 focus:ring-0 cursor-pointer outline-none transition-colors"
                                        >
                                            {subjects.map(sub => (
                                                <option key={sub} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {filteredAttendance.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {filteredAttendance.map(a => (
                                            <div key={a._id} className={`p-4 rounded-2xl border ${a.status === 'present' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{new Date(a.date).toLocaleDateString()}</p>
                                                    {a.subjectId?.name && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                                                            {a.subjectId.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-lg font-black uppercase ${a.status === 'present' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{a.status}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-400 dark:text-gray-500 font-bold">
                                        No attendance records found for {selectedSubject}.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PERFORMANCE TAB */}
                    {activeTab === 'Performance' && (
                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Exam Results</h2>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                        <th className="pb-3 pl-4">Subject</th>
                                        <th className="pb-3">Exam</th>
                                        <th className="pb-3 text-center">Marks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {marks.map(m => (
                                        <tr key={m._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="py-4 pl-4 font-bold text-gray-700 dark:text-gray-300">{m.subjectId?.name}</td>
                                            <td className="py-4 text-sm text-gray-500 dark:text-gray-400">{m.examId?.name}</td>
                                            <td className="py-4 text-center">
                                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-black text-sm">{m.marks}%</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* MATERIALS TAB */}
                    {activeTab === 'Materials' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {materials.map(m => (
                                <div key={m._id} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl mb-6 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <FaBook />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate">{m.title}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">Study material provided for students.</p>
                                    <a
                                        href={`http://localhost:5002/${m.fileUrl}`}
                                        download
                                        className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-wider hover:underline"
                                    >
                                        <FaFilePdf /> Download Resource
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </main >

            {/* Payment Modal */}
            {
                showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 transition-colors duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Make Payment</h2>
                                <button onClick={() => setShowPaymentModal(false)}><FaTimesCircle className="text-2xl text-gray-300 dark:text-gray-500 hover:text-red-500 transition-colors" /></button>
                            </div>
                            <form onSubmit={handlePayment} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Amount</label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={paymentLoading}
                                    className="w-full bg-indigo-600 text-white rounded-xl py-4 font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                >
                                    {paymentLoading ? 'Processing...' : 'Secure Pay'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ParentDashboard;
