import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = [
  "#D97706", // Amber
  "#059669", // Emerald
  "#2563EB", // Blue
  "#7C3AED", // Violet
  "#DB2777", // Pink
  "#DC2626", // Red
  "#0D9488", // Teal
  "#0284C7", // Sky
  "#4F46E5", // Indigo
  "#E11D48", // Rose
  "#EA580C", // Orange
  "#65A30D", // Lime
  "#0891B2", // Cyan
  "#9333EA", // Purple
  "#BE123C", // Rose Darker
  "#15803D", // Green
  "#1D4ED8", // Blue Darker
  "#C026D3", // Fuchsia
  "#4B5563"  // Stone
];

const ExpenseChart = ({ expenses, userData }) => {
  if (!expenses || expenses.length === 0) {
    return <p>No expenses to show</p>;
  }

  const categoryData = expenses.reduce((acc, item) => {
    if (!item || !item.category) return acc;

    // Calculate fair share amount using User ID
    const currentUserId = userData?._id
    const currentUserName = (userData?.name || "").toLowerCase()
    const currentUserEmail = (userData?.email || "").toLowerCase()
    const iPaid = item.userId === currentUserId

    const divisions = (item.splitWith?.length || 0) + 1
    const perPersonAmount = item.amount / (item.totalSplit || divisions)

    let fairShare = 0
    if (iPaid) {
      fairShare = perPersonAmount
    } else {
      const mySplit = item.splitWith?.find(p =>
        (p.name && p.name.toLowerCase() === currentUserName) ||
        (p.email && p.email.toLowerCase() === currentUserEmail)
      )
      fairShare = mySplit ? mySplit.amount || perPersonAmount : 0
    }

    if (fairShare <= 0) return acc

    const existing = acc.find(e => e.name === item.category);
    if (existing) {
      existing.value += fairShare;
    } else {
      acc.push({ name: item.category, value: fairShare });
    }
    return acc;
  }, []);

  return (
    <PieChart width={400} height={300}>
      <Pie
        data={categoryData}
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
        dataKey="value"
      >
        {categoryData.map((entry, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default ExpenseChart;
