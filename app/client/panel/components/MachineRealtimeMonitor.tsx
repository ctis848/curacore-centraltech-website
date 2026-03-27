"use client";

import { useEffect, useState } from "react";

function MachineRealtimeMonitor({ machineId }: { machineId: string }) {
  const [data, setData] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/machines/${machineId}/live`
    );

    ws.onopen = () => setConnected(true);

    ws.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data);
        setData(parsed);
      } catch {}
    };

    ws.onclose = () => setConnected(false);

    return () => ws.close();
  }, [machineId]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border dark:border-gray-700">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
        Real‑Time Monitor
      </h3>

      <p
        className={`text-sm mb-4 ${
          connected ? "text-green-500" : "text-red-500"
        }`}
      >
        {connected ? "Connected" : "Disconnected"}
      </p>

      {!data ? (
        <p className="text-gray-600 dark:text-gray-300">Waiting for live data...</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 text-gray-800 dark:text-gray-200">

          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">CPU</p>
            <p className="text-2xl font-bold">{data.cpu}%</p>
          </div>

          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">RAM</p>
            <p className="text-2xl font-bold">{data.ram}%</p>
          </div>

          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Temperature</p>
            <p className="text-2xl font-bold">{data.temp}°C</p>
          </div>

          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Network</p>
            <p className="text-2xl font-bold">{data.net} kb/s</p>
          </div>

        </div>
      )}
    </div>
  );
}

export default MachineRealtimeMonitor;
