import React, { useEffect, useState, useRef } from 'react';
import type { Event, PriceHistoryPoint } from '../services/polymarket';
import { getMarketHistory } from '../services/polymarket';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { clsx } from 'clsx';

interface MarketCardProps {
  event: Event;
  isTopItem?: boolean;
  isExpanded?: boolean;
  onExpand?: () => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ event, isTopItem = false, isExpanded = false, onExpand }) => {
  const mainMarket = event.markets[0];
  const isMultiChoice = event.markets.length > 1 && event.markets.some(m => m.groupItemTitle);
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showTooltipBelow, setShowTooltipBelow] = useState(true); // Default to below to avoid hiding under header
  
  // Helper function to get all options sorted by percentage (limit to 6)
  const getAllOptions = () => {
    return event.markets
      .map(m => {
        let price = '0';
        try {
          if (m.outcomePrices) {
            const prices = Array.isArray(m.outcomePrices) ? m.outcomePrices : JSON.parse(m.outcomePrices);
            price = prices[0] || '0';
          }
        } catch (e) {
          console.warn('Failed to parse prices for market', m.id);
        }
        return {
          title: m.groupItemTitle || m.question,
          percent: Math.round(parseFloat(price) * 100)
        };
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 6); // Limit to top 6 options
  };
  
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

    // For multi-choice, find the winning market and load its history
    if (isMultiChoice) {
      const options = getAllOptions();
      const winningOption = options[0];
      
      if (!winningOption) return;
      
      // Find the market that corresponds to the winning option
      const winningMarket = event.markets.find(m => 
        (m.groupItemTitle || m.question) === winningOption.title
      );
      
      if (!winningMarket?.clobTokenIds) return;
      
      try {
        const tokenIds = JSON.parse(winningMarket.clobTokenIds);
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
      } catch (e) {
        console.warn('Failed to parse clobTokenIds for winning market', e);
      }
    } else {
      // For binary markets, use the main market (Yes outcome)
      if (!mainMarket?.clobTokenIds) return;

      try {
        const tokenIds = JSON.parse(mainMarket.clobTokenIds);
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
      } catch (e) {
        console.warn('Failed to parse clobTokenIds', e);
      }
    }

    return () => { 
      mounted = false;
    };
  }, [mainMarket?.clobTokenIds, isMultiChoice, event.markets]);

  if (!mainMarket) return null;

  let outcomes: string[] = [];
  try {
    if (!mainMarket.outcomePrices) {
      outcomes = ['0', '0'];
    } else if (Array.isArray(mainMarket.outcomePrices)) {
      outcomes = mainMarket.outcomePrices;
    } else if (typeof mainMarket.outcomePrices === 'string') {
      outcomes = JSON.parse(mainMarket.outcomePrices);
    } else {
      outcomes = ['0', '0'];
    }
  } catch (e) {
    console.error('Error parsing outcome prices', e, mainMarket.outcomePrices);
    return null;
  }
  
  const yesPrice = parseFloat(outcomes[0] || '0');
  const noPrice = parseFloat(outcomes[1] || '0');
  const yesPercent = Math.round(yesPrice * 100);
  const noPercent = Math.round(noPrice * 100);

  const hasHistory = history.length > 1;
  const isTrendingUp = hasHistory ? history[history.length - 1].p >= history[0].p : yesPercent >= 50;
  const chartColor = '#3b82f6'; // Blue for all charts

  const renderTooltipContent = () => (
    <>
        <div className="flex gap-3 mb-3">
            {event.image && (
                <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                />
            )}
            <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white leading-tight mb-1">
                    {event.title}
                </h4>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    ${Number(event.volume).toLocaleString(undefined, { maximumFractionDigits: 0 })} Volume
                </div>
            </div>
        </div>
        
        {/* Chart in tooltip */}
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
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.1} vertical={false} />
                        <XAxis 
                            dataKey="t" 
                            tick={{ fontSize: 9, fill: '#9ca3af' }}
                            tickFormatter={(timestamp) => {
                                const date = new Date(timestamp * 1000);
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }}
                            tickCount={5}
                            stroke="#374151"
                            angle={-15}
                            textAnchor="end"
                            height={40}
                        />
                        <YAxis 
                            domain={[0, 1]} 
                            tick={{ fontSize: 10, fill: '#9ca3af' }}
                            tickFormatter={(value) => `${Math.round(value * 100)}%`}
                            ticks={[0, 0.25, 0.5, 0.75, 1]}
                            stroke="#374151"
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                border: '1px solid #e5e5e5',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                fontSize: '11px',
                                color: '#1f2937'
                            }}
                            itemStyle={{ color: '#1f2937' }}
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
            {isMultiChoice ? (
                <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">All Options</div>
                    {getAllOptions().map((option, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">{option.title}</span>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden w-20">
                                    <div 
                                        className="h-full bg-blue-500" 
                                        style={{ width: `${option.percent}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-gray-900 dark:text-white w-10 text-right">{option.percent}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-green-600 dark:text-green-400">Yes {yesPercent}%</span>
                        <span className="text-red-500 dark:text-red-400">No {noPercent}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex w-full">
                        <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${yesPercent}%` }}
                        />
                        <div 
                            className="h-full bg-gray-200 dark:bg-gray-600" 
                            style={{ width: `${noPercent}%` }}
                        />
                    </div>
                </>
            )}
        </div>
    </>
  );

  // Render large card with visible chart for top 3 items
  if (isTopItem) {
    return (
      <div ref={cardRef} className="group relative p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer">
        
        {/* Hover Tooltip - same as compact items */}
        <div className={clsx(
          "hidden lg:block absolute left-1/2 -translate-x-1/2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none transform",
          showTooltipBelow 
            ? "top-full mt-2 translate-y-[-4px] group-hover:translate-y-0" 
            : "bottom-full mb-2 translate-y-1 group-hover:translate-y-0"
        )}>
            {renderTooltipContent()}

            {/* Arrow pointing to the card */}
            <div className={clsx(
              "absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transform rotate-45",
              showTooltipBelow 
                ? "top-[-6px] border-t border-l" 
                : "bottom-[-6px] border-b border-r"
            )}></div>
        </div>

        <div className="flex items-start gap-2 mb-1.5 shrink-0">
          {event.image && (
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2">
              {event.title}
            </h3>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              ${Number(event.volume).toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })} Vol.
            </div>
          </div>
          {isMultiChoice ? (
            <div className="flex flex-col items-end text-right shrink-0 max-w-[120px]">
              {(() => {
                const winner = getAllOptions()[0];
                
                return winner ? (
                  <>
                    <div className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">Leading</div>
                    <div className="text-[11px] font-bold text-gray-900 dark:text-white line-clamp-2 text-right leading-tight mb-0.5">
                      {winner.title}
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {winner.percent}%
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          ) : (
            <div className={clsx(
              "px-2.5 py-1 rounded-lg whitespace-nowrap flex flex-col items-center shrink-0",
              isTrendingUp 
                ? "bg-green-50 dark:bg-green-900/30" 
                : "bg-red-50 dark:bg-red-900/30"
            )}>
              <div className="text-[9px] font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide leading-none mb-0.5">Yes</div>
              <div className={clsx(
                "text-lg font-bold leading-tight",
                isTrendingUp ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
              )}>
                {yesPercent}%
              </div>
            </div>
          )}
        </div>

        {hasHistory && (
          <div className="flex-1 min-h-0 w-full bg-white dark:bg-gray-900 rounded p-1.5 border border-gray-100 dark:border-gray-800">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 2, right: 2, left: -20, bottom: 12 }}>
                <defs>
                  <linearGradient id={`gradient-large-${mainMarket.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.3}/>
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" strokeOpacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="t" 
                  tick={{ fontSize: 6, fill: '#9ca3af' }}
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp * 1000);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  tickCount={3}
                  stroke="#374151"
                  angle={-5}
                  textAnchor="end"
                  height={20}
                />
                <YAxis 
                  domain={[0, 1]} 
                  tick={{ fontSize: 6, fill: '#9ca3af' }}
                  tickFormatter={(value) => `${Math.round(value * 100)}%`}
                  ticks={[0, 1]}
                  stroke="#374151"
                  width={20}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: '#1f2937'
                  }}
                  itemStyle={{ color: '#1f2937' }}
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
                  formatter={(value: any) => [`${Math.round(value * 100)}%`, 'Probability']}
                />
                <Area 
                  type="monotone" 
                  dataKey="p" 
                  stroke={chartColor} 
                  strokeWidth={2} 
                  fill={`url(#gradient-large-${mainMarket.id})`} 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // Regular compact card with tooltip for remaining items
  return (
    <div className="flex flex-col">
        <div 
            ref={cardRef} 
            className="group relative flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer"
            onClick={() => onExpand ? onExpand() : null}
        >
            
            {/* Hover Tooltip with Chart - positioned above or below based on viewport position - DESKTOP ONLY */}
            <div className={clsx(
            "hidden lg:block absolute left-1/2 -translate-x-1/2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none transform",
            showTooltipBelow 
                ? "top-full mt-2 translate-y-[-4px] group-hover:translate-y-0" 
                : "bottom-full mb-2 translate-y-1 group-hover:translate-y-0"
            )}>
                {renderTooltipContent()}

                {/* Arrow pointing to the card */}
                <div className={clsx(
                "absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transform rotate-45",
                showTooltipBelow 
                    ? "top-[-6px] border-t border-l" 
                    : "bottom-[-6px] border-b border-r"
                )}></div>
            </div>

            {/* Left side: Image + Text - Flexible (60%) */}
            <div className="flex items-center gap-2 flex-[0_0_60%] min-w-0">
                {/* Image */}
                <div className="shrink-0 relative">
                    {event.image ? (
                        <img 
                            src={event.image} 
                            alt={event.title} 
                            className="w-8 h-8 rounded object-cover border border-gray-100 dark:border-gray-700"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    ) : (
                        <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                    )}
                </div>
            
                {/* Text Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-[12px] leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {event.title}
                    </h3>
                    <div className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                        ${Number(event.volume24hr || event.volume).toLocaleString(undefined, { notation: "compact" })} Vol.
                    </div>
                </div>
            </div>

            {/* Middle: Sparkline - Fixed width (always same position) */}
            <div className="flex items-center justify-center shrink-0 w-[60px]">
                {/* Mini Sparkline */}
                <div className="w-14 h-7 relative opacity-50 group-hover:opacity-100 transition-opacity">
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
                        <div className="w-full h-px bg-gray-100 dark:bg-gray-700 mt-4" />
                    )}
                </div>
            </div>

            {/* Right side: Label + Price - Flexible (remaining space) */}
            <div className="flex-1 flex items-center justify-end min-w-0 gap-2">
                {/* Price Button with Label */}
                {isMultiChoice ? (
                    <div className="flex flex-col items-end text-right min-w-0">
                    {(() => {
                        const winner = getAllOptions()[0];
                        return winner ? (
                        <>
                            <div className="text-[8px] text-gray-500 dark:text-gray-400 mb-0.5 uppercase">Lead</div>
                            <div className="text-[10px] font-bold text-gray-900 dark:text-gray-100 line-clamp-1 text-right leading-tight mb-0.5 truncate max-w-full">
                            {winner.title}
                            </div>
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {winner.percent}%
                            </div>
                        </>
                        ) : null;
                    })()}
                    </div>
                ) : (
                    <div className={clsx(
                        "flex flex-col items-center py-1 px-2 rounded transition-colors",
                        isTrendingUp 
                            ? "bg-green-50 group-hover:bg-green-100 dark:bg-green-900/30 dark:group-hover:bg-green-900/50" 
                            : "bg-red-50 group-hover:bg-red-100 dark:bg-red-900/30 dark:group-hover:bg-red-900/50"
                    )}>
                        <div className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-none">Yes</div>
                        <div className={clsx(
                            "text-sm font-bold leading-tight mt-0.5",
                            isTrendingUp ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                        )}>
                            {yesPercent}%
                        </div>
                    </div>
                )}

                {/* Mobile Expand Arrow */}
                <div className="lg:hidden text-gray-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>
        </div>

        {/* Mobile Accordion Content */}
        <div className={clsx(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-800/50 rounded-b-lg",
            isExpanded ? "max-h-[500px] opacity-100 mb-2 border-x border-b border-gray-100 dark:border-gray-800" : "max-h-0 opacity-0"
        )}>
            <div className="p-3">
                {renderTooltipContent()}
            </div>
        </div>
    </div>
  );
};
