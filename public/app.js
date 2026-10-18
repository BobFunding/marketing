const form = document.querySelector('form');
const checks = ['상호·주소·전화가 홈페이지와 지도에서 일치함', '영업시간과 휴무일이 일치함', '서비스와 가격을 텍스트로 확인할 수 있음', '위치·예약 안내가 공개되어 있음', '후기와 고객 질문에 대한 답변이 공개되어 있음'];
const prompts = ['{지역}에서 추천할 만한 {업종}은?', '{지역} {업종}의 서비스와 가격은?', '{지역}에서 예약 가능한 {업종}은?', '{지역} {업종} 방문 전 확인할 점은?', '{지역}에서 후기를 확인할 수 있는 {업종}은?', '{지역} {업종}의 위치와 영업시간은?'];
const key = 'local-geo-audit-v1';
const status = document.querySelector('#status');
checks.forEach((text, i) => { const label = document.createElement('label'); const input = document.createElement('input'); input.type = 'checkbox'; input.name = `check${i}`; label.append(input, text); document.querySelector('#checks').append(label); });
for (let i = 0; i < 6; i++) {
 const block = document.createElement('div'); block.className = 'question';
 for (const [name, title, multi] of [[`q${i}`, `질문 ${i + 1}`, false], [`answer${i}`, '관찰한 답변·업체 등장 여부·출처 URL', true], [`competitor${i}`, '비교 업체와 인용 근거', true]]) {
  const label = document.createElement('label'); label.textContent = title;
  const field = document.createElement(multi ? 'textarea' : 'input'); field.name = name; if (multi) field.rows = 2; label.append(field); block.append(label);
 }
 document.querySelector('#questions').append(block);
}
function defaults() { const today = new Date(); form.elements.date.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`; }
function questions() { prompts.forEach((p,i) => { const field = form.elements[`q${i}`]; if (!field.value || field.dataset.generated === field.value) { field.value = p.replaceAll('{지역}', form.elements.region.value || '우리 지역').replaceAll('{업종}', form.elements.category.value); field.dataset.generated = field.value; } }); }
defaults(); questions();
try { const data = JSON.parse(localStorage.getItem(key) || 'null'); if (data && typeof data === 'object') for (const field of form.elements) if (field.name && Object.hasOwn(data, field.name)) { if (field.type === 'checkbox') field.checked = data[field.name] === 'on'; else if (typeof data[field.name] === 'string') field.value = data[field.name]; } } catch { status.textContent = '저장 내용을 읽을 수 없습니다. 브라우저 저장소 설정을 확인하세요.'; }
for (const name of ['region', 'category']) form.elements[name].addEventListener('input', questions);
document.querySelector('#save').onclick = () => { try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(new FormData(form)))); status.textContent = '이 브라우저에 저장했습니다.'; } catch { status.textContent = '저장하지 못했습니다. 브라우저 저장 공간과 권한을 확인하세요.'; } };
document.querySelector('#clear').onclick = () => { if (!confirm('이 브라우저의 진단 기록과 입력을 삭제할까요?')) return; try { localStorage.removeItem(key); form.reset(); defaults(); for(let i=0;i<6;i++) form.elements[`q${i}`].value=''; questions(); document.querySelector('#report').hidden=true; status.textContent='삭제했습니다.'; } catch { status.textContent='저장 내용을 삭제하지 못했습니다.'; } };
function add(parent, tag, value) { const el = document.createElement(tag); el.textContent = value; parent.append(el); return el; }
form.onsubmit = event => { event.preventDefault(); const data = new FormData(form); const content = document.querySelector('#report-content'); content.replaceChildren();
 add(content,'h3',`1. ${data.get('business')} · ${data.get('region')} · ${data.get('category')}`);
 add(content,'p',`진단일: ${data.get('date')} / 서비스: ${data.get('engine')} / 조건: ${data.get('context')}`);
 add(content,'h3','2. 고객 질문과 관찰 기록');
 for(let i=0;i<6;i++) { const item=add(content,'div',''); item.className='report-question'; add(item,'h4',data.get(`q${i}`)); add(item,'pre',data.get(`answer${i}`)||'미확인 — 직접 검색 후 기록 필요'); add(item,'p',`비교 업체·근거: ${data.get(`competitor${i}`)||'미확인'}`); }
 add(content,'h3','3. 공개 정보 확인 결과'); checks.forEach((text,i)=>add(content,'p',`${data.has(`check${i}`)?'확인':'미확인'} · ${text}`));
 add(content,'h3','4. 누락 항목과 개선 우선순위'); add(content,'pre',data.get('priorities')||'우선순위 미작성');
 add(content,'h3','5. 다음 단계'); add(content,'p','기본정보 정리 → 서비스·가격·후기 페이지 보완 → FAQ 10문답 작성 → 동일 조건으로 재점검'); add(content,'p','이 보고서는 작성자의 수동 확인 기록입니다. 미확인은 문제 확정이나 점수 판정이 아니며 AI 검색 노출을 보장하지 않습니다.');
 document.querySelector('#report').hidden=false; document.querySelector('#report').scrollIntoView({behavior:'smooth'});
};
document.querySelector('#print').onclick=()=>window.print();
