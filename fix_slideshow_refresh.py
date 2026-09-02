import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Add useRouter import
if 'import { useRouter }' not in content:
    content = content.replace(
        'import { useState, useEffect } from "react";',
        'import { useState, useEffect } from "react";\nimport { useRouter } from "next/navigation";'
    )

# Add router inside component
pattern_component = r'(export default function TVSlideshow\(\{ data \}: \{ data: any \}\) \{\n\s*const \{ playerStats, teamStats)'
replacement_component = """export default function TVSlideshow({ data }: { data: any }) {
  const router = useRouter();
  const { playerStats, teamStats"""
content = re.sub(pattern_component, replacement_component, content)

# Update useEffect
pattern_effect = r'(  useEffect\(\(\) => \{\n\s*// Get duration of current slide \(default 12s if not specified\)\n\s*const currentDuration = slides\[currentIndex\]\?\.duration \|\| 12000;\n\s*const timeout = setTimeout\(\(\) => \{\n\s*setCurrentIndex\(\(prev\) => \(prev \+ 1\) % slides\.length\);\n\s*setCycleCount\(\(prev\) => prev \+ 1\); // Force re-render key to restart CSS animations\n\s*\}, currentDuration\);\n\s*return \(\) => clearTimeout\(timeout\);\n\s*\}, \[currentIndex, slides\.length\]\);)'

replacement_effect = """  useEffect(() => {
    // Get duration of current slide (default 12s if not specified)
    const currentDuration = slides[currentIndex]?.duration || 12000;
    
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % slides.length;
        if (next === 0) {
          router.refresh(); // Silently fetch new database updates from the server
        }
        return next;
      });
      setCycleCount((prev) => prev + 1); // Force re-render key to restart CSS animations
    }, currentDuration);
    
    return () => clearTimeout(timeout);
  }, [currentIndex, slides.length, cycleCount, router]);"""
content = re.sub(pattern_effect, replacement_effect, content)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
