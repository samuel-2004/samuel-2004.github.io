// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setInt16),
      AD: x0 => x0.height,
      AE: (x0,x1) => x0.observe(x1),
      AF: x0 => x0.wheelDeltaY,
      AG: x0 => x0.location,
      AH: (x0,x1) => x0.removeAttribute(x1),
      AI: x0 => new BroadcastChannel(x0),
      AJ: x0 => x0.fontFallbackBaseUrl,
      AK: (x0,x1) => { x0.height = x1 },
      AL: x0 => x0.r,
      AM: x0 => x0.lockName,
      AN: x0 => x0.i,
      AO: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      AP: (x0,x1,x2,x3,x4,x5,x6,x7) => ({c: x0,n: x1,v: x2,r: x3,x: x4,y: x5,i: x6,t: x7}),
      AQ: x0 => x0.parameterTypes,
      AR: x0 => x0.href,
      AS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      AT: x0 => x0.latitude,
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BF: x0 => x0.wheelDeltaX,
      BG: x0 => x0.pathname,
      BH: x0 => x0.isConnected,
      BI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BJ: x0 => new WeakRef(x0),
      BK: (x0,x1) => { x0.width = x1 },
      BL: x0 => x0.n,
      BM: (x0,x1,x2) => ({i: x0,d: x1,t: x2}),
      BN: x0 => x0.i,
      BO: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      BP: (x0,x1) => x0.sqlite3_step(x1),
      BQ: x0 => x0.parameters,
      BR: x0 => x0.u,
      BS: x0 => x0.read(),
      BT: x0 => x0.coords,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: x0 => new ResizeObserver(x0),
      CF: x0 => x0.key,
      CG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      CH: x0 => x0.click(),
      CI: x0 => x0.close(),
      CJ: x0 => x0.deref(),
      CK: x0 => x0.style,
      CL: x0 => x0.c,
      CM: x0 => x0.requestId,
      CN: (o, a) => o == a,
      CO: (x0,x1) => x0.dart_sqlite3_free(x1),
      CP: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      CQ: x0 => x0.parameters,
      CR: (x0,x1) => ({port: x0,lockName: x1}),
      CS: (x0,x1) => x0.getType(x1),
      CT: x0 => x0.permissions,
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.setInt8),
      DD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      DE: (x0,x1) => x0.getPropertyValue(x1),
      DF: x0 => x0.identifier,
      DG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      DH: (x0,x1) => x0.getElementsByClassName(x1),
      DI: (x0,x1) => x0.postMessage(x1),
      DJ: () => globalThis.WeakRef,
      DK: (x0,x1) => { x0.src = x1 },
      DL: x0 => x0.y,
      DM: x0 => x0.errorMessage,
      DN: (x0,x1,x2,x3) => ({r: x0,i: x1,d: x2,t: x3}),
      DO: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      DP: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      DQ: x0 => x0.rawSql,
      DR: () => new EventTarget(),
      DS: x0 => x0.text(),
      DT: x0 => x0.geolocation,
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: Function.prototype.call.bind(DataView.prototype.getInt8),
      ED: x0 => x0.tabIndex,
      EE: x0 => globalThis.parseFloat(x0),
      EF: x0 => x0.touches,
      EG: o => Object.keys(o),
      EH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      EI: (x0,x1) => { x0.onmessage = x1 },
      EJ: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      EK: () => globalThis.document,
      EL: x0 => x0.x,
      EM: x0 => x0.recognizedType,
      EN: (x0,x1) => x0.postMessage(x1),
      EO: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      EP: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      EQ: x0 => x0.requireTransaction,
      ER: x0 => ({data: x0}),
      ES: x0 => x0.types,
      ET: (x0,x1,x2,x3,x4) => x0.clearRect(x1,x2,x3,x4),
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      FD: (x0,x1) => x0.contains(x1),
      FE: (x0,x1) => x0.getComputedStyle(x1),
      FF: x0 => x0.pressure,
      FG: x0 => x0.state,
      FH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      FI: () => new AbortController(),
      FJ: (a, s, e) => a.slice(s, e),
      FK: x0 => x0.src,
      FL: (x0,x1,x2,x3,x4,x5,x6,x7,x8) => ({s: x0,p: x1,v: x2,z: x3,r: x4,c: x5,i: x6,d: x7,t: x8}),
      FM: x0 => x0.payload,
      FN: (x0,x1,x2) => x0.open(x1,x2),
      FO: x0 => x0.sqlite3_initialize(),
      FP: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      FQ: x0 => x0.z,
      FR: (x0,x1) => new MessageEvent(x0,x1),
      FS: x0 => x0.clipboard,
      FT: x0 => x0.close(),
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: x0 => x0.documentElement,
      GF: x0 => x0.tiltY,
      GG: x0 => x0.hash,
      GH: (x0,x1) => x0.dispatchEvent(x1),
      GI: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      GJ: (o, p) => p in o,
      GK: x0 => x0.decode(),
      GL: x0 => globalThis.BigInt(x0),
      GM: x0 => x0.requestId,
      GN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GO: x0 => x0.useMultipleCiphersVfs,
      GP: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      GQ: x0 => x0.o,
      GR: x0 => ({name: x0}),
      GS: (x0,x1) => x0.querySelector(x1),
      GT: (x0,x1,x2) => x0.toDataURL(x1,x2),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.computedStyleMap(),
      HF: x0 => x0.tiltX,
      HG: x0 => x0.state,
      HH: (x0,x1) => x0.createEvent(x1),
      HI: (x0,x1) => globalThis.fetch(x0,x1),
      HJ: x0 => x0.groups,
      HK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      HL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HM: x0 => x0.i,
      HN: x0 => x0.close(),
      HO: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      HP: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      HQ: x0 => x0.a,
      HR: (x0,x1) => new Worker(x0,x1),
      HS: (x0,x1) => x0.append(x1),
      HT: x0 => x0.height,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: (x0,x1) => x0.get(x1),
      IF: x0 => x0.pointerType,
      IG: (x0,x1) => x0.go(x1),
      IH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      II: (x0,x1) => x0.get(x1),
      IJ: (x0,x1,x2) => x0.insertBefore(x1,x2),
      IK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IL: (x0,x1,x2,x3) => x0.request(x1,x2,x3),
      IM: x0 => x0.r,
      IN: x0 => x0.error,
      IO: (x0,x1,x2) => x0.transaction(x1,x2),
      IP: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      IQ: x0 => x0.c,
      IR: (x0,x1,x2) => x0.postMessage(x1,x2),
      IS: (x0,x1) => { x0.id = x1 },
      IT: x0 => x0.width,
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.target,
      JE: (o, p) => p in o,
      JF: x0 => x0.pointerId,
      JG: x0 => x0.parentElement,
      JH: x0 => x0.readText(),
      JI: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      JJ: x0 => x0.id,
      JK: (x0,x1,x2) => x0.addEventListener(x1,x2),
      JL: x0 => x0.locks,
      JM: x0 => x0.r,
      JN: x0 => x0.result,
      JO: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      JP: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      JQ: x0 => x0.s,
      JR: (x0,x1,x2) => ({d: x0,i: x1,t: x2}),
      JS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      JT: (x0,x1) => x0.createImageBitmap(x1),
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (x0,x1) => { x0.textContent = x1 },
      KF: x0 => x0.getCoalescedEvents(),
      KG: (x0,x1) => x0.querySelectorAll(x1),
      KH: x0 => x0.clipboard,
      KI: (x0,x1) => x0.forEach(x1),
      KJ: x0 => x0.offsetHeight,
      KK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KL: (o, p, v) => o[p] = v,
      KM: x0 => x0.i,
      KN: (x0,x1) => { x0.onupgradeneeded = x1 },
      KO: () => globalThis.Promise.resolve(),
      KP: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      KQ: x0 => x0.d,
      KR: (x0,x1,x2) => ({d: x0,i: x1,t: x2}),
      KS: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      KT: (x0,x1) => x0.appendChild(x1),
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.clientX,
      LE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LF: (x0,x1) => x0.getModifierState(x1),
      LG: (x0,x1) => x0.requestAnimationFrame(x1),
      LH: (x0,x1) => x0.writeText(x1),
      LI: x0 => x0.name,
      LJ: x0 => x0.offsetWidth,
      LK: x0 => x0.send(),
      LL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      LM: x0 => x0.r,
      LN: x0 => x0.abort(),
      LO: (x0,x1) => x0.then(x1),
      LP: (x0,x1) => { x0.y = x1 },
      LQ: (x0,x1) => globalThis.fetch(x0,x1),
      LR: (x0,x1) => x0.key(x1),
      LS: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      LT: (x0,x1,x2) => x0.addEventListener(x1,x2),
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: x0 => x0.matches,
      MF: s => s.trimLeft(),
      MG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MH: x0 => x0.unlock(),
      MI: x0 => x0.statusText,
      MJ: x0 => x0.stopPropagation(),
      MK: x0 => x0.status,
      ML: (o,s,v) => o[s] = v,
      MM: x0 => x0.req,
      MN: x0 => x0.transaction,
      MO: x0 => x0.commit(),
      MP: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      MQ: (x0,x1) => x0.sqlite3session_delete(x1),
      MR: x0 => x0.length,
      MS: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      MT: (x0,x1) => x0.removeChild(x1),
      N: o => String(o),
      NB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: x0 => x0.getBoundingClientRect(),
      NE: (x0,x1) => x0.matchMedia(x1),
      NF: s => s.toUpperCase(),
      NG: x0 => x0.now(),
      NH: (x0,x1) => x0.lock(x1),
      NI: x0 => x0.url,
      NJ: x0 => x0.disabled,
      NK: x0 => x0.response,
      NL: () => Symbol("jsBoxedDartObjectProperty"),
      NM: x0 => x0.requestId,
      NN: x0 => x0.name,
      NO: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      NP: (x0,x1) => { x0.x = x1 },
      NQ: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      NR: (x0,x1) => x0.transferFromImageBitmap(x1),
      NS: x0 => x0.height,
      NT: x0 => x0.firstChild,
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: x0 => x0.matches,
      OF: x0 => x0.pop(),
      OG: x0 => x0.performance,
      OH: x0 => x0.orientation,
      OI: x0 => x0.status,
      OJ: (x0,x1) => { x0.min = x1 },
      OK: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      OL: (x0,x1) => x0.call(x1),
      OM: x0 => x0.requestId,
      ON: x0 => x0.kind,
      OO: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      OP: (x0,x1) => { x0.i = x1 },
      OQ: x0 => x0.exports,
      OR: (x0,x1) => x0.getContext(x1),
      OS: x0 => x0.width,
      OT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      PF: x0 => x0.flags,
      PG: (d, digits) => d.toFixed(digits),
      PH: (x0,x1) => x0.querySelector(x1),
      PI: x0 => x0.getReader(),
      PJ: (x0,x1) => { x0.max = x1 },
      PK: (x0,x1) => { x0.responseType = x1 },
      PL: (x0,x1) => x0.abort(x1),
      PM: (x0,x1) => ({requestId: x0,payload: x1}),
      PN: () => globalThis.Symbol.asyncIterator,
      PO: (x0,x1) => { x0.onerror = x1 },
      PP: x0 => globalThis.Number(x0),
      PQ: x0 => x0.call(),
      PR: (x0,x1) => { x0.height = x1 },
      PS: (x0,x1) => x0.getContext(x1),
      PT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      QC: (x0,x1) => x0.item(x1),
      QD: Date.now,
      QE: f => f.dartFunction,
      QF: (a, s) => a.join(s),
      QG: x0 => x0.maxHeight,
      QH: (x0,x1) => { x0.title = x1 },
      QI: x0 => x0.read(),
      QJ: (x0,x1) => { x0.disabled = x1 },
      QK: () => new XMLHttpRequest(),
      QL: () => globalThis.navigator,
      QM: (x0,x1,x2) => ({requestId: x0,recognizedType: x1,errorMessage: x2}),
      QN: x0 => x0.next(),
      QO: x0 => new DOMException(x0),
      QP: x0 => globalThis.Number.isSafeInteger(x0),
      QQ: x0 => x0.instance,
      QR: (x0,x1) => { x0.width = x1 },
      QS: (x0,x1) => { x0.height = x1 },
      QT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RF: (x0,x1) => x0.error(x1),
      RG: x0 => x0.maxWidth,
      RH: (x0,x1) => x0.vibrate(x1),
      RI: x0 => x0.value,
      RJ: (x0,x1) => { x0.scrollLeft = x1 },
      RK: x0 => x0.input,
      RL: (x0,x1,x2,x3,x4) => ({r: x0,z: x1,i: x2,d: x3,t: x4}),
      RM: x0 => x0.payload,
      RN: x0 => x0.value,
      RO: x0 => x0.error,
      RP: (x0,x1,x2) => x0.setUint8(x1,x2),
      RQ: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      RR: x0 => x0.height,
      RS: (x0,x1) => { x0.width = x1 },
      RT: x0 => x0.parentNode,
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: x0 => new Float32Array(x0),
      SC: (x0,x1) => x0.querySelectorAll(x1),
      SD: (x0,x1) => x0.closest(x1),
      SE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SF: () => globalThis.console,
      SG: x0 => x0.minHeight,
      SH: x0 => x0.arrayBuffer(),
      SI: x0 => x0.done,
      SJ: (x0,x1) => { x0.spellcheck = x1 },
      SK: () => globalThis.window.navigator.userAgent,
      SL: x0 => ({rawKind: x0}),
      SM: x0 => x0.type,
      SN: x0 => x0.done,
      SO: (x0,x1) => { x0.onabort = x1 },
      SP: (x0,x1) => x0.transfer(x1),
      SQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      SR: x0 => x0.width,
      SS: x0 => x0.height,
      ST: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      T: o => o instanceof RegExp,
      TB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      TC: (x0,x1) => x0.getAttribute(x1),
      TD: x0 => x0.bottom,
      TE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      TF: s => s.trimRight(),
      TG: x0 => x0.minWidth,
      TH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      TI: x0 => x0.cancel(),
      TJ: (x0,x1) => { x0.disabled = x1 },
      TK: x0 => ({type: x0}),
      TL: () => new FileReader(),
      TM: (x0,x1) => ({requestId: x0,content: x1}),
      TN: x0 => ({create: x0}),
      TO: (x0,x1) => { x0.oncomplete = x1 },
      TP: (x0,x1,x2) => x0.slice(x1,x2),
      TQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      TR: x0 => x0.rasterEndMilliseconds,
      TS: x0 => x0.width,
      TT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: x0 => x0.top,
      UE: (o, i) => o[i],
      UF: x0 => x0.blur(),
      UG: (x0,x1) => x0.removeProperty(x1),
      UH: x0 => x0.status,
      UI: x0 => x0.body,
      UJ: (x0,x1) => x0.revokeObjectURL(x1),
      UK: (x0,x1) => new Blob(x0,x1),
      UL: (x0,x1) => x0.readAsArrayBuffer(x1),
      UM: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11) => ({databaseName: x0,crudThrottleTimeMs: x1,requestId: x2,retryDelayMs: x3,implementationName: x4,schemaJson: x5,lockName: x6,syncParamsEncoded: x7,subscriptions: x8,appMetadataEncoded: x9,customHttpClient: x10,checkpointModeRequestsDelay: x11}),
      UN: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      UO: (x0,x1) => x0.objectStore(x1),
      UP: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      UQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      UR: x0 => x0.rasterStartMilliseconds,
      US: (x0,x1) => { x0.src = x1 },
      UT: (x0,x1) => { x0.draggable = x1 },
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.appendChild(x1),
      VD: x0 => x0.right,
      VE: o => o.length,
      VF: x0 => x0.button,
      VG: (x0,x1) => x0.add(x1),
      VH: (x0,x1) => x0.fetch(x1),
      VI: x0 => x0.headers,
      VJ: (x0,x1) => { x0.src = x1 },
      VK: x0 => globalThis.URL.createObjectURL(x0),
      VL: x0 => x0.result,
      VM: x0 => x0.randomUUID(),
      VN: x0 => x0.getDirectory(),
      VO: (x0,x1) => x0.openCursor(x1),
      VP: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      VQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      VR: x0 => x0.imageBitmaps,
      VS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      VT: x0 => x0.length,
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new ArrayBuffer(x0),
      WC: (x0,x1) => x0.append(x1),
      WD: x0 => x0.left,
      WE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      WF: x0 => x0.innerHeight,
      WG: x0 => x0.data,
      WH: x0 => x0.content,
      WI: x0 => x0.signal,
      WJ: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      WK: (x0,x1) => x0.createElement(x1),
      WL: () => new XMLHttpRequest(),
      WM: x0 => x0.port,
      WN: x0 => x0.storage,
      WO: x0 => x0.arrayBuffer(),
      WP: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      WQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      WR: x0 => x0.canvasKitMaximumSurfaces,
      WS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WT: x0 => x0.getReader(),
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.clientY,
      XE: x0 => x0.language,
      XF: x0 => x0.innerWidth,
      XG: (x0,x1) => { x0.scrollTop = x1 },
      XH: x0 => x0.document,
      XI: x0 => x0.abort(),
      XJ: x0 => x0.naturalHeight,
      XK: x0 => x0.click(),
      XL: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      XM: x0 => x0.port2,
      XN: () => globalThis.navigator,
      XO: () => globalThis.Blob,
      XP: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      XQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      XR: x0 => x0.nextSibling,
      XS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      XT: x0 => x0.value,
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientX,
      YE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      YF: x0 => x0.height,
      YG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      YH: (x0,x1) => x0.getItem(x1),
      YI: x0 => new Uint8Array(x0),
      YJ: x0 => x0.naturalWidth,
      YK: x0 => x0.remove(),
      YL: x0 => x0.send(),
      YM: x0 => x0.port1,
      YN: (x0,x1) => x0.open(x1),
      YO: x0 => x0.value,
      YP: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      YQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      YR: (x0,x1) => x0.debug(x1),
      YS: (x0,x1) => { x0.onerror = x1 },
      YT: x0 => x0.done,
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.changedTouches,
      ZE: () => globalThis.window.FinalizationRegistry,
      ZF: x0 => x0.width,
      ZG: (x0,x1) => { x0.value = x1 },
      ZH: x0 => x0.localStorage,
      ZI: (x0,x1,x2) => x0.slice(x1,x2),
      ZJ: x0 => x0.decode(),
      ZK: x0 => globalThis.URL.revokeObjectURL(x0),
      ZL: x0 => x0.type,
      ZM: (x0,x1,x2,x3) => ({rawKind: x0,rawSql: x1,rawParameters: x2,typeInfo: x3}),
      ZN: (x0,x1) => x0.deleteDatabase(x1),
      ZO: x0 => x0.key,
      ZP: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      ZQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      ZR: x0 => x0.hostElement,
      ZS: (x0,x1) => { x0.oncancel = x1 },
      ZT: x0 => x0.read(),
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.offsetY,
      aE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aF: x0 => x0.clientHeight,
      aG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      aH: () => globalThis.window,
      aI: (x0,x1) => x0.decode(x1),
      aJ: (x0,x1) => { x0.decoding = x1 },
      aK: (o, a) => o + a,
      aL: x0 => x0.response,
      aM: (x0,x1) => ({rawKind: x0,name: x1}),
      aN: x0 => ({recursive: x0}),
      aO: x0 => x0.continue(),
      aP: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      aQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      aR: x0 => x0.location,
      aS: (x0,x1) => { x0.onchange = x1 },
      aT: x0 => x0.body,
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      bC: x0 => x0.console,
      bD: x0 => x0.offsetX,
      bE: x0 => new window.FinalizationRegistry(x0),
      bF: x0 => x0.clientWidth,
      bG: (x0,x1) => { x0.value = x1 },
      bH: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      bI: (x0,x1) => x0.adoptText(x1),
      bJ: (x0,x1) => { x0.crossOrigin = x1 },
      bK: x0 => x0.body,
      bL: (x0,x1) => { x0.responseType = x1 },
      bM: x0 => ({useMultipleCiphersVfs: x0}),
      bN: (x0,x1,x2) => x0.removeEntry(x1,x2),
      bO: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      bP: (x0,x1) => x0.set(x1),
      bQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bR: (x0,x1) => x0.getModifierState(x1),
      bS: x0 => x0.type,
      bT: (x0,x1) => new OffscreenCanvas(x0,x1),
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.type,
      cE: (x0,x1) => x0.unregister(x1),
      cF: (x0,x1) => { x0.content = x1 },
      cG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      cH: x0 => x0.history,
      cI: x0 => x0.first(),
      cJ: (x0,x1) => x0.createObjectURL(x1),
      cK: (x0,x1) => { x0.download = x1 },
      cL: x0 => x0.vendor,
      cM: (x0,x1,x2,x3) => ({a: x0,i: x1,d: x2,t: x3}),
      cN: (x0,x1) => x0.createSyncAccessHandle(x1),
      cO: x0 => x0.length,
      cP: (x0,x1) => x0.sqlite3_column_count(x1),
      cQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      cR: x0 => x0.metaKey,
      cS: x0 => x0.lastModified,
      cT: x0 => x0.assetBase,
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.maxTouchPoints,
      dE: (x0,x1) => x0.contains(x1),
      dF: (x0,x1) => { x0.name = x1 },
      dG: x0 => x0.value,
      dH: x0 => x0.href,
      dI: x0 => x0.next(),
      dJ: x0 => x0.URL,
      dK: (x0,x1) => { x0.display = x1 },
      dL: x0 => x0.navigator,
      dM: x0 => x0.d,
      dN: x0 => x0.createSyncAccessHandle(),
      dO: (x0,x1) => x0.get(x1),
      dP: x0 => x0.s,
      dQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      dR: x0 => x0.altKey,
      dS: x0 => x0.name,
      dT: x0 => x0.loader,
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.platform,
      eE: (s) => +s,
      eF: x0 => x0.head,
      eG: x0 => x0.selectionDirection,
      eH: x0 => x0.location,
      eI: x0 => x0.current(),
      eJ: x0 => new Blob(x0),
      eK: x0 => x0.style,
      eL: x0 => new Blob(x0),
      eM: (x0,x1,x2,x3) => ({a: x0,i: x1,d: x2,t: x3}),
      eN: x0 => ({mode: x0}),
      eO: (x0,x1) => x0.index(x1),
      eP: x0 => x0.r,
      eQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      eR: x0 => x0.ctrlKey,
      eS: (x0,x1) => x0.item(x1),
      eT: () => globalThis._flutter,
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o) => new DataView(b, o),
      fC: x0 => x0.length,
      fD: x0 => x0.body,
      fE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      fF: (x0,x1) => x0.removeChild(x1),
      fG: x0 => x0.selectionStart,
      fH: (x0,x1) => x0.removeItem(x1),
      fI: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      fJ: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      fK: (x0,x1) => { x0.href = x1 },
      fL: x0 => x0.size,
      fM: (x0,x1,x2,x3) => ({a: x0,i: x1,d: x2,t: x3}),
      fN: x0 => ({create: x0}),
      fO: x0 => x0.openKeyCursor(),
      fP: x0 => x0.p,
      fQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      fR: x0 => x0.isComposing,
      fS: x0 => x0.length,
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: () => globalThis.document,
      gE: s => s.trim(),
      gF: x0 => x0.firstChild,
      gG: x0 => x0.selectionEnd,
      gH: (x0,x1,x2) => x0.setItem(x1,x2),
      gI: x0 => x0.v8BreakIterator,
      gJ: x0 => new window.ImageDecoder(x0),
      gK: () => globalThis.document,
      gL: x0 => globalThis.fetch(x0),
      gM: x0 => x0.r,
      gN: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      gO: x0 => x0.primaryKey,
      gP: (x0,x1) => x0.sqlite3_get_autocommit(x1),
      gQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      gR: x0 => x0.code,
      gS: x0 => x0.files,
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hE: x0 => x0.classList,
      hF: x0 => x0.viewConstraints,
      hG: x0 => x0.value,
      hH: (handle) => clearInterval(handle),
      hI: () => globalThis.Intl,
      hJ: x0 => x0.name,
      hK: (x0,x1,x2,x3) => ({z: x0,i: x1,d: x2,t: x3}),
      hL: x0 => x0.arrayBuffer(),
      hM: x0 => x0.u,
      hN: x0 => x0.d,
      hO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      hP: x0 => x0.c,
      hQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hR: x0 => x0.repeat,
      hS: (x0,x1) => x0.replaceChildren(x1),
      i: x0 => new Promise(x0),
      iB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      iC: (a, i) => a[i],
      iD: x0 => x0.hasFocus(),
      iE: x0 => x0.preventDefault(),
      iF: x0 => x0.hostElement,
      iG: x0 => x0.selectionDirection,
      iH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      iI: (x0,x1) => x0.segment(x1),
      iJ: x0 => x0.repetitionCount,
      iK: x0 => x0.r,
      iL: (x0,x1) => x0.getRandomValues(x1),
      iM: x0 => x0.k,
      iN: (x0,x1) => x0.dart_sqlite3_unregister_vfs(x1),
      iO: x0 => ({autoIncrement: x0}),
      iP: x0 => x0.z,
      iQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      iR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iS: (x0,x1) => { x0.accept = x1 },
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.relatedTarget,
      jE: x0 => x0.parent,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: x0 => x0.selectionStart,
      jH: () => Date.now(),
      jI: x0 => x0.index,
      jJ: x0 => x0.frameCount,
      jK: x0 => x0.e,
      jL: () => globalThis.crypto,
      jM: (x0,x1,x2,x3,x4,x5,x6,x7) => ({u: x0,d: x1,s: x2,o: x3,a: x4,c: x5,i: x6,t: x7}),
      jN: (x0,x1) => x0.unregister(x1),
      jO: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      jP: (x0,x1) => ({name: x0,length: x1}),
      jQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      jR: x0 => x0.userAgent,
      jS: (x0,x1) => { x0.multiple = x1 },
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: (t, s) => t.set(s),
      kC: (x0,x1) => x0.test(x1),
      kD: x0 => x0.shiftKey,
      kE: x0 => x0.timeStamp,
      kF: x0 => ({runApp: x0}),
      kG: x0 => x0.selectionEnd,
      kH: () => new Array(),
      kI: x0 => x0.next(),
      kJ: x0 => x0.selectedTrack,
      kK: x0 => globalThis.Number(x0),
      kL: l => new DataView(new ArrayBuffer(l)),
      kM: x0 => x0.aborted,
      kN: (x0,x1) => x0.sqlite3_finalize(x1),
      kO: x0 => ({unique: x0}),
      kP: (x0,x1) => x0.update(x1),
      kQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kR: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      kS: (x0,x1) => { x0.type = x1 },
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: (decoder, codeUnits) => decoder.decode(codeUnits),
      lE: (x0,x1) => x0.hasAttribute(x1),
      lF: () => Date.now(),
      lG: x0 => x0.keyCode,
      lH: (x0,x1) => new WebSocket(x0,x1),
      lI: x0 => x0.value,
      lJ: x0 => x0.completed,
      lK: x0 => x0.r,
      lL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      lM: x0 => ({steal: x0}),
      lN: (x0,x1) => x0.sqlite3_reset(x1),
      lO: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      lP: x0 => x0.name,
      lQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      lR: (x0,x1,x2) => x0.setAttribute(x1,x2),
      lS: (x0,x1) => x0.query(x1),
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: () => new TextDecoder("utf-8", {fatal: true}),
      mE: x0 => x0.buttons,
      mF: () => typeof dartUseDateNowForTicks !== "undefined",
      mG: (x0,x1) => x0.scrollIntoView(x1),
      mH: x0 => x0.reason,
      mI: x0 => x0.done,
      mJ: x0 => x0.ready,
      mK: x0 => x0.s,
      mL: x0 => new FinalizationRegistry(x0),
      mM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      mN: (x0,x1) => ({d: x0,t: x1}),
      mO: (x0,x1) => x0.createObjectStore(x1),
      mP: x0 => globalThis.IDBKeyRange.only(x0),
      mQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      mR: (x0,x1) => { x0.cursor = x1 },
      mS: x0 => x0.state,
      n: (o0, o1) => [o0, o1],
      nB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      nC: Function.prototype.call.bind(String.prototype.toLowerCase),
      nD: () => new TextDecoder("utf-8", {fatal: false}),
      nE: x0 => x0.ctrlKey,
      nF: () => 1000 * performance.now(),
      nG: x0 => x0.multiViewEnabled,
      nH: x0 => x0.code,
      nI: (o, m, a) => o[m].apply(o, a),
      nJ: x0 => x0.tracks,
      nK: x0 => x0.t,
      nL: () => globalThis.FinalizationRegistry,
      nM: x0 => x0.close(),
      nN: (x0,x1,x2) => x0.dart_sqlite3_commits(x1,x2),
      nO: x0 => x0.oldVersion,
      nP: (x0,x1,x2) => x0.put(x1,x2),
      nQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      nR: (x0,x1) => { x0.height = x1 },
      nS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: (a, i, v) => a[i] = v,
      oE: x0 => x0.y,
      oF: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      oG: (x0,x1) => x0.replaceWith(x1),
      oH: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      oI: x0 => x0.iterator,
      oJ: x0 => x0.close(),
      oK: (x0,x1) => ({i: x0,t: x1}),
      oL: x0 => new SharedWorker(x0),
      oM: (x0,x1) => { x0.signal = x1 },
      oN: x0 => x0.getSize(),
      oO: () => globalThis.indexedDB,
      oP: (x0,x1) => x0.getKey(x1),
      oQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      oR: (x0,x1) => { x0.width = x1 },
      oS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      pC: x0 => x0.vendor,
      pD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      pE: x0 => x0.x,
      pF: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      pG: (x0,x1) => { x0.type = x1 },
      pH: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      pI: () => globalThis.Symbol,
      pJ: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      pK: (x0,x1,x2) => x0.postMessage(x1,x2),
      pL: () => new MessageChannel(),
      pM: () => globalThis.navigator,
      pN: (x0,x1) => x0.truncate(x1),
      pO: (x0,x1) => new URL(x0,x1),
      pP: (x0,x1) => x0.delete(x1),
      pQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      pR: (x0,x1) => { x0.opacity = x1 },
      pS: (x0,x1,x2) => ({enableHighAccuracy: x0,timeout: x1,maximumAge: x2}),
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: Function.prototype.call.bind(DataView.prototype.getInt32),
      qC: (x0,x1) => x0.createTextNode(x1),
      qD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      qE: x0 => x0.scrollTop,
      qF: (map, o, v) => map.set(o, v),
      qG: (x0,x1) => { x0.className = x1 },
      qH: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qI: (x0,x1) => new Intl.Segmenter(x0,x1),
      qJ: (x0,x1) => x0.decode(x1),
      qK: (x0,x1) => x0.push(x1),
      qL: x0 => x0.start(),
      qM: x0 => x0.error,
      qN: x0 => ({at: x0}),
      qO: x0 => x0.pathname,
      qP: (x0,x1) => x0.put(x1),
      qQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      qR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qS: (x0,x1,x2,x3) => x0.getCurrentPosition(x1,x2,x3),
      r: (o, p) => o[p],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      rC: (x0,x1) => { x0.id = x1 },
      rD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      rE: x0 => x0.offsetTop,
      rF: () => new WeakMap(),
      rG: (x0,x1) => { x0.tabIndex = x1 },
      rH: (o, t) => typeof o === t,
      rI: x0 => x0.Segmenter,
      rJ: x0 => x0.displayHeight,
      rK: x0 => x0.v,
      rL: (x0,x1) => ({isForSyncWorker: x0,message: x1}),
      rM: x0 => x0.i,
      rN: (x0,x1) => x0.write(x1),
      rO: x0 => x0.a,
      rP: x0 => x0.flush(),
      rQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      rR: x0 => x0.preventDefault(),
      rS: x0 => x0.message,
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: x0 => x0.visibilityState,
      sE: x0 => x0.scrollLeft,
      sF: (map, o) => map.get(o),
      sG: (x0,x1) => { x0.name = x1 },
      sH: x0 => x0.data,
      sI: x0 => x0.buffer,
      sJ: x0 => x0.displayWidth,
      sK: x0 => x0.r,
      sL: (x0,x1) => ({type: x0,payload: x1}),
      sM: (x0,x1) => x0.error(x1),
      sN: (x0,x1,x2) => x0.write(x1,x2),
      sO: x0 => x0.d,
      sP: (x0,x1) => x0.read(x1),
      sQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      sR: x0 => x0.shiftKey,
      sS: x0 => x0.code,
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      tE: x0 => x0.offsetLeft,
      tF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      tG: (x0,x1) => { x0.placeholder = x1 },
      tH: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tI: x0 => x0.wasmMemory,
      tJ: x0 => x0.duration,
      tK: () => globalThis.ArrayBuffer,
      tL: (x0,x1) => x0.postMessage(x1),
      tM: (x0,x1,x2,x3,x4) => ({e: x0,s: x1,r: x2,i: x3,t: x4}),
      tN: (x0,x1,x2) => x0.dart_sqlite3_updates(x1,x2),
      tO: (x0,x1) => ({d: x0,t: x1}),
      tP: (x0,x1,x2) => x0.read(x1,x2),
      tQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      tR: x0 => x0.metaKey,
      tS: x0 => x0.speed,
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: x0 => x0.disconnect(),
      uE: x0 => x0.offsetParent,
      uF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      uG: (x0,x1) => { x0.autocomplete = x1 },
      uH: (x0,x1,x2) => x0.close(x1,x2),
      uI: () => globalThis.window._flutter_skwasmInstance,
      uJ: x0 => x0.image,
      uK: x0 => x0.v,
      uL: x0 => x0.uploadError,
      uM: () => globalThis.console,
      uN: x0 => x0.buffer,
      uO: (x0,x1,x2) => x0.dart_sqlite3_rollbacks(x1,x2),
      uP: x0 => x0.f,
      uQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      uR: x0 => x0.altKey,
      uS: x0 => x0.heading,
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => new Intl.Locale(x0),
      vE: (o, p, r) => o.replace(p, () => r),
      vF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      vG: (x0,x1) => { x0.name = x1 },
      vH: (x0,x1) => x0.close(x1),
      vI: () => new TextDecoder(),
      vJ: () => globalThis.window.ImageDecoder,
      vK: x0 => x0.b,
      vL: x0 => x0.downloadError,
      vM: (x0,x1,x2) => ({r: x0,i: x1,t: x2}),
      vN: (x0,x1) => x0.sqlite3_errstr(x1),
      vO: (x0,x1,x2,x3,x4) => ({k: x0,u: x1,r: x2,d: x3,t: x4}),
      vP: x0 => x0.f,
      vQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      vR: x0 => x0.ctrlKey,
      vS: x0 => x0.accuracy,
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: x0 => x0.region,
      wE: (o, p, r) => o.replaceAll(p, () => r),
      wF: o => o.byteLength,
      wG: (x0,x1) => { x0.placeholder = x1 },
      wH: x0 => x0.close(),
      wI: (a, i) => a.splice(i, 1),
      wJ: x0 => x0.naturalHeight,
      wK: x0 => x0.port,
      wL: x0 => x0.uploading,
      wM: x0 => x0.rawSql,
      wN: (x0,x1) => x0.sqlite3_errmsg(x1),
      wO: (x0,x1,x2) => ({r: x0,i: x1,t: x2}),
      wP: x0 => x0.b,
      wQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      wR: (x0,x1) => x0.getAttribute(x1),
      wS: x0 => x0.altitudeAccuracy,
      x: x0 => x0.random(),
      xB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      xC: x0 => x0.scale,
      xD: x0 => x0.script,
      xE: x0 => x0.deltaMode,
      xF: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      xG: (x0,x1) => { x0.action = x1 },
      xH: (x0,x1) => x0.send(x1),
      xI: a => a.pop(),
      xJ: x0 => x0.naturalWidth,
      xK: x0 => x0.r,
      xL: x0 => x0.core,
      xM: x0 => x0.rawParameters,
      xN: (x0,x1) => x0.sqlite3_error_offset(x1),
      xO: x0 => x0.z,
      xP: x0 => x0.a,
      xQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      xR: (x0,x1) => x0.closest(x1),
      xS: x0 => x0.altitude,
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.language,
      yE: x0 => x0.deltaY,
      yF: x0 => x0.history,
      yG: (x0,x1) => { x0.method = x1 },
      yH: x0 => x0.readyState,
      yI: x0 => x0.debugSkipFontRetryDelay,
      yJ: (x0,x1) => x0.createElement(x1),
      yK: (x0,x1) => { x0.i = x1 },
      yL: (x0,x1,x2) => ({databaseName: x0,databasePort: x1,lockName: x2}),
      yM: x0 => x0.rawKind,
      yN: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      yO: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      yP: (x0,x1) => ({a: x0,b: x1}),
      yQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      yR: x0 => x0.tagName,
      yS: x0 => x0.timestamp,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.languages,
      zE: x0 => x0.deltaX,
      zF: x0 => x0.search,
      zG: (x0,x1) => { x0.noValidate = x1 },
      zH: (x0,x1) => { x0.binaryType = x1 },
      zI: (x0,x1,x2) => x0.set(x1,x2),
      zJ: (x0,x1) => { x0.pointerEvents = x1 },
      zK: (x0,x1,x2) => ({i: x0,d: x1,t: x2}),
      zL: (x0,x1,x2,x3) => ({endpoint: x0,token: x1,userId: x2,expiresAt: x3}),
      zM: x0 => x0.r,
      zN: (x0,x1) => x0.sqlite3_close_v2(x1),
      zO: (x0,x1) => { x0.onabort = x1 },
      zP: x0 => x0.name,
      zQ: () => globalThis.WebAssembly,
      zR: x0 => x0.target,
      zS: x0 => x0.longitude,

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
