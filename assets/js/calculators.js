/* ============================================
   AdCalcs.com - 计算器逻辑
   ============================================ */

/* ---------- YouTube 收益计算器 ---------- */
function calcYoutube() {
  var views = parseFloat(document.getElementById('yt-views').value) || 0;
  var cpm = parseFloat(document.getElementById('yt-cpm').value) || 0;
  var rpm = parseFloat(document.getElementById('yt-rpm').value) || 0;
  var length = parseFloat(document.getElementById('yt-length').value) || 8;

  // RPM adjustment based on video length
  var lengthMultiplier = 1;
  if (length < 2) lengthMultiplier = 0.3;
  else if (length < 5) lengthMultiplier = 0.6;
  else if (length < 10) lengthMultiplier = 0.85;
  else if (length < 15) lengthMultiplier = 1.0;
  else lengthMultiplier = 1.1;

  var adjRpm = rpm * lengthMultiplier;
  var estimatedRevenue = (views / 1000) * adjRpm;
  var estimatedCpmRevenue = (views / 1000) * cpm;
  var monthlyViews = views * 30;
  var monthlyRevenue = (monthlyViews / 1000) * adjRpm;

  document.getElementById('yt-result-estimate').textContent = '$' + estimatedRevenue.toFixed(2);
  document.getElementById('yt-result-monthly').textContent = '$' + monthlyRevenue.toFixed(2);
  document.getElementById('yt-result-cpm').textContent = '$' + estimatedCpmRevenue.toFixed(2);
  document.getElementById('yt-result-rpm').textContent = '$' + adjRpm.toFixed(2);
  document.getElementById('yt-result-views').textContent = views.toLocaleString();

  document.getElementById('yt-results').style.display = 'block';
}

/* ---------- TikTok 收益计算器 ---------- */
function calcTiktok() {
  var views = parseFloat(document.getElementById('tt-views').value) || 0;
  var rate = parseFloat(document.getElementById('tt-rate').value) || 0.02;
  var engagement = parseFloat(document.getElementById('tt-engagement').value) || 3;

  // TikTok creator fund / rewards calculation
  var engagementMultiplier = 1 + (engagement - 3) * 0.1;
  var estimatedRevenue = views * rate * engagementMultiplier / 1000;
  var monthlyRevenue = estimatedRevenue * 30;
  var yearlyRevenue = estimatedRevenue * 365;
  var effectiveRpm = rate * 1000 * engagementMultiplier;

  document.getElementById('tt-result-estimate').textContent = '$' + estimatedRevenue.toFixed(2);
  document.getElementById('tt-result-monthly').textContent = '$' + monthlyRevenue.toFixed(2);
  document.getElementById('tt-result-yearly').textContent = '$' + yearlyRevenue.toFixed(2);
  document.getElementById('tt-result-rpm').textContent = '$' + effectiveRpm.toFixed(2);
  document.getElementById('tt-result-views').textContent = views.toLocaleString();

  document.getElementById('tt-results').style.display = 'block';
}

/* ---------- CPM 计算器 ---------- */
function calcCpm() {
  var cost = parseFloat(document.getElementById('cpm-cost').value) || 0;
  var impressions = parseFloat(document.getElementById('cpm-impressions').value) || 0;

  if (impressions <= 0) return;

  var cpm = (cost / impressions) * 1000;

  document.getElementById('cpm-result').textContent = '$' + cpm.toFixed(2);
  document.getElementById('cpm-result-cost').textContent = '$' + cost.toFixed(2);
  document.getElementById('cpm-result-impressions').textContent = impressions.toLocaleString();

  document.getElementById('cpm-results').style.display = 'block';
}

/* ---------- RPM 计算器 ---------- */
function calcRpm() {
  var revenue = parseFloat(document.getElementById('rpm-revenue').value) || 0;
  var impressions = parseFloat(document.getElementById('rpm-impressions').value) || 0;

  if (impressions <= 0) return;

  var rpm = (revenue / impressions) * 1000;
  var cpmEquivalent = rpm * 0.85; // rough estimate
  var pageviewsPerDay = impressions / 30;
  var dailyRevenue = revenue / 30;

  document.getElementById('rpm-result').textContent = '$' + rpm.toFixed(2);
  document.getElementById('rpm-result-total').textContent = '$' + revenue.toFixed(2);
  document.getElementById('rpm-result-daily').textContent = '$' + dailyRevenue.toFixed(2);
  document.getElementById('rpm-result-impressions').textContent = impressions.toLocaleString();
  document.getElementById('rpm-result-pageviews').textContent = Math.round(pageviewsPerDay).toLocaleString();

  document.getElementById('rpm-results').style.display = 'block';
}

