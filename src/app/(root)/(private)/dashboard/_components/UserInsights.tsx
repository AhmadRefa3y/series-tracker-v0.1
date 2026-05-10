"use client";
import React from "react";
import { Clock, Tv, Trophy, Zap, TrendingUp, Calendar, ChevronRight, CheckCircle2, Flame, BarChart } from "lucide-react";
import { UserInsights as UserInsightsType } from "../insightsData";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserInsightsProps {
  insights: UserInsightsType;
}

const UserInsights: React.FC<UserInsightsProps> = ({ insights }) => {
  const formatTime = (minutes: number) => {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    return { days, hours };
  };

  const time = formatTime(insights.totalTimeMinutes);
  const totalGenreCount = insights.genreStats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Watch Time - Now more compact but impactful */}
        <div className="md:col-span-1 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/5 p-5 flex flex-col justify-between hover:border-orange-500/30 transition-all">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Clock size={12} className="text-orange-500" /> Watch Time
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-white">{time.days}</span>
            <span className="text-xs font-bold text-gray-500 uppercase">Days</span>
            <span className="text-4xl font-black text-white">{time.hours}</span>
            <span className="text-xs font-bold text-gray-500 uppercase">Hrs</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-gray-400 uppercase">Total Episodes</span>
            <span className="text-sm font-bold text-white">{insights.totalEpisodes}</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-[#161616] border border-white/5 p-5 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Flame size={12} className="text-orange-500" /> Recent Heat
            </div>
            <div>
                <div className="text-3xl font-black text-white">{insights.last7DaysEpisodes}</div>
                <div className="text-[10px] text-gray-500 uppercase mt-1">Episodes this week</div>
            </div>
            <div className="mt-2 text-[10px] px-2 py-1 bg-orange-500/10 text-orange-500 rounded-full w-fit font-bold">
                {insights.last7DaysEpisodes > 0 ? "Trending Up" : "Quiet Week"}
            </div>
        </div>

        {/* Collection Stats */}
        <div className="rounded-2xl bg-[#161616] border border-white/5 p-5 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <BarChart size={12} className="text-blue-500" /> Library
            </div>
            <div>
                <div className="text-3xl font-black text-white">{insights.totalSeries}</div>
                <div className="text-[10px] text-gray-500 uppercase mt-1">Shows Started</div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
                <CheckCircle2 size={10} className="text-emerald-500" />
                <span>{insights.completedSeries} Finished</span>
            </div>
        </div>

        {/* Level Card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#221a2d] to-[#0d0d0d] border border-purple-500/10 p-5 flex flex-col justify-between">
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Experience</div>
            <div className="flex items-center gap-3">
                <div className="text-4xl font-black text-white italic">LVL {Math.floor(insights.totalEpisodes / 50) + 1}</div>
                <Trophy className="text-yellow-500" size={20} />
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500" 
                    style={{ width: `${(insights.totalEpisodes % 50) * 2}%` }}
                />
            </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Taste Profile - Much denser list */}
        <div className="lg:col-span-4 rounded-3xl bg-[#0d0d0d] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" /> Taste Profile
                </h3>
                <span className="text-[10px] text-gray-500">{insights.genreStats.length} Genres</span>
            </div>
            <div className="space-y-4">
                {insights.genreStats.slice(0, 7).map((genre, idx) => {
                    const percentage = Math.round((genre.count / totalGenreCount) * 100);
                    return (
                        <div key={genre.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase">
                                <span className="text-gray-400">{genre.name}</span>
                                <span className="text-white">{percentage}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-orange-500/80 rounded-full transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Most Watched Series - More items and better info */}
        <div className="lg:col-span-8 rounded-3xl bg-[#0d0d0d] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} className="text-orange-500" /> Top Series Dedication
                </h3>
                <span className="text-[10px] text-gray-500">Based on Episode Count</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {insights.mostWatchedSeries.map((series, idx) => {
                    const completion = Math.round((series.count / series.totalEpisodes) * 100);
                    return (
                        <div key={series.title} className="group relative rounded-xl bg-white/[0.02] border border-white/5 p-3 hover:bg-white/[0.04] transition-all">
                            <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-3 border border-white/5 group-hover:border-orange-500/30 transition-colors">
                                {series.poster ? (
                                    <Image 
                                        src={`https://image.tmdb.org/t/p/w185${series.poster}`} 
                                        alt={series.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-gray-600"><Tv size={24}/></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-black text-white border border-white/10 italic">
                                    #{idx + 1}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[11px] font-bold text-white truncate leading-tight">{series.title}</div>
                                <div className="flex justify-between items-center text-[9px] font-bold uppercase text-gray-500">
                                    <span>{series.count} EPS</span>
                                    <span className={cn(completion >= 100 ? "text-emerald-500" : "text-orange-500")}>
                                        {completion}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserInsights;
