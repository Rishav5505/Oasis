import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { FaUser, FaCalendarAlt, FaBook, FaBullhorn, FaDownload, FaMoneyBillWave, FaClipboardList, FaGraduationCap, FaEdit, FaSave, FaTimes, FaCamera, FaBell, FaChartLine, FaClock, FaStar, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import oasisLogo from '../assets/oasis_logo.png';
import receiptBanner from '../assets/receipt_banner.png';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [student, setStudent] = useState({});
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [fees, setFees] = useState({});
  const [materials, setMaterials] = useState([]);
  const [notices, setNotices] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    dob: '',
    phone: '',
    email: '',
    admissionDate: ''
  });

  // Countdown Timer Logic
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [nextExam, setNextExam] = useState(null);

  useEffect(() => {
    if (exams.length > 0) {
      const upcoming = exams
        .filter(e => new Date(e.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (upcoming.length > 0) {
        setNextExam(upcoming[0]);
      }
    }
  }, [exams]);

  useEffect(() => {
    if (!nextExam) return;

    const timer = setInterval(() => {
      const now = new Date();
      const examDate = new Date(nextExam.date);
      const difference = examDate - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextExam]);

  useEffect(() => {
    if (user?.id) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      // Fetch user profile first (always duplicates existing behavior but safer separate blocks)
      let profileData = {};
      try {
        const profileRes = await axios.get('http://localhost:5002/api/auth/me', { headers });
        profileData = profileRes.data;
        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // If auth fails (401) or user not found (404 - e.g. deleted), logout
        if (err.response?.status === 401 || err.response?.status === 404) {
          alert('Session expired or user not found. Please login again.');
          sessionStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
      }

      // Fetch student data
      let studentData = {};
      try {
        const studentRes = await axios.get(`http://localhost:5002/api/users/students/${user.id}`, { headers });
        studentData = studentRes.data || {};
        setStudent(studentData);
      } catch (err) {
        if (err.response?.status === 404) {
          console.log('Student record not found, using profile data only');
          // No student record yet, which is fine
        } else {
          console.error('Error fetching student details:', err);
        }
      }

      // Now fetch other data that depends on student info
      // We use Promise.allSettled or just individual try-catches to prevent one failure from breaking all
      const requests = [
        axios.get(`http://localhost:5002/api/attendance/student/${user.id}`, { headers }),
        axios.get(`http://localhost:5002/api/marks/student/${user.id}`, { headers }),
        axios.get(`http://localhost:5002/api/fees/student/${user.id}`, { headers }),
        axios.get('http://localhost:5002/api/study-material', { headers }),
        axios.get('http://localhost:5002/api/notices', { headers }),
      ];

      if (studentData?.classId) {
        requests.push(axios.get(`http://localhost:5002/api/exams/class/${studentData.classId._id}`, { headers }));
      }

      const results = await Promise.allSettled(requests);

      // Helper to get data or empty
      const getData = (index, defaultVal = []) => results[index].status === 'fulfilled' ? results[index].value.data : defaultVal;

      setAttendance(getData(0, []));
      setMarks(getData(1, []));
      setFees(getData(2, {}));
      setMaterials(getData(3, []));
      setNotices(getData(4, []));

      if (studentData?.classId && results[5]) {
        setExams(results[5].status === 'fulfilled' ? results[5].value.data : []);
      } else {
        setExams([]);
      }

      // Set edit form data
      setEditForm({
        name: studentData?.name || profileData.name || '',
        fatherName: studentData?.fatherName || '',
        motherName: studentData?.motherName || '',
        dob: studentData?.dob ? new Date(studentData.dob).toISOString().split('T')[0] : '',
        phone: profileData.phone || '', // Check valid profileData
        email: profileData.email || '',
        admissionDate: studentData?.admissionDate ? new Date(studentData.admissionDate).toISOString().split('T')[0] : ''
      });

      // Fetch available classes
      const classesRes = await axios.get('http://localhost:5002/api/users/classes', { headers });
      setAvailableClasses(classesRes.data);

      // Check if class selection is needed
      if (!studentData?.classId) {
        setShowClassModal(true);
      }
    } catch (err) {
      console.error('Error in fetchAllData:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    try {
      console.log('Saving profile data:', editForm);
      console.log('Photo file:', photoFile);

      // Get token from sessionStorage
      const token = sessionStorage.getItem('token');
      console.log('Token from sessionStorage:', token);

      if (!token) {
        alert('You are not logged in. Please login again.');
        return;
      }

      // Create FormData for user update (supports file upload)
      const userFormData = new FormData();
      userFormData.append('name', editForm.name);
      userFormData.append('phone', editForm.phone);
      userFormData.append('email', editForm.email);
      if (photoFile) {
        userFormData.append('profilePhoto', photoFile);
      }

      // Update user data first
      console.log('Updating user data...');
      const userResponse = await axios.put('http://localhost:5002/api/auth/me', userFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('User update response:', userResponse.data);

      // Update student data
      const studentData = {
        name: editForm.name,
        fatherName: editForm.fatherName,
        motherName: editForm.motherName,
        dob: editForm.dob,
        admissionDate: editForm.admissionDate
      };
      console.log('Updating student data:', studentData);

      const studentResponse = await axios.put(`http://localhost:5002/api/users/students/${user.id}`, studentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Student update response:', studentResponse.data);

      setEditMode(false);
      setPhotoFile(null);
      fetchAllData(); // Refresh data
      alert('Profile updated successfully! All data saved to MongoDB.');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleClassSelection = async (classId) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`http://localhost:5002/api/users/students/${user.id}`, { classId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setShowClassModal(false);
      fetchAllData();
      alert('Class selected successfully!');
    } catch (err) {
      alert('Failed to select class');
    }
  };

  const calculateAttendancePercentage = () => {
    if (attendance.length === 0) return 0;
    // Get unique dates
    const uniqueDates = [...new Set(attendance.map(a => new Date(a.date).toDateString()))];
    const presentDates = [...new Set(attendance.filter(a => a.status === 'present').map(a => new Date(a.date).toDateString()))];

    if (uniqueDates.length === 0) return 0;
    return Math.round((presentDates.length / uniqueDates.length) * 100);
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayAttendance = attendance.find(a => new Date(a.date).toDateString() === date.toDateString());
      days.push({
        date: date.getDate(),
        month: date.getMonth(),
        status: dayAttendance ? dayAttendance.status : 'none'
      });
    }
    return days.reverse();
  };

  const getCompletionDeadline = () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7); // 7 days from now
    return deadline.toLocaleDateString();
  };

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
                    <div className="row"><span>Student Name:</span> <span>${student.name || profile.name}</span></div>
                    <div className="row"><span>Class:</span> <span>${student.classId?.name || 'N/A'}</span></div>
                    <hr/>
                    <div className="row"><span>Payment Type:</span> <span>${payment.type}</span></div>
                    <div className="row"><span>Amount Paid:</span> <span>₹${payment.amount}</span></div>
                    <div className="row"><span>Payment Mode:</span> <span>Online/Cash</span></div>
                    <hr/>
                    <div className="row" style="font-weight: bold; font-size: 18px;"><span>TOTAL:</span> <span>₹${payment.amount}</span></div>
                </div>
                <div className="footer">
                    <p>This is a computer-generated receipt.</p>
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

  const getProfileCompletion = () => {
    const fields = [editForm.name, editForm.fatherName, editForm.motherName, editForm.dob, editForm.phone, editForm.email, editForm.admissionDate];
    const completed = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }


  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
                <img src={oasisLogo} alt="Oasis Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Portal</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {student.name || profile.name || 'Student'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <FaBell className="text-xl" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                  {student.profilePhoto || profile.profilePhoto ? (
                    <img src={`http://localhost:5002${student.profilePhoto || profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (student.name || profile.name || 'S').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-gray-900 dark:text-white">{student.name || profile.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Student ID: {user?.id?.slice(-6)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Profile Photo */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white border-opacity-30 overflow-hidden">
                  {student.profilePhoto || profile.profilePhoto ? (
                    <img src={`http://localhost:5002${student.profilePhoto || profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FaUser className="text-4xl text-white opacity-80" />
                  )}
                </div>
                <button
                  onClick={() => document.getElementById('profile-photo-upload').click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <FaCamera className="text-gray-600 text-sm" />
                </button>
                <input
                  type="file"
                  id="profile-photo-upload"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, {student.name || profile.name}!</h2>
                <p className="text-blue-100 mb-4">Ready to continue your learning journey?</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <img src={oasisLogo} alt="Logo" className="w-4 h-4 mr-2 object-contain" />
                    Class: {student.classId?.name || 'Not Assigned'}
                  </span>
                  <span className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Batch: {student.batchId?.name || 'Not Assigned'}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{getProfileCompletion()}%</div>
                  <p className="text-sm opacity-90">Profile Complete</p>
                  <div className="w-20 h-2 bg-white bg-opacity-20 rounded-full mt-3 mx-auto">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${getProfileCompletion()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <FaCalendarAlt />
              </div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Academic Attendance</p>
              <div className="relative mb-2">
                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{calculateAttendancePercentage()}%</p>
                <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${calculateAttendancePercentage()}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {attendance.filter(a => a.status === 'present').length} Sessions Recorded
              </p>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <FaBook />
              </div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Average Marks</p>
              <div className="relative mb-2">
                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                  {marks.length > 0 ? Math.round(marks.reduce((sum, m) => sum + (m.marks || 0), 0) / marks.length) : 0}%
                </p>
                <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${marks.length > 0 ? Math.round(marks.reduce((sum, m) => sum + (m.marks || 0), 0) / marks.length) : 0}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{marks.length} Subjects Evaluated</p>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <FaMoneyBillWave />
              </div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Unpaid Balance</p>
              <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">₹{fees.pendingFees || 0}</p>
              <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">Due: {fees.dueDate ? new Date(fees.dueDate).toLocaleDateString() : 'Paid'}</p>
            </div>
          </div>

          {/* Dynamic Exam Countdown Card (Replaces static Scheduled Exams) */}
          <div className="group bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl shadow-lg shadow-indigo-200 border border-indigo-500 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg backdrop-blur-sm">
                <FaClock className="animate-pulse" />
              </div>

              {nextExam ? (
                <>
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Next: {nextExam.name}</p>
                  <div className="flex gap-2 mb-2">
                    <div className="bg-white/10 rounded p-1 min-w-[30px]">
                      <span className="font-black text-xl block leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                      <span className="text-[8px] uppercase opacity-70">Day</span>
                    </div>
                    <span className="font-bold pt-1">:</span>
                    <div className="bg-white/10 rounded p-1 min-w-[30px]">
                      <span className="font-black text-xl block leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                      <span className="text-[8px] uppercase opacity-70">Hr</span>
                    </div>
                    <span className="font-bold pt-1">:</span>
                    <div className="bg-white/10 rounded p-1 min-w-[30px]">
                      <span className="font-black text-xl block leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                      <span className="text-[8px] uppercase opacity-70">Min</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Upcoming Exams</p>
                  <p className="text-3xl font-black tracking-tight mb-2">None</p>
                </>
              )}

              <p className="text-xs font-bold text-white bg-white/20 px-4 py-1.5 rounded-full border border-white/10">
                {nextExam ? new Date(nextExam.date).toLocaleDateString() : 'Relax & Prepare!'}
              </p>
            </div>
          </div>
        </div>

        {/* Complete Your Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Profile</h2>
              <p className="text-gray-600 dark:text-gray-300">Keep your information up to date for better services</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto mt-4 md:mt-0">
              <div className="text-left md:text-right">
                <div className="text-sm text-gray-500">Complete by</div>
                <div className="font-medium text-gray-900">{getCompletionDeadline()}</div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="text-2xl font-bold text-blue-600">{getProfileCompletion()}%</div>
              </div>
              <button
                onClick={handleEditToggle}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium ml-auto md:ml-0"
              >
                {editMode ? <FaTimes className="mr-2" /> : <FaEdit className="mr-2" />}
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                  <input
                    type="text"
                    value={editForm.fatherName}
                    onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                  <input
                    type="text"
                    value={editForm.motherName}
                    onChange={(e) => setEditForm({ ...editForm, motherName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date</label>
                  <input
                    type="date"
                    value={editForm.admissionDate}
                    onChange={(e) => setEditForm({ ...editForm, admissionDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                  <div className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <FaCamera className="text-gray-400 text-xl" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {photoFile ? photoFile.name : 'Click to upload photo'}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files[0])}
                      className="hidden"
                      id="edit-photo-upload"
                    />
                    <label
                      htmlFor="edit-photo-upload"
                      className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium"
                  >
                    <FaSave className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 ${!editForm.name ? 'border-red-200' : 'border-blue-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-xl" />
                  </div>
                  {!editForm.name && <FaStar className="text-red-500" />}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Full Name</h3>
                <p className="text-gray-700">{editForm.name || 'Not provided'}</p>
                {editForm.name && <FaCheckCircle className="text-green-500 mt-2" />}
              </div>

              <div className={`bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 ${!editForm.phone ? 'border-red-200' : 'border-green-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-xl" />
                  </div>
                  {!editForm.phone && <FaStar className="text-red-500" />}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-700">{editForm.phone || 'Not provided'}</p>
                {editForm.phone && <FaCheckCircle className="text-green-500 mt-2" />}
              </div>

              <div className={`bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 ${!editForm.email ? 'border-red-200' : 'border-purple-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-xl" />
                  </div>
                  {!editForm.email && <FaStar className="text-red-500" />}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-700">{editForm.email || 'Not provided'}</p>
                {editForm.email && <FaCheckCircle className="text-green-500 mt-2" />}
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                    <FaCamera className="text-white text-xl" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Profile Photo</h3>
                <p className="text-gray-700">{profile.profilePhoto ? 'Uploaded' : 'Not uploaded'}</p>
                {profile.profilePhoto && <FaCheckCircle className="text-green-500 mt-2" />}
              </div>

              <div className={`bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 ${!editForm.fatherName ? 'border-red-200' : 'border-yellow-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-xl" />
                  </div>
                  {!editForm.fatherName && <FaStar className="text-red-500" />}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Father's Name</h3>
                <p className="text-gray-700">{editForm.fatherName || 'Not provided'}</p>
                {editForm.fatherName && <FaCheckCircle className="text-green-500 mt-2" />}
              </div>

              <div className={`bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-6 border-2 ${!editForm.motherName ? 'border-red-200' : 'border-pink-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-xl" />
                  </div>
                  {!editForm.motherName && <FaStar className="text-red-500" />}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Mother's Name</h3>
                <p className="text-gray-700">{editForm.motherName || 'Not provided'}</p>
                {editForm.motherName && <FaCheckCircle className="text-green-500 mt-2" />}
              </div>

              <div className={`bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 ${!editForm.dob ? 'border-red-200' : 'border-indigo-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-white text-xl" />
                  </div>
                  {!editForm.dob && <FaStar className="text-red-500" />}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Date of Birth</h3>
                <p className="text-gray-700">{editForm.dob ? new Date(editForm.dob).toLocaleDateString() : 'Not provided'}</p>
                {editForm.dob && <FaCheckCircle className="text-green-500 mt-2" />}
              </div>

              <div className={`bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border-2 ${!editForm.admissionDate ? 'border-red-200' : 'border-teal-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                    <FaClock className="text-white text-xl" />
                  </div>
                  {!editForm.admissionDate && <FaStar className="text-red-500" />}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Admission Date</h3>
                <p className="text-gray-700">{editForm.admissionDate ? new Date(editForm.admissionDate).toLocaleDateString() : 'Not provided'}</p>
                {editForm.admissionDate && <FaCheckCircle className="text-green-500 mt-2" />}
              </div>
            </div>
          )}
        </div>

        {/* Analytics & Digital ID Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
                <p className="text-gray-500 text-sm">Subject-wise marks distribution</p>
              </div>
              <FaChartLine className="text-blue-500 text-xl" />
            </div>
            <div className="h-64">
              {marks.length > 0 ? (
                <Bar
                  data={{
                    labels: marks.map(m => m.subjectId?.name || 'Subject'),
                    datasets: [{
                      label: 'Marks Obtained',
                      data: marks.map(m => m.marks),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderRadius: 8,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true, max: 100 }
                    }
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <FaChartLine className="text-4xl mb-2" />
                  <p>No performance data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Digital ID Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Digital ID Card</h2>
              <button
                onClick={() => {
                  const printContent = document.getElementById('digital-id-card').innerHTML;
                  const win = window.open('', '', 'width=400,height=600');
                  win.document.write('<html><head><title>Student ID Card</title></head><body style="padding: 20px; display: flex; justify-content: center;">' + printContent + '</body></html>');
                  win.document.close();
                  win.print();
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 uppercase tracking-wider"
              >
                <FaDownload /> Print ID
              </button>
            </div>

            <div id="digital-id-card" className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl flex flex-col items-center text-center">
              {/* ID Card Decor */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <img src={oasisLogo} alt="Logo" className="w-12 h-12 object-contain mb-4 brightness-200" />

              <div className="w-24 h-24 rounded-full border-4 border-white/20 p-1 mb-4">
                <img
                  src={`http://localhost:5002${student.profilePhoto || profile.profilePhoto}`}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=' + (student.name || 'Student'); }}
                  alt="Student"
                  className="w-full h-full rounded-full object-cover bg-slate-700"
                />
              </div>

              <h3 className="text-xl font-bold mb-1">{student.name || profile.name || 'Student Name'}</h3>
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">Oasis JEE Student</p>

              <div className="w-full space-y-2 text-sm bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID No.</span>
                  <span className="font-mono">{user?.id?.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Class</span>
                  <span>{student.classId?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Batch</span>
                  <span>{student.batchId?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 w-full">
                <div className="w-full h-8 bg-white rounded flex items-center justify-center">
                  {/* Barcode Placeholder */}
                  <div className="flex gap-1 h-4">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className={`w-${Math.floor(Math.random() * 2) + 1} bg-black h-full`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Attendance & Marks */}
          <div className="lg:col-span-2 space-y-8">
            {/* Attendance Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Attendance Overview</h2>
                  <p className="text-gray-600 text-sm">Your attendance record for this month</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{calculateAttendancePercentage()}%</div>
                  <div className="text-sm text-gray-500">Present</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Monthly Progress</span>
                  <span>{attendance.filter(a => a.status === 'present').length}/{attendance.length} days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${calculateAttendancePercentage()}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Last 30 Days</h3>
                <div className="grid grid-cols-10 gap-2">
                  {renderCalendar().map((day, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black border-2 transition-all hover:scale-110 cursor-help ${day.status === 'present'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : day.status === 'absent'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}
                      title={day.status === 'none' ? 'No session recorded' : `Status: ${day.status}`}
                    >
                      {day.date}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Marks Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Academic Performance</h2>
                <div className="flex items-center space-x-2">
                  <FaChartLine className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Grade Report</span>
                </div>
              </div>

              <div className="space-y-4">
                {marks.length > 0 ? marks.map(m => (
                  <div key={m._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaBook className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{m.subjectId?.name || 'Subject'}</h3>
                        <p className="text-sm text-gray-600">{m.examId?.name || 'Exam'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{m.marks}/100</div>
                      <div className="text-xs text-gray-500">
                        {m.marks >= 90 ? 'Excellent' : m.marks >= 80 ? 'Good' : m.marks >= 70 ? 'Average' : 'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <FaBook className="text-gray-400 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500">No marks available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Fees, Notices, Materials */}
          <div className="space-y-8">
            {/* Fees Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Fee Details</h2>
                <FaMoneyBillWave className="text-green-600 text-xl" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Fees</span>
                  <span className="font-bold text-gray-900">₹{fees.totalFees || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Paid</span>
                  <span className="font-bold text-green-600">₹{fees.paidFees || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-bold text-red-600">₹{fees.pendingFees || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Due Date</span>
                  <span className="font-bold text-blue-600">
                    {fees.dueDate ? new Date(fees.dueDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {fees.payments && fees.payments.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Payments</h3>
                  <div className="space-y-2">
                    {fees.payments.slice(0, 3).map((payment, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{new Date(payment.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-green-600">₹{payment.amount}</span>
                          <button onClick={() => handleDownloadReceipt(payment)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <FaDownload /> Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notices */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
                <FaBullhorn className="text-orange-600 text-xl" />
              </div>

              <div className="space-y-4">
                {notices.slice(0, 3).map(notice => (
                  <div key={notice._id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{notice.title}</h3>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{notice.content}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <FaClock className="mr-1" />
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )) || (
                    <div className="text-center py-8">
                      <FaBullhorn className="text-gray-400 text-4xl mx-auto mb-4" />
                      <p className="text-gray-500">No announcements</p>
                    </div>
                  )}
              </div>
            </div>

            {/* Study Materials */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Study Materials</h2>
                <FaDownload className="text-indigo-600 text-xl" />
              </div>

              <div className="space-y-3">
                {materials.slice(0, 3).map(material => (
                  <div key={material._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{material.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{material.description}</p>
                    </div>
                    <a
                      href={`http://localhost:5002/${material.fileUrl}`}
                      download
                      className="ml-3 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <FaDownload className="text-sm" />
                    </a>
                  </div>
                )) || (
                    <div className="text-center py-8">
                      <FaDownload className="text-gray-400 text-4xl mx-auto mb-4" />
                      <p className="text-gray-500">No materials available</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Class Selection Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                <FaGraduationCap />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Select Your Academic Level</h2>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Choose your grade to customize your dashboard</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {availableClasses.map(c => (
                <button
                  key={c._id}
                  onClick={() => handleClassSelection(c._id)}
                  className="group flex items-center justify-between p-6 bg-gray-50 hover:bg-blue-600 rounded-3xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group"
                >
                  <div className="text-left">
                    <p className="text-lg font-black text-gray-900 group-hover:text-white transition-colors">{c.name}</p>
                    <p className="text-xs font-bold text-gray-400 group-hover:text-blue-100 transition-colors capitalize">Standard Track</p>
                  </div>
                  <FaChevronRight className="text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            <p className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
              If your class isn't listed, please contact<br />
              the administration office.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;