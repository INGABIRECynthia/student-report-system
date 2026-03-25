import React from 'react';

const gradeColors = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-orange-100 text-orange-800',
  F: 'bg-red-100 text-red-800',
};

const Badge = ({ label, variant }) => {
  const colors = gradeColors[label] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors}`}>
      {label}
    </span>
  );
};

export const GradeBadge = ({ grade }) => <Badge label={grade} />;

export const RoleBadge = ({ role }) => {
  const roleColors = {
    admin:   'bg-purple-100 text-purple-800',
    teacher: 'bg-blue-100   text-blue-800',
    student: 'bg-green-100  text-green-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColors[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
};

export const ScoreBadge = ({ score }) => {
  const color =
    score >= 80 ? 'text-green-600 font-bold' :
    score >= 70 ? 'text-blue-600 font-semibold' :
    score >= 60 ? 'text-yellow-600 font-semibold' :
    score >= 50 ? 'text-orange-600 font-semibold' :
    'text-red-600 font-bold';
  return <span className={color}>{score}</span>;
};

export default Badge;
