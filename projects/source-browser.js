(() => {
  const HIDDEN_PATTERNS = [
    /^node_modules\//,
    /^\.next\//,
    /^dist\//,
    /^build\//,
    /^coverage\//,
    /^\.git\//
  ];

  const MAX_FILES = 120;

  const decodeBase64Utf8 = (value) => {
    const binary = atob(value.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  const shouldHide = (path) => HIDDEN_PATTERNS.some((pattern) => pattern.test(path));

  const isLikelyText = (path) => {
    const textExtensions = /\.(js|jsx|ts|tsx|json|md|css|scss|html|py|java|c|cpp|h|hpp|go|rs|sql|yml|yaml|toml|env|txt|sh)$/i;
    return textExtensions.test(path) || !path.includes(".");
  };

  const create = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === "string") el.textContent = text;
    return el;
  };

  async function fetchJson(url) {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" }
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`GitHub API request failed (${response.status}): ${detail.slice(0, 180)}`);
    }

    return response.json();
  }

  async function loadRepository(owner, repo) {
    const repoInfo = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`);
    const branch = repoInfo.default_branch;
    const treeData = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`);

    const files = (treeData.tree || [])
      .filter((item) => item.type === "blob" && !shouldHide(item.path) && isLikelyText(item.path))
      .sort((a, b) => a.path.localeCompare(b.path))
      .slice(0, MAX_FILES);

    return {
      branch,
      fullName: repoInfo.full_name,
      files
    };
  }

  async function loadFile(owner, repo, path, branch) {
    const content = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`);
    if (!content.content || content.encoding !== "base64") {
      throw new Error("Unable to decode this file from GitHub API.");
    }
    return decodeBase64Utf8(content.content);
  }

  function renderBrowser(root) {
    const owner = root.dataset.githubOwner;
    const repo = root.dataset.githubRepo;
    if (!owner || !repo) return;

    const header = create("div", "source-browser-header");
    const meta = create("div", "source-browser-meta");
    const repoLabel = create("span", "source-browser-repo", `${owner}/${repo}`);
    const note = create("span", "source-browser-note", "Public files from GitHub API");
    meta.append(repoLabel, note);

    const refreshBtn = create("button", "source-browser-refresh", "Refresh");
    refreshBtn.type = "button";
    header.append(meta, refreshBtn);

    const layout = create("div", "source-browser-layout");
    const tree = create("div", "source-browser-tree");
    const codeWrap = create("div", "source-browser-code");
    const codeHead = create("div", "source-browser-code-head", "Select a file to preview");
    const pre = create("pre");
    const code = create("code");
    code.className = "language-plaintext";
    pre.appendChild(code);
    codeWrap.append(codeHead, pre);
    layout.append(tree, codeWrap);
    root.append(header, layout);

    let currentBranch = "";

    const setCode = (path, value, isError = false) => {
      codeHead.textContent = path || "Select a file to preview";
      code.textContent = value || "";
      code.classList.toggle("source-browser-error", isError);
    };

    const setTreeMessage = (message, isError = false) => {
      tree.innerHTML = "";
      const msg = create("div", `source-browser-empty${isError ? " source-browser-error" : ""}`, message);
      tree.appendChild(msg);
    };

    const setActiveButton = (path) => {
      tree.querySelectorAll(".source-browser-tree-item").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.path === path);
      });
    };

    const onSelectFile = async (path) => {
      setActiveButton(path);
      setCode(path, "Loading file...");
      try {
        const fileText = await loadFile(owner, repo, path, currentBranch);
        setCode(path, fileText);
      } catch (error) {
        setCode(path, `Failed to load file.\n\n${error.message}`, true);
      }
    };

    const renderTree = (files) => {
      tree.innerHTML = "";
      if (!files.length) {
        setTreeMessage("No source files available to display.");
        return;
      }
      const list = create("ul");
      files.forEach((file) => {
        const li = create("li");
        const btn = create("button", "source-browser-tree-item");
        btn.type = "button";
        btn.dataset.path = file.path;
        btn.innerHTML = `<span>📄</span><span>${file.path}</span>`;
        btn.addEventListener("click", () => onSelectFile(file.path));
        li.appendChild(btn);
        list.appendChild(li);
      });
      tree.appendChild(list);
    };

    const loadAll = async () => {
      setTreeMessage("Loading repository files...");
      setCode("", "Loading...");
      refreshBtn.disabled = true;
      refreshBtn.textContent = "Loading...";
      try {
        const repoData = await loadRepository(owner, repo);
        currentBranch = repoData.branch;
        repoLabel.textContent = repoData.fullName;
        note.textContent = `Branch: ${repoData.branch} • Showing up to ${MAX_FILES} files`;
        renderTree(repoData.files);
        const preferred = repoData.files.find((file) => /(^|\/)readme\.md$/i.test(file.path)) || repoData.files[0];
        if (preferred) {
          await onSelectFile(preferred.path);
        } else {
          setCode("", "No files available.");
        }
      } catch (error) {
        setTreeMessage(`Could not load repository.\n${error.message}`, true);
        setCode("", "GitHub source preview unavailable right now.", true);
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = "Refresh";
      }
    };

    refreshBtn.addEventListener("click", loadAll);
    loadAll();
  }

  document.querySelectorAll("[data-source-browser]").forEach(renderBrowser);
})();
