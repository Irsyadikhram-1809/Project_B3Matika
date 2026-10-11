import React, { useRef, useEffect, useState } from 'react';

export default function SegmentedControl({ options, value, onChange, size = 'primary', className = '' }) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    const updateIndicator = () => {
      if (!containerRef.current) return;
      const activeEl = containerRef.current.querySelector('[aria-selected="true"]');
      if (activeEl) {
        setIndicatorStyle({
          width: `${activeEl.offsetWidth}px`,
          transform: `translateX(${activeEl.offsetLeft}px)`
        });
      }
    };

    updateIndicator();
    const timer = setTimeout(updateIndicator, 20);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [value, options]);

  const handleKeyDown = (e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + options.length) % options.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = options.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    onChange(options[nextIndex].value);
    const buttons = containerRef.current.querySelectorAll('button');
    if (buttons[nextIndex]) buttons[nextIndex].focus();
  };

  return (
    <div 
      className={`segmented-control size-${size} ${className}`} 
      role="tablist"
      ref={containerRef}
    >
      <div className="sc-indicator" style={indicatorStyle} />
      {options.map((opt, i) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="sc-button"
          >
            {opt.icon && <span className="sc-icon">{opt.icon}</span>}
            <span className="sc-label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
