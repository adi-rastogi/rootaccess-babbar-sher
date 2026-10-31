import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Radio, AlertTriangle, Sparkles,
  Cloud, Users, Trophy, TrendingUp, FlaskConical, Bot,
  Route, Lightbulb, ShieldCheck, X, ChevronLeft, ChevronRight,
  Leaf
} from 'lucide-react';
import { useApp } from '../../App';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'core' },
  { to: '/map', icon: Map, label: 'Pollution Flow Map', section: 'core' },
  { to: '/sensors', icon: Radio, label: 'Sensor Network', section: 'core' },
  { to: '/critical-zones', icon: AlertTriangle, label: 'Critical Zones', section: 'core' },
  { to: '/diwali', icon: Sparkles, label: 'Diwali Analytics', section: 'analytics' },
  { to: '/weather', icon: Cloud, label: 'Weather Intel', section: 'analytics' },
  { to: '/forecast', icon: TrendingUp, label: 'Forecasting', section: 'analytics' },
  { to: '/simulator', icon: FlaskConical, label: 'Env Simulator', section: 'analytics' },
  { to: '/community', icon: Users, label: 'Community', section: 'community' },
  { to: '/rewards', icon: Trophy, label: 'Rewards', section: 'community' },
  { to: '/copilot', icon: Bot, label: 'AI Copilot', section: 'ai' },
  { to: '/routes', icon: Route, label: 'Eco Routes', section: 'ai' },
  { to: '/innovations', icon: Lightbulb, label: 'Innovations', section: 'more' },
  { to: '/admin', icon: ShieldCheck, label: 'Admin', section: 'more' },
];

const SECTIONS = [
  { key: 'core', label: 'Core Platform' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'community', label: 'Community' },
  { key: 'ai', label: 'AI & Routing' },
  { key: 'more', label: 'More' },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, demoMode } = useApp();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          ${sidebarOpen ? 'w-60' : 'w-16'}
          flex-shrink-0 bg-navy-900 border-r border-navy-700
          flex flex-col transition-all duration-300 ease-in-out
          fixed md:relative z-40 h-full
          ${demoMode ? 'pt-6' : ''}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-navy-700 min-h-[64px]">
          <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Leaf size={16} className="text-navy-950" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-white font-bold text-sm leading-tight">PollutionMitra</div>
              <div className="text-emerald-400 text-xs">Air Quality, Street by Street</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {SECTIONS.map(section => {
            const items = NAV_ITEMS.filter(i => i.section === section.key);
            return (
              <div key={section.key} className="mb-2">
                {sidebarOpen && (
                  <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {section.label}
                  </div>
                )}
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={!sidebarOpen ? item.label : undefined}
                      className={`
                        flex items-center gap-3 px-2 py-2 rounded-lg mb-0.5
                        text-sm font-medium transition-all duration-150
                        ${isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
                        }
                        ${!sidebarOpen ? 'justify-center' : ''}
                      `}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom — version */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-navy-700">
            <div className="text-xs text-slate-600">v1.0 · Demo Mode</div>
          </div>
        )}
      </aside>
    </>
  );
}

