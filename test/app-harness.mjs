import fs from "node:fs";
import vm from "node:vm";

class FakeClassList {
  constructor(element) {
    this.element = element;
    this.values = new Set();
  }

  set(value) {
    this.values = new Set(String(value).split(/\s+/).filter(Boolean));
  }

  add(...values) {
    values.forEach(value => this.values.add(value));
  }

  remove(...values) {
    values.forEach(value => this.values.delete(value));
  }

  contains(value) {
    return this.values.has(value);
  }

  toggle(value, force) {
    const enabled = force === undefined ? !this.contains(value) : Boolean(force);
    if (enabled) this.add(value);
    else this.remove(value);
    return enabled;
  }

  toString() {
    return [...this.values].join(" ");
  }
}

class FakeElement {
  constructor(document, tagName = "div", id = "") {
    this.ownerDocument = document;
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentElement = null;
    this.dataset = {};
    this.style = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.classList = new FakeClassList(this);
    this.hidden = false;
    this.disabled = false;
    this.value = "";
    this.textContent = "";
    this.title = "";
    this.options = [];
    this.files = [];
    this.complete = false;
    this.naturalWidth = 0;
    this._id = "";
    this._innerHTML = "";
    if (id) this.id = id;
  }

  set id(value) {
    this._id = value;
    if (value) this.ownerDocument.elementsById.set(value, this);
  }

  get id() {
    return this._id;
  }

  set className(value) {
    this.classList.set(value);
  }

  get className() {
    return this.classList.toString();
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    this.children = [];
    if (this.classList.contains("sprite-card")) {
      const art = new FakeElement(this.ownerDocument, "span");
      art.className = "sprite-art";
      art.appendChild(new FakeElement(this.ownerDocument, "img"));
      const info = new FakeElement(this.ownerDocument, "span");
      info.className = "sprite-info";
      const name = new FakeElement(this.ownerDocument, "span");
      name.className = "sprite-name";
      const state = new FakeElement(this.ownerDocument, "span");
      state.className = "sprite-state";
      info.appendChild(name);
      info.appendChild(state);
      this.appendChild(art);
      this.appendChild(info);
    } else if (this.classList.contains("sprite-group")) {
      const heading = new FakeElement(this.ownerDocument, "h2");
      const count = new FakeElement(this.ownerDocument, "span");
      count.className = "sprite-group-count";
      heading.appendChild(count);
      const grid = new FakeElement(this.ownerDocument, "div");
      grid.className = "sprite-grid";
      this.appendChild(heading);
      this.appendChild(grid);
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  get selectedOptions() {
    return this.options.filter(option => option.value === this.value);
  }

  appendChild(child) {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  remove() {
    if (!this.parentElement) return;
    this.parentElement.children = this.parentElement.children.filter(child => child !== this);
    this.parentElement = null;
  }

  setAttribute(name, value) {
    const stringValue = String(value);
    this.attributes.set(name, stringValue);
    if (name === "class") this.className = stringValue;
    if (name === "id") this.id = stringValue;
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  async dispatch(type, init = {}) {
    const event = {
      type,
      target: this,
      currentTarget: this,
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; },
      ...init
    };
    for (const listener of this.listeners.get(type) || []) await listener(event);
    return event;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  click() {
    return this.dispatch("click");
  }

  matches(selector) {
    if (selector.startsWith(".")) return this.classList.contains(selector.slice(1));
    if (selector === "img") return this.tagName === "IMG";
    if (selector === "[data-status-filter]") return this.dataset.statusFilter !== undefined;
    return false;
  }

  querySelectorAll(selector) {
    const matches = [];
    for (const child of this.children) {
      if (child.matches(selector)) matches.push(child);
      matches.push(...child.querySelectorAll(selector));
    }
    return matches;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }
}

class FakeDocument {
  constructor() {
    this.elementsById = new Map();
    this.body = new FakeElement(this, "body");
    this.activeElement = this.body;
  }

  createElement(tagName) {
    return new FakeElement(this, tagName);
  }

  getElementById(id) {
    return this.elementsById.get(id) || null;
  }

  querySelectorAll(selector) {
    return this.body.querySelectorAll(selector);
  }
}

class FakeStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

function buildDocument() {
  const document = new FakeDocument();
  const ids = [
    "spriteGroups", "emptyResults", "status", "filterSummary", "collectedCount",
    "masteredCount", "remainingCount", "percentDone", "progressBar", "fill",
    "spriteSearch", "statusFilter", "clearFilters", "compactMode", "resetAll",
    "siteCounter", "siteCounterImage", "siteCounterFallback", "exportFile",
    "importFileButton", "importFile"
  ];
  for (const id of ids) {
    const tag = id === "statusFilter" ? "select" : id === "spriteSearch" || id === "importFile" ? "input" : id.includes("Button") || ["clearFilters", "compactMode", "resetAll", "exportFile"].includes(id) ? "button" : "div";
    document.body.appendChild(new FakeElement(document, tag, id));
  }

  const statusFilter = document.getElementById("statusFilter");
  statusFilter.options = [
    ["all", "All statuses"], ["collected", "Collected"], ["not-found", "Not Found"],
    ["found", "Found"], ["mastered", "Mastered"]
  ].map(([value, textContent]) => ({ value, textContent }));
  statusFilter.value = "all";

  for (const status of ["collected", "mastered", "not-found", "collected"]) {
    const button = new FakeElement(document, "button");
    button.dataset.statusFilter = status;
    document.body.appendChild(button);
  }
  return document;
}

export function createApp({ storage = {}, confirm = () => true } = {}) {
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw new Error("Application script not found");

  const document = buildDocument();
  const windowListeners = new Map();
  const window = {
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) || [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    }
  };
  const localStorage = new FakeStorage(storage);
  let timerId = 0;
  const context = vm.createContext({
    document,
    window,
    localStorage,
    location: { hostname: "", pathname: "/" },
    confirm,
    Blob,
    URL: { createObjectURL: () => "blob:test", revokeObjectURL: () => {} },
    setTimeout(callback) { callback(); return ++timerId; },
    clearTimeout() {},
    console
  });
  new vm.Script(script, { filename: "index.html" }).runInContext(context);

  return {
    context,
    document,
    localStorage,
    evaluate(expression) {
      return vm.runInContext(expression, context);
    },
    card(id) {
      return document.getElementById(id);
    },
    async dispatchWindow(type, init = {}) {
      const event = { type, ...init };
      for (const listener of windowListeners.get(type) || []) await listener(event);
    }
  };
}
