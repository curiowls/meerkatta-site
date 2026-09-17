const button=document.querySelector('[data-interest-vote]');
if(button){
  button.hidden=false;
  const status=document.querySelector('[data-interest-status]');
  let interested=false;
  const paint=()=>{button.setAttribute('aria-pressed',String(interested));button.innerHTML=`<span aria-hidden="true">${interested?'✓':'↑'}</span> ${interested?'Interested':'I’m interested'}`;button.title=interested?'Withdraw your interest vote':'Vote for visual capture';};
  const request=async(options={})=>{
    const response=await fetch('/api/interest.php',{credentials:'same-origin',...options});
    if(!response.ok||!response.headers.get('content-type')?.includes('application/json'))throw new Error('Unavailable');
    const result=await response.json();if(typeof result.interested!=='boolean')throw new Error('Invalid response');return result;
  };
  button.disabled=true;
  request().then(result=>{interested=result.interested;paint();}).catch(()=>{}).finally(()=>{button.disabled=false;});
  button.addEventListener('click',async()=>{
    button.disabled=true;status.textContent='';
    try{
      const result=await request({method:'POST',headers:{'Content-Type':'application/json','X-Meerkatta-Interest':'1'},body:JSON.stringify({feature:'visual-capture',interested:!interested})});
      interested=result.interested;paint();status.textContent=interested?'Thanks—your interest is recorded.':'Your vote has been removed.';
    }catch{status.textContent='Couldn’t record your vote. Please try again later.';}
    finally{button.disabled=false;}
  });
}
