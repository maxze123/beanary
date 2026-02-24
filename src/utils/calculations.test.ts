import { describe, it, expect } from 'vitest';
import {
  calculateRatio,
  formatRatio,
  formatTime,
  getBalanceLabel,
  getBalanceColor,
} from './calculations';

describe('calculateRatio', () => {
  it('calculates ratio correctly', () => {
    expect(calculateRatio(18, 36)).toBe(2);
    expect(calculateRatio(18, 40)).toBe(2.22);
    expect(calculateRatio(20, 40)).toBe(2);
  });

  it('handles edge cases', () => {
    expect(calculateRatio(0, 36)).toBe(0);
    expect(calculateRatio(-1, 36)).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateRatio(18, 41)).toBe(2.28);
    expect(calculateRatio(17, 39)).toBe(2.29);
  });
});

describe('formatRatio', () => {
  it('formats ratio with 1 decimal place', () => {
    expect(formatRatio(2)).toBe('1:2.0');
    expect(formatRatio(2.22)).toBe('1:2.2');
    expect(formatRatio(2.5)).toBe('1:2.5');
  });
});

describe('formatTime', () => {
  it('formats seconds under 60', () => {
    expect(formatTime(28)).toBe('28s');
    expect(formatTime(45)).toBe('45s');
  });

  it('formats seconds over 60', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(120)).toBe('2:00');
  });
});

describe('getBalanceLabel', () => {
  it('returns correct labels', () => {
    expect(getBalanceLabel(-2)).toBe('Very Sour');
    expect(getBalanceLabel(-1)).toBe('Slightly Sour');
    expect(getBalanceLabel(0)).toBe('Balanced');
    expect(getBalanceLabel(1)).toBe('Slightly Bitter');
    expect(getBalanceLabel(2)).toBe('Very Bitter');
  });
});

describe('getBalanceColor', () => {
  it('returns green for balanced', () => {
    expect(getBalanceColor(0)).toContain('dialed');
  });

  it('returns amber for sour', () => {
    expect(getBalanceColor(-1)).toContain('amber');
    expect(getBalanceColor(-2)).toContain('amber');
  });

  it('returns orange for bitter', () => {
    expect(getBalanceColor(1)).toContain('orange');
    expect(getBalanceColor(2)).toContain('orange');
  });
});
