(function(){
document.querySelectorAll('#ca,.ca-mirror').forEach(e=>e.textContent=CA);
document.querySelectorAll('.xlink').forEach(a=>a.href=X_LINK);
const b=document.getElementById('copy');b.onclick=()=>{const done=()=>{b.textContent='copied ✓';b.classList.add('ok');setTimeout(()=>{b.textContent='copy';b.classList.remove('ok')},1600)};
if(navigator.clipboard)navigator.clipboard.writeText(CA).then(done,fb);else fb();function fb(){const t=document.createElement('textarea');t.value=CA;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();done()}};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.sec .wrap>*').forEach(el=>{el.classList.add('rv');io.observe(el)});
})();
(function(){var b=document.getElementById('buybtn');if(!b)return;var u='https://app.uniswap.org/swap';if(/^0x[0-9a-fA-F]{40}$/.test(CA))u+='?outputCurrency='+CA;b.href=u;b.target='_blank';b.rel='noopener';})();
