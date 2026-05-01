import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView, 
  StatusBar,
  useColorScheme
} from 'react-native';
import { useStealthStore } from '../features/stealth/stealthStore';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = (width - 40) / 4;

export const Calculator: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { pin, setMode, setLocked } = useStealthStore();
  
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [inputHistory, setInputHistory] = useState<string>('');

  const handleTap = (type: string, value: string) => {
    if (type === 'number') {
      if (display === '0') {
        setDisplay(value);
      } else {
        setDisplay(display + value);
      }
      setInputHistory(inputHistory + value);
    }

    if (type === 'operator') {
      setExpression(display + ' ' + value + ' ');
      setDisplay('0');
      setInputHistory(''); // Clear PIN tracking on operator
    }

    if (type === 'clear') {
      setDisplay('0');
      setExpression('');
      setInputHistory('');
    }

    if (type === 'equal') {
      // 1. Check for Stealth Unlock
      if (inputHistory === pin) {
        setLocked(false);
        setMode('BIBLE_MODE');
        return;
      }

      // 2. Perform normal calculation
      try {
        const fullExpr = expression + display;
        const result = eval(fullExpr.replace('×', '*').replace('÷', '/').replace('−', '-'));
        setDisplay(String(result));
        setExpression('');
        setInputHistory('');
      } catch (e) {
        setDisplay('Error');
        setExpression('');
        setInputHistory('');
      }
    }
  };

  const renderButton = (label: string, type: string, color?: string, flex?: number) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.button,
        { backgroundColor: color || (isDark ? '#333' : '#e0e0e0') },
        flex ? { width: BUTTON_WIDTH * flex + 10 } : {}
      ]}
      onPress={() => handleTap(type, label)}
    >
      <Text style={[styles.buttonText, { color: isDark ? 'white' : 'black' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? 'black' : 'white' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.displayContainer}>
        <Text style={[styles.expressionText, { color: isDark ? '#999' : '#666' }]}>{expression}</Text>
        <Text style={[styles.displayText, { color: isDark ? 'white' : 'black' }]}>{display}</Text>
      </View>
      
      <View style={styles.buttonGrid}>
        <View style={styles.row}>
          {renderButton('AC', 'clear', isDark ? '#a5a5a5' : '#bdbdbd')}
          {renderButton('+/-', 'operator', isDark ? '#a5a5a5' : '#bdbdbd')}
          {renderButton('%', 'operator', isDark ? '#a5a5a5' : '#bdbdbd')}
          {renderButton('÷', 'operator', '#f09a36')}
        </View>
        <View style={styles.row}>
          {renderButton('7', 'number')}
          {renderButton('8', 'number')}
          {renderButton('9', 'number')}
          {renderButton('×', 'operator', '#f09a36')}
        </View>
        <View style={styles.row}>
          {renderButton('4', 'number')}
          {renderButton('5', 'number')}
          {renderButton('6', 'number')}
          {renderButton('−', 'operator', '#f09a36')}
        </View>
        <View style={styles.row}>
          {renderButton('1', 'number')}
          {renderButton('2', 'number')}
          {renderButton('3', 'number')}
          {renderButton('+', 'operator', '#f09a36')}
        </View>
        <View style={styles.row}>
          {renderButton('0', 'number', undefined, 2)}
          {renderButton('.', 'number')}
          {renderButton('=', 'equal', '#f09a36')}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
  },
  displayText: {
    fontSize: 80,
    fontWeight: '300',
  },
  expressionText: {
    fontSize: 24,
    marginBottom: 10,
  },
  buttonGrid: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    width: BUTTON_WIDTH,
    height: BUTTON_WIDTH,
    borderRadius: BUTTON_WIDTH / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 32,
    fontWeight: '400',
  },
});
