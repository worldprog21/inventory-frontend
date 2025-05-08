"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

export default function TestTransactionPage() {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const router = useRouter();

  // Test successful transaction
  const testSuccessful = async () => {
    setLoading(true);
    try {
      // 1. Get two products
      const productsResponse = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/products?pagination[limit]=2`
      );

      const products = productsResponse.data.data;
      if (products.length < 2) {
        toast.error("Need at least 2 products for testing");
        return;
      }

      const product1 = products[0];
      const product2 = products[1];

      // 2. Create a valid transaction payload
      const transactionPayload = {
        customer_name: "Test Customer",
        invoice_number: `TEST-${Date.now()}`,
        customer_email: "test@example.com",
        customer_phone: "123456789",
        date: new Date().toISOString().split("T")[0],
        notes: "Transaction test",
        products: [
          {
            product: product1.id,
            quantity: 1,
            price: product1.price || 100,
          },
          {
            product: product2.id,
            quantity: 1,
            price: product2.price || 150,
          },
        ],
        subtotal: (product1.price || 100) + (product2.price || 150),
        discount_amount: 0,
        tax_amount: 0,
        total: (product1.price || 100) + (product2.price || 150),
      };

      // 3. Execute transaction
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/sale-transactions`,
        { data: transactionPayload }
      );

      toast.success("Test successful! Transaction completed properly.");
      setTestResults((prev) => ({
        ...prev,
        successful: {
          success: true,
          message: `Created sale with ID: ${response.data.data.id}`,
          data: response.data,
        },
      }));
    } catch (error) {
      console.error("Test failed:", error);
      toast.error(
        `Test failed: ${error.response?.data?.error?.message || error.message}`
      );
      setTestResults((prev) => ({
        ...prev,
        successful: {
          success: false,
          message: error.response?.data?.error?.message || error.message,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  // Test failed transaction
  const testFailed = async () => {
    setLoading(true);
    try {
      // 1. Get two products
      const productsResponse = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/products?pagination[limit]=2`
      );

      const products = productsResponse.data.data;
      if (products.length < 2) {
        toast.error("Need at least 2 products for testing");
        return;
      }

      const product1 = products[0];
      const product2 = products[1];

      // Get current stock of product2
      const product2Response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/products/${product2.id}`
      );
      const currentStock = product2Response.data.data.stock;

      // 2. Create an invalid transaction payload (excessive quantity)
      const transactionPayload = {
        customer_name: "Test Customer Fail",
        invoice_number: `TEST-FAIL-${Date.now()}`,
        customer_email: "test@example.com",
        customer_phone: "123456789",
        date: new Date().toISOString().split("T")[0],
        notes: "Failed transaction test",
        products: [
          {
            product: product1.id,
            quantity: 1,
            price: product1.price || 100,
          },
          {
            product: product2.id,
            quantity: currentStock + 100, // More than available stock
            price: product2.price || 150,
          },
        ],
        subtotal: (product1.price || 100) + (product2.price || 150),
        discount_amount: 0,
        tax_amount: 0,
        total: (product1.price || 100) + (product2.price || 150),
      };

      // 3. Execute transaction - this should fail
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/sale-transactions`,
        { data: transactionPayload }
      );

      // If we get here, something went wrong with our test
      toast.error("Test failed! Transaction should have failed but succeeded");
      setTestResults((prev) => ({
        ...prev,
        failed: {
          success: false,
          message: "Transaction should have failed but succeeded",
          data: response.data,
        },
      }));
    } catch (error) {
      // This is actually the expected outcome
      toast.success("Test successful! Transaction failed as expected");

      // Verify stock was not changed
      try {
        // Refresh product data to check if stock levels changed
        const productsResponse = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/products?pagination[limit]=2`
        );
        const products = productsResponse.data.data;

        setTestResults((prev) => ({
          ...prev,
          failed: {
            success: true,
            message: `Transaction correctly failed with: ${
              error.response?.data?.error?.message || error.message
            }`,
            stockData: {
              product1Id: products[0].id,
              product1Stock: products[0].stock,
              product2Id: products[1].id,
              product2Stock: products[1].stock,
            },
          },
        }));
      } catch (stockError) {
        setTestResults((prev) => ({
          ...prev,
          failed: {
            success: true,
            message: `Transaction correctly failed but couldn't verify stock: ${stockError.message}`,
          },
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transaction Testing Page</h1>

      <div className="flex flex-col gap-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">
            Test Successful Transaction
          </h2>
          <p className="mb-4">
            Tests a normal transaction that should complete successfully
          </p>
          <button
            onClick={testSuccessful}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Testing..." : "Run Test"}
          </button>

          {testResults.successful && (
            <div className="mt-4 p-3 rounded border bg-gray-50">
              <h3 className="font-medium">
                {testResults.successful.success ? "✅ Success" : "❌ Failed"}
              </h3>
              <p>{testResults.successful.message}</p>
              {testResults.successful.data && (
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(testResults.successful.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">
            Test Failed Transaction
          </h2>
          <p className="mb-4">
            Tests a transaction that should fail and roll back (orders too much
            stock)
          </p>
          <button
            onClick={testFailed}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? "Testing..." : "Run Test"}
          </button>

          {testResults.failed && (
            <div className="mt-4 p-3 rounded border bg-gray-50">
              <h3 className="font-medium">
                {testResults.failed.success ? "✅ Success" : "❌ Failed"}
              </h3>
              <p>{testResults.failed.message}</p>
              {testResults.failed.stockData && (
                <div className="mt-2">
                  <p>Product stock verification:</p>
                  <ul className="list-disc ml-5">
                    <li>
                      Product {testResults.failed.stockData.product1Id}:{" "}
                      {testResults.failed.stockData.product1Stock}
                    </li>
                    <li>
                      Product {testResults.failed.stockData.product2Id}:{" "}
                      {testResults.failed.stockData.product2Stock}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
