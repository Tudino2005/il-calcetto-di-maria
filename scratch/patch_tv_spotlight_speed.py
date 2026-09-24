import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# 1. Replace the JS timing logic
old_js = """    const startDelay = setTimeout(() => {
      if (!isMounted) return;
      setActiveMatch(toAnimate[idx]);
      setIsFading(true);
      
      interval = setInterval(() => {
        setIsFading(false);
        setTimeout(() => {
          if (!isMounted) return;
          idx++;
          if (idx >= toAnimate.length) {
            setActiveMatch(null);
            clearInterval(interval);
            return;
          }
          setActiveMatch(toAnimate[idx]);
          setIsFading(true);
        }, 500);
      }, 3500);
    }, 1500);"""

new_js = """    const startDelay = setTimeout(() => {
      if (!isMounted) return;
      setActiveMatch(toAnimate[idx]);
      setTimeout(() => setIsFading(true), 50);
      
      interval = setInterval(() => {
        setIsFading(false);
        setTimeout(() => {
          if (!isMounted) return;
          idx++;
          if (idx >= toAnimate.length) {
            setActiveMatch(null);
            clearInterval(interval);
            return;
          }
          setActiveMatch(toAnimate[idx]);
          setTimeout(() => setIsFading(true), 50);
        }, 1200); // Attendiamo che finisca l'animazione di uscita (1.2s)
      }, 5000); // Ciclo totale di 5 secondi a partita
    }, 1500);"""

content = content.replace(old_js, new_js)

# 2. Replace the CSS transition classes
old_css_bg = "transition-opacity duration-500"
new_css_bg = "transition-opacity duration-1000 ease-in-out"

old_css_card = "transition-transform duration-500"
new_css_card = "transition-transform duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]"

content = content.replace(old_css_bg, new_css_bg)
content = content.replace(old_css_card, new_css_card)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched animation speed")
