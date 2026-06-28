import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Image27Svg from '../assets/images/image27.svg';
import { useTheme } from '../theme/ThemeContext';

type Props = {
  navigation: any;
};

export default function CongratulationsScreen({ navigation }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.congratulationsText, { color: theme.text }]}>Congratulations</Text>

        <Image27Svg width={200} height={200} style={styles.image} />

        <Text style={[styles.levelText, { color: theme.text }]}>You are in the Intermediate level</Text>

        <Text style={[styles.descriptionText, { color: theme.text }]}>
          We assume that you have a good basic knowledge about coding so you just have to upgrade your skills into
          advance
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.btnPrimary }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={[styles.buttonText, { color: theme.btnPrimaryText }]}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratulationsText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