/* ---------- ROI 计算器 ---------- */
function calcRoi() {
  var investment = parseFloat(document.getElementById('roi-investment').value) || 0;
  var revenue = parseFloat(document.getElementById('roi-revenue').value) || 0;

  if (investment <= 0) return;

  var profit = revenue - investment;
  var roi = (profit / investment) * 100;
  var totalReturn = (revenue / investment) * 100;

  document.getElementById('roi-result-pct').textContent = roi.toFixed(1) + '%';
  document.getElementById('roi-result-profit').textContent = '$' + profit.toFixed(2);
  document.getElementById('roi-result-revenue').textContent = '$' + revenue.toFixed(2);
  document.getElementById('roi-result-investment').textContent = '$' + investment.toFixed(2);
  document.getElementById('roi-result-return').textContent = totalReturn.toFixed(1) + '%';

  var roiElement = document.getElementById('roi-result-pct');
  if (roi >= 0) {
    roiElement.style.color = '#16a34a';
  } else {
    roiElement.style.color = '#dc2626';
  }

  document.getElementById('roi-results').style.display = 'block';
}

/* ---------- AdSense 收入计算器 ---------- */
function calcAdsense() {
  var impressions = parseFloat(document.getElementById('as-impressions').value) || 0;
  var rpm = parseFloat(document.getElementById('as-rpm').value) || 0;
  var ctr = parseFloat(document.getElementById('as-ctr').value) || 2.5;

  var ctrMultiplier = 1 + (ctr - 2.5) * 0.05;
  var effectiveRpm = rpm * ctrMultiplier;
  var daily = (impressions / 1000) * effectiveRpm;
  var monthly = daily * 30;
  var yearly = daily * 365;

  document.getElementById('as-result-daily').textContent = '$' + daily.toFixed(2);
  document.getElementById('as-result-monthly').textContent = '$' + monthly.toFixed(2);
  document.getElementById('as-result-yearly').textContent = '$' + yearly.toFixed(2);
  document.getElementById('as-result-rpm').textContent = '$' + effectiveRpm.toFixed(2);
  document.getElementById('as-result-impressions').textContent = impressions.toLocaleString();

  document.getElementById('as-results').style.display = 'block';
}

/* ---------- Range Slider Sync ---------- */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('input[type="range"]').forEach(function (slider) {
    var display = document.getElementById(slider.id + '-val');
    if (display) {
      display.textContent = slider.value;
      slider.addEventListener('input', function () {
        display.textContent = slider.value;
      });
    }
  });
});

/* ---------- Hero Tab Switching ---------- */
function switchHeroTab(tab) {
  document.querySelectorAll('.hero-calc-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  document.querySelectorAll('.hero-calc-panel').forEach(function(p) {
    p.classList.remove('active');
  });
  document.querySelector('.hero-calc-tab[data-tab="' + tab + '"]').classList.add('active');
  document.getElementById('hero-panel-' + tab).classList.add('active');
}

/* ---------- Hero YouTube Calculator ---------- */
function calcHeroYoutube() {
  var views = parseFloat(document.getElementById('hero-yt-views').value) || 0;
  var cpm = parseFloat(document.getElementById('hero-yt-cpm').value) || 0;
  var rpm = parseFloat(document.getElementById('hero-yt-rpm').value) || 0;
  var length = parseFloat(document.getElementById('hero-yt-length').value) || 8;

  var lengthMultiplier = 1;
  if (length < 2) lengthMultiplier = 0.3;
  else if (length < 5) lengthMultiplier = 0.6;
  else if (length < 10) lengthMultiplier = 0.85;
  else if (length < 15) lengthMultiplier = 1.0;
  else lengthMultiplier = 1.1;

  var adjRpm = rpm * lengthMultiplier;
  var daily = (views / 1000) * adjRpm;
  var monthly = daily * 30;
  var yearly = daily * 365;

  document.getElementById('hero-yt-daily').textContent = '$' + daily.toFixed(2);
  document.getElementById('hero-yt-monthly').textContent = '$' + monthly.toFixed(2);
  document.getElementById('hero-yt-rpm-result').textContent = '$' + adjRpm.toFixed(2);
  document.getElementById('hero-yt-yearly').textContent = '$' + yearly.toFixed(2);
  document.getElementById('hero-yt-results').style.display = 'grid';
}

/* ---------- Hero AdSense Calculator ---------- */
function calcHeroAdsense() {
  var impressions = parseFloat(document.getElementById('hero-as-impressions').value) || 0;
  var rpm = parseFloat(document.getElementById('hero-as-rpm').value) || 0;
  var ctr = parseFloat(document.getElementById('hero-as-ctr').value) || 0;

  var daily = (impressions / 1000) * rpm;
  var monthly = daily * 30;
  var yearly = daily * 365;

  document.getElementById('hero-as-daily').textContent = '$' + daily.toFixed(2);
  document.getElementById('hero-as-monthly').textContent = '$' + monthly.toFixed(2);
  document.getElementById('hero-as-yearly').textContent = '$' + yearly.toFixed(2);
  document.getElementById('hero-as-rpm-result').textContent = '$' + rpm.toFixed(2);
  document.getElementById('hero-as-results').style.display = 'grid';
}

/* ---------- Form Submit Prevention ---------- */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.calc-card form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
    });
  });
});
