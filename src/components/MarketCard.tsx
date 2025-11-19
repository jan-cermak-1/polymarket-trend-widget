import React, { useEffect, useState, useRef } from 'react';
import type { Event, PriceHistoryPoint } from '../services/polymarket';
import { getMarketHistory } from '../services/polymarket';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { clsx } from 'clsx';

interface MarketCardProps {
  event: Event;
}

export const MarketCard: React.FC<MarketCardProps> = ({ event }) => {
  const mainMarket = event.markets[0];
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const currentRef = cardRef.current;
    let mounted = true;

    if (!mainMarket?.id || !currentRef) return;

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && mounted && history.length === 0 && !loadingHistory) {
                setLoadingHistory(true);
                getMarketHistory(mainMarket.id)
                    .then(data => {
                        if (mounted) {
                            setHistory(data);
                            setLoadingHistory(false);
                        }
                    })
                    .catch(() => {
                         if (mounted) setLoadingHistory(false);
                    });
                observer.disconnect();
            }
        },
        { threshold: 0.1 }
    );

    observer.observe(currentRef);

    return () => { 
        mounted = false;
        observer.disconnect();
    };
  }, [mainMarket?.id]);

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
        
        {/* Hover Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none transform translate-y-1 group-hover:translate-y-0">
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
                        Total Vol: ${Number(event.volume).toLocaleString()}
                    </div>
                </div>
            </div>
            
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

            {/* Little arrow pointing down */}
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
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
