(function () {
	// Elements
	var inputEl = document.getElementById('display');
	var previewEl = document.getElementById('preview');
	var historyEl = document.getElementById('history');
	var keysEl = document.querySelector('.keys');

	// State
	var expr = '';

	// Helpers
	function toOp(ch) {
		if (ch === '÷') return '/';
		if (ch === '×') return '*';
		if (ch === '−') return '-';
		return ch;
	}

	function toSymbol(ch) {
		if (ch === '/') return '÷';
		if (ch === '*') return '×';
		if (ch === '-') return '−';
		return ch;
	}

	function show(str) {
		// Display pretty symbols
		inputEl.value = str.replace(/[/*+-]/g, function (m) { return toSymbol(m); });
	}

	function evalString(s) {
		// Convert pretty symbols to JS ops and handle percentages like 50% -> (50/100)
		var js = s.replace(/[÷×−]/g, function (m) { return toOp(m); });
		js = js.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
		try {
			var out = eval('(' + js + ')');
			return (typeof out === 'number' && isFinite(out)) ? out : '';
		} catch (e) {
			return '';
		}
	}

	function updatePreview() {
		var r = expr.trim() ? evalString(expr) : '';
		previewEl.textContent = (r === '' && r !== 0) ? '' : String(r);
	}

	function redraw() {
		show(expr);
		updatePreview();
	}

	function addToken(t) {
		// Operators: keep last one only
		if (t === '+' || t === '−' || t === '×' || t === '÷' || t === '-' || t === '*' || t === '/') {
			var sym = toSymbol(toOp(t));
			if (!expr && (sym === '+' || sym === '−' || sym === '×' || sym === '÷')) return;
			if (/[+−×÷]$/.test(expr)) expr = expr.slice(0, -1) + sym; else expr += sym;
			return redraw();
		}
		// Single decimal per number block
		if (t === '.') {
			var lastNum = expr.split(/[+−×÷]/).pop() || '';
			if (lastNum.indexOf('.') !== -1) return;
		}
		expr += t;
		redraw();
	}

	function clearAll() {
		expr = '';
		historyEl.textContent = '';
		redraw();
	}

	function backspace() {
		if (expr) {
			expr = expr.slice(0, -1);
			redraw();
		}
	}

	function toggleSign() {
		var parts = expr.split(/([+−×÷])/);
		var last = parts.pop() || '';
		if (!last) return;
		if (/^\-?\d*(?:\.\d+)?%?$/.test(last)) {
			parts.push(last[0] === '-' ? last.slice(1) : '-' + last);
			expr = parts.join('');
			redraw();
		}
	}

	function equalsNow() {
		if (!expr.trim()) return;
		var r = evalString(expr);
		if (r === '' && r !== 0) return;
		historyEl.textContent = inputEl.value + ' =';
		expr = String(r);
		redraw();
	}

	// Mouse / touch input
	keysEl.addEventListener('click', function (e) {
		var btn = e.target.closest('button');
		if (!btn) return;
		var val = btn.getAttribute('data-value');
		var act = btn.getAttribute('data-action');
		if (val !== null) return addToken(val);
		switch (act) {
			case 'clear': return clearAll();
			case 'backspace': return backspace();
			case 'percent': return addToken('%');
			case 'divide': return addToken('÷');
			case 'multiply': return addToken('×');
			case 'subtract': return addToken('−');
			case 'add': return addToken('+');
			case 'sign': return toggleSign();
			case 'equals': return equalsNow();
		}
	});

	// Keyboard input
	window.addEventListener('keydown', function (e) {
		var k = e.key;
		if (/^\d$/.test(k)) { addToken(k); return e.preventDefault(); }
		if (k === '.') { addToken('.'); return e.preventDefault(); }
		if (k === '+') { addToken('+'); return e.preventDefault(); }
		if (k === '-') { addToken('−'); return e.preventDefault(); }
		if (k === '*' || k.toLowerCase() === 'x') { addToken('×'); return e.preventDefault(); }
		if (k === '/') { addToken('÷'); return e.preventDefault(); }
		if (k === '%') { addToken('%'); return e.preventDefault(); }
		if (k === 'Enter' || k === '=') { equalsNow(); return e.preventDefault(); }
		if (k === 'Backspace') { backspace(); return e.preventDefault(); }
		if (k === 'Escape') { clearAll(); return e.preventDefault(); }
	});

	// Typing directly into the input (kept simple)
	inputEl.addEventListener('input', function () {
		var raw = inputEl.value.replace(/[^0-9+\-*/%.()\s÷×−]/g, '');
		raw = raw.replace(/[\/]/g, function (m) { return m === '/' ? '÷' : '×'; }).replace(/-/g, '−');
		raw = raw.replace(/([+−×÷]){2,}/g, '$1');
		expr = raw;
		redraw();
	});

	inputEl.addEventListener('focus', function () {
		var n = inputEl.value.length;
		try { inputEl.setSelectionRange(n, n); } catch (e) {}
	});

	// First paint
	redraw();
})();
