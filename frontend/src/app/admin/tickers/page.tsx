'use client';

import { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { TickerItem } from '@/types/ticker';
import {
  getTickerItems,
  addTickerItem,
  updateTickerItem,
  deleteTickerItem,
} from '@/utils/tickerStorage';

export default function AdminTickersPage() {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TickerItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    text: '',
    imageUrl: '',
    linkUrl: '',
    tag: 'إعلان',
    isActive: true,
  });

  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  // Sample GIF and image presets to make it easy for the admin
  const PRESET_GIFS = [
    { label: '🔥 نار / العروض المميزة', url: 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif' },
    { label: '🎉 احتفال / مكافآت', url: 'https://media.giphy.com/media/l2JHRhAtnJSDNJ2py/giphy.gif' },
    { label: '⚡ عاجل / خفيف', url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
    { label: '💎 ماسة / فرص استثمارية', url: 'https://cdn-icons-png.flaticon.com/512/1041/1041883.png' },
    { label: '✨ تميز / إطلاق جديد', url: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' },
  ];

  const loadTickers = () => {
    setTickers(getTickerItems());
  };

  useEffect(() => {
    loadTickers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      text: '',
      imageUrl: '',
      linkUrl: '',
      tag: 'إعلان',
      isActive: true,
    });
    setImagePreview('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TickerItem) => {
    setEditingItem(item);
    setFormData({
      text: item.text,
      imageUrl: item.imageUrl || '',
      linkUrl: item.linkUrl || '',
      tag: item.tag || 'إعلان',
      isActive: item.isActive,
    });
    setImagePreview(item.imageUrl || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      setError('يرجى إدخال نص الإعلان');
      return;
    }

    if (editingItem) {
      updateTickerItem(editingItem.id, {
        text: formData.text.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
        linkUrl: formData.linkUrl.trim() || undefined,
        tag: formData.tag.trim() || undefined,
        isActive: formData.isActive,
      });
    } else {
      addTickerItem({
        text: formData.text.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
        linkUrl: formData.linkUrl.trim() || undefined,
        tag: formData.tag.trim() || undefined,
        isActive: formData.isActive,
      });
    }

    loadTickers();
    setIsModalOpen(false);
  };

  const handleToggleActive = (item: TickerItem) => {
    updateTickerItem(item.id, { isActive: !item.isActive });
    loadTickers();
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان من الشريط؟')) {
      deleteTickerItem(id);
      loadTickers();
    }
  };

  const activeCount = tickers.filter((t) => t.isActive).length;

  return (
    <div className="space-y-6 max-w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="text-primary-600" size={28} />
            إدارة شريط الإعلانات الأخبارية (Ticker)
          </h1>
          <p className="text-gray-600 mt-1">
            إضافة وتعديل الإعلانات والصور الـ GIF المتحركة التي تظهر في الشريط المتحرك لأعلى الموقع.
          </p>
        </div>

        <Button onClick={handleOpenAddModal} size="md">
          <Plus size={18} className="ml-2" />
          إضافة إعلان جديد
        </Button>
      </div>

      {/* Live Preview Box */}
      <Card className="p-6 bg-gradient-to-r from-gray-900 via-primary-950 to-gray-900 text-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400" size={20} />
            <h2 className="font-bold text-lg text-amber-300">معاينة حية لشريط الإعلانات</h2>
          </div>
          <Badge variant="secondary" className="bg-white/10 text-white border border-white/20">
            {activeCount} إعلانات نشطة
          </Badge>
        </div>

        <div className="bg-black/40 p-3 rounded-xl border border-white/10 overflow-hidden relative">
          {activeCount === 0 ? (
            <p className="text-center text-gray-400 text-sm py-2">لا توجد إعلانات نشطة حالياً</p>
          ) : (
            <div className="flex items-center gap-8 overflow-x-auto py-1 whitespace-nowrap scrollbar-none">
              {tickers
                .filter((t) => t.isActive)
                .map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
                    {item.tag && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-400 text-gray-950">
                        {item.tag}
                      </span>
                    )}
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt="GIF preview"
                        className="h-6 w-auto object-contain rounded bg-white/10 p-0.5"
                      />
                    )}
                    <span className="text-sm font-medium text-white">{item.text}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Card>

      {/* Tickers List Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">قائمة الإعلانات المضافة ({tickers.length})</h2>
          <Button variant="outline" size="sm" onClick={loadTickers}>
            <RefreshCw size={16} className="ml-1" />
            تحديث
          </Button>
        </div>

        {tickers.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <Megaphone className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-600 font-medium">لم يتم إضافة أي إعلان في الشريط بعد</p>
            <p className="text-sm text-gray-400 mb-4">أضف إعلاناتك الأولى للظهور للزوار والمستثمرين</p>
            <Button onClick={handleOpenAddModal} size="sm">
              <Plus size={16} className="ml-2" />
              إضافة إعلان الآن
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickers.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-full overflow-hidden ${
                  item.isActive ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-70'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Image/GIF Preview */}
                  {item.imageUrl ? (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-lg border flex items-center justify-center p-1 overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center shrink-0 font-bold text-lg">
                      📣
                    </div>
                  )}

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.tag && (
                        <Badge variant="accent" size="sm">
                          {item.tag}
                        </Badge>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.isActive ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {item.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </div>

                    <p className="font-bold text-gray-900 text-sm sm:text-base break-words">{item.text}</p>

                    {item.linkUrl && (
                      <p className="text-xs text-primary-600 flex items-center gap-1 dir-ltr text-right break-all truncate max-w-full">
                        <LinkIcon size={12} className="shrink-0" />
                        <span className="truncate">{item.linkUrl}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 justify-end border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                      item.isActive
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {item.isActive ? (
                      <>
                        <XCircle size={14} /> إيقاف
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} /> تفعيل
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold border border-gray-200"
                    title="تعديل الإعلان"
                  >
                    <Edit3 size={15} />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold border border-red-200"
                    title="حذف الإعلان"
                  >
                    <Trash2 size={15} />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Megaphone size={22} className="text-primary-600" />
                {editingItem ? 'تعديل الإعلان' : 'إضافة إعلان جديد للشريط'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نص الإعلان أو الخبر <span className="text-error">*</span>
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="أدخل النص المتحرك الذي سيظهر للزوار..."
                  required
                />
              </div>

              {/* Tag / Badge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  وسم الإعلان (Badge)
                </label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="مثال: عاجل، عرض خاص، تحديث، فرصة استثمارية"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              {/* Image / GIF URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                  <span>رابط الصورة أو صورة GIF المتحركة (اختياري)</span>
                  <ImageIcon size={16} className="text-gray-400" />
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/image.gif أو .png"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-left dir-ltr"
                />

                {/* Preset Suggestions */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">نماذج جاهزة للاختيار السريع:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_GIFS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, imageUrl: preset.url });
                          setImagePreview(preset.url);
                        }}
                        className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-md transition-colors border border-gray-200"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border text-center">
                    <p className="text-xs text-gray-500 mb-2">معاينة الصورة/GIF:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-12 w-auto mx-auto object-contain rounded"
                      onError={() => setError('تعذر تحميل معاينة الصورة/GIF')}
                    />
                  </div>
                )}
              </div>

              {/* Action Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                  <span>رابط عند النقر على الإعلان (اختياري)</span>
                  <LinkIcon size={16} className="text-gray-400" />
                </label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="مثال: /investments أو https://..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-left dir-ltr"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium text-gray-800 cursor-pointer">
                  تفعيل ظهور الإعلان في الشريط فوراً
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" className="flex-1">
                  {editingItem ? 'حفظ التعديلات' : 'إضافة الإعلان'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
