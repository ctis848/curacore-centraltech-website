"use client";

export default function MachineActivationLogs({ logs }: any) {
  return (
    <div className="bg-white rounded-xl shadow border p-8">
      <h3 className="text-2xl font-bold mb-6">Machine Activation Logs</h3>

      <div className="space-y-6">
        {logs.map((log: any, i: number) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="w-3 h-3 bg-blue-600 rounded-full mt-2" />

            <div>
              <p className="font-semibold">{log.machineName}</p>
              <p className="text-gray-600 text-sm">{log.action}</p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
