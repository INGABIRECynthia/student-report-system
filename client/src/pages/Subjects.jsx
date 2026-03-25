import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', class_id: '', teacher_id: '' });
  const [filterClass, setFilterClass] = useState('');
  const [saving, setSaving] = useState(false);

  // Class management
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [className, setClassName] = useState('');

  const fetchAll = async () => {
    const params = {};
    if (filterClass) params.class_id = filterClass;
    const [sub, cls] = await Promise.all([
      api.get('/subjects', { params }),
      api.get('/subjects/classes'),
    ]);
    setSubjects(sub.data);
    setClasses(cls.data);
  };

  useEffect(() => {
    fetchAll()
      .catch(console.error)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClass]);

  const openAdd = () => {
    setEditSubject(null);
    setForm({ name: '', code: '', class_id: '', teacher_id: '' });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditSubject(s);
    setForm({ name: s.name, code: s.code || '', class_id: s.class_id, teacher_id: s.teacher_id || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editSubject) {
        await api.put(`/subjects/${editSubject.id}`, form);
        toast.success('Subject updated');
      } else {
        await api.post('/subjects', form);
        toast.success('Subject added');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted');
      fetchAll();
    } catch {
      toast.error('Could not delete subject');
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects/classes', { name: className });
      toast.success('Class added');
      setClassName('');
      setClassModalOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding class');
    }
  };

  const columns = [
    { key: 'name', label: 'Subject' },
    { key: 'code', label: 'Code' },
    { key: 'class_name', label: 'Class' },
    { key: 'teacher_name', label: 'Teacher', render: (r) => r.teacher_name || '—' },
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="sm:w-48">
          <option value="">All classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={() => setClassModalOpen(true)}>+ Add Class</Button>
          <Button onClick={openAdd}>+ Add Subject</Button>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={subjects} loading={loading} emptyMessage="No subjects found" />
      </Card>

      {/* Subject Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editSubject ? 'Edit Subject' : 'Add Subject'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Subject Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Code (optional)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Select label="Class" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} required>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editSubject ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>

      {/* Class Modal */}
      <Modal open={classModalOpen} onClose={() => setClassModalOpen(false)} title="Add Class" size="sm">
        <form onSubmit={handleAddClass} className="space-y-4">
          <Input label="Class Name" value={className} onChange={(e) => setClassName(e.target.value)} required placeholder="e.g. Form 4" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setClassModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Class</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Subjects;
