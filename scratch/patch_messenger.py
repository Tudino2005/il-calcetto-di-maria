with open('src/components/JoinClient.tsx', 'r') as f:
    content = f.read()

old_link = '<Link href="https://facebook.com/profile.php?id=61594379083733" target="_blank" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-xl text-center flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)] relative z-10">'
new_link = '<a href="https://m.me/61594379083733" target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-xl text-center flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)] relative z-10">'

content = content.replace(old_link, new_link)
content = content.replace('</Link>', '</a>')

with open('src/components/JoinClient.tsx', 'w') as f:
    f.write(content)

print("Patched link")
