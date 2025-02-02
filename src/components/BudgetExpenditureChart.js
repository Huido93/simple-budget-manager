import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const BudgetExpenditureChart = ({ expenditures }) => {
  // Aggregate expenditures per category
  const categoryTotals = expenditures.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  // Convert to chart-friendly format
  const labels = Object.keys(categoryTotals);
  const dataValues = Object.values(categoryTotals);

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
      },
    ],
  };

  return (
    <div>
      <h5>Expenditure Breakdown by Category</h5>
      <Pie data={chartData} />
    </div>
  );
};

export default BudgetExpenditureChart;
