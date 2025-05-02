"use client";

import { getColumns } from "./features/columns";
import { DataTable } from "./features/data-table";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { New } from "./features/new";
import { toast } from "sonner";

const Page = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ name: "", description: "" });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const buildQuery = () => {
    const query = new URLSearchParams();
    query.set("pagination[page]", page);
    query.set("pagination[pageSize]", pageSize);

    if (filters.name) {
      query.set("filters[name][$containsi]", filters.name);
    }

    if (filters.description) {
      query.set("filters[description][$containsi]", filters.description);
    }

    return query.toString();
  };

  const fetchData = () => {
    setLoading(true);
    axiosInstance
      .get(`/api/categories?${buildQuery()}`)
      .then((response) => {
        const apiData = response.data.data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          documentId: item.documentId,
        }));
        setCategories(apiData);
        setMeta(response.data.meta.pagination);
      })
      .catch((error) => {
        console.log("Failed to fetch categories:", error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, filters]);

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value));
    setPage(1);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      await axiosInstance.delete(`/api/categories/${item.documentId}`);
      await fetchData();
      toast.success("Category deleted successfully");
    } catch (error) {
      console.log("Delete failed: ", error);
      toast.error("Failed to delete category");
    }
  };

  const columns = getColumns(
    filters,
    handleFilterChange,
    (item) => {
      setSelectedItem(item);
      setSheetOpen(true);
    },
    handleDelete
  );

  return (
    <div className="py-4 md:py-6 px-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            <span>List of categories</span>
          </CardDescription>

          <CardAction>
            <Button
              onClick={() => {
                setSelectedItem(null);
                setSheetOpen(true);
              }}
            >
              Add a new record
            </Button>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <New
                item={selectedItem}
                isOpen={sheetOpen}
                onSuccess={() => {
                  setSheetOpen(false);
                  fetchData();
                }}
              />
            </Sheet>
          </CardAction>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <DataTable columns={columns} data={categories} />
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center mt-4 text-sm text-muted-foreground">
            {meta && (
              <>
                {categories.length === 0
                  ? "No rows"
                  : `Showing ${(meta.page - 1) * meta.pageSize + 1} to ${
                      (meta.page - 1) * meta.pageSize + categories.length
                    } of ${meta.total} rows`}
              </>
            )}

            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>Rows per page</span>
            </div>

            <span className="whitespace-nowrap">
              Page {meta?.page} of {meta?.pageCount}
            </span>

            {/* pagination buttons */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                «
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                ‹
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, meta?.pageCount || 1))
                }
                disabled={page === meta?.pageCount}
              >
                ›
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(meta?.pageCount)}
                disabled={page === meta?.pageCount}
              >
                »
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
