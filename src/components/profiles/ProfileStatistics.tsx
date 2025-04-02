
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProfileStatistics as ProfileStats, getProfileStatistics } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, Users, MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileStatisticsProps {
  userId: string;
}

const ProfileStatistics: React.FC<ProfileStatisticsProps> = ({ userId }) => {
  const [statistics, setStatistics] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      const stats = await getProfileStatistics(userId);
      setStatistics(stats);
      setIsLoading(false);
    };

    fetchStatistics();
  }, [userId]);

  // Prepare data for chart
  const chartData = statistics ? [
    { name: 'Posts', value: statistics.postsCount },
    { name: 'Comments', value: statistics.commentsCount },
    { name: 'Connections', value: statistics.connectionsCount },
  ] : [];

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'No recent activity';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Activity Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-[200px] w-full" />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center p-4 border rounded-md">
                <ClipboardList className="h-8 w-8 mr-3 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Posts</p>
                  <p className="text-2xl font-semibold">{statistics?.postsCount || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 border rounded-md">
                <MessageSquare className="h-8 w-8 mr-3 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Comments</p>
                  <p className="text-2xl font-semibold">{statistics?.commentsCount || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 border rounded-md">
                <Users className="h-8 w-8 mr-3 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Connections</p>
                  <p className="text-2xl font-semibold">{statistics?.connectionsCount || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mb-4 p-4 border rounded-md">
              <Clock className="h-6 w-6 mr-3 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Last Active</p>
                <p className="text-lg font-medium">{formatLastActive(statistics?.lastActive)}</p>
              </div>
            </div>
            
            {(statistics?.postsCount || 0) + (statistics?.commentsCount || 0) + (statistics?.connectionsCount || 0) > 0 && (
              <div className="h-[200px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileStatistics;
