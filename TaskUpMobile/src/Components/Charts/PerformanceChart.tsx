import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../UI/Text';

export const PerformanceChart = () => {
  const { theme } = useTheme();
  const width = Dimensions.get('window').width - 60;

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 76],
        color: () => theme.colors.primary,
        strokeWidth: 2,
      },
      {
        data: [30, 25, 50, 10, 40, 60, 20],
        color: () => theme.colors.secondary,
        strokeWidth: 2,
      },
    ],
    legend: ['Tasks Completed', 'Hours Worked'],
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: () => theme.colors.text,
    labelColor: () => theme.colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.card,
    },
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={data}
        width={width}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix=""
        withInnerLines={false}
        withOuterLines={false}
        fromZero
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});