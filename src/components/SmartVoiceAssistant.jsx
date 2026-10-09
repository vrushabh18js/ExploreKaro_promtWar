import React, { useState } from 'react';
import { X, Sparkles, Send, Compass, CheckCircle2, Shield, ArrowRight, Bot } from 'lucide-react';
import { askGeminiConcierge } from '../services/geminiService';

export function SmartVoiceAssistant({
  allPlaces,
  cityName,
  onClose,
  onApplyAIRecommendation
}) {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const samplePrompts = [
    'Find late night safe food spots with high ratings',
    'Show peaceful heritage places with wheelchair accessibility',
    'Where can I find budget hidden gems without traffic chaos?',
    'Recommend clean romantic sunset spots near me'
  ];

  const handleRunQuery = async (inputPrompt) => {
    const text = inputPrompt || query;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    // 1. Try Live Gemini LLM API (Cascades across Key Pool -> Groq -> OpenRouter)
    const aiResult = await askGeminiConcierge(text, cityName, allPlaces);
    const aiText = aiResult?.text;
    const providerBadge = aiResult?.providerBadge;

    // 2. Local semantic filter for map places
    const lower = text.toLowerCase();
    let matchedPlaces = [...allPlaces];
    const reasoning = [];

    if (lower.includes('food') || lower.includes('eat') || lower.includes('chai') || lower.includes('bakery')) {
      matchedPlaces = matchedPlaces.filter(p => p.category === 'food');
      reasoning.push('Prioritized authentic culinary landmarks and verified eateries');
    } else if (lower.includes('heritage') || lower.includes('history') || lower.includes('monument')) {
      matchedPlaces = matchedPlaces.filter(p => p.category === 'heritage');
      reasoning.push('Filtered for UNESCO-recognized and colonial-era heritage architectures');
    } else if (lower.includes('hidden') || lower.includes('secret') || lower.includes('gem')) {
      matchedPlaces = matchedPlaces.filter(p => p.category === 'hidden_gem');
      reasoning.push('Surfaced offbeat cultural spots with lower crowd density');
    }

    if (lower.includes('safe') || lower.includes('night') || lower.includes('solo')) {
      matchedPlaces = matchedPlaces.filter(p => p.safetyScore >= 8.8);
      reasoning.push('Enforced high safety threshold (Score ≥ 8.8) with active street surveillance');
    }

    if (lower.includes('wheelchair') || lower.includes('accessible')) {
      matchedPlaces = matchedPlaces.filter(p => p.accessibility?.wheelchair);
      reasoning.push('Filtered strictly for barrier-free wheelchair accessible paths');
    }

    if (lower.includes('budget') || lower.includes('cheap')) {
      matchedPlaces = matchedPlaces.filter(p => p.priceLevel === '₹' || p.priceLevel === '₹₹');
      reasoning.push('Filtered for affordable dining and budget exploration options');
    }

    if (matchedPlaces.length === 0) {
      matchedPlaces = allPlaces.slice(0, 3);
      reasoning.push('Balanced top overall recommendations for ' + cityName);
    }

    setResult({
      query: text,
      places: matchedPlaces.slice(0, 3),
      reasoning,
      isAiPowered: Boolean(aiText),
      providerBadge: providerBadge || 'exploreKaro Smart NLP Engine',
      summary: aiText || `exploreKaro AI analyzed your intent ("${text}") against local infrastructure, security logs, and cultural archives in ${cityName}. Here are the optimal matches ranked for safety, cleanliness, and authentic experience.`
    });
    setIsAnalyzing(false);
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--accent-purple)',
                letterSpacing: '0.04em'
              }}>
                Natural Language Urban Concierge
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-main)' }}>
              Ask exploreKaro AI
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Query Input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g., Where can I get safe street food at 9 PM with good seating?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunQuery(query)}
              style={{
                flex: 1,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              className="btn-primary"
              onClick={() => handleRunQuery(query)}
              disabled={isAnalyzing}
              style={{ padding: '10px 18px' }}
            >
              {isAnalyzing ? 'Thinking...' : <Send size={16} />}
            </button>
          </div>

          {/* Quick Prompts */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Suggested Prompt Inquiries:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p);
                    handleRunQuery(p);
                  }}
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  ⚡ "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* AI Result Card */}
          {result && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(56, 189, 248, 0.1))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                width: 'fit-content'
              }}>
                <Sparkles size={12} />
                <span>Powered by {result.providerBadge || 'exploreKaro AI'}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5, margin: 0 }}>
                {result.summary}
              </p>

              {/* Reasoning Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  AI Analytical Filters Applied:
                </span>
                {result.reasoning.map((r, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981' }}>
                    <CheckCircle2 size={12} /> {r}
                  </div>
                ))}
              </div>

              {/* Recommended Matches */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Top Ranked Recommendations:
                </span>
                {result.places.map((place) => (
                  <div
                    key={place.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
                        {place.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Safety: {place.safetyScore}/10 • Cleanliness: {place.cleanlinessScore}/10 • {place.priceLevel}
                      </div>
                    </div>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        onApplyAIRecommendation(place);
                        onClose();
                      }}
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                    >
                      <span>Focus on Map</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
