
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface Column {
  key: string;
  title: string;
  render?: (value: any, record: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  className?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ 
  data, 
  columns,
  className
}) => {
  const isMobile = useIsMobile();

  // Function to render cell content
  const renderCell = (record: any, column: Column) => {
    if (column.render) {
      return column.render(record[column.key], record);
    }
    return record[column.key];
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((record, index) => (
          <Card key={index} className="animate-fade-in shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y">
                {columns.map((column) => (
                  <div key={column.key} className="flex p-3">
                    <div className="w-1/3 font-medium text-muted-foreground text-sm">
                      {column.title}
                    </div>
                    <div className="w-2/3 text-sm">
                      {renderCell(record, column)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {renderCell(record, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResponsiveTable;
