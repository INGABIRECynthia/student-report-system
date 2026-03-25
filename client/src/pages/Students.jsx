import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const emptyForm = { name: '', gender: 'male', date_of_birth: '', class_id: '' };

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchStudents = async () => {
    const params = {};
    if (search) params.search = search;
    if (filterClass) params.class_id = filterClass;
    const { data } = await api.get('/students', { params });
    setStudents(data);
  };

  useEffect(() => {
    Promise.all([fetchStudents(), api.get('/subjects/classes')])
      .then(([, cls]) => setClasses(cls.data))
      .catch(console.error)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStudents().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterClass]);

  const openAdd = () => {
    setEditStudent(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (student) => {
    setEditStudent(student);
    setForm({
      name: student.name,
      gender: student.gender,
      date_of_birth: student.date_of_birth?.slice(0, 10),
      class_id: student.class_id,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editStudent) {
        await api.put(`/students/${editStudent.id}`, form);
        toast.success('Student updated');
      } else {
        await api.post('/students', form);
        toast.success('Student added');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch {
      toast.error('Could not delete student');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'class_name', label: 'Class' },
    {
      key: 'gender', label: 'Gender',
      render: (r) => <span className="capitalize">{r.gender}</span>,
    },
    {
      key: 'date_of_birth', label: 'Date of Birth',
      render: (r) => r.date_of_birth?.slice(0, 10),
    },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="text-indigo-600 hover:underline text-xs font-medium">Edit</button>
          <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:underline text-xs font-medium">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-64"
        />
        <Select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="sm:w-48"
        >
          <option value="">All classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <div className="ml-auto">
          <Button onClick={openAdd}>+ Add Student</Button>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={students} loading={loading} emptyMessage="No students found" />
      </Card>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editStudent ? 'Edit Student' : 'Add Student'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Select
            label="Gender"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
          <Input
            label="Date of Birth"
            type="date"
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            required
          />
          <Select
            label="Class"
            value={form.class_id}
            onChange={(e) => setForm({ ...form, class_id: e.target.value })}
            required
          >
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editStudent ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
