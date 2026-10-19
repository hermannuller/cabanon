const fs=require('fs');const path='dist/app.js';let s=fs.readFileSync(path,'utf8');
const old="if(focus.pos===0){snapshot();f.break=Math.min(2,(f.break||0)+1);save();render()}else openFile(f.id);return";
const replacement="if(focus.pos===0){snapshot();f.break=Math.min(2,(f.break||0)+1);save();render()}else if(focus.pos===f.name.length){if(!commit(f.id)){render();return}snapshot();const list=visible(),next=list[list.findIndex(x=>x.id===f.id)+1];if(next){next.break=Math.min(2,(next.break||0)+1);anchor=focus={id:next.id,pos:0}}else{f.trailingBreak=Math.min(2,(f.trailingBreak||0)+1)}save();render()}else openFile(f.id);return";
if(!s.includes(old))throw Error('Enter handler not found');s=s.replace(old,replacement);
s=s.replace("${icon(f)}</span>`}).join('')", "${icon(f)}</span>${f===list.at(-1)&&f.trailingBreak?`<span class=\"linebreak ${f.trailingBreak===2?'double':''}\"></span><span class=\"trailing-space\">&#8203;</span>`:''}`}).join('')");
s=s.replace('文件开头 Enter 分段，最多留一行空行。','文件开头或后缀末尾 Enter 分段，最多留一行空行。').replace('名字内部 Enter 或双击文件：模拟打开。','名字内部（不含首尾）Enter 或双击文件：模拟打开。');
fs.writeFileSync(path,s);
