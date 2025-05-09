"use client";

import ColumnFilter from "@/components/ColumnFilter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";

export const getColumns = (filters, handleFilterChange, onDelete) => [
  {
    accessorKey: "invoice_number",
    header: () => (
      <ColumnFilter
        label="Invoice number"
        placeholder="Filter invoice number..."
        value={filters.invoice_number || ""}
        onChange={(val) => handleFilterChange("invoice_number", val)}
      />
    ),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "customer_name",
    header: () => (
      <ColumnFilter
        label="Customer name"
        placeholder="Filter customer name..."
        value={filters.customer_name || ""}
        onChange={(val) => handleFilterChange("customer_name", val)}
      />
    ),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "customer_phone",
    header: () => (
      <ColumnFilter
        label="Customer phone"
        placeholder="Filter customer phone..."
        value={filters.customer_phone || ""}
        onChange={(val) => handleFilterChange("customer_phone", val)}
      />
    ),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "customer_email",
    header: () => (
      <ColumnFilter
        label="Customer email"
        placeholder="Filter customer email..."
        value={filters.customer_email || ""}
        onChange={(val) => handleFilterChange("customer_email", val)}
      />
    ),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "date",
    header: () => (
      <ColumnFilter
        label="Date"
        placeholder="Filter date..."
        value={filters.date || ""}
        onChange={(val) => handleFilterChange("date", val)}
        type="date"
      />
    ),
    cell: (info) => {
      const date = info.getValue();

      return date ? format(new Date(date), "yyyy-MM-dd hh:mm a") : "N/A";
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: (info) => {
      const total = info.getValue();

      return total ? `$${total.toFixed(2)}` : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <Link href={`/dashboard/sales/invoice/${row.original.documentId}`}>
            <DropdownMenuItem>View invoice</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              onDelete(row.original);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
