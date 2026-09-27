const fs = require('fs');
let code = fs.readFileSync('src/components/SlotMachineDraw.tsx', 'utf8');

if (!code.includes('const gridContainerRef = useRef<HTMLDivElement>(null);')) {
  // Insert hooks right after flipState
  code = code.replace(
    '  const [flipState, setFlipState] = useState<"none" | "out" | "in">("none");',
    \`  const [flipState, setFlipState] = useState<"none" | "out" | "in">("none");
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridScale, setGridScale] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
      if (gridContainerRef.current) {
        const container = gridContainerRef.current;
        const rect = container.getBoundingClientRect();
        // Since we are applying transform: scale, rect.top is stable if transform-origin is top
        const availableHeight = window.innerHeight - rect.top - 40; // 40px bottom padding
        
        // We temporarily remove transform to get true scrollHeight if needed, but scrollHeight is unscaled!
        const originalHeight = container.scrollHeight;
        
        if (originalHeight > availableHeight && availableHeight > 0) {
           setGridScale(availableHeight / originalHeight);
        } else {
           setGridScale(1);
        }
      }
    };
    
    handleResize();
    const t1 = setTimeout(handleResize, 50);
    const t2 = setTimeout(handleResize, 300);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", handleResize);
    };
  }, [showcaseIndex, teams]);\`
  );

  // Wrap the grid container
  code = code.replace(
    '{/* Already shown teams stacking below */}',
    \`{/* Already shown teams stacking below */}
          <div className="w-full flex justify-center flex-1 overflow-visible" ref={gridContainerRef}>
            <div 
               className="w-full flex justify-center transition-transform duration-500 ease-out origin-top"
               style={{ transform: \\\`scale(\${gridScale})\\\` }}
            >\`
  );
  
  // Close the new wrapper divs
  code = code.replace(
    '          {/* End of Slot Machine Intro */}',
    \`            </div>
          </div>
          {/* End of Slot Machine Intro */}\`
  );

  fs.writeFileSync('src/components/SlotMachineDraw.tsx', code);
}
