import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';

interface DebugViewProps {
  label: string;
  data?: any;
  collapsed?: boolean;
  onCopy?: () => void;
}

const DebugView = ({ label, data, collapsed = false, onCopy }: DebugViewProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const formattedData = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleCollapse} style={styles.headerContainer}>
        <Text style={styles.label}>{label}</Text>
        <Feather 
          name={isCollapsed ? 'chevron-down' : 'chevron-up'} 
          size={16} 
          color={Colors.neutrals.gray900} 
        />
      </TouchableOpacity>
      
      {!isCollapsed && (
        <View style={styles.content}>
          <ScrollView style={styles.dataContainer}>
            <Text style={styles.data}>
              {formattedData}
            </Text>
          </ScrollView>
          
          {onCopy && (
            <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
              <Feather name="copy" size={14} color={Colors.primary.blue} />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900
  },
  content: {
    marginTop: 8
  },
  dataContainer: {
    maxHeight: 200
  },
  data: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray800,
    fontFamily: 'monospace'
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4
  },
  copyText: {
    fontSize: Typography.sizes.caption,
    color: Colors.primary.blue,
    marginLeft: 4
  }
});

export default DebugView;