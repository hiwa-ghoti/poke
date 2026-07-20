/**
 * Optional AI layer for Pokémon Champions team helper.
 * Uses localStorage for keys. Prefers proxy URL (CORS-safe), else tries direct API.
 */
(function () {
  const STORAGE_KEY = 'poke-team-ai-settings-v1';

  function $(id) {
    return document.getElementById(id);
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveSettings( partial) {
    const next = { ...loadSettings(), ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  function fillForm() {
    const s = loadSettings();
    if ($('ai-provider')) $('ai-provider').value = s.provider || 'gemini';
    if ($('ai-api-key')) $('ai-api-key').value = s.apiKey || '';
    if ($('ai-proxy-url')) $('ai-proxy-url').value = s.proxyUrl || '';
    if ($('ai-model')) $('ai-model').value = s.model || '';
  }

  function setStatus(msg) {
    if (window.PokeTeam?.setStatus) window.PokeTeam.setStatus(msg);
    else if ($('ai-status')) $('ai-status').textContent = msg || '';
  }

  function buildExplainPrompt(ctx) {
    return [
      'あなたはポケモンチャンピオンズ（Regulation M-B / Season M-4）の対戦コーチです。',
      '以下のパーティについて、日本語で簡潔に実戦的な解説をしてください。',
      '制約: メガシンカは1体まで、持ち物重複不可（Item Clause）。',
      '出力は次の見出しで: 1) 勝ち筋 2) 役割分担 3) 注意点（弱点・対策）',
      '各見出し2〜3文。誇張せず、ルールと使用率傾向を踏まえる。',
      '',
      JSON.stringify(ctx, null, 2)
    ].join('\n');
  }

  function buildRefinePrompt(ctx) {
    return [
      'あなたはポケモンチャンピオンズ（Regulation M-B）の構築家です。',
      `形式: ${ctx.format === 'singles' ? 'シングル（Bring6/Pick3）' : 'ダブル（Bring6/Pick4）'}`,
      `軸ポケモンは必ず残す: ${ctx.axis.join('、')}`,
      '6体パーティを最大3案提案。メガは全体で1体まで。持ち物は重複禁止。',
      '使用率上位（metaPriority）を優先しつつ、役割（サポート/耐久/エース/速度）をバランスさせる。',
      'pokemonIds は半角英語スラッグ（例: garchomp, mega-charizard-y, sinistcha）。',
      '出力は JSON のみ。説明文やコードフェンス禁止。形式:',
      '{"teams":[{"name":"案名","concept":"一言","explain":"なぜ強いか","pokemonIds":["id1","id2","id3","id4","id5","id6"]}]}',
      '',
      JSON.stringify({
        axisIds: window.PokeTeam.getSelectedIds(),
        axisNames: ctx.axis,
        format: ctx.format,
        metaPriority: ctx.metaPriority,
        current: ctx.members
      }, null, 2)
    ].join('\n');
  }

  async function callViaProxy(proxyUrl, prompt, settings) {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: settings.provider || 'gemini',
        model: settings.model || undefined,
        apiKey: settings.apiKey,
        prompt
      })
    });
    if (!res.ok) throw new Error(`プロキシエラー HTTP ${res.status}`);
    const data = await res.json();
    return data.text || data.content || data.output || '';
  }

  async function callGeminiDirect(prompt, settings) {
    const model = settings.model || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 }
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 180)}`);
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  }

  async function callOpenAiDirect(prompt, settings) {
    const model = settings.model || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: 'system', content: 'You are a Pokémon Champions coach. Reply in Japanese unless JSON is requested.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI HTTP ${res.status}: ${errText.slice(0, 180)}`);
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  async function askAi(prompt) {
    const settings = loadSettings();
    if (!settings.apiKey && !settings.proxyUrl) {
      throw new Error('APIキーかプロキシURLをAI設定に保存してください。またはプロンプトコピー→貼り付けを使えます。');
    }
    if (settings.proxyUrl) {
      return callViaProxy(settings.proxyUrl, prompt, settings);
    }
    if (settings.provider === 'openai') {
      return callOpenAiDirect(prompt, settings);
    }
    return callGeminiDirect(prompt, settings);
  }

  function extractJson(text) {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = fenced ? fenced[1] : text;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end < 0) throw new Error('JSONが見つかりません');
    return JSON.parse(raw.slice(start, end + 1));
  }

  async function onExplain() {
    const core = window.PokeTeam.getActiveSuggestion();
    if (!core) {
      setStatus('先に編成候補を表示してください。');
      return;
    }
    const prompt = buildExplainPrompt(window.PokeTeam.teamContextPayload(core));
    setStatus('AIに解説を依頼中…');
    try {
      const text = await askAi(prompt);
      window.PokeTeam.applyAiExplain(text.trim());
      setStatus('AI解説を反映しました。');
    } catch (err) {
      console.error(err);
      setStatus(`${err.message} / プロンプトコピー→チャットAI→貼り付けでも可`);
    }
  }

  async function onRefine() {
    if (!window.PokeTeam.getSelectedIds().length) {
      setStatus('軸ポケモンを選んでください。');
      return;
    }
    const core = window.PokeTeam.getActiveSuggestion() || { slots: [] };
    const prompt = buildRefinePrompt(window.PokeTeam.teamContextPayload(core));
    setStatus('AIに組み直しを依頼中…');
    try {
      const text = await askAi(prompt);
      const data = extractJson(text);
      window.PokeTeam.applyAiTeams(data.teams || []);
      setStatus('AI提案をルール補正して表示しました。');
    } catch (err) {
      console.error(err);
      setStatus(`${err.message} / プロンプトコピー→JSON貼り付けでも可`);
    }
  }

  async function onCopyPrompt() {
    const core = window.PokeTeam.getActiveSuggestion();
    if (!core) {
      setStatus('先に編成候補を表示してください。');
      return;
    }
    const mode = $('ai-refine-btn')?.dataset.copyMode === 'refine' ? 'refine' : 'explain';
    const ctx = window.PokeTeam.teamContextPayload(core);
    const prompt = mode === 'refine' ? buildRefinePrompt(ctx) : buildExplainPrompt(ctx);
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus('プロンプトをコピーしました。ChatGPT等に貼って返答を戻してください。');
    } catch {
      setStatus('コピーに失敗しました。ブラウザの権限を確認してください。');
    }
  }

  function onPasteApply() {
    const raw = ($('ai-paste-input')?.value || '').trim();
    if (!raw) {
      setStatus('貼り付け内容が空です。');
      return;
    }
    try {
      if (raw.includes('{') && /"teams"\s*:/.test(raw)) {
        const data = extractJson(raw);
        window.PokeTeam.applyAiTeams(data.teams || []);
        setStatus('貼り付けJSONをルール補正して反映しました。');
      } else {
        window.PokeTeam.applyAiExplain(raw);
        setStatus('解説文を反映しました。');
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  function init() {
    fillForm();
    $('ai-save-settings')?.addEventListener('click', () => {
      saveSettings({
        provider: $('ai-provider')?.value || 'gemini',
        apiKey: $('ai-api-key')?.value?.trim() || '',
        proxyUrl: $('ai-proxy-url')?.value?.trim() || '',
        model: $('ai-model')?.value?.trim() || ''
      });
      setStatus('AI設定を保存しました（この端末のみ）。');
    });
    $('ai-clear-settings')?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      fillForm();
      setStatus('AI設定を削除しました。');
    });
    $('ai-explain-btn')?.addEventListener('click', onExplain);
    $('ai-refine-btn')?.addEventListener('click', () => {
      $('ai-copy-prompt-btn').dataset.copyMode = 'refine';
      onRefine();
    });
    $('ai-copy-prompt-btn')?.addEventListener('click', () => {
      // 詳細パネルからは解説プロンプトを既定に
      if ($('ai-copy-prompt-btn').dataset.copyMode !== 'refine') {
        $('ai-copy-prompt-btn').dataset.copyMode = 'explain';
      }
      onCopyPrompt();
      $('ai-copy-prompt-btn').dataset.copyMode = 'explain';
    });
    $('ai-paste-apply')?.addEventListener('click', onPasteApply);
  }

  window.TeamAI = { init, buildExplainPrompt, buildRefinePrompt };
})();
