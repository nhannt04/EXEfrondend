import re

with open('/home/michael/code/EXE/EXEfrondend/src/features/trip-planner/components/landing/CategorySection.jsx', 'r') as f:
    content = f.read()

# Make the outer card clickable and remove inner onClicks
# 1. Add onClick and cursor-pointer to the outer div:
#    className="flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden min-w-[340px] max-w-[360px] hover:border-heritage-amber/40 hover:shadow-lg transition-all duration-300"
# -> className="flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden min-w-[340px] max-w-[360px] hover:border-heritage-amber/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
#    onClick={() => setSelectedSpotDetail(spot)}
content = content.replace(
    'className="flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden min-w-[340px] max-w-[360px] hover:border-heritage-amber/40 hover:shadow-lg transition-all duration-300"',
    'className="flex flex-col bg-white border border-gray-150 rounded-2xl overflow-hidden min-w-[340px] max-w-[360px] hover:border-heritage-amber/40 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setSelectedSpotDetail(spot)}'
)

# 2. Remove cursor-pointer and onClick from the inner image div
content = content.replace(
    'className="h-56 w-full overflow-hidden relative cursor-pointer"\n                            onClick={() => setSelectedSpotDetail(spot)}',
    'className="h-56 w-full overflow-hidden relative"'
)

# 3. Remove cursor-pointer and onClick from the text content div
content = content.replace(
    'className="cursor-pointer"\n                              onClick={() => setSelectedSpotDetail(spot)}',
    'className=""'
)

# 4. Remove onClick from the button, but keep the visual button for affordance, though it's not strictly necessary to have an onClick since the parent has it, but it does no harm to keep it or remove it. Let's just keep the button's onClick as it bubbles. Or remove it to be clean.
content = content.replace(
    'onClick={() => setSelectedSpotDetail(spot)}\n                              className="bg-[#003366] hover:bg-[#002244]',
    'className="bg-[#003366] hover:bg-[#002244]'
)

with open('/home/michael/code/EXE/EXEfrondend/src/features/trip-planner/components/landing/CategorySection.jsx', 'w') as f:
    f.write(content)

print("Done UX fix")
