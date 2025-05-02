import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const New = ({ item = null, onSuccess, isOpen }) => {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (item) {
      form.reset({
        name: item.name || "",
        description: item.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [item, isOpen]);

  async function onSubmit(values) {
    setLoading(true);

    if (item?.id) {
      await axiosInstance.put(`/api/categories/${item.documentId}`, {
        data: values,
      });
    } else {
      await axiosInstance.post("/api/categories", { data: values });
    }

    toast.success("Category created successfully");
    if (onSuccess) onSuccess();
    setLoading(false);
  }

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{item?.id ? "Edit" : " Add"} category</SheetTitle>
      </SheetHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Category name" type="" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Category description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </SheetContent>
  );
};
