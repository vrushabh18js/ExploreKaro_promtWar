import React from 'react';
import { CloudRain, Sun, Wind, Activity, AlertOctagon, Clock, ShieldCheck } from 'lucide-react';

export function ChaosBanner({ city, weather, hazardCount }) {
  const rainRisk = weather?.rainProb || 10;
  const aqi = weather?.aqi || 95;
  const isTrafficHeavy = city?.trafficStatus?.toLowerCase().includes('heavy') || city?.trafficStatus?.toLowerCase().includes('slow');

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '8px 20px',
      fontSize: '12px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* City & Live Weather */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {city.name} Live Status:
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{city.tagline}</span>
          </div>

          {/* Weather Widget */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-tertiary)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}>
            {rainRisk > 40 ? (
              <CloudRain size={14} style={{ color: 'var(--accent-primary)' }} />
            ) : (
              <Sun size={14} style={{ color: 'var(--accent-warning)' }} />
            )}
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
              {weather?.temp ?? 29}°C
            </span>
            <span style={{ color: 'var(--text-muted)' }}>• {weather?.condition || 'Clear'}</span>
            <span style={{ color: rainRisk > 30 ? 'var(--accent-secondary)' : 'var(--accent-success)' }}>
              (Rain Risk: {rainRisk}%)
            </span>
          </div>

          {/* AQI Widget */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-tertiary)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}>
            <Wind size={14} style={{ color: aqi > 150 ? 'var(--accent-secondary)' : 'var(--accent-success)' }} />
            <span>AQI: <strong>{aqi}</strong> ({weather?.aqiLabel || 'Moderate'})</span>
          </div>
        </div>

        {/* Traffic Status & Active Hazards */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Traffic Condition */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isTrafficHeavy ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: isTrafficHeavy ? '#ef4444' : '#10b981',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${isTrafficHeavy ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            fontWeight: 600
          }}>
            <Activity size={14} />
            <span>Traffic: {city.trafficStatus || 'Normal Urban Flow'}</span>
          </div>

          {/* Hazards Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: hazardCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.12)',
            color: hazardCount > 0 ? '#f59e0b' : '#10b981',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontWeight: 600
          }}>
            {hazardCount > 0 ? <AlertOctagon size={14} /> : <ShieldCheck size={14} />}
            <span>{hazardCount} Active Caution Zones</span>
          </div>

          {/* Optimal Window */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)'
          }}>
            <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Best Hours: <strong>4:30 PM - 8:30 PM</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
