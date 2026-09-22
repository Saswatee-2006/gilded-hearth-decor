import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*, admin:profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(search.toLowerCase()) || 
    log.entity_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E0D8]">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E5E0D8]">
        <h3 className="text-xl font-display text-ink">Activity Logs</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search logs..." 
            className="pl-9 bg-[#FDFBF7]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[#FDFBF7] text-[#8C857B] border-b border-[#E5E0D8]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="border-b border-[#E5E0D8] last:border-0 hover:bg-[#FDFBF7]">
                  <td className="px-4 py-3 whitespace-nowrap text-[#6B655C]">
                    {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {log.admin?.full_name || log.admin?.email || "Unknown Admin"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-[#6B655C]">
                    {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ""}
                  </td>
                  <td className="px-4 py-3 text-[#8C857B] max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
