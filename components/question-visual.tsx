import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { QuestionVisualSpec } from '@/data/embeddedQuestionPackV10';

export function QuestionVisual({ visual }: { visual?: QuestionVisualSpec }) {
  if (!visual) return null;

  if (visual.kind === 'number-line') {
    const span = Math.max(1, visual.max - visual.min);
    return (
      <View style={styles.card}>
        <View style={styles.numberLineTrack}>
          {visual.points.map((point) => {
            const left = `${Math.max(0, Math.min(100, ((point - visual.min) / span) * 100))}%` as `${number}%`;
            const active = point === visual.highlight;
            return (
              <View key={point} style={[styles.numberPointWrap, { left }]}>
                <View style={[styles.numberPoint, active && styles.numberPointActive]} />
                <Text style={[styles.numberLabel, active && styles.numberLabelActive]}>{point}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.numberEndpoints}>
          <Text style={styles.axisLabel}>{visual.min}</Text>
          <Text style={styles.axisLabel}>{visual.max}</Text>
        </View>
      </View>
    );
  }

  if (visual.kind === 'bars') {
    const max = Math.max(...visual.values, 1);
    return (
      <View style={styles.card}>
        {visual.values.map((value, index) => (
          <View key={`${visual.labels[index]}-${index}`} style={styles.barRow}>
            <Text style={styles.barLabel}>{visual.labels[index] ?? index + 1}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.max(8, (value / max) * 100)}%` }]} />
            </View>
            <Text style={styles.barValue}>{value}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (visual.kind === 'icon-grid') {
    const capped = Math.min(60, Math.max(1, visual.count));
    return (
      <View style={styles.card}>
        <View style={styles.iconGrid}>
          {Array.from({ length: capped }).map((_, index) => (
            <Text key={index} style={styles.icon}>{visual.icon}</Text>
          ))}
        </View>
        {visual.groups ? <Text style={styles.caption}>{visual.count} nesne · {visual.groups} grup</Text> : null}
      </View>
    );
  }

  if (visual.kind === 'timeline') {
    const items = [...visual.items].sort((a, b) => a.year - b.year);
    return (
      <View style={styles.card}>
        <View style={styles.timelineLine} />
        {items.map((item) => (
          <View key={`${item.label}-${item.year}`} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineTextWrap}>
              <Text style={styles.timelineYear}>{item.year}</Text>
              <Text style={styles.timelineLabel}>{item.label}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.chipCard]}>
      {visual.items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#F7F5FF', borderRadius: 16, padding: 14, marginTop: 14, borderWidth: 1, borderColor: '#E5E0FA' },
  numberLineTrack: { height: 4, borderRadius: 999, backgroundColor: '#BDB5E8', marginHorizontal: 12, marginTop: 22, marginBottom: 26, position: 'relative' },
  numberPointWrap: { position: 'absolute', top: -6, alignItems: 'center', marginLeft: -10 },
  numberPoint: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#6552D9', borderWidth: 3, borderColor: '#FFFFFF' },
  numberPointActive: { backgroundColor: '#FF5C7C', transform: [{ scale: 1.15 }] },
  numberLabel: { color: '#554F70', fontSize: 11, fontWeight: '800', marginTop: 4 },
  numberLabelActive: { color: '#FF5C7C' },
  numberEndpoints: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 2 },
  axisLabel: { color: '#8A839F', fontSize: 10, fontWeight: '700' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 5 },
  barLabel: { width: 58, color: '#554F70', fontSize: 10, fontWeight: '800' },
  barTrack: { flex: 1, height: 14, borderRadius: 999, backgroundColor: '#E7E3F5', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999, backgroundColor: '#6552D9' },
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
  chipText: { color: '#554F70', fontSize: 11, fontWeight: '800' },
});
