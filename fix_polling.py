import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

old_polling = """  // Fast polling to catch admin actions (like start draw) instantly
  useEffect(() => {
    const poll = setInterval(() => {
      router.refresh();
    }, 3000); // Check every 3 seconds
    return () => clearInterval(poll);
  }, [router]);"""

new_polling = """  // Fast polling to catch admin actions (like start draw) instantly
  useEffect(() => {
    if (drawSlideIndex !== -1) return; // Do not poll while drawing!
    
    const poll = setInterval(() => {
      router.refresh();
    }, 3000); // Check every 3 seconds
    return () => clearInterval(poll);
  }, [router, drawSlideIndex]);"""

content = content.replace(old_polling, new_polling)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)

