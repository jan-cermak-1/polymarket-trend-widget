import React, { useEffect, useState, useRef } from 'react';
import type { Event, PriceHistoryPoint } from '../services/polymarket';
import { getMarketHistory } from '../services/polymarket';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { clsx } from 'clsx';

interface MarketCardProps {
  event: Event;
}

export const MarketCard: React.FC<MarketCardProps> = ({ event }) => {
  const mainMarket = event.markets[0];
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showTooltipBelow, setShowTooltipBelow] = useState(false);
  
  // Check if tooltip should show below (for items near top of viewport)
  useEffect(() => {
    const checkPosition = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        // If card is in top 30% of viewport, show tooltip below
        setShowTooltipBelow(rect.top < window.innerHeight * 0.3);
      }
    };
    
    checkPosition();
    window.addEventListener('scroll', checkPosition);
    window.addEventListener('resize', checkPosition);
    
    return () => {
      window.removeEventListener('scroll', checkPosition);
      window.removeEventListener('resize', checkPosition);
    };
  }, []);

  // Load history immediately when component mounts
  useEffect(() => {
    let mounted = true;

    if (!mainMarket?.clobTokenIds) return;

    // Parse clobTokenIds (it's a JSON string array)
    let tokenIds: string[] = [];
    try {
      tokenIds = JSON.parse(mainMarket.clobTokenIds);
    } catch (e) {
      console.warn('Failed to parse clobTokenIds', e);
      return;
    }

    // Use the first token ID (Yes outcome) for price history
    const tokenId = tokenIds[0];
    if (!tokenId) return;

    setLoadingHistory(true);
    getMarketHistory(tokenId)
        .then(data => {
            if (mounted) {
                setHistory(data);
                setLoadingHistory(false);
            }
        })
        .catch(() => {
             if (mounted) setLoadingHistory(false);
        });

    return () => { 
        mounted = false;
    };
  }, [mainMarket?.clobTokenIds]);

  if (!mainMarket) return null;

  let outcomes: string[] = [];
  try {
    outcomes = Array.isArray(mainMarket.outcomePrices) 
      ? mainMarket.outcomePrices 
      : JSON.parse(mainMarket.outcomePrices);
  } catch (e) {
    console.error('Error parsing outcome prices', e);
    return null;
  }
  
  const yesPrice = parseFloat(outcomes[0] || '0');
  const noPrice = parseFloat(outcomes[1] || '0');
  const yesPercent = Math.round(yesPrice * 100);
  const noPercent = Math.round(noPrice * 100);

  const hasHistory = history.length > 1;
  const isTrendingUp = hasHistory ? history[history.length - 1].p >= history[0].p : yesPercent >= 50;
  const chartColor = isTrendingUp ? '#22c55e' : '#ef4444';

  return (
    <div ref={cardRef} className="group relative flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border-b border-gray-50 last:border-0">
        
        {/* Hover Tooltip with Chart - positioned above or below based on viewport position */}
        <div className={clsx(
          "absolute left-1/2 -translate-x-1/2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none transform",
          showTooltipBelow 
            ? "top-full mt-2 translate-y-[-4px] group-hover:translate-y-0" 
            : "bottom-full mb-2 translate-y-1 group-hover:translate-y-0"
        )}>
            <div className="flex gap-3 mb-3">
                {event.image && (
                    <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-10 h-10 rounded-md object-cover bg-gray-100"
                    />
                )}
                <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900 leading-tight mb-1">
                        {event.title}
                    </h4>
                    <div className="text-xs text-gray-500">
                        ${Number(event.volume).toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })} Vol.
                    </div>
                </div>
            </div>
            
            {/* Chart */}
            {hasHistory && (
                <div className="mb-3 h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id={`gradient-tooltip-${mainMarket.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.2}/>
                                    <stop offset="100%" stopColor={chartColor} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis 
                                dataKey="t" 
                                tick={{ fontSize: 9, fill: '#999' }}
                                tickFormatter={(timestamp) => {
                                    const date = new Date(timestamp * 1000);
                                    
                                    // If data spans more than 30 days, show month/day, otherwise show day/time
                                    if (history.length > 0) {
                                        const firstDate = new Date(history[0].t * 1000);
                                        const lastDate = new Date(history[history.length - 1].t * 1000);
                                        const rangeDays = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
                                        
                                        if (rangeDays > 30) {
                                            // Show month and day for longer ranges
                                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        } else if (rangeDays > 7) {
                                            // Show month, day for week+ ranges
                                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        } else {
                                            // Show day and time for short ranges
                                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        }
                                    }
                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                }}
                                tickCount={5}
                                stroke="#e5e5e5"
                                angle={-15}
                                textAnchor="end"
                                height={40}
                            />
                            <YAxis 
                                domain={[0, 1]} 
                                tick={{ fontSize: 10, fill: '#999' }}
                                tickFormatter={(value) => `${Math.round(value * 100)}%`}
                                ticks={[0, 0.25, 0.5, 0.75, 1]}
                                stroke="#e5e5e5"
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    fontSize: '11px'
                                }}
                                labelFormatter={(timestamp) => {
                                    const date = new Date((timestamp as number) * 1000);
                                    return date.toLocaleString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        hour: 'numeric', 
                                        minute: '2-digit',
                                        hour12: true 
                                    });
                                }}
                                formatter={(value: any) => [`${Math.round(value * 100)}%`, 'Price']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="p" 
                                stroke={chartColor} 
                                strokeWidth={2} 
                                fill={`url(#gradient-tooltip-${mainMarket.id})`} 
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
            
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-green-600">Yes {yesPercent}%</span>
                    <span className="text-red-500">No {noPercent}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex w-full">
                    <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${yesPercent}%` }}
                    />
                    <div 
                        className="h-full bg-gray-200" 
                        style={{ width: `${noPercent}%` }}
                    />
                </div>
            </div>

            {/* Arrow pointing to the card */}
            <div className={clsx(
              "absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-gray-200 transform rotate-45",
              showTooltipBelow 
                ? "top-[-6px] border-t border-l" 
                : "bottom-[-6px] border-b border-r"
            )}></div>
        </div>

        {/* Image */}
        <div className="shrink-0 relative">
             {event.image ? (
                <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-8 h-8 rounded object-cover border border-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
            ) : (
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>
            )}
        </div>
     
        {/* Text Content */}
        <div className="flex-1 min-w-0">
             <h3 className="font-medium text-gray-900 text-[13px] leading-tight truncate group-hover:text-blue-600 transition-colors">
                {event.title}
             </h3>
             <div className="text-[11px] text-gray-400 mt-0.5">
                ${Number(event.volume24hr || event.volume).toLocaleString(undefined, { notation: "compact" })} Vol.
             </div>
        </div>

        {/* Right Side: Sparkline & Price */}
        <div className="flex items-center gap-3 shrink-0">
            {/* Mini Sparkline */}
            <div className="w-16 h-8 relative opacity-50 group-hover:opacity-100 transition-opacity">
                 {!loadingHistory && history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id={`gradient-mini-${mainMarket.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.3}/>
                                    <stop offset="100%" stopColor={chartColor} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <YAxis domain={[0, 1]} hide />
                            <Area 
                                type="monotone" 
                                dataKey="p" 
                                stroke={chartColor} 
                                strokeWidth={1.5} 
                                fill={`url(#gradient-mini-${mainMarket.id})`} 
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    // Placeholder line
                    <div className="w-full h-px bg-gray-100 mt-4" />
                )}
            </div>

            {/* Price Button */}
            <div className={clsx(
                "w-12 py-1 rounded text-center text-xs font-bold transition-colors",
                isTrendingUp 
                    ? "bg-green-50 text-green-700 group-hover:bg-green-100" 
                    : "bg-red-50 text-red-700 group-hover:bg-red-100"
            )}>
                {yesPercent}%
            </div>
        </div>
    </div>
  );
};
