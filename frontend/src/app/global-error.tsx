'use client';

export const dynamic = 'force-dynamic';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-slate-800 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md text-center">
          <h2 className="text-xl font-bold mb-3 text-red-600">حدث خطأ غير متوقع</h2>
          <p className="text-sm text-gray-600 mb-6">
            عذراً، حدث خطأ أثناء تحميل الصفحة.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}

