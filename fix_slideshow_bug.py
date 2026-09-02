import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

pattern_effect = r'(    const timeout = setTimeout\(\(\) => \{\n\s*setCurrentIndex\(\(prev\) => \{\n\s*const next = \(prev \+ 1\) % slides\.length;\n\s*if \(next === 0\) \{\n\s*router\.refresh\(\); // Silently fetch new database updates from the server\n\s*\}\n\s*return next;\n\s*\}\);\n\s*setCycleCount\(\(prev\) => prev \+ 1\); // Force re-render key to restart CSS animations\n\s*\}, currentDuration\);)'

replacement_effect = """    const timeout = setTimeout(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setCurrentIndex(nextIndex);
      setCycleCount((prev) => prev + 1); // Force re-render key to restart CSS animations
      
      if (nextIndex === 0) {
        router.refresh(); // Silently fetch new database updates from the server
      }
    }, currentDuration);"""

content = re.sub(pattern_effect, replacement_effect, content)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
