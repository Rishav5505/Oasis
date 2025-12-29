import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import {
  FaChalkboardTeacher, FaUsers, FaCalendarCheck, FaBook,
  FaFilePdf, FaChartLine, FaHistory, FaSearch, FaPlus,
  FaChevronRight, FaSignOutAlt, FaRegClock, FaCheckCircle,
  FaTimesCircle, FaFileUpload, FaUserGraduate, FaClipboardList
} from 'react-icons/fa';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [teacherData, setTeacherData] = useState({ subjects: [], batches: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const decodeToken = (t) => {
    try {
      return JSON.parse(atob(t.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Attendance State
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); // { studentId: status }
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSubject, setAttendanceSubject] = useState('');

  // Marks State
  const [marksClass, setMarksClass] = useState('');
  const [marksStudents, setMarksStudents] = useState([]);
  const [selectedMarkStudent, setSelectedMarkStudent] = useState(null);
  const [newMark, setNewMark] = useState({ subjectId: '', marks: '', examId: '', remarks: '' });
  const [exams, setExams] = useState([]);

  // Material State
  const [materialForm, setMaterialForm] = useState({ title: '', subjectId: '', file: null });

  useEffect(() => {
    if (user?.id) {
      fetchTeacherProfile();
      fetchExams();

      const token = sessionStorage.getItem('token');
      if (token) {
        const decoded = decodeToken(token);
        console.log('Decoded Token Assignments:', decoded?.user);
        if (decoded?.user?.classIds?.length > 0) {
          setSelectedClass(decoded.user.classIds[0]);
          fetchClassStudents(decoded.user.classIds[0]);
        }
      }
    }
  }, [user]);

  const fetchTeacherProfile = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [resProfile, resTeacher] = await Promise.all([
        axios.get('http://localhost:5002/api/auth/me', { headers }),
        axios.get('http://localhost:5002/api/teacher/me', { headers })
      ]);
      setProfile(resProfile.data);
      setTeacherData(resTeacher.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching teacher profile:', err);
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const res = await axios.get('http://localhost:5002/api/exams', { headers });
      setExams(res.data);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  const fetchClassStudents = async (classId, type = 'attendance') => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const res = await axios.get(`http://localhost:5002/api/teacher/classes/${classId}/students`, { headers });
      if (type === 'attendance') {
        setStudents(res.data);
        const initialAttendance = {};
        res.data.forEach(s => initialAttendance[s._id] = 'present');
        setAttendanceData(initialAttendance);
      } else {
        setMarksStudents(res.data);
      }
    } catch (err) {
      console.error('Error fetching class students:', err);
    }
  };

  const handleMarkAttendance = async () => {
    if (!attendanceSubject) {
      alert('Please select a subject');
      return;
    }
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please login again.');
      return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const promises = Object.keys(attendanceData).map(studentId =>
        axios.post('http://localhost:5002/api/attendance', {
          studentId,
          date: attendanceDate,
          status: attendanceData[studentId],
          subjectId: attendanceSubject
        }, { headers })
      );
      await Promise.all(promises);
      alert('Attendance marked successfully for the entire batch!');
    } catch (err) {
      alert('Failed to mark attendance');
    }
  };

  const handleUploadMarks = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      await axios.post('http://localhost:5002/api/marks', {
        ...newMark,
        studentId: selectedMarkStudent._id
      }, { headers });
      alert('Marks and remarks uploaded successfully!');
      setNewMark({ subjectId: '', marks: '', examId: '', remarks: '' });
      setSelectedMarkStudent(null);
    } catch (err) {
      alert('Failed to upload marks');
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', materialForm.title);
    formData.append('subjectId', materialForm.subjectId);
    formData.append('file', materialForm.file);
    const token = sessionStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    };
    try {
      await axios.post('http://localhost:5002/api/study-material', formData, { headers });
      alert('Study material uploaded successfully!');
      setMaterialForm({ title: '', subjectId: '', file: null });
    } catch (err) {
      alert('Failed to upload material');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-bold">Loading Teacher Portal...</div>;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-emerald-900 text-emerald-100 flex-shrink-0 flex flex-col shadow-2xl z-20">
        <div className="p-8 flex items-center gap-4 border-b border-emerald-800/50">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
            <FaChalkboardTeacher className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Oasis</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Faculty Suite</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', icon: FaChartLine, label: 'Dashboard' },
            { id: 'attendance', icon: FaCalendarCheck, label: 'Attendance' },
            { id: 'marks', icon: FaClipboardList, label: 'Academic Performance' },
            { id: 'materials', icon: FaBook, label: 'Study Resources' },
            { id: 'profile', icon: FaUserGraduate, label: 'My Profile' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-sm ${activeTab === item.id
                ? 'bg-emerald-500 text-white shadow-emerald-900/50 shadow-lg translate-x-1'
                : 'hover:bg-emerald-800/50 hover:text-white'
                }`}
            >
              <item.icon className={activeTab === item.id ? 'text-white' : 'text-emerald-400'} />
              {item.label}
              {activeTab === item.id && <FaChevronRight className="ml-auto text-[10px]" />}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-emerald-800/50">
          <button
            onClick={() => { sessionStorage.removeItem('token'); window.location.href = '/login'; }}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all border border-red-500/20"
          >
            <FaSignOutAlt /> TERMINATE SESSION
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shadow-sm z-10">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <h2 className="text-xl font-black text-gray-900 capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-5 py-2.5 bg-gray-50 rounded-2xl border border-dotted border-gray-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900 leading-none mb-1">{profile.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Expert Educator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          {activeTab === 'overview' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 text-xl mb-6">
                    <FaUsers />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">{teacherData.batches.length || 0}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Batches</p>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 text-xl mb-6">
                    <FaBook />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">{teacherData.subjects.length || 0}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned Expertise</p>
                </div>
                <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-xl mb-6">
                    <FaRegClock />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">Active</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Teaching Status</p>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-8">Recent Activities</h3>
                <div className="space-y-6">
                  {[
                    { title: 'Attendance Marked', desc: 'Batch Alpha - Grade 10', time: '10 mins ago', icon: FaCheckCircle, color: 'emerald' },
                    { title: 'Notes Uploaded', desc: 'Physics - Chapter 4', time: '2 hours ago', icon: FaFileUpload, color: 'indigo' },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 hover:bg-gray-50 rounded-2xl transition-all">
                      <div className={`w-12 h-12 bg-${act.color}-50 text-${act.color}-500 rounded-xl flex items-center justify-center`}>
                        <act.icon />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm">{act.title}</h4>
                        <p className="text-xs text-gray-400 font-medium">{act.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-300 uppercase">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">Mark Attendance</h2>
                    <p className="text-gray-400 font-bold">Recording student footprints for today</p>
                  </div>
                  <div className="flex gap-4">
                    <select
                      className="px-6 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm text-gray-600 focus:outline-none"
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        fetchClassStudents(e.target.value);
                      }}
                    >
                      <option value="">Select Class</option>
                      {teacherData.classes?.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      className="px-6 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm text-gray-600 focus:outline-none"
                      value={attendanceSubject}
                      onChange={(e) => setAttendanceSubject(e.target.value)}
                    >
                      <option value="">Select Subject</option>
                      {teacherData.subjects.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      className="px-6 py-3.5 bg-gray-50 rounded-2xl border-none font-bold text-sm text-gray-600 focus:outline-none"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={handleMarkAttendance}
                  disabled={!selectedClass}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 transition-all disabled:opacity-50"
                >
                  FINALIZE AND SAVE ATTENDANCE
                </button>
              </div>

              {selectedClass && (
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden p-2">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="px-8 py-6">Student Identity</th>
                        <th className="px-8 py-6 text-right">Status Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {students.map(s => (
                        <tr key={s._id} className="group hover:bg-emerald-50/30 transition-all">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center font-black text-emerald-600">{(s.name || s.userId?.name || '?').charAt(0)}</div>
                              <p className="font-bold text-gray-800 text-sm">{s.name || s.userId?.name || 'Unknown Student'}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex gap-2 justify-end">
                              {['present', 'absent'].map(status => (
                                <button
                                  key={status}
                                  onClick={() => setAttendanceData({ ...attendanceData, [s._id]: status })}
                                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${attendanceData[s._id] === status
                                    ? status === 'present' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'marks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Academic Records</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Global Selector</p>
                  </div>
                  <div className="space-y-4">
                    <select
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-sm text-gray-700"
                      value={marksClass}
                      onChange={(e) => {
                        setMarksClass(e.target.value);
                        fetchClassStudents(e.target.value, 'marks');
                      }}
                    >
                      <option value="">-- Choose Class --</option>
                      {teacherData.classes?.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-sm text-gray-700"
                      value={newMark.subjectId}
                      onChange={(e) => setNewMark({ ...newMark, subjectId: e.target.value })}
                    >
                      <option value="">-- Choose Subject --</option>
                      {teacherData.subjects.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {marksStudents.map(s => (
                      <button
                        key={s._id}
                        onClick={() => setSelectedMarkStudent(s)}
                        className={`w-full p-4 rounded-2xl text-left transition-all ${selectedMarkStudent?._id === s._id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                        <p className="font-bold text-sm">{s.name || s.userId?.name || 'Unknown'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedMarkStudent ? (
                  <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8 animate-in slide-in-from-right-5">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 text-2xl font-black">
                        {(selectedMarkStudent.name || selectedMarkStudent.userId?.name || '?').charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">{selectedMarkStudent.name || selectedMarkStudent.userId?.name || 'Unknown'}</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mark Entry Terminal</p>
                      </div>
                    </div>

                    <form onSubmit={handleUploadMarks} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Subject</label>
                          <select
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700"
                            value={newMark.subjectId}
                            onChange={(e) => setNewMark({ ...newMark, subjectId: e.target.value })}
                            required
                          >
                            <option value="">-- Select Subject --</option>
                            {teacherData.subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Exam Cycle</label>
                          <select
                            className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700"
                            value={newMark.examId}
                            onChange={(e) => setNewMark({ ...newMark, examId: e.target.value })}
                            required
                          >
                            <option value="">-- Select Exam --</option>
                            {exams.map(e => <option key={e._id} value={e._id}>{e.name} ({e.type})</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Score (%)</label>
                        <input
                          type="number"
                          max="100"
                          placeholder="0-100"
                          className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700 text-3xl text-center"
                          value={newMark.marks}
                          onChange={(e) => setNewMark({ ...newMark, marks: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Pedagogical Remarks</label>
                        <textarea
                          rows="4"
                          placeholder="Provide constructive feedback..."
                          className="w-full p-6 bg-gray-50 rounded-[2rem] border-none font-bold text-gray-700 resize-none"
                          value={newMark.remarks}
                          onChange={(e) => setNewMark({ ...newMark, remarks: e.target.value })}
                        />
                      </div>
                      <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-indigo-100">COMMIT TO LEDGER</button>
                    </form>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 border-4 border-dashed border-gray-100 rounded-[3rem] p-20">
                    <FaClipboardList className="text-6xl mb-6 opacity-20" />
                    <p className="font-bold">Select a student from the sidebar to start evaluation</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-5 duration-500">
              <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl space-y-10">
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center text-3xl mx-auto mb-6">
                    <FaFileUpload />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">Resource Repository</h2>
                  <p className="text-gray-400 font-bold">Upload PDF notes or study materials for students</p>
                </div>

                <form onSubmit={handleUploadMaterial} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Resource Heading</label>
                    <input
                      type="text"
                      placeholder="e.g., Quantum Mechanics Part 1"
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700"
                      value={materialForm.title}
                      onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Target Subject</label>
                    <select
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-gray-700"
                      value={materialForm.subjectId}
                      onChange={(e) => setMaterialForm({ ...materialForm, subjectId: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Subject --</option>
                      {teacherData.subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="relative group cursor-pointer">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files[0] })}
                      required
                    />
                    <div className="p-10 border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 group-hover:border-emerald-100 group-hover:text-emerald-500 transition-all">
                      <FaFilePdf className="text-4xl mb-4" />
                      <p className="font-bold text-sm">{materialForm.file ? materialForm.file.name : 'Select or Drop PDF Document'}</p>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-2xl shadow-emerald-100 transition-all">DELEGATE TO COMMUNITY</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
              <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center mb-10">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-50 border-4 border-white shadow-xl flex items-center justify-center text-4xl text-emerald-600 font-black mb-6">
                    {profile.name?.charAt(0)}
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">{profile.name}</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">Platform Educator</p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-3xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {teacherData.subjects.map(s => <span key={s._id} className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase">{s.name}</span>)}
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Batches</p>
                      <div className="flex flex-wrap gap-2">
                        {teacherData.batches.map(b => <span key={b._id} className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase">{b.name}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <span className="text-xs font-bold text-gray-400 uppercase">Registered Email</span>
                      <span className="text-sm font-bold text-gray-700">{profile.email}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <span className="text-xs font-bold text-gray-400 uppercase">Contact Node</span>
                      <span className="text-sm font-bold text-gray-700">{profile.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
