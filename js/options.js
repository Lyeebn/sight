(function(doc) {  // Work with v2 and v3
  function id(a) { return a }
  function eq(b) { return function(a) { return a === b } }
  function val(obj, key) { return obj[key] }
  function set(sel, path, fn) {
    var parts = path.split('.');
    var target = parts[parts.length-1];
    var parents = parts.slice(0, -1);
    return function(a) {
      var el = doc.querySelector(sel);
      parents.reduce(val, el)[target] = fn(a);
    }
  }

  var options = {
    theme: {
      selector: '#theme',
      value: 'value',
      decode: id,
      render: set('link:last-of-type', 'href', function(value) {
        return '/css/' + value + '.css';
      })
    },
    font: {
      selector: '#font',
      value: 'value',
      decode: id,
      render: set('#code', 'style.fontFamily', id)
    },
    fontSize: {
      selector: '#font-size',
      value: 'value',
      decode: id,
      render: set('#code', 'style.fontSize', id)
    },
    lineNumbers: {
      selector: '#line-numbers',
      value: 'checked',
      decode: eq('true'),
      render: function(value) {
        var codeEl = doc.getElementById('code');
        hljs.configure({ lineNumbers: value });
        codeEl.innerHTML = codeEl.textContent;
        hljs.highlightBlock(codeEl);
      }
    }
  };
DOE = function () { // globle
    Object.keys(options).forEach(function(name) {
      var opt = options[name];
      var el = doc.querySelector(opt.selector);
      el.addEventListener('change', function(e) {
        var value = e.target[opt.value];
        localStorage.setItem(name, value);
        opt.render(value);
      });
      el[opt.value] = opt.decode(localStorage.getItem(name));
      el.dispatchEvent(new Event('change'));
    });
  }
  
DefaultSet={ theme: 'sunburst', font: 'Inconsolata', fontSize: 'medium', lineNumbers: true}
if (  chrome.storage) { // false && V2→V3  typeof localStorage == 'undefined'
  // cfge = [theme,font,document.getElementById('font-size'),document.getElementById('line-numbers')]
  chrome.storage.local.get().then(x=>{ DefaultSet={...DefaultSet, ...x};
      // theme.value=ld.theme;font.value=ld.font;document.getElementById('font-size').value=ld.fontSize;document.getElementById('line-numbers').value=ld.lineNumbers;
    }).then(x=>console.log(x))
    chrome.storage.local.set(options);
  localStorage=chrome.storage.local;
  localStorage.setItem= (k,v)=>{let kv={};kv[k]=v; chrome.storage.local.set(kv)};
  localStorage.getItem= k=> DefaultSet[k];
  setTimeout(DOE, 55);
} 
doc.addEventListener('DOMContentLoaded', DOE)  //setTimeout(DOE, 55);
}(window.document));
