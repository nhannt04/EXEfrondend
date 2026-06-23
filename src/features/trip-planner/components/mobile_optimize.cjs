const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'TripPlannerStudio.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add state isMapVisible
content = content.replace(
  /const \[swapDropdown, setSwapDropdown\] = useState\(null\);/,
  `const [swapDropdown, setSwapDropdown] = useState(null);\n  const [isMapVisible, setIsMapVisible] = useState(false);`
);

// 2. Refactor Map Layout classes
// Current Map Sidebar: <div className="w-[45%] lg:w-[40%] flex flex-col bg-white ...
content = content.replace(
  /<div className="w-\[45%\] lg:w-\[40%\] flex flex-col bg-white dark:bg-slate-950 border-r/g,
  `<div className={\`fixed inset-0 z-50 md:relative md:flex md:w-[45%] lg:w-[40%] flex-col bg-white dark:bg-slate-950 border-r \`}`
);

// 3. Add close button for Map on Mobile
content = content.replace(
  /{!apiKeyError && googleLoaded && \(/,
  `{!apiKeyError && googleLoaded && (\n            <>
              {/* Close Map Button for Mobile */}
              <button onClick={() => setIsMapVisible(false)} className="md:hidden absolute top-4 right-4 z-50 bg-white p-3 rounded-full shadow-lg text-gray-800">
                Đóng Bản Đồ
              </button>\n`
);
content = content.replace(
  /<\/GoogleMap>\n\s*\)/,
  `</GoogleMap>\n            </>\n          )`
);

// 4. Refactor Main Content Area
// Current Main Content: <div className="flex-1 flex flex-col bg-gray-50/50 ...
content = content.replace(
  /<div className="flex-1 flex flex-col bg-gray-50\/50/g,
  `<div className="flex-1 w-full md:w-[55%] lg:w-[60%] flex flex-col bg-gray-50/50`
);

// 5. Add FAB to open map on mobile
content = content.replace(
  /{swapDropdown && \(/,
  `{/* Mobile FAB to open Map */}
      <button 
        onClick={() => setIsMapVisible(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold min-h-[50px] animate-bounce"
      >
        <span>Xem Bản Đồ</span>
      </button>

      {swapDropdown && (`
);

// 6. Fix Form Grid classes for mobile
content = content.replace(/grid-cols-4/g, 'grid-cols-1 md:grid-cols-4');
content = content.replace(/grid-cols-3/g, 'grid-cols-1 md:grid-cols-3');
content = content.replace(/grid-cols-2/g, 'grid-cols-1 md:grid-cols-2');

// 7. Increase text sizes
content = content.replace(/text-\[10px\]/g, 'text-sm');
content = content.replace(/text-\[11px\]/g, 'text-sm');
content = content.replace(/text-\[10\.5px\]/g, 'text-sm');
content = content.replace(/text-\[9px\]/g, 'text-xs');
// Replace standard xs/sm/base classes with responsive sizes
content = content.replace(/text-xs /g, 'text-sm md:text-xs ');
content = content.replace(/text-sm /g, 'text-base md:text-sm ');

// 8. Increase touch targets for clickable items (min-h-[44px])
content = content.replace(/py-1\.5/g, 'py-3 md:py-1.5');
content = content.replace(/px-2\.5/g, 'px-4 md:px-2.5');
content = content.replace(/h-8/g, 'h-12 md:h-8');
content = content.replace(/w-8/g, 'w-12 md:w-8');

// Write back
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Mobile optimization applied successfully.');
