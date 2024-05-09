"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

interface TableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  showFooter?: boolean;
  selectedRowId?: string;
  onRowClick?: (row: TData, rowId: string) => void;
}

function DataTable<TData, TValue>({
  data,
  columns,
  showFooter = false,
  selectedRowId,
  onRowClick,
}: TableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className={cn("cursor-pointer", {
              "bg-blue-500 text-white hover:bg-blue-600":
                row.id === selectedRowId,
            })}
            onClick={() => {
              onRowClick?.(row.original, row.id);
            }}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className=" py-0.5">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
      {showFooter ? (
        <TableFooter>
          {table.getFooterGroups().map((footerGroup) => (
            <TableRow key={footerGroup.id} className="h-2">
              {footerGroup.headers.map((footer) => (
                <TableCell key={footer.id} className=" py-0.5">
                  {flexRender(
                    footer.column.columnDef.footer,
                    footer.getContext(),
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableFooter>
      ) : null}
    </Table>
  );
}

export { DataTable };
