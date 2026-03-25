import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import { GradeBadge, ScoreBadge } from '../components/ui/Badge';
import toast from 'react-hot-toast';

const Marks = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [marks, setMarks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [filter, setFilter] = useState({ class_id: '', term_id: '' });
  const [form, setForm] = useState({ student_id: '', subject_id: '', term_id: '', score: '' });
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/students'),
      api.get('/subjects'),
      api.get('/marks/terms'),
      api.get('/subjects/classes'),
    ])
      .then(([stu, sub, ter, cls]) => {
        setStudents(stu.data);
        setSubjects(sub.data);
        setTerms(ter.data);
        setClasses(cls.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fetchMarks = async () => {
    const params = {};
    if (filter.class_id) params.class_id = filter.class_id;
    if (filter.term_id) params.term_id = filter.term_id;
    const { data } = await api.get('/marks', { params });
    setMarks(data);
  };

  useEffect(() => {
    fetchMarks().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // When class selected in form, filter subjects
  useEffect(() => {
    const selectedStudent = students.find((s) => String(s.id) === String(form.student_id));
    if (selectedStudent) {
      setFilteredSubjects(subjects.filter((s) => String(s.class_id) === String(selectedStudent.class_id)));
    } else {
      setFilteredSubjects([]);
    }
  }, [form.student_id, students, subjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/marks', form);
      toast.success('Mark saved successfully');
      setForm({ student_id: '', subject_id: '', term_id: '', score: '' });
      fetchMarks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving mark');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mark?')) return;
    try {
      await api.delete(`/marks/${id}`);
      toast.success('Mark deleted');
      fetchMarks();
    } catch {
      toast.error('Could not delete mark');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Entry form */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Enter / Update Mark</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <Select
              label="Student"
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value, subject_id: '' })}
              required
            >
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
            </Select>
            <Select
              label="Subject"
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
              required
            >
              <option value="">Select subject</option>
              {filteredSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select
              label="Term"
              value={form.term_id}
              onChange={(e) => setForm({ ...form, term_id: e.target.value })}
              required
            >
              <option value="">Select term</option>
              {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            <Input
              label="Score (0-100)"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              required
            />
            <Button type="submit" loading={saving} className="self-end">Save Mark</Button>
          </form>
        </CardBody>
      </Card>

      {/* Filter & marks table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="font-semibold text-gray-900 flex-1">Marks List</h2>
            <Select
              value={filter.class_id}
              onChange={(e) => setFilter({ ...filter, class_id: e.target.value })}
              className="sm:w-40"
            >
              <option value="">All classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select
              value={filter.term_id}
              onChange={(e) => setFilter({ ...filter, term_id: e.target.value })}
              className="sm:w-44"
            >
              <option value="">All terms</option>
              {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Subject', 'Term', 'Score', 'Grade', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {marks.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{m.student_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.subject_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.term_name}</td>
                  <td className="px-4 py-3 text-sm"><ScoreBadge score={m.score} /></td>
                  <td className="px-4 py-3"><GradeBadge grade={m.grade} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:underline text-xs font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {!marks.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No marks found for selected filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Marks;
