import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { QuestionVisualSpec } from '@/data/embeddedQuestionPackV10';

type QuestionVisualProps = {
  visual?: QuestionVisualSpec;
  hiddenAnswer?: string;
};

function normalizeValue(value: string | number) {
  return String(value).trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');
}

function numericValue(value: string | number) {
  const normalized = String(value).trim().replace(',', '.');
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesHiddenAnswer(value: string | number, hiddenAnswer?: string) {
  if (!hiddenAnswer?.trim()) return false;
  if (normalizeValue(value) === normalizeValue(hiddenAnswer)) return true;

  const valueNumber = numericValue(value);
  const answerNumber = numericValue(hiddenAnswer);
  return valueNumber !== null && answerNumber !== null && valueNumber === answerNumber;
}

function visibleValue(value: string | number, hiddenAnswer?: string) {
  return matchesHiddenAnswer(value, hiddenAnswer) ? '?' : String(value);
}

export function QuestionVisual({ visual, hiddenAnswer }: QuestionVisualProps) {
  if (!visual) return null;

  if (visual.kind === 'number-line') {
    const span = Math.max(1, visual.max - visual.min);
    return (
      <View style={styles.card}>
        <View style={styles.numberLineTrack}>
          {visual.points.map((point) => {
            const left = `${Math.max(0, Math.min(100, ((point - visual.min) / span) * 100))}%` as `${number}%`;
            const active = point === visual.highlight;
            const masked = matchesHiddenAnswer(point, hiddenAnswer);
            return (
              <View key={point} style={[styles.numberPointWrap, { left }]}>
                <View style={[styles.numberPoint, active && styles.numberPointActive, masked && styles.numberPointMasked]} />
                <Text style={[styles.numberLabel, active && styles.numberLabelActive, masked && styles.maskedText]}>
                  {visibleValue(point, hiddenAnswer)}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.numberEndpoints}>
          <Text style={styles.axisLabel}>{visibleValue(visual.min, hiddenAnswer)}</Text>
          <Text style={styles.axisLabel}>{visibleValue(visual.max, hiddenAnswer)}</Text>
        </View>
      </View>
    );
  }

  if (visual.kind === 'bars') {
    const max = Math.max(...visual.values, 1);
    return (
      <View style={styles.card}>
        {visual.values.map((value, index) => {
          const masked = matchesHiddenAnswer(value, hiddenAnswer);
          return (
            <View key={`${visual.labels[index]}-${index}`} style={styles.barRow}>
              <Text style={styles.barLabel}>{visual.labels[index] ?? index + 1}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.max(8, (value / max) * 100)}%` },
                    masked && styles.barFillMasked,
                  ]}
                />
              </View>
              <Text style={[styles.barValue, masked && styles.maskedText]}>{visibleValue(value, hiddenAnswer)}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  if (visual.kind === 'icon-grid') {
    const capped = Math.min(60, Math.max(1, visual.count));
    const hidesCount = matchesHiddenAnswer(visual.count, hiddenAnswer);
    return (
      <View style={styles.card}>
        <View style={styles.iconGrid}>
          {Array.from({ length: capped }).map((_, index) => (
            <Text key={index} style={styles.icon}>{visual.icon}</Text>
          ))}
        </View>
        {visual.groups ? (
          <Text style={styles.caption}>
            {hidesCount ? `${visual.groups} grup · toplamı sen bul` : `${visual.count} nesne · ${visual.groups} grup`}
          </Text>
        ) : null}
      </View>
    );
  }

  if (visual.kind === 'timeline') {
    const items = [...visual.items].sort((a, b) => a.year - b.year);
    return (
      <View style={styles.card}>
        <View style={styles.timelineLine} />
        {items.map((item) => {
          const yearMasked = matchesHiddenAnswer(item.year, hiddenAnswer);
          const labelMasked = matchesHiddenAnswer(item.label, hiddenAnswer);
          return (
            <View key={`${item.label}-${item.year}`} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineTextWrap}>
                <Text style={[styles.timelineYear, yearMasked && styles.maskedText]}>
                  {visibleValue(item.year, hiddenAnswer)}
                </Text>
                <Text style={[styles.timelineLabel, labelMasked && styles.maskedText]}>
                  {visibleValue(item.label, hiddenAnswer)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.chipCard]}>
      {visual.items.map((item, index) => {
        const masked = matchesHiddenAnswer(item, hiddenAnswer);
        return (
          <View key={`${item}-${index}`} style={[styles.chip, masked && styles.chipMasked]}>
            <Text style={[styles.chipText, masked && styles.maskedText]}>{visibleValue(item, hiddenAnswer)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#F7F5FF', borderRadius: 16, padding: 14, marginTop: 14, borderWidth: 1, borderColor: '#E5E0FA' },
  numberLineTrack: { height: 4, borderRadius: 999, backgroundColor: '#BDB5E8', marginHorizontal: 12, marginTop: 22, marginBottom: 26, position: 'relative' },
  numberPointWrap: { position: 'absolute', top: -6, alignItems: 'center', marginLeft: -10 },
  numberPoint: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#6552D9', borderWidth: 3, borderColor: '#FFFFFF' },
  numberPointActive: { backgroundColor: '#FF5C7C', transform: [{ scale: 1.15 }] },
  numberPointMasked: { backgroundColor: '#BDB5E8' },
  numberLabel: { color: '#554F70', fontSize: 11, fontWeight: '800', marginTop: 4 },
  numberLabelActive: { color: '#FF5C7C' },
  numberEndpoints: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 2 },
  axisLabel: { color: '#8A839F', fontSize: 10, fontWeight: '700' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 5 },
  barLabel: { width: 58, color: '#554F70', fontSize: 10, fontWeight: '800' },
  barTrack: { flex: 1, height: 14, borderRadius: 999, backgroundColor: '#E7E3F5', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999, backgroundColor: '#6552D9' },
  barFillMasked: { backgroundColor: '#BDB5E8' },
  barValue: { width: 38, textAlign: 'right', color: '#1D1A34', fontSize: 11, fontWeight: '900' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  icon: { fontSize: 17, lineHeight: 21 },
  caption: { color: '#6B6684', fontSize: 10, fontWeight: '700', marginTop: 8 },
  timelineLine: { position: 'absolute', left: 21, top: 17, bottom: 17, width: 2, backgroundColor: '#BDB5E8' },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 7 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#6552D9', borderWidth: 3, borderColor: '#FFFFFF', marginTop: 2 },
  timelineTextWrap: { flex: 1 },
  timelineYear: { color: '#6552D9', fontSize: 11, fontWeight: '900' },
  timelineLabel: { color: '#1D1A34', fontSize: 12, fontWeight: '700', marginTop: 1 },
  chipCard: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { backgroundColor: '#FFFFFF', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#DED8F7' },
  chipMasked: { borderStyle: 'dashed', backgroundColor: '#F0EDF9' },
  chipText: { color: '#554F70', fontSize: 11, fontWeight: '800' },
  maskedText: { color: '#8A839F' },
});
