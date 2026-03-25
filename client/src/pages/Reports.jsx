import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import { GradeBadge, ScoreBadge } from '../components/ui/Badge';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import toast from 'react-hot-toast';

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [report, setReport] = useState(null);
  const [classReport, setClassReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('student'); // 'student' | 'class'

  useEffect(() => {
    Promise.all([
      api.get('/students'),
      api.get('/subjects/classes'),
      api.get('/marks/terms'),
    ])
      .then(([stu, cls, ter]) => {
        setStudents(stu.data);
        setClasses(cls.data);
        setTerms(ter.data);
      })
      .catch(console.error);
  }, []);

  const fetchStudentReport = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const params = {};
      if (selectedTerm) params.term_id = selectedTerm;
      const { data } = await api.get(`/reports/student/${selectedStudent}`, { params });
      setReport(data);
    } catch (err) {
      toast.error('Could not load report');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassReport = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const params = {};
      if (selectedTerm) params.term_id = selectedTerm;
      const { data } = await api.get(`/reports/class/${selectedClass}`, { params });
      setClassReport(data);
    } catch (err) {
      toast.error('Could not load class report');
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = (grade) => {
    const map = {
      A: 'bg-green-100 border-green-200',
      B: 'bg-blue-100 border-blue-200',
      C: 'bg-yellow-100 border-yellow-200',
      D: 'bg-orange-100 border-orange-200',
      F: 'bg-red-100 border-red-200',
    };
    return map[grade] || 'bg-gray-100';
  };

  const radarData = report?.subjects?.map((s) => ({
    subject: s.subject,
    score: s.score,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === 'student' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setTab('student')}
        >
          Student Report
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === 'class' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setTab('class')}
        >
          Class Report
        </button>
      </div>

      {tab === 'student' && (
        <div className="space-y-6">
          {/* Controls */}
          <Card>
            <CardBody>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <Select
                  label="Student"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="sm:w-64"
                >
                  <option value="">Select student</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
                </Select>
                <Select
                  label="Term (optional)"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="sm:w-48"
                >
                  <option value="">All terms</option>
                  {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
                <Button onClick={fetchStudentReport} loading={loading} disabled={!selectedStudent}>
                  Generate Report
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Report card */}
          {report && (
            <div className="space-y-4">
              {/* Student header */}
              <Card className={`border-2 ${gradeColor(report.overallGrade)}`}>
                <CardBody>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{report.student.name}</h2>
                      <p className="text-sm text-gray-500">{report.student.class_name} · {report.student.gender}</p>
                    </div>
                    <div className="flex gap-6 text-center">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{report.total}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Average</p>
                        <p className="text-2xl font-bold text-gray-900">{report.average}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Grade</p>
                        <div className="mt-1"><GradeBadge grade={report.overallGrade} /></div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subjects table */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900">Subject Scores</h3>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Subject', 'Score', 'Grade'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {report.subjects.map((s, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{s.subject}</td>
                            <td className="px-4 py-3 text-sm"><ScoreBadge score={s.score} /></td>
                            <td className="px-4 py-3"><GradeBadge grade={s.grade} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Radar chart */}
                {radarData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold text-gray-900">Performance Overview</h3>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <Radar name="Score" dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.3} />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'class' && (
        <div className="space-y-6">
          <Card>
            <CardBody>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <Select
                  label="Class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="sm:w-48"
                >
                  <option value="">Select class</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <Select
                  label="Term (optional)"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="sm:w-48"
                >
                  <option value="">All terms</option>
                  {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
                <Button onClick={fetchClassReport} loading={loading} disabled={!selectedClass}>
                  Generate Report
                </Button>
              </div>
            </CardBody>
          </Card>

          {classReport.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900">Class Performance</h3>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Rank', 'Student', 'Subjects', 'Total', 'Average', 'Grade'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {classReport.map((r, i) => (
                      <tr key={r.student_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-bold text-gray-500">#{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.student_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{r.subject_count}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{r.total}</td>
                        <td className="px-4 py-3 text-sm"><ScoreBadge score={r.average} /></td>
                        <td className="px-4 py-3"><GradeBadge grade={r.grade} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
