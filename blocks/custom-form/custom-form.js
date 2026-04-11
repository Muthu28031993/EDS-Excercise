import { applyBlockItemStyles } from '../../scripts/aem.js';

function normalizeKey(s) { return (s || '').toString().trim().toLowerCase(); }

function buildJsonMap(json) {
  const map = new Map();
  if (!json || !Array.isArray(json.data)) return map;
  json.data.forEach((item) => {
    if (!item || !item.name) return;
    const k = normalizeKey(item.name);
    map.set(k, { placeholder: item.placeholder || '', required: normalizeKey(item.required) === 'yes', raw: item });
  });
  return map;
}

function resolveTypeFromLabel(label){
  const k=normalizeKey(label);
  const rules=[
    ['name','text'],['password','password'],['email','email'],['telephone','tel'],['phone','telephone'],
    ['url','url'],['search','search'],['number','number'],['dob','dob'],['date','dob'],['ratio','ratio'],['radio','ratio'],
    ['textarea','textarea'],['button','button'],['submit','button'],['dropdown','dropdown'],['select','dropdown']
  ];
  for(const [frag,type] of rules) if(k.includes(frag)) return type;
  const known=['text','password','email','telephone','search','number','textarea','button','dropdown','url','dob','ratio'];
  return known.includes(k)?k:null;
}

function createLabel(text,required){
  const l=document.createElement('label');
  l.className='cf-label';
  l.textContent=(text||'').trim();
  if(required){const s=document.createElement('span');s.className='cf-required';s.textContent=' *';l.appendChild(s);} 
  return l;
}

// helper: return text inside first parentheses if present
function extractParenContent(s){
  if(!s) return null;
  const m=s.toString().match(/\(([^)]+)\)/);
  return m?m[1].trim():null;
}

// helper: remove text inside parentheses
function removeParenContent(s) {
  return s ? s.replace(/\s*\([^)]*\)/g, '').trim() : '';
}

function createInput(type,placeholder,required){
  const input=document.createElement('input');
  const map={text:'text',password:'password',email:'email',telephone:'tel',search:'search',number:'number',url:'url',dob:'date'};
  input.type=map[type]||'text';
  if(placeholder) input.placeholder=placeholder;
  if(required) input.required=true;
  input.className='cf-input';
  return input;
}

function createTextarea(placeholder,required){const ta=document.createElement('textarea'); if(placeholder) ta.placeholder=placeholder; if(required) ta.required=true; ta.className='cf-textarea'; return ta;}

function createSelect(options,required){
  const s=document.createElement('select'); s.className='cf-select'; if(required) s.required=true;
  options.forEach(opt=>{const o=document.createElement('option'); o.value=o.textContent=opt.trim(); s.appendChild(o);});
  return s;
}

function createRadioGroup(name,options,required){
  const wrap=document.createElement('div'); wrap.className='cf-radio-group';
  options.forEach((opt,idx)=>{
    const id='cf-'+name+'-'+idx;
    const input=document.createElement('input'); input.type='radio'; input.name=name; input.id=id; input.value=opt.trim(); if(required) input.required=true;
    const label=document.createElement('label'); label.htmlFor=id; label.textContent=opt.trim();
    const span=document.createElement('span'); span.appendChild(input); span.appendChild(label); wrap.appendChild(span);
  });
  return wrap;
}

function createButton(text){const b=document.createElement('button'); b.type='button'; b.className='cf-button'; b.textContent=text||'Submit'; return b;}

