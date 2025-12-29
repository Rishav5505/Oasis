import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { AuthContext } from '../contexts/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import {
  FaUserGraduate, FaChalkboardTeacher, FaUsers, FaCalendarCheck,
  FaMoneyBillWave, FaBullhorn, FaTasks, FaHistory, FaSearch,
  FaPlus, FaUserPlus, FaEnvelope, FaFilter, FaArrowUp, FaArrowDown,
  FaCheckCircle, FaExclamationTriangle, FaChartLine, FaRegClock,
  FaCogs, FaSignOutAlt, FaChevronRight, FaFileInvoiceDollar
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AdminDashboard = () => {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState({ attendance: [], marks: [] });
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', phone: '', subjects: '', batches: '', classes: '', password: '' });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ subjects: '', batches: '', classes: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [photoFile, setPhotoFile] = useState(null);

  // Linking State
  const [parentList, setParentList] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [linkParentId, setLinkParentId] = useState('');
  const [linkStudentId, setLinkStudentId] = useState('');

  // UI & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', targetRoles: ['student', 'parent'] });

  useEffect(() => {
    // If auth is loading, do nothing yet
    if (authLoading) return;

    console.log('AdminDashboard useEffect', { token: !!token, user });
    if (!token || user?.role !== 'admin') {
      setLoading(false);
      // We handle the UI return for access denied separately below
      return;
    }

    fetchUsers();
    fetchProfile();
    fetchAllStudents();
    fetchMetadata();
  }, [token, user, authLoading]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5002/api/auth/me');
      setProfile(res.data);
      setEditForm({ name: res.data.name, phone: res.data.phone, email: res.data.email, address: res.data.address });
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('phone', editForm.phone);
      formData.append('email', editForm.email);
      formData.append('address', editForm.address);
      if (photoFile) formData.append('profilePhoto', photoFile);

      await axios.put('http://localhost:5002/api/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditMode(false);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const fetchUsers = async () => {
    console.log('Fetching users...');
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5002/api/users');
      console.log('Users fetched:', res.data);
      setUsers(res.data);
      const studentUsers = res.data.filter(u => u.role === 'student');
      setStudents(studentUsers);
      const parentUsers = res.data.filter(u => u.role === 'parent');
      console.log('Parent Users Debug:', parentUsers);
      setParentList(parentUsers);
      fetchStats(res.data);
      fetchAllStudents(); // Fetch students with full populated data
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5002/api/users/students/all');
      setAllStudents(res.data);
    } catch (err) {
      console.error('Error fetching all students:', err);
    }
  };

  const fetchMetadata = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [classesRes, subjectsRes, batchesRes] = await Promise.all([
        axios.get('http://localhost:5002/api/users/classes', { headers }),
        axios.get('http://localhost:5002/api/users/subjects', { headers }),
        axios.get('http://localhost:5002/api/users/batches', { headers })
      ]);
      setAvailableClasses(classesRes.data);
      setAvailableSubjects(subjectsRes.data);
      setAvailableBatches(batchesRes.data);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const fetchStats = (allUsers) => {
    const totalStudents = allUsers.filter(u => u.role === 'student').length;
    const totalTeachers = allUsers.filter(u => u.role === 'teacher').length;
    const totalParents = allUsers.filter(u => u.role === 'parent').length;
    setStats({ totalStudents, totalTeachers, totalParents, presentToday: Math.floor(totalStudents * 0.8), absentToday: Math.floor(totalStudents * 0.2) });
  };

  const handleStudentClick = async (student) => {
    console.log('Clicked student:', student);
    setSelectedStudent(student);
    try {
      const [attendanceRes, marksRes] = await Promise.all([
        axios.get(`http://localhost:5002/api/attendance/user/${student._id}`),
        axios.get(`http://localhost:5002/api/marks/student/${student._id}`)
      ]);
      console.log('Attendance:', attendanceRes.data);
      console.log('Marks:', marksRes.data);
      setStudentDetails({ attendance: attendanceRes.data, marks: marksRes.data });
    } catch (err) {
      console.error('Error fetching student details:', err);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5002/api/users/teachers', teacherForm);
      alert('Teacher added successfully');
      setTeacherForm({ name: '', email: '', phone: '', subjects: '', batches: '', classes: '', password: '' });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add teacher';
      alert(msg);
    }
  };

  const handleUpdateTeacherAssignments = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5002/api/users/teachers/${assignForm.teacherId}`, assignForm);
      alert('Assignments updated successfully');
      setShowAssignModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update assignments');
    }
  };

  const openAssignModal = (teacher) => {
    setEditingTeacher(teacher);
    setAssignForm({
      subjects: teacher.subjects || '',
      batches: teacher.batches || '',
      classes: teacher.classes || '',
      teacherId: teacher.teacherId || teacher._id // Ensure we have the Teacher model ID
    });
    setShowAssignModal(true);
  };
  const handleLinkParent = async (e) => {
    e.preventDefault();
    if (!linkParentId || !linkStudentId) {
      alert('Please select both parent and student');
      return;
    }
    try {
      await axios.post('http://localhost:5002/api/users/link-parent', {
        parentId: linkParentId,
        studentId: linkStudentId
      });
      alert('Parent linked to student successfully');
      setLinkParentId('');
      setLinkStudentId('');
      fetchUsers(); // Refresh to show linked status
    } catch (err) {
      console.error('Error linking parent:', err);
      alert('Failed to link parent: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5002/api/notices', newNotice);
      alert('Notice published successfully!');
      setShowNoticeModal(false);
      setNewNotice({ title: '', content: '', targetRoles: ['student', 'parent'] });
    } catch (err) {
      alert('Failed to publish notice');
    }
  };

  const filteredStudents = allStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || s.classId?.name === filterClass;
    return matchesSearch && matchesClass;
  });

  // Enhanced Chart Data
  const enrollmentTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'New Enrolments',
      data: [65, 59, 80, 81, 56, 95],
      fill: true,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4
    }]
  };

  const roleDistributionData = {
    labels: ['Students', 'Teachers', 'Parents'],
    datasets: [{
      data: [stats.totalStudents, stats.totalTeachers, stats.totalParents],
      backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const revenueData = {
    labels: ['W1', 'W2', 'W3', 'W4'],
    datasets: [{
      label: 'Fee Collection',
      data: [120000, 190000, 150000, 250000],
      backgroundColor: '#6366f1',
      borderRadius: 12,
    }]
  };

  const attendanceChart = {
    labels: ['Present', 'Absent'],
    datasets: [{
      label: 'Today\'s Attendance',
      data: [stats.presentToday, stats.absentToday],
      backgroundColor: ['#10B981', '#EF4444'],
    }],
  };

  // 1. Check if Auth is still loading
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  // 2. Access Denied Check
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access the Admin Dashboard.
            <br />
            Current Role: <span className="font-semibold capitalize">{user?.role || 'Guest'}</span>
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Go Home</a>
            <button
              onClick={() => {
                sessionStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Main Dashboard Render
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar - Pro Layout */}
      <aside className="w-72 bg-indigo-900 text-indigo-100 flex-shrink-0 flex flex-col shadow-2xl z-20">
        <div className="p-8 flex items-center gap-4 border-b border-indigo-800/50">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-all">
            <FaUserGraduate className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Oasis</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', icon: FaChartLine, label: 'Overview' },
            { id: 'students', icon: FaUserGraduate, label: 'Students' },
            { id: 'teachers', icon: FaChalkboardTeacher, label: 'Teachers' },
            { id: 'communication', icon: FaBullhorn, label: 'Notice Center' },
            { id: 'profile', icon: FaCogs, label: 'Profile Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-sm ${activeTab === item.id
                ? 'bg-indigo-500 text-white shadow-indigo-900/50 shadow-lg translate-x-1'
                : 'hover:bg-indigo-800/50 hover:text-white'
                }`}
            >
              <item.icon className={activeTab === item.id ? 'text-white' : 'text-indigo-400'} />
              {item.label}
              {activeTab === item.id && <FaChevronRight className="ml-auto text-[10px]" />}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-indigo-800/40 p-5 rounded-3xl border border-indigo-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-400/20 flex items-center justify-center text-indigo-300">
                <FaRegClock />
              </div>
              <div className="text-[11px] font-bold text-indigo-200">Session Active</div>
            </div>
            <button
              onClick={() => { sessionStorage.removeItem('token'); window.location.href = '/login'; }}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/40"
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shadow-sm z-10">
          <div className="flex items-center gap-6 flex-1 max-w-2xl text-gray-400">
            <FaSearch className="text-gray-300" />
            <input
              type="text"
              placeholder="Universal Search (Command + K)"
              className="w-full bg-transparent focus:outline-none text-gray-600 font-medium placeholder-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 rounded-2xl border border-dotted border-gray-200 cursor-pointer hover:bg-white transition-all">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {profile.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-gray-900 leading-none mb-1">{profile.name || 'Administrator'}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 scroll-smooth">
          {activeTab === 'overview' && (
            <>
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Add Student', icon: FaUserPlus, color: 'bg-emerald-500', action: () => setActiveTab('students') },
                  { label: 'New Teacher', icon: FaPlus, color: 'bg-indigo-600', action: () => setActiveTab('teachers') },
                  { label: 'Broadcast', icon: FaBullhorn, color: 'bg-orange-500', action: () => setActiveTab('communication') },
                  { label: 'Fee Report', icon: FaFileInvoiceDollar, color: 'bg-purple-600', action: () => alert('Generating report...') },
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={act.action}
                    className="group flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all border-dashed hover:border-solid hover:border-indigo-100"
                  >
                    <div className={`${act.color} w-16 h-16 rounded-[2rem] flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 rotate-3 group-hover:rotate-0 transition-all`}>
                      <act.icon />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">{act.label}</span>
                  </button>
                ))}
              </div>

              {/* Stats & Clickable Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Live Students', value: stats.totalStudents, trend: '+12%', icon: FaUserGraduate, color: 'indigo', action: () => setActiveTab('students') },
                  { label: 'Teachers', value: stats.totalTeachers, trend: '+2%', icon: FaChalkboardTeacher, color: 'emerald', action: () => setActiveTab('teachers') },
                  { label: 'Today Presence', value: `${stats.presentToday}/${stats.totalStudents}`, trend: 'Good', icon: FaCalendarCheck, color: 'orange' },
                  { label: 'Fees Collection', value: '₹4.2L', trend: '-5%', icon: FaMoneyBillWave, color: 'rose' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    onClick={stat.action}
                    className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm cursor-pointer hover:shadow-xl transition-all hover:bg-indigo-50/20 group relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700`}></div>
                    <div className="flex items-center justify-between mb-6 relative">
                      <div className={`w-14 h-14 bg-${stat.color}-50 rounded-2xl flex items-center justify-center text-${stat.color}-500 text-xl`}>
                        <stat.icon />
                      </div>
                      <span className={`text-${stat.trend.startsWith('+') ? 'emerald' : stat.trend === 'Good' ? 'indigo' : 'rose'}-500 text-[10px] font-black bg-gray-50 px-3 py-1.5 rounded-full`}>
                        {stat.trend.startsWith('+') ? <FaArrowUp className="inline mr-1" /> : stat.trend.startsWith('-') ? <FaArrowDown className="inline mr-1" /> : <FaCheckCircle className="inline mr-1" />}
                        {stat.trend}
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-1 relative tracking-tighter">{stat.value}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest relative">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Visual Performance Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm transition-all hover:shadow-xl group">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 leading-tight">Enrollment Matrix</h2>
                      <p className="text-gray-400 font-bold text-sm">Growth analysis across roles</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                        <FaArrowUp /> 12% Growth
                      </div>
                    </div>
                  </div>
                  <div className="h-[350px]">
                    <Line
                      data={enrollmentTrendData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                          x: { grid: { display: false } }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm transition-all hover:shadow-xl flex flex-col items-center justify-center text-center">
                  <h2 className="text-xl font-black text-gray-900 mb-8 self-start">User Demographics</h2>
                  <div className="w-64 h-64 mb-8">
                    <Doughnut
                      data={roleDistributionData}
                      options={{ cutout: '75%', plugins: { legend: { display: false } } }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 w-full">
                    <div>
                      <p className="text-2xl font-black text-indigo-600">{stats.totalStudents}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Students</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-500">{stats.totalTeachers}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-orange-500">{stats.totalParents}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guardians</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fees & Tasks Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fee Analytics */}
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm transition-all hover:shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                      <FaMoneyBillWave className="text-emerald-500" /> Revenue Stream
                    </h2>
                    <button className="text-xs font-black text-indigo-600 hover:underline">Download Ledger</button>
                  </div>
                  <div className="h-64 mb-8">
                    <Bar
                      data={revenueData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: { grid: { color: '#f1f5f9' }, border: { display: false } },
                          x: { grid: { display: false } }
                        }
                      }}
                    />
                  </div>
                  <div className="p-6 bg-indigo-50 rounded-3xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                      <p className="text-2xl font-black text-indigo-900">₹8,45,200</p>
                    </div>
                    <button className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-xs shadow-sm hover:scale-105 transition-all">RECOVER NOW</button>
                  </div>
                </div>

                {/* Task & Notification Center */}
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col">
                  <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                    <FaTasks className="text-rose-500" /> Administrative Backlog
                  </h2>
                  <div className="space-y-4 flex-1">
                    {[
                      { title: 'Finalize Q3 Marks Entry', due: '2h ago', status: 'CRITICAL', color: 'rose', icon: FaCheckCircle },
                      { title: 'Employee Payroll Approval', due: 'Tomorrow', status: 'PENDING', color: 'indigo', icon: FaRegClock },
                      { title: 'Infrastructure Upgrade Plan', due: 'Sunday', status: 'PLANNING', color: 'emerald', icon: FaCogs },
                    ].map((task, i) => (
                      <div key={i} className="group p-5 bg-gray-50 rounded-3xl hover:bg-white border border-transparent hover:border-indigo-100 transition-all cursor-pointer flex items-center gap-4">
                        <div className={`w-12 h-12 bg-${task.color}-50 rounded-2xl flex items-center justify-center text-${task.color}-500 text-lg group-hover:scale-110 transition-all`}>
                          <task.icon />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[9px] font-black uppercase text-${task.color}-500 tracking-widest`}>{task.status}</span>
                            <span className="text-[10px] text-gray-400 font-bold">{task.due}</span>
                          </div>
                          <h4 className="font-bold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                        </div>
                        <FaChevronRight className="text-gray-200 group-hover:text-indigo-300 transition-all" />
                      </div>
                    ))}
                  </div>
                  <button className="mt-8 w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-2xl font-black text-sm transition-all border border-dashed border-gray-200">System Logs & Archivals</button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'students' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Student Directory</h2>
                  <p className="text-gray-400 font-bold">Manage and visualize student footprints</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="Search student..."
                      className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-semibold"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-6 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm font-bold text-sm text-gray-600 focus:outline-none"
                    onChange={(e) => setFilterClass(e.target.value)}
                  >
                    <option value="all">Everywhere</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-6">Identity</th>
                      <th className="px-8 py-6">Classification</th>
                      <th className="px-8 py-6">Linked Guardian</th>
                      <th className="px-8 py-6">Engagement</th>
                      <th className="px-8 py-6 text-right">Interactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredStudents.map(student => (
                      <tr
                        key={student._id}
                        className="group hover:bg-indigo-50/30 transition-all cursor-pointer"
                        onClick={() => handleStudentClick(student)}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg group-hover:scale-110 transition-all">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{student.name}</p>
                              <p className="text-xs text-gray-400 font-medium">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-gray-600 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">Grade {student.classId?.name || 'NA'}</span>
                        </td>
                        <td className="px-8 py-6">
                          {student.parentId ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <div>
                                <p className="text-xs font-bold text-gray-900 leading-tight">{student.parentId.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{student.parentId.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Not Linked</span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }}></div>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600">82%</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-3 hover:bg-white rounded-xl text-gray-400 hover:text-indigo-600 transition-all hover:shadow-md">
                            <FaChevronRight className="text-xs" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Student Details & Linking Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                  {selectedStudent && (
                    <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl animate-in slide-in-from-left-5 duration-500">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">Academic Profile: {selectedStudent.name}</h2>
                        <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-rose-500 p-2"><FaPlus className="rotate-45" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-indigo-50 rounded-3xl">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Attendance</p>
                          <p className="text-2xl font-black text-indigo-600">{studentDetails.attendance.length > 0 ? Math.round((studentDetails.attendance.filter(a => a.status === 'present').length / studentDetails.attendance.length) * 100) : 0}%</p>
                        </div>
                        <div className="p-6 bg-emerald-50 rounded-3xl">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Performance</p>
                          <p className="text-2xl font-black text-emerald-600">8.4 CGPA</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Performance</h4>
                        {studentDetails.marks.slice(0, 3).map((m, i) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                            <span className="font-bold text-gray-700">{m.subjectId?.name}</span>
                            <span className="font-black text-indigo-600">{m.marks}%</span>
                          </div>
                        ))}
                        {studentDetails.marks.length === 0 && <p className="text-sm font-bold text-gray-400 text-center py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-100">No marks recorded yet</p>}
                      </div>
                    </div>
                  )}

                  {/* Link Parent Form */}
                  <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                      <FaUsers className="text-indigo-500" /> Link Parent Entity
                    </h2>
                    <form onSubmit={handleLinkParent} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">Biological Parent</label>
                        <select
                          value={linkParentId}
                          onChange={(e) => setLinkParentId(e.target.value)}
                          className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:outline-none font-bold text-gray-700 transition-all appearance-none"
                        >
                          <option value="">-- Select Parent Member --</option>
                          {parentList.map(p => (
                            <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">Associate Student</label>
                        <select
                          value={linkStudentId}
                          onChange={(e) => setLinkStudentId(e.target.value)}
                          className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:outline-none font-bold text-gray-700 transition-all appearance-none"
                        >
                          <option value="">-- Select Student Entity --</option>
                          {allStudents.map(s => (
                            <option key={s._id} value={s._id}>{s.name} - Class {s.classId?.name}</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3">
                        ESTABLISH CONNECTION
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Faculty Management</h2>
                  <p className="text-gray-400 font-bold">Track and onboard teaching staff</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                  <FaPlus /> ONBOARD TEACHER
                </button>
              </div>

              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <FaUserPlus className="text-emerald-500" /> New Faculty Entry
                </h3>
                <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                    <input type="text" placeholder="Dr. John Doe" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:outline-none font-bold text-gray-700 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                    <input type="email" placeholder="john@school.com" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:outline-none font-bold text-gray-700 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Contact Number</label>
                    <input type="tel" placeholder="+91 9876543210" value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:outline-none font-bold text-gray-700 transition-all" required />
                  </div>
                  <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Assign Subjects</label>
                    <div className="flex flex-wrap gap-3 p-6 bg-gray-50 rounded-[2rem] border border-transparent">
                      {availableSubjects.map(sub => (
                        <label key={sub._id} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl cursor-pointer hover:shadow-md transition-all group">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded-lg border-2 border-gray-100 text-indigo-600 focus:ring-0 transition-all checked:bg-indigo-600"
                            checked={teacherForm.subjects.split(',').filter(x => x).includes(sub.name)}
                            onChange={(e) => {
                              const current = teacherForm.subjects.split(',').filter(x => x && x.trim());
                              if (e.target.checked) {
                                setTeacherForm({ ...teacherForm, subjects: [...current, sub.name].join(',') });
                              } else {
                                setTeacherForm({ ...teacherForm, subjects: current.filter(x => x !== sub.name).join(',') });
                              }
                            }}
                          />
                          <span className="text-sm font-black text-gray-600 group-hover:text-indigo-600 transition-colors">{sub.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Assign Classes</label>
                    <div className="flex flex-wrap gap-3 p-6 bg-gray-50 rounded-[2rem] border border-transparent">
                      {availableClasses.map(cls => (
                        <label key={cls._id} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl cursor-pointer hover:shadow-md transition-all group">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded-lg border-2 border-gray-100 text-indigo-600 focus:ring-0 transition-all checked:bg-indigo-600"
                            checked={teacherForm.classes.split(',').filter(x => x).includes(cls.name)}
                            onChange={(e) => {
                              const current = teacherForm.classes.split(',').filter(x => x && x.trim());
                              if (e.target.checked) {
                                setTeacherForm({ ...teacherForm, classes: [...current, cls.name].join(',') });
                              } else {
                                setTeacherForm({ ...teacherForm, classes: current.filter(x => x !== cls.name).join(',') });
                              }
                            }}
                          />
                          <span className="text-sm font-black text-gray-600 group-hover:text-indigo-600 transition-colors">{cls.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Assigned Batches</label>
                    <input type="text" placeholder="B1, B2" value={teacherForm.batches} onChange={(e) => setTeacherForm({ ...teacherForm, batches: e.target.value })} className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:outline-none font-bold text-gray-700 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Access Password</label>
                    <input type="password" placeholder="Create strong password" value={teacherForm.password} onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })} className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 focus:outline-none font-bold text-gray-700 transition-all" />
                  </div>
                  <div className="flex items-end pt-2">
                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-100">REGISTER TEACHER</button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-6">Faculty Member</th>
                      <th className="px-8 py-6">Expertise</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.filter(u => u.role === 'teacher').map(teacher => (
                      <tr key={teacher._id} className="group hover:bg-indigo-50/30 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-lg">
                              {teacher.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{teacher.name}</p>
                              <p className="text-xs text-gray-400 font-medium">{teacher.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 space-x-2">
                          {teacher.subjects?.split(',').map((s, i) => (
                            <span key={i} className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase">{s.trim()}</span>
                          )) || <span className="text-[10px] font-black text-gray-300">N/A</span>}
                        </td>
                        <td className="px-8 py-6">
                          <span className="flex items-center gap-2 text-xs font-black text-emerald-500">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> ACTIVE
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => openAssignModal(teacher)} className="text-gray-300 hover:text-indigo-600 transition-colors">
                            <FaCogs className="text-xl ml-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'communication' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-5 duration-500">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-500 text-3xl mx-auto mb-6">
                  <FaBullhorn />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-2">Notice Center</h2>
                <p className="text-gray-400 font-bold">Broadcast updates to your entire academic community</p>
              </div>

              <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-2xl space-y-8">
                <form onSubmit={handleNoticeSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3 block">Target Distribution</label>
                      <div className="flex gap-4">
                        {['student', 'parent', 'teacher'].map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              const roles = newNotice.targetRoles.includes(role)
                                ? newNotice.targetRoles.filter(r => r !== role)
                                : [...newNotice.targetRoles, role];
                              setNewNotice({ ...newNotice, targetRoles: roles });
                            }}
                            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all border ${newNotice.targetRoles.includes(role)
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                              : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-100'
                              }`}
                          >
                            {role.toUpperCase()}S
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3 block">Heading</label>
                      <input
                        type="text"
                        placeholder="Urgent Maintenance / Holiday Update..."
                        className="w-full px-8 py-5 bg-gray-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-100 focus:outline-none font-bold text-gray-700 transition-all"
                        value={newNotice.title}
                        onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3 block">Message Protocol</label>
                      <textarea
                        rows="6"
                        placeholder="Detailed announcement content goes here..."
                        className="w-full px-8 py-5 bg-gray-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-100 focus:outline-none font-bold text-gray-700 transition-all resize-none"
                        value={newNotice.content}
                        onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black tracking-widest shadow-2xl shadow-indigo-200 transition-all scale-100 hover:scale-105 active:scale-95 flex items-center justify-center gap-4"
                  >
                    <FaEnvelope /> INITIALIZE BROADCAST
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
              <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center mb-10">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 border-4 border-white shadow-xl flex items-center justify-center text-4xl text-indigo-600 font-black mb-6 relative group overflow-hidden">
                    {profile.profilePhoto ? (
                      <img src={`http://localhost:5002${profile.profilePhoto}`} className="w-full h-full object-cover" />
                    ) : profile.name?.charAt(0)}
                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                      <FaPlus className="text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">{profile.name}</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Platform Admin</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Canonical Name</label>
                      <input type="text" value={editForm.name} className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 focus:outline-none" readOnly={!editMode} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Encrypted ID</label>
                      <input type="text" value={profile._id?.slice(-8).toUpperCase()} className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-mono text-indigo-400 focus:outline-none" readOnly />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Emergency Contact</label>
                    <input type="text" value={editForm.phone} className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 focus:outline-none" readOnly={!editMode} />
                  </div>
                  <button className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-100 transition-all">Update Access Tokens</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* Task: Teacher Module Activation - Assignment Modal */}
      {showAssignModal && editingTeacher && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black">Manage Assignments</h3>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">{editingTeacher.name}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all">
                <FaSignOutAlt className="rotate-180" />
              </button>
            </div>
            <form onSubmit={handleUpdateTeacherAssignments} className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Assign Subjects</label>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl">
                  {availableSubjects.map(sub => (
                    <label key={sub._id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl cursor-pointer border border-transparent hover:border-indigo-100 transition-all">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                        checked={assignForm.subjects.split(',').filter(x => x).map(x => x.trim()).includes(sub.name)}
                        onChange={(e) => {
                          const current = assignForm.subjects.split(',').filter(x => x && x.trim()).map(x => x.trim());
                          if (e.target.checked) {
                            setAssignForm({ ...assignForm, subjects: [...current, sub.name].join(', ') });
                          } else {
                            setAssignForm({ ...assignForm, subjects: current.filter(x => x !== sub.name).join(', ') });
                          }
                        }}
                      />
                      <span className="text-xs font-bold text-gray-600">{sub.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Assign Classes</label>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl">
                  {availableClasses.map(cls => (
                    <label key={cls._id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl cursor-pointer border border-transparent hover:border-indigo-100 transition-all">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                        checked={assignForm.classes.split(',').filter(x => x).map(x => x.trim()).includes(cls.name)}
                        onChange={(e) => {
                          const current = assignForm.classes.split(',').filter(x => x && x.trim()).map(x => x.trim());
                          if (e.target.checked) {
                            setAssignForm({ ...assignForm, classes: [...current, cls.name].join(', ') });
                          } else {
                            setAssignForm({ ...assignForm, classes: current.filter(x => x !== cls.name).join(', ') });
                          }
                        }}
                      />
                      <span className="text-xs font-bold text-gray-600">{cls.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Batches</label>
                <input
                  type="text"
                  value={assignForm.batches}
                  onChange={(e) => setAssignForm({ ...assignForm, batches: e.target.value })}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-700"
                  placeholder="Morning, Evening"
                />
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1">
                UPDATE ASSIGNMENTS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;