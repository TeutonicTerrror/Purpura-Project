/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.__PurpuraFx) return;


    const BASE_RATES = {
        Regular: 0.0125,
        Premium: 0.01136,
        DevEx: 0.0038
    };


    const RATES = {
        AED: 3.6725, ARS: 1333.9887, AUD: 1.531988, BDT: 121.56904, BGN: 1.6763,
        BHD: 0.377025, BRL: 5.4211, CAD: 1.375032, CHF: 0.802507, CLP: 968.32,
        CNY: 7.1334, COP: 4030.439286, CRC: 504.67446, CZK: 20.974236, DKK: 6.397475,
        DOP: 62.913021, EGP: 48.5706, EUR: 0.857049, GBP: 0.742845, GTQ: 7.663482,
        HKD: 7.795532, HUF: 340.324145, IDR: 16466.24734, ILS: 3.338455, INR: 88.197984,
        ISK: 122.56, JMD: 159.462443, JPY: 147.20031818, KES: 129.15, KRW: 1391.496508,
        KWD: 0.305626, LKR: 302.290731, MXN: 18.682732, MYR: 4.225, NGN: 1536,
        NOK: 10.064215, NZD: 1.699048, OMR: 0.384499, PEN: 3.549939, PHP: 57.191997,
        PKR: 283.468631, PLN: 3.657178, QAR: 3.654266, RON: 4.3492, RUB: 80.498992,
        SAR: 3.752325, SEK: 9.473402, SGD: 1.285283, THB: 32.4, TRY: 41.150177,
        TTD: 6.785526, TWD: 30.5625, UAH: 41.212691, USD: 1, UYU: 40.022165,
        VND: 26343.521322, ZAR: 17.756687
    };

    const codes = Object.keys(RATES).filter(code => code.length === 3).sort();

    let displayNames = null;
    try {
        displayNames = new Intl.DisplayNames([ 'en' ], { type: 'currency' });
    } catch {
        displayNames = null;
    }

    function nameFor(code) {
        try {
            const name = displayNames && displayNames.of(code);
            if (name && name !== code) return name;
        } catch {}
        return code;
    }

    window.__PurpuraFx = {
        baseRates: BASE_RATES,
        rates: RATES,
        codes: codes,
        nameFor: nameFor,
        options: codes.map(code => ({ value: code, label: `${nameFor(code)} (${code})` })),
        rateFor: function (baseRate, code) {
            const fx = RATES[code];
            return Number.isFinite(fx) ? baseRate * fx : baseRate;
        },
        format: function (amount, code) {
            try {
                return new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: code
                }).format(amount);
            } catch {
                return `${amount.toFixed(2)} ${code}`;
            }
        }
    };
})();
