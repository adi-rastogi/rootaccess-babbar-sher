import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import DemoBanner from './components/layout/DemoBanner';
import GuidedTour from './components/tour/GuidedTour';
import Dashboard from './components/dashboard/Dashboard';
import PollutionMap from './components/map/PollutionMap';
import SensorNetwork from './components/sensors/SensorNetwork';
import CriticalZones from './components/sensors/CriticalZones';
import DiwaliIntelligence from './components/diwali/DiwaliIntelligence';
import WeatherModule from './components/weather/WeatherModule';
import CommunityReports from './components/community/CommunityReports';
import RewardsModule from './components/rewards/RewardsModule';
import ForecastModule from './components/forecast/ForecastModule';
import SimulatorModule from './components/simulator/SimulatorModule';
import CopilotModule from './components/copilot/CopilotModule';
import EcoRoutes from './components/routes/EcoRoutes';
import Innovations from './components/innovations/Innovations';
import AdminDashboard from './components/admin/AdminDashboard';
import { NEIGHBORHOODS, type NeighborhoodId } from './data/demoData';

// Global app context
interface AppContextType {
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  selectedNeighborhood: NeighborhoodId;
  setSelectedNeighborhood: (id: NeighborhoodId) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  tourActive: boolean;
  setTourActive: (v: boolean) => void;
  notifications: number;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

export default function App() {
  const [demoMode, setDemoMode] = useState(true);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodId>('cp');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tourActive, setTourActive] = useState(false);
  const notifications = 4;

  return (
    <AppContext.Provider value={{
      demoMode, setDemoMode,
      selectedNeighborhood, setSelectedNeighborhood,
      sidebarOpen, setSidebarOpen,
      tourActive, setTourActive,
      notifications,
    }}>
      <BrowserRouter>
        <div className="flex h-screen bg-navy-950 overflow-hidden">
          {demoMode && <DemoBanner />}

          <Sidebar />

          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${demoMode ? 'pt-6' : ''}`}>
            <TopNav />

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map" element={<PollutionMap />} />
                <Route path="/sensors" element={<SensorNetwork />} />
                <Route path="/critical-zones" element={<CriticalZones />} />
                <Route path="/diwali" element={<DiwaliIntelligence />} />
                <Route path="/weather" element={<WeatherModule />} />
                <Route path="/community" element={<CommunityReports />} />
                <Route path="/rewards" element={<RewardsModule />} />
                <Route path="/forecast" element={<ForecastModule />} />
                <Route path="/simulator" element={<SimulatorModule />} />
                <Route path="/copilot" element={<CopilotModule />} />
                <Route path="/routes" element={<EcoRoutes />} />
                <Route path="/innovations" element={<Innovations />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
          </div>

          {tourActive && <GuidedTour onClose={() => setTourActive(false)} />}
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

