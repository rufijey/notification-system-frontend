import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, ShieldAlert, Shield, Ban, RotateCcw } from 'lucide-react';
import {
  useGetReportsQuery,
  useBanChannelMutation,
  useDismissReportMutation,
  useGetBannedChannelsQuery,
  useUnbanChannelMutation
} from '@/entities/admin/api/admin.api';
import { Loader, Avatar } from '@/shared';
import { Sidebar } from '@/widgets/sidebar';
import { PageRoutes } from '@/shared/config';

import { AdminHeader } from './components/admin-header';
import { AdminStats } from './components/admin-stats';
import { ReportCard } from './components/report-card';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<'reports' | 'bans'>('reports');
  const { data: reports = [], isLoading: isReportsLoading, error: reportsError, refetch: refetchReports } = useGetReportsQuery();
  const { data: bannedChannels = [], isLoading: isBansLoading, refetch: refetchBans } = useGetBannedChannelsQuery();

  const [banChannel, { isLoading: isBanning }] = useBanChannelMutation();
  const [dismissReport, { isLoading: isDismissing }] = useDismissReportMutation();
  const [unbanChannel, { isLoading: isUnbanning }] = useUnbanChannelMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<number>(0);

  const handleSelectChannel = (id: string) => {
    navigate(`${PageRoutes.channelBase}/${id}`);
  };

  const handleViewChannel = (channelId: string) => {
    navigate(`${PageRoutes.channelBase}/${channelId}`);
  };

  const handleDismiss = async (reportId: string) => {
    try {
      await dismissReport(reportId).unwrap();
      if (selectedReportId === reportId) {
        setSelectedReportId(null);
      }
    } catch (err) {
      console.error('Failed to dismiss report:', err);
    }
  };

  const handleUnban = async (banId: string) => {
    try {
      await unbanChannel({ banId }).unwrap();
      refetchBans();
    } catch (err) {
      console.error('Failed to unban channel:', err);
    }
  };

  const filteredReports = reports.filter(r =>
    r.channelTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reporterUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBans = bannedChannels.filter(b =>
    b.channelTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBan = async (channelId: string) => {
    if (!banReason) return;
    try {
      await banChannel({
        channelId,
        reason: banReason,
        durationDays: banDuration > 0 ? banDuration : undefined
      }).unwrap();

      // Auto-dismiss related reports for this channel
      const relatedReports = reports.filter(r => r.channelId === channelId);
      for (const r of relatedReports) {
        await dismissReport(r.id).unwrap();
      }

      setSelectedReportId(null);
      setBanReason('');
      setBanDuration(0);
      refetchReports();
      refetchBans();
    } catch (err) {
      console.error('Failed to ban channel:', err);
    }
  };

  const isLoading = currentTab === 'reports' ? isReportsLoading : isBansLoading;
  const error = currentTab === 'reports' ? reportsError : null;

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden w-full selection:bg-rose-500/30">
      <Sidebar
        selectedChannelId={null}
        onSelectChannel={handleSelectChannel}
        className="flex"
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-48 bg-rose-500/[0.03] blur-[100px] pointer-events-none" />

        <div className="px-8 pt-8 shrink-0 z-10">
          <AdminHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-8 z-10 scrollbar-hide">
          <div className="max-w-5xl mx-auto space-y-6 pb-20">

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <AdminStats
                totalReports={reports.length}
                bannedCount={bannedChannels.length}
                currentTab={currentTab}
                onTabChange={setCurrentTab}
              />
            </div>

            <div className="bg-neutral-900/10 border border-neutral-800/40 rounded-[32px] overflow-hidden backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
              <div className="px-6 py-4 border-b border-neutral-800/40 flex items-center justify-between bg-neutral-900/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${currentTab === 'reports' ? 'bg-rose-500/10 text-rose-500' : 'bg-neutral-500/10 text-neutral-500'}`}>
                    {currentTab === 'reports' ? <Shield size={18} /> : <Ban size={18} />}
                  </div>
                  <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                    {currentTab === 'reports' ? 'Safety Queue' : 'Restricted Sector'}
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-neutral-900/50">
                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center gap-4">
                    <Loader size="lg" />
                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-black">Synchronizing...</p>
                  </div>
                ) : error ? (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-rose-500/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500/50 border border-rose-500/10">
                      <ShieldAlert size={28} />
                    </div>
                    <h3 className="text-white font-black text-lg tracking-tight">Access Denied</h3>
                    <p className="text-neutral-600 max-w-xs mx-auto mt-2 text-xs font-medium">
                      {(error as any)?.status === 403
                        ? "Global Administrator permissions required."
                        : "Server connection failure."}
                    </p>
                    <button
                      onClick={() => refetchReports()}
                      className="mt-6 px-8 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Retry
                    </button>
                  </div>
                ) : (currentTab === 'reports' ? filteredReports : filteredBans).length === 0 ? (
                  <div className="p-24 text-center group">
                    <div className="w-16 h-16 bg-neutral-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-700 border border-neutral-800/50 group-hover:scale-110 transition-transform duration-500">
                      <Flag size={28} />
                    </div>
                    <h3 className="text-neutral-400 font-bold text-sm tracking-tight">Status: Clear</h3>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest mt-2 font-black">Nothing to show</p>
                  </div>
                ) : currentTab === 'reports' ? (
                  filteredReports.map((report, index) => (
                    <div key={report.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 30}ms` }}>
                      <ReportCard
                        report={report}
                        isSelected={selectedReportId === report.id}
                        onSelect={() => setSelectedReportId(selectedReportId === report.id ? null : report.id)}
                        banReason={banReason}
                        setBanReason={setBanReason}
                        banDuration={banDuration}
                        setBanDuration={setBanDuration}
                        onBan={handleBan}
                        isBanning={isBanning}
                        onDismiss={() => handleDismiss(report.id)}
                        isDismissing={isDismissing}
                        onView={() => handleViewChannel(report.channelId)}
                      />
                    </div>
                  ))
                ) : (
                  filteredBans.map((ban, index) => (
                    <div key={ban.id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 30}ms` }}>
                      <div className="flex items-center gap-4">
                        <Avatar name={ban.channelTitle} size="md" className="rounded-xl border border-neutral-800" />
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">{ban.channelTitle}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] text-neutral-500 font-medium italic">Reason: {ban.reason}</p>
                            <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                              {ban.expiresAt ? `Until ${new Date(ban.expiresAt).toLocaleDateString()}` : 'Permanent'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnban(ban.id)}
                        disabled={isUnbanning}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw size={14} />
                        {isUnbanning ? 'Restoring...' : 'Unban'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
