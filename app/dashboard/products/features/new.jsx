"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().gt(0, "Price is required"),
  stock: z.coerce.number().gt(0, "Stock is required"),
  barcode: z.string().min(1, "Barcode is required"),
  category: z.string().min(1, "Category is required"),
});

export const New = ({ item = null, onSuccess, isOpen }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageId, setImageId] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      barcode: "",
      category: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (item) {
      form.reset({
        name: item.name || "",
        description: item.description || "",
        price: item.price || 0,
        stock: item.stock || 0,
        barcode: item.barcode || "",
        category: item.category?.documentId || "",
      });

      if (item.image) {
        setImagePreview(item.image.url);
        setImageId(item.image.id);
      } else {
        setImagePreview(null);
        setImageId(null);
      }
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        barcode: "",
        category: "",
      });

      setImagePreview(null);
      setImageId(null);
    }
  }, [item, isOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await axiosInstance.get("/api/categories");
        setCategories(res.data.data);
      } catch (error) {
        toast.error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (isOpen) fetchCategories();
  }, [isOpen]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("files", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await axiosInstance.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },

        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      const uploadedImage = res.data[0];
      setImagePreview(uploadedImage.url);
      setImageId(uploadedImage.id);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Image upload failed");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  async function onSubmit(values) {
    setLoading(true);
    try {
      if (item?.id) {
        await axiosInstance.put(`/api/products/${item.documentId}`, {
          data: {
            ...values,
            category: values.category,
            image: imageId,
          },
        });
        toast.success("Product updated successfully");
      } else {
        await axiosInstance.post("/api/products", {
          data: {
            ...values,
            category: values.category,
            image: imageId,
          },
        });
        toast.success("Product created successfully");
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{item?.id ? "Edit" : "Add"} product</SheetTitle>
      </SheetHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 px-6 overflow-y-scroll pb-10"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  {categoriesLoading ? (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="animate-spin w-4 h-4" />
                      <span>Loading categories...</span>
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.documentId}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Product price"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Product stock" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input placeholder="Product barcode" {...field} />
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
                    placeholder="Product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Image</FormLabel>
            {imagePreview && (
              <div className="relative w-full max-w-xs">
                <Image
                  src={process.env.NEXT_PUBLIC_STRAPI_URL + imagePreview}
                  alt="Product Preview"
                  width={500}
                  height={500}
                  className="object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageId(null);
                  }}
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white p-1 rounded-full"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-primary hover:underline">
                <UploadCloud className="w-4 h-4" />
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading... {uploadProgress}%
              </div>
            )}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </SheetContent>
  );
};
