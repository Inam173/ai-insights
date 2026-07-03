// ====== AI洞察平台 - 主应用逻辑 ======
// 模块化结构，每个函数独立，通过 window 暴露给 HTML onclick

var D = window.__EMBEDDED_DATA__;
if (!D) {
  document.getElementById("newsList").innerHTML = '<div class="empty-state"><p>DATA LOAD FAILED</p></div>';
} else {
  init();
}

// ====== 初始化 & 全局状态 ======
function init() {
  var curTab = "news";
  var curFilter = "all";
  var curCo = "all";
  var curRank = "arena";

  // 工具函数
  function fmt(d) { var dt = new Date(d); return (dt.getMonth()+1) + "M" + dt.getDate() + "D"; }
  function gco(id) { var a = (D.companies.domestic||[]).concat(D.companies.international||[]); return a.find(function(c){ return c.id === id; }); }
  function gcat(id) { return D.categories.find(function(c){ return c.id === id; }) || { name: id, icon: "📌" }; }
  var tagCls = {
    "model-breakthrough": "mb", "application": "ap", "partnership": "pt",
    "advanced-usage": "au", "ecosystem": "ec", "capital": "cp"
  };

  // ====== 主渲染入口 ======
  function rAll() {
    document.getElementById("updateTime").textContent = new Date(D.lastUpdated).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    document.getElementById("newsCount").textContent = D.news.length;
    var tc = D.companies.domestic.length + D.companies.international.length;
    document.getElementById("companyCount").textContent = tc;
    renderCategoryFilters();
    renderCompanySelect();
    renderNews();
    renderCompanies();
    renderCaseStudies();
  }

  // ====== 筛选器 ======
  function renderCategoryFilters() {
    document.getElementById("catFilters").innerHTML = D.categories.map(function(c) {
      return '<button class="filter-btn" id="filter-' + c.id + '" onclick="filterNews(\'' + c.id + '\')">' + c.icon + ' ' + c.name + '</button>';
    }).join("");
  }

  function renderCompanySelect() {
    var all = (D.companies.domestic||[]).concat(D.companies.international||[]);
    document.getElementById("companyFilter").innerHTML = '<option value="all">所有厂商</option>' +
      all.map(function(c) { return '<option value="' + c.id + '">' + c.logo + ' ' + c.name + '</option>'; }).join("");
  }

  window.filterNews = function(cat) {
    curFilter = cat;
    document.querySelectorAll("#catFilters .filter-btn, #filter-all").forEach(function(b) { b.classList.remove("active"); });
    var btn = document.getElementById("filter-" + cat); if (btn) btn.classList.add("active");
    renderNews();
  };

  window.filterNewsByCo = function(cid) { curCo = cid; renderNews(); };

  // ====== 📰 资讯流 ======
  function renderNews() {
    var list = D.news;
    if (curFilter !== "all") list = list.filter(function(n) { return n.category === curFilter; });
    if (curCo !== "all") list = list.filter(function(n) { return n.companies.indexOf(curCo) >= 0; });
    var el = document.getElementById("newsList"), em = document.getElementById("newsEmpty");
    if (!list.length) { el.innerHTML = ""; em.classList.remove("hidden"); return; }
    em.classList.add("hidden");
    el.innerHTML = list.map(function(n) {
      var ct = gcat(n.category), tc = tagCls[n.category] || "mb";
      var ctags = n.companies.map(function(id) { var c = gco(id); return c ? '<span class="company-tag">' + c.logo + ' ' + c.name + '</span>' : ''; }).join("");
      return '<div class="news-card" onclick="openSrc(\'' + n.id + '\')">' +
        '<div class="news-header"><div class="news-tags"><span class="tag tag-' + tc + '">' + ct.icon + ' ' + ct.name + '</span>' + ctags + '</div>' +
        '<span class="news-date">' + fmt(n.date) + '</span></div>' +
        '<h3 class="news-title">' + n.title + '</h3>' +
        '<p class="news-summary">' + n.summary + '</p>' +
        '<div class="news-source-link">📎 ' + n.sources.length + ' 个来源 →</div></div>';
    }).join("");
  }

  // 来源弹窗
  window.openSrc = function(nid) {
    var n = D.news.find(function(x) { return x.id === nid; }); if (!n) return;
    if (n.sources.length === 1) { window.open(n.sources[0].url, "_blank"); return; }
    document.getElementById("modalNewsTitle").textContent = n.title;
    document.getElementById("modalSourceList").innerHTML = n.sources.map(function(s, i) {
      return '<a href="' + s.url + '" target="_blank" class="modal-link"><span class="modal-link-num">' + (i+1) + '</span>' +
        '<div class="modal-link-info"><div class="modal-link-name">' + s.name + '</div><div class="modal-link-url">' + s.url + '</div></div>' +
        '<span class="modal-link-arrow">↗</span></a>';
    }).join("");
    document.getElementById("sourceModal").classList.add("show");
  };

  window.closeModal = function(e) { if (e.target === document.getElementById("sourceModal")) document.getElementById("sourceModal").classList.remove("show"); };
  window.closeModalDirect = function() { document.getElementById("sourceModal").classList.remove("show"); };

  // ====== 🏢 厂商卡片 ======
  function renderCompanies() {
    function cardHTML(c) {
      var models = c.coreModels.map(function(m) { return '<span class="model-tag">' + m + '</span>'; }).join("");
      var strengths = c.strengths.map(function(s) { return '<span class="strength-tag">' + s + '</span>'; }).join(" ");
      var metrics = "";
      if (c.keyMetrics) {
        var fields = ['月活用户', '日均Token调用'];
        metrics = '<div class="co-card-metrics">' + fields.map(function(k) {
          var v = c.keyMetrics[k] || '未公开';
          return '<div class="metric-row"><span class="metric-label">' + k + '</span><span class="metric-value">' + v + '</span></div>';
        }).join("") + '</div>';
      }
      return '<div class="co-card"><div class="co-card-head"><div class="co-card-logo"><span class="co-card-icon">' + c.logo + '</span>' +
        '<div><h3 class="co-card-name">' + c.name + '</h3><p class="co-card-en">' + c.nameEn + '</p></div></div>' +
        '<span class="co-card-loc">' + c.headquarters + '</span></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">' + models + '</div>' +
        '<p class="co-card-hl">' + c.latestHighlight + '</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">' + strengths + '</div>' + metrics +
        '<a href="' + c.website + '" target="_blank" class="co-card-link">访问官网 →</a></div>';
    }
    document.getElementById("domesticCards").innerHTML = D.companies.domestic.map(cardHTML).join("");
    document.getElementById("internationalCards").innerHTML = D.companies.international.map(cardHTML).join("");
  }

  // ====== 📋 友商案例 ======
  function renderCaseStudies() {
    var grid = document.getElementById("casesGrid"); if (!grid) return;
    var html = "";
    D.caseStudies.forEach(function(c) {
      html += '<div style="background:#12121a;border:1px solid rgba(99,102,241,0.15);border-radius:12px;padding:16px;margin-bottom:12px">';
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">';
      html += '<span style="font-size:24px">' + c.logo + '</span>';
      html += '<div><span style="font-size:16px;font-weight:600;color:#f3f4f6">' + c.company + '</span>';
      html += '<span style="font-size:12px;color:#6b7280;margin-left:8px">' + c.industry + ' · ' + c.cases.length + '条案例</span></div></div>';
      c.cases.forEach(function(cs) {
        html += '<div style="padding:10px 0;border-top:1px solid rgba(45,45,80,0.3)">';
        html += '<div style="font-size:14px;font-weight:600;color:#e5e7eb;margin-bottom:4px">' + cs.title + '</div>';
        html += '<div style="font-size:12px;color:#9ca3af;line-height:1.6;margin-bottom:8px">' + cs.summary + '</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px">';
        cs.tags.forEach(function(t) { html += '<span style="display:inline-block;padding:2px 6px;border-radius:4px;font-size:11px;background:rgba(26,26,46,0.5);color:#6b7280;margin:1px">' + t + '</span>'; });
        html += '</div><div style="display:flex;flex-wrap:wrap;gap:8px">';
        cs.sources.forEach(function(src, k) { html += '<a href="' + src.url + '" target="_blank" style="font-size:11px;color:#818cf8;text-decoration:none">[' + (k+1) + '] ' + src.name + '</a>'; });
        html += '</div></div>';
      });
      html += '</div>';
    });
    grid.innerHTML = html;
  }

  // ====== 🔀 页签切换 ======
  window.switchTab = function(tab) {
    curTab = tab;
    ["news", "companies", "ranking", "cases"].forEach(function(t) {
      document.getElementById("tab-" + t).classList.remove("active");
      document.getElementById("section-" + t).classList.add("hidden");
    });
    document.getElementById("tab-" + tab).classList.add("active");
    document.getElementById("section-" + tab).classList.remove("hidden");
    if (tab === "ranking") setTimeout(renderBars, 100);
  };

  // ====== 🏆 天梯图 ======
  window.switchRanking = function(type) {
    curRank = type;
    ["arena", "artificial", "livebench", "swebench"].forEach(function(t) {
      var b = document.getElementById("rank-" + t); if (b) b.classList.remove("active");
    });
    var a = document.getElementById("rank-" + type); if (a) a.classList.add("active");
    var bm = D.benchmarks[type];
    document.getElementById("rankingTitle").textContent = bm.icon + " " + bm.name + " 排名";
    document.getElementById("rankingSource").textContent = "来源: " + bm.source + " — " + bm.desc;
    renderBars();
  };

  function renderBars() {
    var bm = D.benchmarks[curRank]; if (!bm || !bm.models || !bm.models.length) return;
    var max = bm.models[0].score, html = "";
    bm.models.forEach(function(m, i) {
      var pct = (m.score / max * 100).toFixed(0);
      var cls = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "normal";
      var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
      html += '<div class="bar-row"><div class="bar-label">' + medal + ' ' + m.logo + ' ' + m.name + '</div>' +
        '<div class="bar-track"><div class="bar-fill ' + cls + '" style="width:' + pct + '%"><span class="bar-score">' + m.score + '</span></div></div>' +
        '<div style="font-size:11px;color:#6b7280;width:100px;flex-shrink:0">' + m.company + '</div></div>';
    });
    document.getElementById("rankingBars").innerHTML = html;
  }

  // ====== ESC 关闭弹窗 ======
  document.addEventListener("keydown", function(e) { if (e.key === "Escape") document.getElementById("sourceModal").classList.remove("show"); });

  // ====== 启动 ======
  rAll();
}
