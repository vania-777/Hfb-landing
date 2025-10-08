document.getElementById('y').textContent=new Date().getFullYear();
const subject=encodeURIComponent('HFB — Investor / Collaboration Access');
const body=encodeURIComponent('Hi HFB team,\n\nI’m interested in investor/collaboration access. Please share private materials and next steps.\n\n— ');
const href=`mailto:vania@highfunctioningbrains.com?subject=${subject}&body=${body}`;
['mailto','investorEmail'].forEach(id=>document.getElementById(id).setAttribute('href',href));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id.length>1){e.preventDefault();document.querySelector(id).scrollIntoView({behavior:'smooth'})}}));
