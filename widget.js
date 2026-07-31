/* =====================================================================
   クラス診断ウィジェット（HPの全ページ右下に吹き出しで出す）
   HP側にはこの1行を入れてもらうだけ：
     <script src="https://＜配信先＞/widget.js" defer></script>
   以後、質問もクラスも見た目も、この配信先を更新するだけで反映される。
   （HPのテーマ・固定ページは二度と触らない ＝ 作り直しが起きない）
   ===================================================================== */
(function () {
  var BASE = document.currentScript
    ? document.currentScript.src.replace(/widget\.js.*$/, '')
    : '';
  var PANEL_SRC = BASE + 'index.html';

  var ACCENT = '#e8467c';
  // スマホはHP下部の固定バー（体験申し込み/お問い合わせ）を避けて上に出す
  var CSS = `
  #mkfinder-btn{position:fixed;right:16px;bottom:88px;z-index:99998;display:flex;align-items:center;gap:8px;
    background:${ACCENT};color:#fff;border:0;border-radius:999px;padding:12px 18px 12px 15px;cursor:pointer;
    font:700 14px/1.2 "Hiragino Sans","Noto Sans JP",sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.22);
    animation:mkpop .4s ease both}
  #mkfinder-btn:hover{filter:brightness(1.06)}
  #mkfinder-btn .ico{font-size:17px}
  #mkfinder-btn .cls{display:none}
  #mkfinder-btn.open .lbl,#mkfinder-btn.open .ico{display:none}
  #mkfinder-btn.open .cls{display:inline}
  #mkfinder-bubble{position:fixed;right:16px;bottom:150px;z-index:99997;max-width:230px;background:#fff;color:#333;
    border-radius:14px;padding:11px 14px;font:13px/1.6 "Hiragino Sans","Noto Sans JP",sans-serif;
    box-shadow:0 6px 20px rgba(0,0,0,.16);animation:mkpop .5s .8s ease both}
  #mkfinder-bubble::after{content:"";position:absolute;right:26px;bottom:-7px;border:7px solid transparent;
    border-top-color:#fff;border-bottom:0}
  #mkfinder-bubble b{color:${ACCENT}}
  #mkfinder-bubble .x{position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;background:#888;
    color:#fff;border:0;font-size:12px;line-height:22px;cursor:pointer;padding:0}
  #mkfinder-panel{position:fixed;right:16px;bottom:150px;z-index:99998;width:380px;height:min(620px,calc(100vh - 190px));
    background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 44px rgba(0,0,0,.26);display:none;
    animation:mkslide .28s ease both}
  #mkfinder-panel.open{display:block}
  #mkfinder-panel iframe{width:100%;height:100%;border:0;display:block}
  @keyframes mkpop{from{opacity:0;transform:scale(.85) translateY(8px)}to{opacity:1;transform:none}}
  @keyframes mkslide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
  @media (max-width:600px){
    #mkfinder-panel{right:8px;left:8px;width:auto;bottom:140px;height:calc(100vh - 175px)}
    #mkfinder-bubble{bottom:148px;max-width:200px}
  }
  @media (min-width:768px){ /* PCはHPの固定バーが無いので下げてよい */
    #mkfinder-btn{bottom:24px}
    #mkfinder-bubble{bottom:86px}
    #mkfinder-panel{bottom:86px;height:min(620px,calc(100vh - 200px))}
  }`;

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function init() {
    if (document.getElementById('mkfinder-btn')) return;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var btn = el('<button id="mkfinder-btn" aria-label="クラス診断を開く">' +
      '<span class="ico">💬</span><span class="lbl">クラス診断</span><span class="cls">✕ 閉じる</span></button>');

    var bubble = el('<div id="mkfinder-bubble">' +
      '<button class="x" aria-label="閉じる">✕</button>' +
      'どのクラスが合うか<br><b>30秒で診断</b>できます🩰</div>');

    var panel = el('<div id="mkfinder-panel"><iframe title="クラス診断" loading="lazy"></iframe></div>');

    document.body.appendChild(bubble);
    document.body.appendChild(panel);
    document.body.appendChild(btn);

    // 一度閉じた吹き出しはその訪問中は出さない
    // （Storageが使えない環境でもボタン自体は必ず出るよう、読み書きは失敗を握りつぶす）
    var store = {
      get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
    };
    if (store.get('mkfinder-bubble-closed')) bubble.style.display = 'none';
    bubble.querySelector('.x').onclick = function (e) {
      e.stopPropagation();
      bubble.style.display = 'none';
      store.set('mkfinder-bubble-closed', '1');
    };

    function open() {
      var f = panel.querySelector('iframe');
      if (!f.src) f.src = PANEL_SRC;      // 開くまで読み込まない＝HPの表示速度に影響しない
      panel.classList.add('open');
      btn.classList.add('open');
      bubble.style.display = 'none';
    }
    function close() {
      panel.classList.remove('open');
      btn.classList.remove('open');
    }
    btn.onclick = function () {
      panel.classList.contains('open') ? close() : open();
    };
    bubble.onclick = open;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
