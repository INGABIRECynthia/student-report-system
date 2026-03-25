import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatCard } from '../components/ui/Card';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import { GradeBadge, ScoreBadge } from '../components/ui/Badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-indigo-600">
        <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  const stats = data?.stats || {};
  const topStudents = data?.topStudents || [];
  const recentMarks = data?.recentMarks || [];
  const classSummary = data?.classSummary || [];

  const chartData = classSummary.map((c) => ({
    class: c.class_name,
    average: parseFloat(c.average) || 0,
    students: c.student_count,
  }));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          label="Total Students"
          value={stats.totalStudents ?? '—'}
          color="indigo"
        />
        <StatCard
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          label="Total Teachers"
          value={stats.totalTeachers ?? '—'}
          color="blue"
        />
        <StatCard
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          label="Total Subjects"
          value={stats.totalSubjects ?? '—'}
          color="green"
        />
        <StatCard
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          label="Average Score"
          value={stats.avgScore ? `${stats.avgScore}%` : '—'}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class performance chart */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Performance by Class</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="average" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Top students */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">🏆 Top Students</h2>
          </CardHeader>
          <CardBody className="!p-0">
            <ul className="divide-y divide-gray-50">
              {topStudents.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 px-6 py-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.class_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">{s.average}%</span>
                    <GradeBadge grade={s.grade} />
                  </div>
                </li>
              ))}
              {!topStudents.length && (
                <li className="px-6 py-8 text-center text-gray-400 text-sm">No data available</li>
              )}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Recent marks */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Recent Marks</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Subject', 'Term', 'Score', 'Grade'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentMarks.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{m.student_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.subject_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.term_name}</td>
                  <td className="px-4 py-3 text-sm"><ScoreBadge score={m.score} /></td>
                  <td className="px-4 py-3"><GradeBadge grade={m.grade} /></td>
                </tr>
              ))}
              {!recentMarks.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No marks entered yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
