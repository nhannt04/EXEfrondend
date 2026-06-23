const fs = require('fs');

const diff = fs.readFileSync('../../../../diff.txt', 'utf8');

const lines = diff.split('\n');

let currentFile = '';
let deletedLines = [];
let addedLines = [];

// To extract a chunk that was deleted and replaced by a specific added line:
// For example: <SavedItineraryList
// We look for where it was added, and grab the contiguous deleted lines right above it.

let componentsToExtract = [
  { match: '<SavedItineraryList', name: 'SavedItineraryList.jsx', dir: 'saved' },
  { match: '<TripSaveModal', name: 'TripSaveModal.jsx', dir: '' },
  { match: '<ItineraryDayViewer', name: 'ItineraryDayViewer.jsx', dir: '' },
  { match: '<TripInputPanel', name: 'TripInputPanel.jsx', dir: '' },
  { match: 'const LeafletMap = ({', name: 'LeafletMap.jsx', dir: 'map', isFunction: true }
];

for (let comp of componentsToExtract) {
    let extracted = [];
    if (comp.isFunction) {
        let inside = false;
        let braceCount = 0;
        for (let line of lines) {
            if (!inside && line.startsWith('-') && line.includes(comp.match)) {
                inside = true;
            }
            if (inside && line.startsWith('-')) {
                let codeLine = line.substring(1);
                extracted.push(codeLine);
                braceCount += (codeLine.match(/\{/g) || []).length;
                braceCount -= (codeLine.match(/\}/g) || []).length;
                if (braceCount === 0 && extracted.length > 5) {
                    break;
                }
            }
        }
    } else {
        // Find where the component was ADDED (+ <CompName)
        // And grab the block of DELETED lines (-) right above it in the same hunk
        let currentHunkDeletions = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.startsWith('@@')) {
                currentHunkDeletions = [];
            } else if (line.startsWith('-')) {
                currentHunkDeletions.push(line.substring(1));
            } else if (line.startsWith('+') && line.includes(comp.match)) {
                extracted = currentHunkDeletions;
                break; // Found it
            } else if (!line.startsWith('-') && !line.startsWith('+')) {
                // If it's a context line, should we clear deletions? 
                // Only if we haven't found the addition yet, but context lines can separate deletions and additions.
                // Actually in a diff, - and + are often grouped.
            }
        }
    }
    
    fs.mkdirSync(comp.dir || '.', { recursive: true });
    let path = (comp.dir ? comp.dir + '/' : '') + comp.name;
    
    // Wrap in a component template
    let content = `import React from 'react';\nimport { Calendar, RefreshCw, X, Check, Award, ShieldAlert } from 'lucide-react';\n\n`;
    if (!comp.isFunction) {
        content += `export default function ${comp.name.replace('.jsx', '')}(props) {\n  const { currentUser, language, t } = props; // Adjust props as needed\n  return (\n    <>\n`;
        content += extracted.join('\n');
        content += `\n    </>\n  );\n}\n`;
    } else {
        content += extracted.join('\n');
        content += `\nexport default LeafletMap;\n`;
    }
    
    fs.writeFileSync(path, content);
    console.log(`Extracted ${comp.name} with ${extracted.length} lines.`);
}
