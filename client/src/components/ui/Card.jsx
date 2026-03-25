import React from 'react';

const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

export const StatCard = ({ icon, label, value, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green:  'bg-green-100  text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red:    'bg-red-100    text-red-600',
    blue:   'bg-blue-100   text-blue-600',
  };
  return (
    <Card className="flex items-center gap-4 p-6">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color] || colors.indigo}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );
};

export default Card;
