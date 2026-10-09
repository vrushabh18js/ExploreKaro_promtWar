import React from 'react';
import { ArrowUpDown, Landmark, Utensils, Hotel, Gem, ShieldCheck, Wallet } from 'lucide-react';

export function CategoryFilters({
  activeCategory,
  onSelectCategory,
  safetyFilter,
  onToggleSafetyFilter,
  budgetFilter,
  onToggleBudgetFilter,
  sortBy,
  onChangeSortBy,
  keywordFilter = '',
  onChangeKeywordFilter,
  counts
}) {
  const categories = [
    { id: 'all', label: 'All Places', count: counts.all, icon: null },
    { id: 'heritage', label: 'Heritage & Lore', count: counts.heritage, icon: Landmark },
    { id: 'food', label: 'Local Food & Cafes', count: counts.food, icon: Utensils },
    { id: 'hidden_gem', label: 'Hidden Gems', count: counts.hidden_gem, icon: Gem },
    { id: 'hotel', label: 'Stays & Hospitality', count: counts.hotel, icon: Hotel }
  ];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '14px 20px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      {/* Category Pills & Quick Attributes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: 600,
                border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-tertiary)',
                color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {Icon && <Icon size={14} />}
              <span>{cat.label}</span>
              <span style={{
                fontSize: '11px',
                background: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                color: isSelected ? '#000000' : 'var(--text-muted)',
                padding: '1px 6px',
                borderRadius: '99px',
                fontWeight: 700
              }}>
                {cat.count}
              </span>
            </button>
          );
        })}

        {/* Quick Filter: High Safety 8.5+ */}
        <button
          onClick={onToggleSafetyFilter}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 600,
            border: `1px solid ${safetyFilter ? 'var(--accent-success)' : 'var(--border-subtle)'}`,
            background: safetyFilter ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
            color: safetyFilter ? 'var(--accent-success)' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={14} />
          <span>High Safety (8.5+)</span>
        </button>

        {/* Quick Filter: Budget Friendly */}
        <button
          onClick={onToggleBudgetFilter}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 600,
            border: `1px solid ${budgetFilter ? 'var(--accent-warning)' : 'var(--border-subtle)'}`,
            background: budgetFilter ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-tertiary)',
            color: budgetFilter ? 'var(--accent-warning)' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <Wallet size={14} />
          <span>Budget Friendly (₹ / ₹₹)</span>
        </button>
      </div>

      {/* Right Controls: In-Page Place Search & Sort Select */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* In-page keyword filter */}
        {onChangeKeywordFilter && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 8px',
            width: '210px'
          }}>
            <span style={{ fontSize: '13px', marginRight: '6px', opacity: 0.6 }}>🔍</span>
            <input
              type="text"
              placeholder="Filter spots, food, tags..."
              value={keywordFilter}
              onChange={(e) => onChangeKeywordFilter(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            {keywordFilter && (
              <button
                type="button"
                onClick={() => onChangeKeywordFilter('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  fontSize: '11px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowUpDown size={14} style={{ color: 'var(--text-dim)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value)}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="distance">Nearest Distance</option>
            <option value="rating">Highest Rating</option>
            <option value="safety">Safety Score</option>
            <option value="cleanliness">Cleanliness Score</option>
            <option value="affordability">Price (Low to High)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
