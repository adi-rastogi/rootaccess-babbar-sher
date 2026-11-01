import { useState, useEffect, createContext, useContext } from 'react';
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
import SatelliteIntelligence from './components/satellite/SatelliteIntelligence';
import PrecisionHealthAlerts from './components/health/PrecisionHealthAlerts';
import MicroCanyonModule from './components/canyon/MicroCanyonModule';
import { NEIGHBORHOODS, type NeighborhoodId } from './data/demoData';
import {
  getUnifiedAirQualityIntelligence,
  type AirQualityIntelligence,
  type LiveAQIStation
} from './services/airQualityService';

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
  // Live Real-Time Telemetry (WAQI & OpenAQ)
  liveData: AirQualityIntelligence | null;
  isFetchingLive: boolean;
  liveError: string | null;
  refreshLiveData: (force?: boolean) => Promise<void>;
  selectedStation: LiveAQIStation | null;
  setSelectedStation: (s: LiveAQIStation | null) => void;
  isLiveMode: boolean;
  setIsLiveMode: (v: boolean) => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

export default function App() {
  const [demoMode, setDemoMode] = useState(false); // Default to Live Real-Time Data Mode!
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodId>('cp');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tourActive, setTourActive] = useState(false);
  const notifications = 4;

  // Real-Time Air Quality State
  const [liveData, setLiveData] = useState<AirQualityIntelligence | null>(null);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<LiveAQIStation | null>(null);

  const refreshLiveData = async (force = true) => {
    setIsFetchingLive(true);
    try {
      const data = await getUnifiedAirQualityIntelligence(force);
      setLiveData(data);
      if (!selectedStation && data.stations.length > 0) {
        // Default to Central Delhi / CP station if available, or first station
        const cpStation = data.stations.find(s => s.name.toLowerCase().includes('dhyan') || s.name.toLowerCase().includes('delhi')) || data.stations[0];
        setSelectedStation(cpStation);
      }
      setLiveError(null);
    } catch (err: any) {
      setLiveError(err.message || 'Live data update failed');
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Fetch live real-time data upon startup and set recurring poll every 2 minutes
  useEffect(() => {
    refreshLiveData(false);
    const interval = setInterval(() => {
      refreshLiveData(false);
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{
      demoMode, setDemoMode,
      selectedNeighborhood, setSelectedNeighborhood,
      sidebarOpen, setSidebarOpen,
      tourActive, setTourActive,
      notifications,
      liveData,
      isFetchingLive,
      liveError,
      refreshLiveData,
      selectedStation,
      setSelectedStation,
      isLiveMode,
      setIsLiveMode,
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
                <Route path="/satellite" element={<SatelliteIntelligence />} />
                <Route path="/diwali" element={<DiwaliIntelligence />} />
                <Route path="/canyon" element={<MicroCanyonModule />} />
                <Route path="/health" element={<PrecisionHealthAlerts />} />
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

