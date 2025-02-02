import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

const BudgetChart = ({ totalAmount, categories }) => {
  const allocatedAmount = categories.reduce((sum, cat) => sum + Number(cat.amount), 0);
  const unallocatedAmount = totalAmount - allocatedAmount;

  // Predefined color palette
  const colors = [
    '#FF6384', // Red
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#C9CBCF', // Grey
  ];

  const data = {
    labels: [...categories.map((cat) => cat.name), 'To Be Allocated'],
    datasets: [
      {
        data: [...categories.map((cat) => Number(cat.amount)), unallocatedAmount > 0 ? unallocatedAmount : 0],
        backgroundColor: [
          ...categories.map((_, index) => colors[index % colors.length]), // Assign color based on index
          '#cccccc', // Grey for "To Be Allocated"
        ],
      },
    ],
  };

  return (
    <div>
      <h5>Budget Allocation</h5>
      <Doughnut data={data} />
    </div>
  );
};

export default BudgetChart;

