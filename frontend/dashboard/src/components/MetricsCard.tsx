import React from 'react';

interface Props {
  title: string;
  value: string | number;
}

const MetricsCard: React.FC<Props> = ({ title, value }) => {
  return (
    <div className="p-4 rounded-lg text-gray-50 min-w-[120px] text-center bg-black/20 backdrop-blur-xl shadow-xl shadow-black/10">
      <h4 className="font-semibold">{title}</h4>
      <p className="text-lg mt-1">{value}</p>
    </div>
  );
};

export default MetricsCard;
