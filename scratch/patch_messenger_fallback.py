with open('src/components/JoinClient.tsx', 'r') as f:
    content = f.read()

old_link = 'href="https://m.me/61594379083733"'
new_link = 'href="https://www.facebook.com/profile.php?id=61594379083733"'

content = content.replace(old_link, new_link)

with open('src/components/JoinClient.tsx', 'w') as f:
    f.write(content)

print("Patched link fallback")
