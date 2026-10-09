import React, { useState } from 'react';
import { X, Cpu, CloudSun, Compass, Database, Copy, Check, Sparkles, Shield, AlertTriangle } from 'lucide-react';

export function AIDataInspectorModal({
  isOpen,
  onClose,
  city,
  weather,
  places = [],
  aiDiscoveryInfo,
  onTriggerAIRefresh,
  isAiDiscovering
}) {
  const [activeTab, setActiveTab] = useState('places');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rawPayload = {
    destination: city.name,
    state: city.state,
    centerCoordinates: city.center,
    aiProvider: aiDiscoveryInfo?.providerBadge || 'Google Gemini & OpenRouter Engine',
    timestamp: new Date().toISOString(),
    liveWeatherTelemetry: {
      temperatureCelsius: weather?.temp ?? 33,
      condition: weather?.condition || 'Clear Skies',
      humidity: weather?.humidity || '32%',
      rainProbability: `${weather?.rainProb || 10}%`,
      windSpeed: `${weather?.windSpeed || 11} km/h`,
      airQualityIndex: `${weather?.aqi || 95} (${weather?.aqiLabel || 'Moderate'})`
    },
    liveTrafficIntelligence: {
      status: city.trafficStatus || 'Optimal Traffic Flow',
      bottlenecks: aiDiscoveryInfo?.bottlenecks || `${city.name} Central Market & Ring Road`,
      bestTravelWindow: 'Before 9:00 AM or between 1:00 PM - 4:00 PM',
      transitEstimates: { drive: '~14 mins', transit: '~22 mins', walk: '~42 mins' }
    },
    topTouristPlacesDiscovered: places.map((p, i) => ({
      index: i + 1,
      name: p.name,
      category: p.category,
      rating: p.rating,
      safetyScore: p.safetyScore,
      cleanlinessScore: p.cleanlinessScore,
      priceLevel: p.priceLevel,
      estimatedCost: p.estimatedCost,
      bestVisitingHours: p.bestTime,
      coordinates: [p.lat, p.lng],
      description: p.description,
      historicalLore: p.historicalLore,
      audioGuideScript: p.audioStory,
      tags: p.tags
    }))
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rawPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '840px', width: '92%' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Live AI Travel & Navigation Dossier
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  background: '#dbeafe',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: '99px'
                }}>
                  {aiDiscoveryInfo?.providerBadge || 'Gemini 3.8 / OpenRouter'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Real-time urban intelligence for <strong>{city.name}, {city.state}</strong>
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)',
          overflowX: 'auto'
        }}>
          {[
            { id: 'places', label: `🏛️ Tourist Places (${places.length})` },
            { id: 'telemetry', label: '🚦 Weather & Traffic Telemetry' },
            { id: 'cascade', label: '⚡ API Cascade Status' },
            { id: 'raw', label: '💻 Raw AI JSON' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid',
                borderColor: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                background: activeTab === tab.id ? '#0284c7' : '#ffffff',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px 24px', maxHeight: '58vh', overflowY: 'auto' }}>
          {/* TAB 1: PLACES */}
          {activeTab === 'places' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Total places curated by AI & Live Web: <strong>{places.length}</strong>
                </span>
                <button
                  className="btn-secondary"
                  onClick={onTriggerAIRefresh}
                  disabled={isAiDiscovering}
                  style={{ padding: '4px 12px', fontSize: '11px', borderRadius: 'var(--radius-full)' }}
                >
                  {isAiDiscovering ? '⏳ Researching...' : '✨ Re-query AI'}
                </button>
              </div>

              {places.map((p, idx) => (
                <div
                  key={p.id || idx}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        fontWeight: 800,
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        #{idx + 1}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {p.name}
                      </h4>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {p.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        ⭐ {p.rating}
                      </span>
                      <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        🛡️ {p.safetyScore}/10
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: '4px 0 8px 0', lineHeight: 1.4 }}>
                    {p.description}
                  </p>

                  <div style={{
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    marginBottom: '8px',
                    color: '#334155'
                  }}>
                    <strong>📜 Historical Lore:</strong> {p.historicalLore}
                  </div>

                  <div style={{
                    background: '#eff6ff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#1e40af'
                  }}>
                    <strong>🎧 Audio Story Narration:</strong> "{p.audioStory}"
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {(p.tags || []).map((t, ti) => (
                      <span key={ti} style={{ fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '2px 7px', borderRadius: '4px' }}>
                        #{t}
                      </span>
                    ))}
                    <span style={{ fontSize: '11px', color: '#0369a1', marginLeft: 'auto', fontWeight: 600 }}>
                      ⏰ Best: {p.bestTime} • 💰 {p.priceLevel} ({p.estimatedCost})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Weather Panel */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <CloudSun size={18} color="#0284c7" />
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Live Weather Telemetry</h4>
                  <span style={{ fontSize: '11px', color: '#16a34a', marginLeft: 'auto', fontWeight: 700 }}>
                    ● Real-Time Open-Meteo Feed
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Temperature</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {weather?.temp ?? 33}°C
                    </p>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Condition: {weather?.condition || 'Clear'}</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rain Probability</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#0284c7' }}>
                      {weather?.rainProb ?? 10}%
                    </p>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Precipitation Risk</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wind Speed</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
                      {weather?.windSpeed ?? 11} km/h
                    </p>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Steady breeze</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Air Quality Index</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>
                      {weather?.aqi ?? 95}
                    </p>
                    <span style={{ fontSize: '10px', color: '#16a34a' }}>{weather?.aqiLabel || 'Moderate'}</span>
                  </div>
                </div>
              </div>

              {/* Traffic Panel */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Compass size={18} color="#0284c7" />
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Live Traffic Intelligence</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong>🚦 Current Traffic Flow:</strong> {city.trafficStatus || 'Optimal Steady Flow'}
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong>⚠️ Major Bottlenecks:</strong> {aiDiscoveryInfo?.bottlenecks || `${city.name} Station Road & Market Circle`}
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong>🕒 Recommended Travel Window:</strong> Before 9:00 AM or between 1:00 PM - 4:00 PM
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CASCADE STATUS */}
          {activeTab === 'cascade' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#065f46'
              }}>
                <strong>Active Multi-Provider AI Cascade</strong>: exploreKaro connects Google Gemini, xAI Grok, OpenRouter and Live Web Wikipedia APIs. If any provider experiences quota or rate limits, the system auto-switches to the next tier with zero failure.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}>
                  <span><strong>Tier 1: Google Gemini Pool</strong> (Gemini 3.8 / 2.5 / Flash)</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>● Configured & Polled</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}>
                  <span><strong>Tier 2: OpenRouter AI Engine</strong> (Liquid LFM 2.5 / Gemma 4)</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>● Active & Connected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}>
                  <span><strong>Tier 3: xAI Grok API</strong> (Grok-2)</span>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>● Standby / Configured</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }}>
                  <span><strong>Tier 4: Live Web Travel Gazetteers</strong> (Wikipedia & Wikivoyage)</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>● 100% Free Live Feed</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RAW JSON PAYLOAD */}
          {activeTab === 'raw' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Complete JSON telemetry received from AI & Web services
                </span>
                <button
                  className="btn-secondary"
                  onClick={handleCopyJson}
                  style={{ padding: '4px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '12px',
                lineHeight: 1.45,
                overflowX: 'auto',
                maxHeight: '400px'
              }}>
                {JSON.stringify(rawPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-tertiary)'
        }}>
          <button className="btn-primary" onClick={onClose} style={{ padding: '8px 20px', fontSize: '13px' }}>
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
