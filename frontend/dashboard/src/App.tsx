import useMetrics from "./hooks/useMetrics";
import MetricsCard from "./components/MetricsCard";
import CpuChart from "./components/CpuChart";
import Sidebar from "./components/Sidebar";
import CoreUsageBarChart from "./components/CoreUsageBarChart";
import AvailableMemoryGauge from "./components/AvailableMemoryGauge";
import CpuDualAxisChart from "./components/CpuDualAxisChart";

function App() {
  const { metrics } = useMetrics(); // Only destructure what we need
  const latest = metrics[metrics.length - 1];

if (!latest) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700 mb-2">Connecting to CorePulse...</p>
        <p className="text-sm text-gray-400">Waiting for system metrics to arrive.</p>
      </div>
    </div>
  );
}
  console.log(latest);

  return (
    <div className="p-3 font-sans bg-gray-100 min-h-screen ">
      <div className="bg-white h-[96vh] shadow-xl p-2 rounded-2xl flex gap-2 items-start">
        <Sidebar
          batteryPercent={latest?.battery ?? 0}
          isCharging={latest?.charging ?? false}
        />
        <div className="w-full bg-gray-50 h-full rounded-lg p-4">
          {/* <Header/> */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-sans text-4xl text-[#001233] font-bold">
                Dashboard
              </h2>
              <p className="font-sans text-md text-gray-400 mb-5">
                Monitor your system in real-time with detailed stats.
              </p>
              {latest && (
                <div className="flex space-x-4 mb-6">
                  <MetricsCard
                    title="CPU Usage"
                    value={`${latest.cpu_usage}%`}
                  />
                  <MetricsCard
                    title="RAM Usage"
                    value={`${latest.ram_usage}%`}
                  />
                  <MetricsCard
                    title="Available Memory"
                    value={`${latest.available_memory.toPrecision(3)} GB`}
                  />
                  <MetricsCard
                    title="CPU Clock Speed"
                    value={`${latest.cpu_clock_speed} GHz`}
                  />
                </div>
              )}
            </div>
            <div
              style={{
                backgroundImage: latest?.wallpaper
                  ? `url(${latest.wallpaper})`
                  : "none",
              }}
              className="w-[17rem] flex items-end h-[10rem] bg-cover bg-center rounded-lg shadow-md"
            >
              <div className="relative  w-full rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl shadow-xl shadow-white/10 pt-3 pb-1 px-4 flex flex-col justify-end ">
                <div className="text-white">
                  <p className="text-lg font-semibold">Levi Udoh</p>
                  <p className="text-sm text-white/70">{latest.device_id}</p>
                </div>
                <div className="absolute top-6 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-sm font-semibold text-black">
                  Windows
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-8">
              <CpuChart data={metrics} />
              <div className="flex justify-between gap-4">
                <div className="flex justify-between gap-4">
                  <AvailableMemoryGauge
                    latestMetric={latest}
                    totalMemoryGB={16}
                  />
                  <CoreUsageBarChart latestMetric={latest} />
                </div>
              </div>
            </div>
            <CpuDualAxisChart data={metrics} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
