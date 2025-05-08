"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { FilterX, Funnel } from "lucide-react";
import { format } from "date-fns";

export default function ColumnFilter({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  const [inputValue, setInputValue] = useState(value || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleApply = () => {
    onChange(inputValue);
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="flex items-center gap-1">
      {label}
      {value ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-1 text-primary"
          onClick={handleClear}
        >
          <FilterX className="h-4 w-4" />
        </Button>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 p-1">
              <Funnel className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52">
            {type === "date" ? (
              <Input
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) =>
                  setInputValue(format(new Date(e.target.value), "yyyy-MM-dd"))
                }
                className="mb-2"
                type="date"
              />
            ) : type === "text" ? (
              <Input
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="mb-2"
              />
            ) : null}
            <Button onClick={handleApply} size="sm" className="w-full">
              Apply
            </Button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
