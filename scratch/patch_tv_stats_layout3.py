import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# 1st place defenders patch
old_1st_def = """                                  <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Tot Subiti</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{tSubiti}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{mSubiti}</span>
                                    </div>
                                  </div>"""
new_1st_def = """                                  <div className="flex items-center gap-6 shrink-0 ml-8">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-[13px] text-blue-400 font-bold tracking-widest uppercase">Tot Subiti</span>
                                      <span className="text-3xl font-black text-white leading-none">{tSubiti}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-[13px] text-blue-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-3xl font-black text-white leading-none">{mSubiti}</span>
                                    </div>
                                  </div>"""
if old_1st_def in content:
    content = content.replace(old_1st_def, new_1st_def)

# 1st place strikers patch
old_1st_strk = """                                  <div className="flex items-center gap-2 shrink-0 ml-4">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Tot Fatti</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{tFatti}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-lg font-black text-white leading-none mt-1">{mFatti}</span>
                                    </div>
                                  </div>"""
new_1st_strk = """                                  <div className="flex items-center gap-6 shrink-0 ml-8">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-[13px] text-red-400 font-bold tracking-widest uppercase">Tot Fatti</span>
                                      <span className="text-3xl font-black text-white leading-none">{tFatti}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-[13px] text-red-400 font-bold tracking-widest uppercase">Media</span>
                                      <span className="text-3xl font-black text-white leading-none">{mFatti}</span>
                                    </div>
                                  </div>"""
if old_1st_strk in content:
    content = content.replace(old_1st_strk, new_1st_strk)


with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

