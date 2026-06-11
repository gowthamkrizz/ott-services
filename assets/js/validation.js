/* ============================================================
   STACKLY — Form Validation Module
   ============================================================ */

const Validator = (() => {
  /* ── Helpers ── */
  const show = (el) => el && el.classList.add('show');
  const hide = (el) => el && el.classList.remove('show');
  const setErr = (input, msg) => {
    input.classList.remove('success');
    input.classList.add('error');
    const err = input.parentElement.querySelector('.form-error') ||
                input.closest('.form-group')?.querySelector('.form-error');
    if (err) { err.textContent = msg; show(err); }
    return false;
  };
  const setOk = (input) => {
    input.classList.remove('error');
    input.classList.add('success');
    const err = input.parentElement.querySelector('.form-error') ||
                input.closest('.form-group')?.querySelector('.form-error');
    if (err) hide(err);
    return true;
  };
  const reset = (input) => {
    input.classList.remove('error', 'success');
    const err = input.parentElement.querySelector('.form-error') ||
                input.closest('.form-group')?.querySelector('.form-error');
    if (err) hide(err);
  };

  /* ── Rules ── */
  const rules = {
    required: (val) => val.trim() !== '',
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
    minLen: (val, n) => val.trim().length >= n,
    maxLen: (val, n) => val.trim().length <= n,
    phone: (val) => /^[+]?[\d\s\-()]{7,15}$/.test(val.trim()),
    noSpecial: (val) => /^[a-zA-Z\s]+$/.test(val.trim()),
    strongPw: (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(val),
    match: (val, target) => val === target,
    checked: (el) => el.checked,
    number: (val) => /^\d+$/.test(val.trim()),
    url: (val) => { try { new URL(val); return true; } catch { return false; } }
  };

  /* ── Password Strength ── */
  const pwStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[a-z]/.test(val)) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[!@#$%^&*_\-]/.test(val)) score++;
    return score; // 0-5
  };

  const updateStrengthBar = (input) => {
    const wrap = input.closest('.form-group');
    if (!wrap) return;
    const bar = wrap.querySelector('.pw-strength-bar');
    const label = wrap.querySelector('.pw-strength-label');
    if (!bar) return;
    const score = pwStrength(input.value);
    const pct = (score / 5) * 100;
    bar.style.width = pct + '%';
    const colors = ['#ef4444','#f97316','#eab308','#22c55e','#22c55e'];
    const labels = ['Too Weak','Weak','Fair','Strong','Very Strong'];
    bar.style.background = colors[Math.max(score - 1, 0)];
    if (label) label.textContent = input.value ? labels[Math.max(score - 1, 0)] : '';
  };

  /* ── Field Validator ── */
  const validateField = (input) => {
    const val = input.value;
    const type = input.dataset.validate || '';
    const types = type.split('|');

    for (const t of types) {
      const [rule, ...args] = t.split(':');
      switch (rule) {
        case 'required':
          if (!rules.required(val)) return setErr(input, input.dataset.errRequired || 'This field is required.');
          break;
        case 'email':
          if (val && !rules.email(val)) return setErr(input, input.dataset.errEmail || 'Enter a valid email address.');
          break;
        case 'min':
          if (val && !rules.minLen(val, +args[0])) return setErr(input, input.dataset.errMin || `Minimum ${args[0]} characters required.`);
          break;
        case 'max':
          if (val && !rules.maxLen(val, +args[0])) return setErr(input, `Maximum ${args[0]} characters allowed.`);
          break;
        case 'phone':
          if (val && !rules.phone(val)) return setErr(input, 'Enter a valid phone number.');
          break;
        case 'alpha':
          if (val && !rules.noSpecial(val)) return setErr(input, 'Only letters and spaces allowed.');
          break;
        case 'strong':
          if (val && !rules.strongPw(val)) return setErr(input, 'Must be 8+ chars with upper, lower, number & symbol.');
          break;
        case 'match':
          const target = document.querySelector(args[0]);
          if (target && !rules.match(val, target.value)) return setErr(input, 'Passwords do not match.');
          break;
        case 'checked':
          if (!rules.checked(input)) return setErr(input, 'You must accept to continue.');
          break;
        case 'number':
          if (val && !rules.number(val)) return setErr(input, 'Only numbers allowed.');
          break;
      }
    }
    return setOk(input);
  };

  /* ── Form Validator ── */
  const validateForm = (form) => {
    const fields = form.querySelectorAll('[data-validate]');
    let valid = true;
    fields.forEach(f => { if (!validateField(f)) valid = false; });
    return valid;
  };

  /* ── Init Form ── */
  const initForm = (formSelector, onSuccess) => {
    const forms = document.querySelectorAll(formSelector);
    forms.forEach(form => {
      // Live validation on input
      form.querySelectorAll('[data-validate]').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) validateField(input);
          if (input.type === 'password') updateStrengthBar(input);
        });
      });

      // Submit
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ok = validateForm(form);
        if (ok && typeof onSuccess === 'function') {
          onSuccess(form, new FormData(form));
        } else if (!ok) {
          const firstErr = form.querySelector('[data-validate].error');
          if (firstErr) firstErr.focus();
          showToast('Please fix the errors above.', 'error');
        }
      });
    });
  };

  /* ── Public API ── */
  return { initForm, validateField, validateForm, rules, pwStrength, reset, setErr, setOk };
})();

/* ── Toast helper (shared) ── */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}
