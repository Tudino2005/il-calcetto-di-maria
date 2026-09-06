import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Replace useState(0) with smart init and jump effect
old_state = "const [currentIndex, setCurrentIndex] = useState(0);"
new_state = """
  const drawSlideIndex = slides.findIndex(s => s.type === "slot_machine");
  const [currentIndex, setCurrentIndex] = useState(drawSlideIndex !== -1 ? drawSlideIndex : 0);

  // Jump to slot machine immediately if it appears
  useEffect(() => {
    if (drawSlideIndex !== -1 && currentIndex !== drawSlideIndex) {
      setCurrentIndex(drawSlideIndex);
    }
  }, [drawSlideIndex]);

  // Fast polling to catch admin actions (like start draw) instantly
  useEffect(() => {
    const poll = setInterval(() => {
      router.refresh();
    }, 3000); // Check every 3 seconds
    return () => clearInterval(poll);
  }, [router]);
"""
content = content.replace(old_state, new_state)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
