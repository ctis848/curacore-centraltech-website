export default function DashboardKPI({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 shadow rounded">
      <p className="text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold dark:text-white mt-2">{value}</p>
    </div>
  );
}