// Main transformer (kept simple and predictable)
function transformBlock(block){
  if(!block) return;
  const link=block.querySelector('a[href$=".json"]');
  let jsonUrl=link?link.getAttribute('href'):null;
  let finalJsonUrl=null;
  if(jsonUrl){try{finalJsonUrl=(typeof window!=='undefined')?new URL(jsonUrl,window.location.href).href:jsonUrl;}catch(e){finalJsonUrl=jsonUrl;}}

  const rows=Array.from(block.children).filter(ch=>ch.tagName&&ch.tagName.toLowerCase()==='div');
  const fetchJson = finalJsonUrl ? fetch(finalJsonUrl).then(r=>r.ok?r.json():Promise.reject(new Error('Failed to load JSON'))).catch(()=>null) : Promise.resolve(null);

  fetchJson.then(json=>{
    const jsonMap=buildJsonMap(json);
    const form=document.createElement('form'); form.className='cf-form';
    // Live data object to capture input values
    const liveData = {};
    // Helper to add event listeners to input fields
    function addLiveCapture(el, name) {
      if (!el || !name) return;
      const handler = () => {
        if (el.type === 'radio') {
          if (el.checked) liveData[name] = el.value;
        } else {
          liveData[name] = el.value;
        }
      };
      el.addEventListener('input', handler);
      // For select, also listen to 'change'
      if (el.tagName === 'SELECT') el.addEventListener('change', handler);
    }

    rows.forEach(row=>{
      const cols=Array.from(row.children).filter(c=>c.tagName&&c.tagName.toLowerCase()==='div');
      if(cols.length<2) return;
      const firstP=cols[0].querySelector('p');
      const secondP=cols[1].querySelector('p');
      if(!firstP||!secondP) return;
      // Use first column text without parenthesis content for type/key matching
      const keyTextRaw = firstP.textContent || firstP.innerText || '';
      const keyTextForType = normalizeKey(removeParenContent(keyTextRaw));
      const labelText=(secondP.textContent||secondP.innerText||'').trim();
      // keep second-column value handy for use as label text
      const secondColText = labelText;

      // skip row that contains the JSON link
      if((cols[0].querySelector('a')||cols[1].querySelector('a'))&&(firstP.querySelector('a')||secondP.querySelector('a'))) return;

      // Use cleaned key for type resolution and JSON lookup
      const resolvedType=resolveTypeFromLabel(keyTextForType)||null;
      let jsonEntry=null;
      if(resolvedType) jsonEntry=jsonMap.get(resolvedType)||null;
      if(!jsonEntry&&json){ for(const [k,v]of jsonMap.entries()){ if(keyTextForType.includes(k)){ jsonEntry=v; break; }}}

      const placeholder=jsonEntry?jsonEntry.placeholder:'';
      const required=jsonEntry?jsonEntry.required:false;
      
      // Combine placeholder with first column text
      let combinedPlaceholder = placeholder ? `${placeholder} ${secondP.textContent.trim()}` : firstP.textContent.trim();

      const fieldWrapper=document.createElement('div'); fieldWrapper.className='cf-form-field';
      let inputName = null;

      if(resolvedType==='button'){
        const btn = createButton(labelText);
        btn.addEventListener('click', function() {
          // Show liveData as JSON when button is clicked
          alert('Live form data (JSON):\n' + JSON.stringify(liveData, null, 2));
          // Reset all input fields in the form
          form.reset();
          // Clear liveData object
          Object.keys(liveData).forEach(k => delete liveData[k]);
        });
        fieldWrapper.appendChild(btn);
      } else if(resolvedType==='ratio' || resolvedType==='radio'){
        const options=labelText.split(',').map(s=>s.trim()).filter(Boolean);
        // use only parenthetical text from first column as the visible label if available
        const visibleLabel = extractParenContent(firstP.textContent) || firstP.textContent.trim();
        const nameForInputs = (visibleLabel || firstP.textContent.trim()).replace(/\s+/g,'-').replace(/[^a-z0-9\-]/gi,'').toLowerCase();
        fieldWrapper.appendChild(createLabel(visibleLabel,required));
        const radioGroup = createRadioGroup(nameForInputs,options,required);
        // Add event listeners to each radio input
        Array.from(radioGroup.querySelectorAll('input[type="radio"]')).forEach(radio => {
          addLiveCapture(radio, nameForInputs);
        });
        fieldWrapper.appendChild(radioGroup);
        inputName = nameForInputs;
      } else if(resolvedType==='dropdown' || resolvedType==='select'){
        const options=labelText.split(',').map(s=>s.trim()).filter(Boolean);
        // use only parenthetical text from first column as the visible label if available
        const visibleLabel = extractParenContent(firstP.textContent) || firstP.textContent.trim();
        fieldWrapper.appendChild(createLabel(visibleLabel,required));
        const select = createSelect(options,required);
        // Use label as name
        const selectName = visibleLabel.replace(/\s+/g,'-').replace(/[^a-z0-9\-]/gi,'').toLowerCase();
        select.name = selectName;
        addLiveCapture(select, selectName);
        fieldWrapper.appendChild(select);
        inputName = selectName;
      } else if(resolvedType==='textarea'){
        fieldWrapper.appendChild(createLabel(secondColText || firstP.textContent.trim(),required));
        const ta = createTextarea(combinedPlaceholder,required);
        // Use label as name
        const taName = (secondColText || firstP.textContent.trim()).replace(/\s+/g,'-').replace(/[^a-z0-9\-]/gi,'').toLowerCase();
        ta.name = taName;
        addLiveCapture(ta, taName);
        fieldWrapper.appendChild(ta);
        inputName = taName;
      } else if(resolvedType){
        fieldWrapper.appendChild(createLabel(secondColText || firstP.textContent.trim(),required));
        const inp = createInput(resolvedType,combinedPlaceholder,required);
        // Use label as name
        const inpName = (secondColText || firstP.textContent.trim()).replace(/\s+/g,'-').replace(/[^a-z0-9\-]/gi,'').toLowerCase();
        inp.name = inpName;
        addLiveCapture(inp, inpName);
        fieldWrapper.appendChild(inp);
        inputName = inpName;
      } else {
        fieldWrapper.appendChild(createLabel(secondColText || firstP.textContent.trim(),false));
        const inp = createInput('text','',false);
        const inpName = (secondColText || firstP.textContent.trim()).replace(/\s+/g,'-').replace(/[^a-z0-9\-]/gi,'').toLowerCase();
        inp.name = inpName;
        addLiveCapture(inp, inpName);
        fieldWrapper.appendChild(inp);
        inputName = inpName;
      }

      form.appendChild(fieldWrapper);
    });

    // Add submit handler to send data to backend endpoint
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {};
      new FormData(form).forEach((value, key) => {
        data[key] = value;
      });
      try {
        const resp = await fetch('/api/submit-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (resp.ok) {
          alert('Form submitted successfully!');
        } else {
          alert('Submission failed.');
        }
      } catch (err) {
        alert('Submission error.');
      }
    });

    if(block.parentNode){ block.parentNode.insertBefore(form,block); block.parentNode.removeChild(block); }
  }).catch(err=>{ 
    // eslint-disable-next-line no-console
    console.error('custom-form error:',err); 
  });
}

// public API
if(typeof window!=='undefined') window.customFormTransform=transformBlock;
export default function decorate(block){
  if(!block && typeof document!=='undefined') {
    const container = document.querySelector('.custom-form-container');
    if(container) {
      block = container.querySelector('.custom-form.block');
    }
  }
  if(block && block.closest('.custom-form-container')) {
    transformBlock(block);
  }
}
