import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';

interface DataPoint {
  value: number;
  label: string;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
}

export function LineChart({ data, height = 200 }: LineChartProps) {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const padding = 30;
  const chartWidth = screenWidth - padding * 2 - 20;
  const chartHeight = height - padding * 2;

  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.98; // 2% padding under
  const maxVal = Math.max(...values) * 1.02; // 2% padding over
  const valRange = maxVal - minVal || 1;

  // Calculate coordinates
  const coords = data.map((d, i) => {
    const x = padding + (data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2);
    const y = padding + chartHeight - ((d.value - minVal) / valRange) * chartHeight;
    return { x, y };
  });

  // Construct SVG Path
  let linePath = '';
  let areaPath = '';

  if (coords.length > 0) {
    linePath = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map((c) => `L ${c.x} ${c.y}`).join(' ');
    // Construct area path closing at the bottom of the chart
    areaPath =
      `${linePath} ` +
      `L ${coords[coords.length - 1].x} ${padding + chartHeight} ` +
      `L ${coords[0].x} ${padding + chartHeight} Z`;
  }

  // Horizontal Grid Lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.container}>
      <Svg height={height} width={screenWidth - 20}>
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={theme.primary} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {gridLines.map((ratio, index) => {
          const y = padding + chartHeight * ratio;
          return (
            <Line
              key={index}
              x1={padding}
              y1={y}
              x2={padding + chartWidth}
              y2={y}
              stroke={theme.backgroundSelected}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area Fill */}
        {coords.length > 1 && (
          <Path d={areaPath} fill="url(#gradient)" />
        )}

        {/* Line Path */}
        {coords.length > 1 && (
          <Path
            d={linePath}
            fill="none"
            stroke={theme.primary}
            strokeWidth="3"
          />
        )}

        {/* Data points */}
        {coords.map((c, i) => (
          <Circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="5"
            fill={theme.primary}
            stroke={theme.background}
            strokeWidth="2"
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
});
