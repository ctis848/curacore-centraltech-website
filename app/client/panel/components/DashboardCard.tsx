"use client";

import { motion } from "framer-motion";

export default function DashboardCard({ title, value, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 bg-white rounded-xl shadow border border-gray-200"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
    </motion.div>
  );
}
