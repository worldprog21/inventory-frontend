"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { Skeleton } from "./ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
    </div>
  );
}

export function SectionCards() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/sales/summary/");

      setData({
        ...res.data.data,
        twoWeeks: res.data.data["two-weeks"],
        lastMonth: res.data.data["last-month"],
      });
    } catch (error) {
      console.log("Failed to fetch categories", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {loading ? (
        [...Array(4)].map((_, idx) => <LoadingSkeleton key={idx} />)
      ) : (
        <>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Current Week Revenue</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                ${Number(data?.week?.totalRevenue).toFixed(2)}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp />
                  {data?.week?.count}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Sales {Number(data?.week?.totalSales).toFixed(2) ?? 0}
              </div>
              <div className="text-muted-foreground">
                Total Discount{" "}
                {Number(data?.week?.totalDiscount).toFixed(2) ?? 0}
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Last 15 Days Revenue</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                ${Number(data?.twoWeeks?.totalRevenue).toFixed(2) ?? 0}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp /> {Number(data?.twoWeeks?.count) ?? 0}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Sales {Number(data?.twoWeeks?.totalSales).toFixed(2) ?? 0}
              </div>
              <div className="text-muted-foreground">
                Total Discount{" "}
                {Number(data?.twoWeeks?.totalDiscount).toFixed(2) ?? 0}
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Current Month Revenue</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                ${Number(data?.month?.totalRevenue).toFixed(2) ?? 0}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp /> {Number(data?.month?.count) ?? 0}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Sales {Number(data?.month?.totalSales).toFixed(2) ?? 0}
              </div>
              <div className="text-muted-foreground">
                Total Discount{" "}
                {Number(data?.month?.totalDiscount).toFixed(2) ?? 0}
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Last Month Revenue</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                ${Number(data?.lastMonth?.totalRevenue).toFixed(2) ?? 0}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp /> {Number(data?.lastMonth?.count) ?? 0}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total Sales{" "}
                {Number(data?.lastMonth?.totalSales).toFixed(2) ?? 0}
              </div>
              <div className="text-muted-foreground">
                Total Discount{" "}
                {Number(data?.lastMonth?.totalDiscount).toFixed(2) ?? 0}
              </div>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
