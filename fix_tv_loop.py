import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Add cycleCount state and fix useEffect
pattern_effect = r'(  const \[currentIndex, setCurrentIndex\] = useState\(0\);\s*useEffect\(\(\) => \{\n\s*if \(slides\.length <= 1\) return;\n\s*// Get duration of current slide \(default 12s if not specified\)\n\s*const currentDuration = slides\[currentIndex\]\?\.duration \|\| 12000;\n\s*const timeout = setTimeout\(\(\) => \{\n\s*setCurrentIndex\(\(prev\) => \(prev \+ 1\) % slides\.length\);\n\s*\}, currentDuration\);\n\s*return \(\) => clearTimeout\(timeout\);\n\s*\}, \[currentIndex, slides\]\);)'

replacement_effect = """  const [currentIndex, setCurrentIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    // Get duration of current slide (default 12s if not specified)
    const currentDuration = slides[currentIndex]?.duration || 12000;
    
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setCycleCount((prev) => prev + 1); // Force re-render key to restart CSS animations
    }, currentDuration);
    
    return () => clearTimeout(timeout);
  }, [currentIndex, slides.length]);"""

content = re.sub(pattern_effect, replacement_effect, content)

# Wrap the main content with a key
pattern_render = r'(      <div className="flex-1 flex items-center justify-center pt-24 pb-8 px-12 relative z-10 w-full h-full">\n\s*<div className="w-full max-w-7xl animate-fade-in-up">)'
replacement_render = """      <div key={cycleCount} className="flex-1 flex items-center justify-center pt-24 pb-8 px-12 relative z-10 w-full h-full">
        <div className="w-full max-w-7xl animate-fade-in-up">"""

content = re.sub(pattern_render, replacement_render, content)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
