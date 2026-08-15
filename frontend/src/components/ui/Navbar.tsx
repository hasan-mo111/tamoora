'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-primary-600">
              مشروعـي
            </div>
            <span className="mr-2 text-xs text-gray-500">
              شارك بفكرتك وكن جزءاً من مستقبل الاستثمار
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <Link href="/" className="text-gray-700 hover:text-primary-600 px-3 py-2">
              الرئيسية
            </Link>
            <Link href="/investments" className="text-gray-700 hover:text-primary-600 px-3 py-2">
              الأنشطة التجارية
            </Link>
            <Link href="/terms" className="text-gray-700 hover:text-primary-600 px-3 py-2">
              الشروط والأحكام
            </Link>
            <Link 
              href="/auth/login" 
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              تسجيل الدخول
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              الرئيسية
            </Link>
            <Link href="/investments" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              الأنشطة التجارية
            </Link>
            <Link href="/terms" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
              الشروط والأحكام
            </Link>
            <Link 
              href="/auth/login" 
              className="block px-4 py-2 text-primary-600 font-bold hover:bg-gray-100"
            >
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}