'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  disabled?: boolean;
  autoFocusFirst?: boolean;
}

export default function PinInput({ length = 6, onComplete, disabled = false, autoFocusFirst = true }: PinInputProps) {
  const [pins, setPins] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocusFirst && !disabled) {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [autoFocusFirst, disabled]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newPins = [...pins];
    newPins[index] = value.substring(value.length - 1);
    setPins(newPins);

    const pinValue = newPins.join('');
    if (pinValue.length === length && !newPins.includes('')) {
      onComplete(pinValue);
    }

    // الانتقال للحقل التالي
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pins[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newPins = [...pins];
    for (let i = 0; i < pastedData.length; i++) {
      newPins[i] = pastedData[i];
    }
    setPins(newPins);

    if (newPins.join('').length === length && !newPins.includes('')) {
      onComplete(newPins.join(''));
    } else {
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
      {pins.map((pin, index) => (
        <input
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={pin}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          aria-label={`الرقم ${index + 1} من رمز PIN`}
          placeholder="•"
          autoComplete="off"
          className={`
            w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold
            border-2 rounded-xl transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${pin ? 'border-primary-500 bg-primary-50 text-slate-900' : 'border-gray-300 bg-white text-slate-900'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      ))}
    </div>
  );
}