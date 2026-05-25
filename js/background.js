// V3 Deving 
chrome.storage.local.get().then(x=>{
  Setting=x;//{ theme: 'sunburst', font: 'Inconsolata', fontSize: 'medium', lineNumbers: true, ...x};
  localStorage=chrome.storage.local;
  localStorage.setItem= (k,v)=>{let kv={};kv[k]=v; chrome.storage.local.set(kv)};
  localStorage.getItem= k=> Setting[k];
}) .then(function() {
  const LANG_EXT_MAP = {
    actionscript:['actionscript', 'as'],
    apache:      ['httpd', 'conf', 'htaccess'],
    asciidoc:    ['asciidoc'],
    applescript: ['applescript'],
    aspectj:     ['aspectj', 'aj'],
    avrasm:      ['asm', 's'],
    bash:        ['sh', 'bash', 'zsh', 'shell'],
    brainfuck:   ['bf'],
    clojure:     ['clj'],
    coffeescript:['coffee'],
    cpp:         ['c', 'h', 'cc', 'cpp', 'cxx', 'c++', 'hpp', 'hxx', 'h++'],
    cs:          ['cs'],
    css:         ['css'],
    d:           ['d', 'dd', 'di'],
    dart:        ['dart'],
    delphi:      ['pas'],
    desktop:     ['desktop'],
    diff:        ['diff', 'patch'],
    dockerfile:  ['dockerfile'],
    dos:         ['bat', 'cmd'],
    elixir:      ['ex', 'exs'],
    erlang:      ['erl', 'erlang'],
    fortran:     ['f', 'for', 'f90', 'f95'],
    fsharp:      ['fs'],
    gherkin:     ['feature'],
    go:          ['go'],
    gradle:      ['gradle'],
    groovy:      ['groovy', 'gvy', 'gy', 'gsh'],
    haml:        ['haml'],
    handlebars:  ['hbs', 'handlebars'],
    haskell:     ['hs'],
    haxe:        ['hx', 'hxml'],
    http:        ['http'],
    ini:         ['ini'],
    java:        ['java', 'class', 'fx'],
    javascript:  ['js'],
    json:        ['json'],
    julia:       ['jl'],
    kotlin:      ['kt', 'kts'],
    less:        ['less'],
    lisp:        ['lsp', 'lisp', 'cl', 'el', 'scm'],
    livescript:  ['ls'],
    lua:         ['lua'],
    makefile:    ['Makefile'],
    markdown:    ['md', 'markdown'],
    nginx:       ['nginx'],
    objectivec:  ['m', 'mm'],
    ocaml:       ['ml'],
    perl:        ['pl', 'pm', 'perl'],
    php:         ['php', 'phtml', 'phps'],
    pig:         ['pig'],
    powershell:  ['ps1', 'psm1'],
    python:      ['py', 'pyc'],
    r:           ['r'],
    ruby:        ['rakefile', 'gemfile', 'rb'],
    scala:       ['scala', 'scl', 'sca', 'scb'],
    scss:        ['scss', 'sass'],
    smalltalk:   ['st', 'sm', 'sll'],
    sml:         ['sml'],
    sql:         ['sql'],
    stylus:      ['styl'],
    swift:       ['swift'],
    tex:         ['tex','cls','def','sty','dtx','cfg'],
    typescript:  ['ts'],
    vala:        ['vala', 'vapi'],
    vbnet:       ['vb'],
    vbscript:    ['vbs'],
    vhdl:        ['vhd', 'vhdl'],
    xml:         ['atom', 'rss', 'vsproj', 'csproj', 'build', 'wsdl', 'config', 'xsd', 'plist', 'xib'],
    yaml:        ['yaml']
  };

  const BROWSER_CONTENT = ['htm', 'html', 'xml', 'xhtml', 'shtml'];

  const OPTIONS_DEFAULTS = {
    theme: 'sunburst',
    font: 'Inconsolata',
    fontSize: 'medium',
    lineNumbers: true
  };

  const OPTIONS = Object.keys(OPTIONS_DEFAULTS);

  OPTIONS.forEach(function(option) {
    var value = localStorage.getItem(option) || OPTIONS_DEFAULTS[option];
    localStorage.setItem(option, value);
  });
  // Reverse index
  const EXT_LANG_MAP = {};
  for (var lang in LANG_EXT_MAP) {
    LANG_EXT_MAP[lang].forEach(function(ext) {
      EXT_LANG_MAP[ext] = lang;
    });
  }

  function getHeaderByName(headers, name) {
    var index, length = headers.length;
    for (index = 0; index < length; index++) {
      if (headers[index].name.toLowerCase() === name) {
        return headers[index].value;
      }
    }
    return null;
  }

  function getContentTypeFromHeaders(headers) {
    var contentType = getHeaderByName(headers, 'content-type');
    if (!contentType) { return null; }
    return contentType.split(';').shift().split('/').pop().trim();
  }

  function getFilenameFromUrl(url) {
    return url.split('/').pop().split('?').shift().toLowerCase();
  }

  function getExtensionFromFilename(filename) {
    return filename.split('.').pop();
  }

  function getFragmentFromUrl(url) {
    var fragment = /#ft=(\w+)/.exec(url);
    return fragment && fragment[1];
  }

  function detectLanguage(contentType, fragment, filename, extension) {
    if (BROWSER_CONTENT.indexOf(contentType) != -1) {
      return null;
    }
    return !!LANG_EXT_MAP[fragment] ?  fragment : EXT_LANG_MAP[contentType] ||
                                                  EXT_LANG_MAP[extension]   ||
                                                  EXT_LANG_MAP[filename];
  }

  function getHighlightingCode(font, fontSize, lineNumbers, language) {
    return `
      var container = document.querySelector("pre");
      if ((container.innerHTML.length > 8<<13) && confirm("prompt: 太长，是否停止高亮")) throw '太长，不管';
      document.body.style.fontFamily = "${font}";
      document.body.style.fontSize = "${fontSize}";
      container.classList.add("${language}"); // alert(666)
      hljs.configure({ lineNumbers: ${lineNumbers}}); 
      hljs.highlightBlock(container);
      document.body.style.backgroundColor = getComputedStyle(container).backgroundColor;`
  }

  JS_BEUTIFY_CODE =`
    var container = document.querySelector("pre");
    var options = { indent_size: 2 };
    container.textContent = js_beautify(container.textContent, options);`

  chrome.webRequest.onCompleted.addListener(function(details) {
    var contentType = getContentTypeFromHeaders(details.responseHeaders);
    var fragment = getFragmentFromUrl(details.url);
    var filename = getFilenameFromUrl(details.url);
    var extension = getExtensionFromFilename(filename);
    var language = detectLanguage(contentType, fragment, filename, extension);
    if (!language) {
      return;
    }

    var styles  = [
      { file: 'css/reset.css' },
      { file: 'css/main.css' },
      { file: 'css/' + localStorage.getItem('theme') + '.css' }
    ]; // or  css/sunburst.css

    var scripts = [
      { file: 'js/lib/highlight.js' },
      { file: 'js/languages/' + language + '.js' }
    ];

    if (/json/.test(language)) {
      scripts.push(
        { file: 'js/lib/beautify.js' },
        { code: JS_BEUTIFY_CODE }
      );
    }

    // scripts.push({
    //   code: '1/0;document.writeln(66);console.log(66);alert(66)'  //&& getHighlightingCode()
    //     // getHighlightingCode.apply(this, ['font', 'fontSize', 'lineNumbers'].map(localStorage.getItem.bind(localStorage)).concat(language))
    // });
g=styles[0]
    for (var i = 0; i < styles.length; i++) {
      console.log('details.tabId',details.tabId,chrome.tabs,chrome.scripting.insertCSS, styles[i])
      chrome.scripting.insertCSS({
        target: { tabId: details.tabId },          
        files: [styles[i].file] //styles[i],//只能二选一 css:  "body { font-size: 38px; }", 
        });
      // v2: chrome.tabs.insertCSS(details.tabId, styles[i]); // 
    }
    // console.log(JS_BEUTIFY_CODE, Function) // setTimeout('' + getHighlightingCode('Inconsolata', 'medium', true, 'javascript')
    k=`;alert(document.body.innerText)`
  chrome.scripting.executeScript({
          target: { tabId: details.tabId },
// 坑 以前通过 code: 传入动态代码，现在两个方式 文件file:、func 但不能用 Function('code') 构造，setTimeout 也不行，只能传字面量
          func: x=>setTimeout(x,300), // x=>document.designMode="on"; JS_BEUTIFY_CODE
          args:[getHighlightingCode(
            localStorage.getItem('font'), //'Inconsolata'
            localStorage.getItem('fontSize'), //'medium'
            localStorage.getItem('lineNumbers'), //true
            language)]  // world: "MAIN" 
  }).then(x=>console.log(x, '注入')); // 神经，要这样传参的 https://jishuzhan.net/article/1904550919025537025
    for (i in scripts)  {
      // chrome.tabs.executeScript(details.tabId, scripts[i], chain.bind(null, i+1));
      console.log(scripts[i],scripts)
      chrome.scripting.executeScript({
          target: { tabId: details.tabId },
          files: [scripts[i].file] })
    }
  }, { urls: ['<all_urls>'], types: ['main_frame'] }, ['responseHeaders']);
});
// 这是背景页，隔离上下文的，要注入到目标页才能 setTimeout(_=>document.designMode="on", 1500)
