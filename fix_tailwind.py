import re

with open("tailwind.config.ts", "r") as f:
    content = f.read()

# Check if animate-slot-spin is there
if "slot-spin" not in content:
    content = content.replace(
        "keyframes: {",
        """keyframes: {
        'slot-spin': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },"""
    )
    content = content.replace(
        "animation: {",
        """animation: {
        'slot-spin': 'slot-spin 0.15s linear infinite',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.26, 1.55) forwards',"""
    )

with open("tailwind.config.ts", "w") as f:
    f.write(content)
