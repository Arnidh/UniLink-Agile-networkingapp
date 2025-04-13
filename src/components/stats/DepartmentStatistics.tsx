
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDepartmentStatistics } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface StatRecord {
  name: string;
  value: number;
}

interface DepartmentStatisticsProps {
  className?: string;
}

const PAGE_SIZE = 4;

const DepartmentStatistics: React.FC<DepartmentStatisticsProps> = ({ className }) => {
  const [statistics, setStatistics] = useState<StatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      const stats = await getDepartmentStatistics();
      setStatistics(stats);
      setTotalRecords(stats.length);
      setIsLoading(false);
    };

    fetchStatistics();
  }, []);

  const paginatedStats = statistics.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-md">Department Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStats.map((stat) => (
                  <TableRow key={stat.name}>
                    <TableCell>{stat.name}</TableCell>
                    <TableCell className="text-right">{stat.value}</TableCell>
                  </TableRow>
                ))}
                {paginatedStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                      No department data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {totalRecords > PAGE_SIZE && (
              <div className="flex justify-between items-center mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentStatistics;
