/**
 * ToolForge Smart Unit Converter (Bidirectional)
 */

(function () {
  'use strict';

  let currentCategory = 'length';

  const catBtns = document.querySelectorAll('.uc-cat-btn');
  const valFrom = document.getElementById('uc-val-from');
  const valTo = document.getElementById('uc-val-to');
  const unitFrom = document.getElementById('uc-unit-from');
  const unitTo = document.getElementById('uc-unit-to');
  const swapBtn = document.getElementById('uc-swap-btn');
  const formulaText = document.getElementById('uc-formula-text');
  const copyBtn = document.getElementById('uc-copy-result');

  const unitDefinitions = {
    length: {
      units: [
        { id: 'meter', name: 'Meters (m)', factor: 1 },
        { id: 'kilometer', name: 'Kilometers (km)', factor: 1000 },
        { id: 'centimeter', name: 'Centimeters (cm)', factor: 0.01 },
        { id: 'millimeter', name: 'Millimeters (mm)', factor: 0.001 },
        { id: 'mile', name: 'Miles (mi)', factor: 1609.344 },
        { id: 'yard', name: 'Yards (yd)', factor: 0.9144 },
        { id: 'foot', name: 'Feet (ft)', factor: 0.3048 },
        { id: 'inch', name: 'Inches (in)', factor: 0.0254 }
      ],
      defaultFrom: 'meter',
      defaultTo: 'foot'
    },
    mass: {
      units: [
        { id: 'kilogram', name: 'Kilograms (kg)', factor: 1 },
        { id: 'gram', name: 'Grams (g)', factor: 0.001 },
        { id: 'milligram', name: 'Milligrams (mg)', factor: 0.000001 },
        { id: 'pound', name: 'Pounds (lb)', factor: 0.45359237 },
        { id: 'ounce', name: 'Ounces (oz)', factor: 0.028349523 },
        { id: 'metric_ton', name: 'Metric Tons (t)', factor: 1000 }
      ],
      defaultFrom: 'kilogram',
      defaultTo: 'pound'
    },
    temperature: {
      units: [
        { id: 'celsius', name: 'Celsius (°C)' },
        { id: 'fahrenheit', name: 'Fahrenheit (°F)' },
        { id: 'kelvin', name: 'Kelvin (K)' }
      ],
      defaultFrom: 'celsius',
      defaultTo: 'fahrenheit'
    },
    digital: {
      units: [
        { id: 'b', name: 'Bytes (B)', factor: 1 },
        { id: 'kb', name: 'Kilobytes (KB)', factor: 1024 },
        { id: 'mb', name: 'Megabytes (MB)', factor: 1024 * 1024 },
        { id: 'gb', name: 'Gigabytes (GB)', factor: 1024 * 1024 * 1024 },
        { id: 'tb', name: 'Terabytes (TB)', factor: 1024 * 1024 * 1024 * 1024 }
      ],
      defaultFrom: 'gb',
      defaultTo: 'mb'
    },
    area: {
      units: [
        { id: 'sq_meter', name: 'Square Meters (m²)', factor: 1 },
        { id: 'sq_km', name: 'Square Kilometers (km²)', factor: 1000000 },
        { id: 'sq_foot', name: 'Square Feet (ft²)', factor: 0.092903 },
        { id: 'acre', name: 'Acres', factor: 4046.856 },
        { id: 'hectare', name: 'Hectares', factor: 10000 }
      ],
      defaultFrom: 'sq_meter',
      defaultTo: 'sq_foot'
    },
    speed: {
      units: [
        { id: 'mps', name: 'Meters / sec (m/s)', factor: 1 },
        { id: 'kph', name: 'Kilometers / hour (km/h)', factor: 0.277778 },
        { id: 'mph', name: 'Miles / hour (mph)', factor: 0.44704 },
        { id: 'knot', name: 'Knots (kn)', factor: 0.514444 }
      ],
      defaultFrom: 'kph',
      defaultTo: 'mph'
    }
  };

  const populateUnits = (cat) => {
    const def = unitDefinitions[cat];
    unitFrom.innerHTML = def.units.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    unitTo.innerHTML = def.units.map(u => `<option value="${u.id}">${u.name}</option>`).join('');

    unitFrom.value = def.defaultFrom;
    unitTo.value = def.defaultTo;
  };

  const convertValue = (val, from, to, cat) => {
    if (isNaN(val)) return 0;
    if (from === to) return val;

    if (cat === 'temperature') {
      let kelvin = 0;
      if (from === 'celsius') kelvin = val + 273.15;
      else if (from === 'fahrenheit') kelvin = (val - 32) * (5 / 9) + 273.15;
      else kelvin = val;

      if (to === 'celsius') return kelvin - 273.15;
      if (to === 'fahrenheit') return (kelvin - 273.15) * 9 / 5 + 32;
      return kelvin;
    }

    const units = unitDefinitions[cat].units;
    const fromUnit = units.find(u => u.id === from);
    const toUnit = units.find(u => u.id === to);

    if (!fromUnit || !toUnit) return val;

    const baseVal = val * fromUnit.factor;
    return baseVal / toUnit.factor;
  };

  const updateFrom = () => {
    const val = parseFloat(valFrom.value);
    const from = unitFrom.value;
    const to = unitTo.value;
    const result = convertValue(val, from, to, currentCategory);
    valTo.value = isNaN(result) ? '' : Math.round(result * 100000) / 100000;
    updateFormula();
  };

  const updateTo = () => {
    const val = parseFloat(valTo.value);
    const from = unitFrom.value;
    const to = unitTo.value;
    const result = convertValue(val, to, from, currentCategory);
    valFrom.value = isNaN(result) ? '' : Math.round(result * 100000) / 100000;
    updateFormula();
  };

  const updateFormula = () => {
    const fromName = unitFrom.options[unitFrom.selectedIndex]?.text || unitFrom.value;
    const toName = unitTo.options[unitTo.selectedIndex]?.text || unitTo.value;
    const oneResult = convertValue(1, unitFrom.value, unitTo.value, currentCategory);
    formulaText.textContent = `1 ${fromName} = ${Math.round(oneResult * 10000) / 10000} ${toName}`;
  };

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat');
      populateUnits(currentCategory);
      valFrom.value = '1';
      updateFrom();
    });
  });

  unitFrom.addEventListener('change', updateFrom);
  unitTo.addEventListener('change', updateFrom);
  valFrom.addEventListener('input', updateFrom);
  valTo.addEventListener('input', updateTo);

  swapBtn.addEventListener('click', () => {
    const temp = unitFrom.value;
    unitFrom.value = unitTo.value;
    unitTo.value = temp;
    updateFrom();
  });

  copyBtn.addEventListener('click', () => {
    const text = `${valFrom.value} ${unitFrom.options[unitFrom.selectedIndex].text} = ${valTo.value} ${unitTo.options[unitTo.selectedIndex].text}`;
    window.copyToClipboard(text, 'Converted value copied!');
  });

  // Init
  populateUnits('length');
  updateFrom();

})();
