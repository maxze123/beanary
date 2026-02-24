import { describe, it, expect } from 'vitest';
import { generateGuidance } from './guidance';
import type { Shot } from '../types';

const createMockShot = (overrides: Partial<Shot> = {}): Shot => ({
  id: 'shot-1',
  beanId: 'bean-1',
  doseGrams: 18,
  yieldGrams: 36,
  timeSeconds: 28,
  grindSetting: '',
  ratio: 2,
  taste: { balance: 0 },
  notes: '',
  shotNumber: 1,
  isDialedShot: false,
  createdAt: '2026-01-01',
  ...overrides,
});

describe('generateGuidance', () => {
  describe('first shot (no previous)', () => {
    it('suggests grind finer for sour + fast first shot', () => {
      const shot = createMockShot({ taste: { balance: -1 }, timeSeconds: 18 });
      const guidance = generateGuidance({ currentShot: shot, previousShot: null });

      expect(guidance.action).toBe('grind-finer');
      expect(guidance.confidence).toBe('high');
      expect(guidance.reasoning).toContain('fast');
    });

    it('suggests grind coarser for bitter + slow first shot', () => {
      const shot = createMockShot({ taste: { balance: 1 }, timeSeconds: 40 });
      const guidance = generateGuidance({ currentShot: shot, previousShot: null });

      expect(guidance.action).toBe('grind-coarser');
      expect(guidance.confidence).toBe('high');
      expect(guidance.reasoning).toContain('slow');
    });

    it('encourages confirmation for balanced first shot', () => {
      const shot = createMockShot({ taste: { balance: 0 }, timeSeconds: 28 });
      const guidance = generateGuidance({ currentShot: shot, previousShot: null });

      expect(guidance.action).toBe('none');
      expect(guidance.message).toContain('Great start');
      expect(guidance.reasoning).toContain('confirm');
    });
  });

  describe('balanced shots', () => {
    it('encourages saving recipe for balanced shot', () => {
      const current = createMockShot({ taste: { balance: 0 }, shotNumber: 2 });
      const previous = createMockShot({ taste: { balance: -1 }, shotNumber: 1 });

      const guidance = generateGuidance({ currentShot: current, previousShot: previous });

      expect(guidance.action).toBe('none');
      expect(guidance.message).toContain('dialed');
    });
  });

  describe('sour shots', () => {
    it('high confidence grind finer for sour + fast', () => {
      const current = createMockShot({
        taste: { balance: -1 },
        timeSeconds: 18,
        shotNumber: 2,
      });
      const previous = createMockShot({ shotNumber: 1 });

      const guidance = generateGuidance({ currentShot: current, previousShot: previous });

      expect(guidance.action).toBe('grind-finer');
      expect(guidance.confidence).toBe('high');
    });

    it('suggests keep grinding finer when improving but still sour', () => {
      const current = createMockShot({
        taste: { balance: -1 },
        timeSeconds: 26,
        shotNumber: 2,
      });
      const previous = createMockShot({
        taste: { balance: -2 },
        timeSeconds: 20,
        shotNumber: 1,
      });

      const guidance = generateGuidance({ currentShot: current, previousShot: previous });

      expect(guidance.action).toBe('grind-finer');
      expect(guidance.reasoning).toContain('slowed');
    });

    it('suggests checking puck prep for slow but sour (channeling)', () => {
      const current = createMockShot({
        taste: { balance: -1 },
        timeSeconds: 40,
        shotNumber: 2,
      });
      const previous = createMockShot({ shotNumber: 1 });

      const guidance = generateGuidance({ currentShot: current, previousShot: previous });

      expect(guidance.action).toBe('experiment');
      expect(guidance.reasoning).toContain('channeling');
    });
  });

  describe('bitter shots', () => {
    it('high confidence grind coarser for bitter + slow', () => {
      const current = createMockShot({
        taste: { balance: 1 },
        timeSeconds: 40,
        shotNumber: 2,
      });
      const previous = createMockShot({ shotNumber: 1 });

      const guidance = generateGuidance({ currentShot: current, previousShot: previous });

      expect(guidance.action).toBe('grind-coarser');
      expect(guidance.confidence).toBe('high');
    });

    it('suggests keep grinding coarser when improving but still bitter', () => {
      const current = createMockShot({
        taste: { balance: 1 },
        timeSeconds: 30,
        shotNumber: 2,
      });
      const previous = createMockShot({
        taste: { balance: 2 },
        timeSeconds: 38,
        shotNumber: 1,
      });

      const guidance = generateGuidance({ currentShot: current, previousShot: previous });

      expect(guidance.action).toBe('grind-coarser');
      expect(guidance.reasoning).toContain('sped up');
    });

    it('detects overcorrection from sour to bitter', () => {
      const current = createMockShot({
        taste: { balance: 1 },
        timeSeconds: 28,
        shotNumber: 2,
      });
      const previous = createMockShot({
        taste: { balance: -1 },
        timeSeconds: 24,
        shotNumber: 1,
      });

      const guidance = generateGuidance({ currentShot: current, previousShot: previous });

      expect(guidance.action).toBe('grind-coarser');
      expect(guidance.reasoning).toContain('overcorrected');
    });

    it('flags unusual fast + bitter combination', () => {
      const current = createMockShot({
        taste: { balance: 1 },
        timeSeconds: 18,
        shotNumber: 2,
      });
      const previous = createMockShot({ shotNumber: 1 });

      const guidance = generateGuidance({ currentShot: current, previousShot: previous });

      expect(guidance.action).toBe('experiment');
      expect(guidance.confidence).toBe('low');
      expect(guidance.reasoning).toContain('unusual');
    });
  });

  describe('very sour/bitter intensifiers', () => {
    it('includes "very" in reasoning for balance -2', () => {
      const current = createMockShot({
        taste: { balance: -2 },
        timeSeconds: 18,
        shotNumber: 2,
      });
      const previous = createMockShot({ shotNumber: 1 });

      const guidance = generateGuidance({ currentShot: current, previousShot: previous });

      expect(guidance.reasoning).toContain('very');
    });

    it('includes "very" in reasoning for balance +2', () => {
      const current = createMockShot({
        taste: { balance: 2 },
        timeSeconds: 40,
        shotNumber: 2,
      });
      const previous = createMockShot({ shotNumber: 1 });

      const guidance = generateGuidance({ currentShot: current, previousShot: previous });

      expect(guidance.reasoning).toContain('very');
    });
  });
});
