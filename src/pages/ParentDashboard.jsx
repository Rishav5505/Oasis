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

    const handleDownloadReport = () => {
        window.print();
    };

    const markNotificationAsRead = async (id) => {
        const token = sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            await axios.patch(`http://localhost:5002/api/notifications/${id}/read`, {}, { headers });
            fetchNotifications();
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    // Chart Configs
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

    const activeNotices = notices.filter(n => n.targetRoles.includes('parent'));
    const currentChild = children.find(c => c._id === selectedChild);

    const NavItem = ({ label, icon: Icon, active, onClick }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-5 px-7 py-4.5 rounded-[1.5rem] w-full transition-all duration-500 group relative ${active ? 'bg-indigo-600 text-white shadow-[0_15px_30px_-10px_rgba(79,70,229,0.4)]' : 'text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-600'}`}
        >
            {active && <div className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full my-auto inset-y-0"></div>}
            <div className={`text-xl transition-all duration-500 ${active ? 'text-white scale-110' : 'group-hover:scale-125 group-hover:text-indigo-600 opacity-70 group-hover:opacity-100'}`}>
                <Icon />
            </div>
            <span className={`font-extrabold text-[13px] tracking-tight uppercase ${active ? 'tracking-widest' : 'tracking-normal'}`}>{label}</span>
            {active && <FaChevronRight className="ml-auto text-xs opacity-40 animate-pulse" />}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 relative">
            {/* Ambient Background Glows */}
            <div className="fixed top-0 right-0 w-[80vw] h-[80vh] bg-gradient-to-bl from-indigo-50/40 via-transparent to-transparent -z-10 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-[50vw] h-[50vh] bg-gradient-to-tr from-purple-50/30 via-transparent to-transparent -z-10 pointer-events-none"></div>

            {/* Sidebar Navigation */}
            <aside className="w-80 bg-white border-r border-gray-100 flex flex-col p-8 fixed h-full z-30 transition-all no-print hidden lg:flex">
                <div className="flex items-center gap-5 mb-14 px-2 group cursor-pointer">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[1.5rem] flex items-center justify-center text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.5)] transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                        <FaGraduationCap className="text-3xl" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-[900] tracking-tighter text-[#1e1b4b] leading-none mb-1">Oasis</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Faculty Suite</span>
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem label="Overview" icon={FaHome} active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
                    <NavItem label="Fee Payments" icon={FaWallet} active={activeTab === 'Fees'} onClick={() => setActiveTab('Fees')} />
                    <NavItem label="Attendance" icon={FaCalendarAlt} active={activeTab === 'Attendance'} onClick={() => setActiveTab('Attendance')} />
                    <NavItem label="Performance" icon={FaChartLine} active={activeTab === 'Performance'} onClick={() => setActiveTab('Performance')} />
                    <NavItem label="Study Materials" icon={FaBook} active={activeTab === 'Materials'} onClick={() => setActiveTab('Materials')} />
                </nav>

                <div className="mt-auto space-y-4">
                    <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-8 -mt-8"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Support Hotnode</p>
                        <p className="text-sm font-bold text-gray-900 mb-4 tracking-tight">Need technical assistance?</p>
                        <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl text-xs font-black shadow-sm hover:shadow-md transition-all">Open Ticket</button>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-4 px-6 py-4 rounded-2xl w-full text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"
                    >
                        <FaSignOutAlt /> Sign Out Terminal
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-80 p-6 lg:p-12">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Top Navigation / Desktop Header */}
                    <header className="flex flex-col md:flex-row justify-between items-center gap-8 no-print">
                        <div className="space-y-2 text-center md:text-left">
                            <h1 className="text-5xl font-[900] text-[#1e1b4b] tracking-tighter leading-tight">
                                Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">{profile.name?.split(' ')[0]}</span>
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] border-r border-slate-200 pr-4">Parental Oversight Console</p>
                                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    <FaBell className="text-xl" />
                                    {notifications.some(n => !n.read) && (
                                        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>
                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                            <h3 className="font-black text-gray-900 text-xs uppercase tracking-[0.2em]">Recent Intelligence</h3>
                                            <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-900"><FaTimesCircle /></button>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
                                            {notifications.map(n => (
                                                <div key={n._id} className={`p-6 rounded-3xl transition-all cursor-pointer ${!n.read ? 'bg-indigo-50/50 border border-indigo-100' : 'hover:bg-gray-50'}`}>
                                                    <p className="font-black text-gray-900 text-xs uppercase mb-1">{n.title}</p>
                                                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed">{n.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-black text-[#1e1b4b] leading-none mb-1">{profile.name}</p>
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Authorized Parent</p>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 p-0.5 border border-indigo-200">
                                    <img
                                        src={profile.profilePhoto ? `http://localhost:5002${profile.profilePhoto}` : `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff`}
                                        className="w-full h-full object-cover rounded-[0.9rem]"
                                        alt=""
                                    />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Tab Switcher - Logic Section */}
                    <div className="space-y-12">

                        {/* Overview Section */}
                        {activeTab === 'Overview' && (
                            <div className="space-y-12 animate-in fade-in duration-700">
                                {/* Child Spotlight Card - HIGH END REFINEMENT */}
                                <div className="bg-white rounded-[4rem] p-12 lg:p-16 border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-rose-50/20 rounded-full blur-[100px] -mr-64 -mt-64 transition-all duration-1000 group-hover:bg-indigo-100/40"></div>

                                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-14">
                                        <div className="relative">
                                            <div className="w-64 h-64 rounded-[4.5rem] p-2.5 bg-gradient-to-tr from-indigo-500 via-indigo-400 to-indigo-600 shadow-[0_20px_40px_rgba(99,102,241,0.3)] rotate-3 group-hover:rotate-6 transition-all duration-700">
                                                <div className="w-full h-full rounded-[4.1rem] bg-white p-1.5 overflow-hidden">
                                                    {currentChild?.userId?.profilePhoto ? (
                                                        <img src={`http://localhost:5002${currentChild.userId.profilePhoto}`} className="w-full h-full object-cover rounded-[3.9rem] scale-105" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300"><FaUserGraduate className="text-8xl" /></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-8 text-center lg:text-left">
                                            <div className="space-y-4">
                                                <div className="flex flex-col lg:flex-row items-center gap-8">
                                                    <h2 className="text-7xl font-[900] text-[#1e1b4b] tracking-[tightest] leading-none drop-shadow-sm">{currentChild?.name || 'Loading Student...'}</h2>
                                                    {children.length > 1 && (
                                                        <select
                                                            value={selectedChild}
                                                            onChange={(e) => setSelectedChild(e.target.value)}
                                                            className="bg-indigo-50 text-indigo-700 text-[11px] font-extrabold uppercase tracking-widest px-8 py-3 rounded-2xl border-none focus:ring-4 focus:ring-indigo-100 cursor-pointer shadow-sm no-print"
                                                        >
                                                            {children.map(c => <option key={c._id} value={c._id}>Switch Context</option>)}
                                                        </select>
                                                    )}
                                                </div>
                                                <p className="text-slate-400 font-bold text-base flex items-center justify-center lg:justify-start gap-4">
                                                    <FaLock className="text-indigo-400 text-xl" /> <span className="uppercase tracking-[0.1em] text-slate-400">Student Identity Auth :</span> <span className="bg-indigo-600 px-4 py-1.5 rounded-xl text-white font-black text-sm tracking-widest shadow-lg shadow-indigo-100">{currentChild?.userId?._id?.slice(-8).toUpperCase()}</span>
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap justify-center lg:justify-start gap-5">
                                                <div className="px-10 py-5 bg-[#f0fdf4] text-emerald-700 rounded-[2rem] font-black text-[13px] uppercase tracking-widest flex items-center gap-3 border border-emerald-100 shadow-sm transition-all hover:scale-105">
                                                    <FaChalkboardTeacher className="text-lg opacity-80" /> {currentChild?.classId?.name}
                                                </div>
                                                <div className="px-10 py-5 bg-[#eef2ff] text-indigo-700 rounded-[2rem] font-black text-[13px] uppercase tracking-widest flex items-center gap-3 border border-indigo-100 shadow-sm transition-all hover:scale-105">
                                                    <FaLayerGroup className="text-lg opacity-80" /> {currentChild?.batchId?.name || 'A - SECTION'}
                                                </div>
                                                <div className="px-10 py-5 bg-[#1e1b4b] text-white rounded-[2rem] font-black text-[13px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_12px_24px_-8px_rgba(30,27,75,0.5)] transition-all hover:scale-105">
                                                    <FaIdCard className="text-lg opacity-80" /> ROLL INDEX #{currentChild?.rollNo || '001'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* KPI Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 no-print">
                                    {[
                                        { label: 'Attendance Rate', value: `${attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0}%`, icon: <FaCalendarAlt />, color: 'emerald', sub: 'Last 30 Days', shadow: 'rgba(16,185,129,0.15)' },
                                        { label: 'Academic Index', value: `${marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.marks, 0) / marks.length) : 0}%`, icon: <FaChartLine />, color: 'indigo', sub: 'Current Semester', shadow: 'rgba(99,102,241,0.15)' },
                                        { label: 'Pending Dues', value: `₹${fees.pendingFees || 0}`, icon: <FaMoneyBillWave />, color: 'rose', sub: 'Immediate Action', shadow: 'rgba(244,63,94,0.15)' },
                                        { label: 'Active Notices', value: `${activeNotices.length} Logs`, icon: <FaBullhorn />, color: 'amber', sub: 'Departmental Alerts', shadow: 'rgba(245,158,11,0.15)' }
                                    ].map((kpi, i) => (
                                        <div key={i} className={`bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_40px_-15px_${kpi.shadow}] group hover:shadow-[0_30px_60px_-15px_${kpi.shadow}] hover:-translate-y-3 transition-all duration-500 cursor-pointer relative overflow-hidden`}>
                                            <div className="flex justify-between items-start mb-10">
                                                <div className={`w-18 h-18 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-[1.8rem] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-all duration-500 border border-${kpi.color}-100/50`}>
                                                    {kpi.icon}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest transform rotate-90 origin-right translate-y-3 absolute right-6 top-8">UNIT 0{i + 1}</span>
                                            </div>
                                            <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-[0.25em] mb-2">{kpi.label}</p>
                                            <h3 className="text-5xl font-black text-[#1e1b4b] tracking-tighter mb-5 tabular-nums">{kpi.value}</h3>
                                            <div className="pt-5 border-t border-slate-50 flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-indigo-400 transition-colors">
                                                <div className={`w-2 h-2 rounded-full bg-${kpi.color}-400 animate-pulse`}></div>
                                                {kpi.sub}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Dashboard Core Modules */}
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                                    {/* Performance Glance */}
                                    <div className="xl:col-span-2 space-y-8">
                                        <div className="bg-white p-10 lg:p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-12 h-full">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h2 className="text-3xl font-black text-[#1e1b4b] tracking-tight">Academic Trendline</h2>
                                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cross-subject scoring analysis</p>
                                                </div>
                                                <button onClick={() => setActiveTab('Performance')} className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><FaChevronRight /></button>
                                            </div>
                                            <div className="h-[350px]">
                                                <Line
                                                    data={marksData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: { legend: { display: false } },
                                                        scales: { y: { beginAtZero: true, max: 100, border: { display: false }, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions / Fee Module */}
                                    <div className="space-y-8">
                                        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group min-h-[450px] flex flex-col justify-between">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full translate-x-24 -translate-y-24"></div>

                                            <div className="relative z-10 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <h2 className="text-2xl font-black tracking-tight">Financial Status</h2>
                                                        <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest">Active Billing Cycle</p>
                                                    </div>
                                                    <FaWallet className="text-4xl text-indigo-400 opacity-30" />
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Outstanding Balance</p>
                                                    <h4 className="text-7xl font-black tracking-tighter text-indigo-400">₹{fees.pendingFees || 0}</h4>
                                                </div>

                                                <div className="space-y-4 pt-10 border-t border-white/5">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500 font-bold uppercase tracking-widest">Course Value</span>
                                                        <span className="text-gray-300 font-black">₹{fees.totalFees || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500 font-bold uppercase tracking-widest">Paid-to-Date</span>
                                                        <span className="text-emerald-400 font-black">₹{fees.paidFees || 0}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setShowPaymentModal(true)}
                                                disabled={!fees.pendingFees || fees.pendingFees <= 0}
                                                className="w-full py-6 bg-indigo-600 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:hover:translate-y-0 relative z-10"
                                            >
                                                {fees.pendingFees > 0 ? "Pay Outstanding Dues" : "No Pending Dues"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fee Section */}
                        {activeTab === 'Fees' && (
                            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">

                                    {/* High-End Bill Card */}
                                    <div className="bg-white rounded-[4rem] p-12 lg:p-16 border border-gray-100 shadow-sm flex flex-col justify-between">
                                        <div className="space-y-12">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center text-3xl"><FaMoneyBillWave /></div>
                                                <div>
                                                    <h2 className="text-4xl font-black text-[#1e1b4b] tracking-tight">Secure Payment Node</h2>
                                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Financial Interface</p>
                                                </div>
                                            </div>

                                            <div className="p-10 bg-[#fdfefe] rounded-[3rem] border-2 border-dashed border-gray-100 space-y-8">
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Authorized Payee</p>
                                                        <p className="text-2xl font-black text-[#1e1b4b] uppercase tracking-tight">{currentChild?.name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Due Date</p>
                                                        <p className="text-lg font-black text-rose-500 uppercase tracking-tight">{fees.dueDate ? new Date(fees.dueDate).toLocaleDateString() : 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div className="h-[2px] bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-4xl font-black text-[#1e1b4b] tracking-tighter">₹{fees.pendingFees || 0}</span>
                                                    <span className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100">Delayed Payment Warning</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowPaymentModal(true)}
                                            className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 hover:-translate-y-1 transition-all mt-12"
                                        >
                                            Initialize Transaction Process
                                        </button>
                                    </div>

                                    {/* Payment History Tracker */}
                                    <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
                                        <div className="p-12 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                            <h2 className="text-2xl font-black text-[#1e1b4b] tracking-tight flex items-center gap-4"><FaHistory className="text-indigo-400 text-3xl" /> Transaction Ledger</h2>
                                            <button onClick={handleDownloadReport} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-white px-6 py-2 rounded-xl border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all no-print">Export CSV</button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-12 pt-8 space-y-4">
                                            {fees.payments?.slice().reverse().map((p, idx) => (
                                                <div key={idx} className="group flex items-center justify-between p-8 bg-white rounded-[2.5rem] border border-gray-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-2xl group-hover:scale-110 transition-all shadow-inner"><FaCheckCircle /></div>
                                                        <div className="space-y-1">
                                                            <h4 className="text-lg font-black text-[#1e1b4b] tracking-tight capitalize">{p.mode || 'Online Terminal'}</h4>
                                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(p.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-3xl font-black text-[#1e1b4b] tracking-tighter">₹{p.amount}</p>
                                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Verified</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!fees.payments || fees.payments.length === 0) && (
                                                <div className="text-center py-24 opacity-20">
                                                    <FaEnvelopeOpenText className="text-8xl mx-auto mb-6" />
                                                    <p className="text-xs font-black uppercase tracking-widest">No transaction logs detected</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Attendance Section */}
                        {activeTab === 'Attendance' && (
                            <div className="space-y-12 animate-in zoom-in-95 duration-700">
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                                    {/* Insights Summary */}
                                    <div className="bg-emerald-600 rounded-[4rem] p-12 text-white shadow-2xl flex flex-col justify-between">
                                        <div className="space-y-8">
                                            <h2 className="text-3xl font-black tracking-tight uppercase leading-none">Log Summary</h2>
                                            <div className="space-y-6">
                                                <div className="p-6 bg-white/10 rounded-3xl border border-white/10">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">Consistency Level</p>
                                                    <h4 className="text-3xl font-black tracking-tight">Excellent</h4>
                                                </div>
                                                <div className="p-6 bg-white/10 rounded-3xl border border-white/10">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">Total Active Sessions</p>
                                                    <h4 className="text-3xl font-black tracking-tight">{attendance.length} Sessions</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <Doughnut data={attendanceChartData} options={{ maintainAspectRatio: true, plugins: { legend: { display: false } }, cutout: '75%' }} className="mt-12" />
                                    </div>

                                    {/* Detailed Attendance List */}
                                    <div className="xl:col-span-2 bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
                                        <div className="p-12 border-b border-gray-50 flex items-center justify-between">
                                            <h2 className="text-2xl font-black text-[#1e1b4b] tracking-tight">Daily Sign-in Logs</h2>
                                        </div>
                                        <div className="flex-1 overflow-y-auto px-12">
                                            <table className="w-full text-left">
                                                <tbody className="divide-y divide-gray-50">
                                                    {attendance.slice().reverse().map(a => (
                                                        <tr key={a._id} className="group transition-colors hover:bg-gray-50/50">
                                                            <td className="py-10">
                                                                <span className="text-xl font-black text-[#1e1b4b] tracking-tight uppercase">{new Date(a.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                            </td>
                                                            <td className="py-10 text-right">
                                                                <span className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${a.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white'}`}>
                                                                    {a.status}
                                                                </span>
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

                        {/* Performance Section */}
                        {activeTab === 'Performance' && (
                            <div className="space-y-12 animate-in fade-in duration-700">
                                <div className="bg-white rounded-[4rem] p-12 lg:p-16 border border-gray-100 shadow-sm space-y-16">
                                    <div className="flex flex-col lg:flex-row justify-between items-end gap-8">
                                        <div className="space-y-2">
                                            <h2 className="text-5xl font-black text-[#1e1b4b] tracking-tighter">Transcript Overview</h2>
                                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Internal & External assessments</p>
                                        </div>
                                        <button onClick={handleDownloadReport} className="bg-gray-900 text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all no-print">Download Transcript</button>
                                    </div>

                                    <div className="overflow-x-auto rounded-[3rem] border border-gray-50">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-50">
                                                    <th className="px-12 py-8">Faculty Department</th>
                                                    <th className="px-12 py-8">Assessment Cycle</th>
                                                    <th className="px-12 py-8 text-center">Score Index</th>
                                                    <th className="px-12 py-8">Performance Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {marks.map(m => (
                                                    <tr key={m._id} className="group hover:bg-[#fcfdff] transition-all">
                                                        <td className="px-12 py-10">
                                                            <span className="text-xl font-black text-[#1e1b4b] tracking-tight uppercase group-hover:text-indigo-600 transition-colors">{m.subjectId?.name}</span>
                                                        </td>
                                                        <td className="px-12 py-10">
                                                            <span className="px-6 py-2.5 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">{m.examId?.name || 'Unit Assessment'}</span>
                                                        </td>
                                                        <td className="px-12 py-10">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <span className={`text-3xl font-black ${m.marks > 80 ? 'text-emerald-500' : m.marks > 50 ? 'text-indigo-500' : 'text-rose-500'}`}>{m.marks}%</span>
                                                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                                    <div className={`h-full transition-all duration-1000 ${m.marks > 80 ? 'bg-emerald-500' : m.marks > 50 ? 'bg-indigo-500' : 'bg-rose-500'}`} style={{ width: `${m.marks}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-12 py-10 max-w-sm">
                                                            <p className="text-xs font-bold text-slate-400 leading-relaxed italic border-l-4 border-indigo-50 pl-6 group-hover:border-indigo-500 transition-all">"{m.remarks || 'Student is showing exceptional understanding of core concepts in recent labs.'}"</p>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Materials Section */}
                        {activeTab === 'Materials' && (
                            <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                    {materials.map(m => (
                                        <div key={m._id} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                                            <div className="space-y-8">
                                                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                                    <FaBook />
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="text-2xl font-black text-[#1e1b4b] tracking-tight leading-tight uppercase line-clamp-2">{m.title}</h3>
                                                    <p className="text-xs text-slate-400 font-bold leading-relaxed line-clamp-3 italic">Curated curriculum resource uploaded by the departmental head for the current academic session.</p>
                                                </div>
                                            </div>
                                            <a
                                                href={`http://localhost:5002/${m.fileUrl}`}
                                                download
                                                className="flex items-center justify-center gap-4 w-full py-5 bg-[#fcfdfe] rounded-2xl border-2 border-slate-50 text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all mt-12 shadow-sm"
                                            >
                                                <FaFilePdf className="text-lg" /> Access Repository
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Secure Payment Modal */}
                    {showPaymentModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-2xl animate-in fade-in duration-300">
                            <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                                <div className="relative h-64 bg-[#1e293b] p-14 flex flex-col justify-end">
                                    <button onClick={() => setShowPaymentModal(false)} className="absolute top-10 right-10 text-white/30 hover:text-white transition-all hover:rotate-90 duration-300"><FaTimesCircle className="text-3xl" /></button>
                                    <div className="space-y-2 relative z-10">
                                        <h2 className="text-4xl font-black text-white tracking-tighter">Authorize Payment</h2>
                                        <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3"><FaLock className="text-lg" /> 256-Bit SSL Encrypted Node</p>
                                    </div>
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] translate-x-12 -translate-y-12"></div>
                                </div>

                                <form onSubmit={handlePayment} className="p-14 space-y-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6">Transaction Amount (INR)</label>
                                        <div className="relative">
                                            <span className="absolute left-10 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-300">₹</span>
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-20 pr-10 py-8 bg-[#f8fafc] rounded-[2.5rem] border-none focus:ring-4 focus:ring-indigo-50 font-black text-4xl text-[#1e1b4b] shadow-inner"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 no-print">
                                        {[
                                            { id: 'UPI', label: 'UPI / GPay' },
                                            { id: 'Card', label: 'Credit Card' }
                                        ].map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setPaymentMethod(m.id)}
                                                className={`p-6 rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-center gap-4 ${paymentMethod === m.id ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-xl shadow-indigo-100' : 'border-slate-50 text-slate-400 hover:border-indigo-100'}`}
                                            >
                                                <FaCreditCard className="text-xl" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                                                {paymentMethod === m.id && <FaCheckCircle className="ml-auto text-xs" />}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-3">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Selected Student Profile</p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><FaUserGraduate /></div>
                                            <p className="text-lg font-black text-[#1e1b4b] uppercase tracking-tight">{currentChild?.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <button
                                            type="submit"
                                            disabled={paymentLoading}
                                            className="w-full py-7 bg-gray-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 hover:-translate-y-1 active:scale-95 transition-all duration-500 disabled:opacity-30"
                                        >
                                            {paymentLoading ? 'Authenticating...' : 'Confirm Transaction'}
                                        </button>
                                        <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Powered by Oasis Secure Pay • V 2.4.1</p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Global Terminal Footer */}
                    <footer className="text-center pt-10 pb-20 no-print border-t border-gray-50 mt-12">
                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.6em]">Oasis Learning Management Terminal © 2024 • End-to-End Encrypted</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default ParentDashboard;
